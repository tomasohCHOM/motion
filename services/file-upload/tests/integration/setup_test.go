package integration

import (
	"context"
	"fmt"
	"testing"

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
	pgContainer    *postgres.PostgresContainer
	minioContainer *minio.MinioContainer
}

func (ts *TestSuite) SetupSuite() {
	ts.ctx = context.Background()
	// Postgres
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

	host, err := pgContainer.Host(ts.ctx)
	ts.NoError(err)

	port, err := pgContainer.MappedPort(ts.ctx, "5432")
	ts.NoError(err)

	dsn := fmt.Sprintf("postgres://testuser:testpw@%s:%s/testdb?sslmode=disable",
		host, port.Port())
	pool, err := pgxpool.New(ts.ctx, dsn)
	if err == nil {
		err = pool.Ping(ts.ctx)
	}
	pool.Close()
	ts.NoError(err, "Failed to ping Postgres container")

	ts.NoError(err)

	ts.pgContainer = pgContainer

	// Minio
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
