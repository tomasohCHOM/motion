package store

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/tomasohchom/motion/services/file-upload/internal/db"
)

type Store struct {
	Queries *db.Queries
	Pool    *pgxpool.Pool
}

func NewStore(pool *pgxpool.Pool) *Store {
	return &Store{
		Queries: db.New(pool),
		Pool:    pool,
	}
}
