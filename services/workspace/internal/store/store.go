package store

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tomasohchom/motion/services/workspace/internal/models"
)

type Store struct {
	Queries *models.Queries
	Pool    *pgxpool.Pool
}

func NewStore(pool *pgxpool.Pool) *Store {
	return &Store{
		Queries: models.New(pool),
		Pool:    pool,
	}
}
