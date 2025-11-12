package integration

import (
	"context"
	"fmt"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/minio"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

type TestSuite struct {
	suite.Suite
	ctx            context.Context
	db             *pgx.Conn
	pgContainer    *postgres.PostgresContainer
	minioContainer *minio.MinioContainer
}

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

	// conn, err := pgx.Connect(ts.ctx)
	// ts.NoError(err)

	ts.pgContainer = pgContainer

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
