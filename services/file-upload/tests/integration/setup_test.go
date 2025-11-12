package integration

import (
	"context"
	"fmt"
	// "testing"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/minio"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

type TestSuite struct {
	suite.Suite
	ctx            context.Context
	pool           *pgxpool.Pool
	dsn            string
	pgContainer    *postgres.PostgresContainer
	minioContainer *minio.MinioContainer
}

/* TODO:
 * 1. Implement SetupTest to perform DB migrations (create tables)
 * 2. TearDownTest should tear down tables
 * 3. Start writing tests
 */

func (ts *TestSuite) SetupSuite() {
	ts.ctx = context.Background()
	pgContainer, err := postgres.Run(
		ts.ctx,
		"postgres:18.0",
		postgres.WithDatabase("testdb"),
		postgres.WithUsername("testuser"),
		postgres.WithPassword("testpw"),
		testcontainers.WithWaitStrategy(
			wait.ForListeningPort("5432/tcp"),
			wait.ForLog("database system is ready to accept connections"),
		),
	)
	ts.NoError(err)
	ts.pgContainer = pgContainer

	host, err := pgContainer.Host(ts.ctx)
	ts.NoError(err)
	port, err := pgContainer.MappedPort(ts.ctx, "5432")
	ts.NoError(err)
	ts.dsn = fmt.Sprintf("postgres://testuser:testpw@%s:%s/testdb?sslmode=disable", host, port.Port())
	pool, err := pgxpool.New(ts.ctx, ts.dsn)
	ts.NoError(err)
	ts.NoError(pool.Ping(ts.ctx))
	ts.pool = pool

	minioContainer, err := minio.Run(
		ts.ctx,
		"minio:latest",
		testcontainers.WithWaitStrategy(
			wait.ForListeningPort("9000/tcp"),
			wait.ForLog("MinIO Object Storage Server"),
		),
	)
	ts.NoError(err)
	ts.minioContainer = minioContainer
}

func (ts *TestSuite) TearDownSuite() {
	err := ts.pgContainer.Terminate(ts.ctx)
	ts.NoError(err)

	err = ts.minioContainer.Terminate(ts.ctx)
	ts.NoError(err)
}

func (ts *TestSuite) SetupTest() {
	m, err := migrate.New(
		"file://../migrations",
		ts.dsn,
	)
	ts.NoError(err)
	defer m.Close()

	ts.NoError(m.Up())
}

func (ts *TestSuite) TearDownTest() {
	m, err := migrate.New(
		"file://../migrations",
		ts.dsn,
	)
	ts.NoError(err)
	defer m.Close()

	ts.NoError(m.Down())
}

// Runs immediately after `SetupTest` and just before a test is executed
func (ts *TestSuite) BeforeTest() {}
