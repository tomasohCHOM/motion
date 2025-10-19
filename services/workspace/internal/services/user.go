package services

import (
	"context"

	"github.com/tomasohchom/motion/services/workspace/internal/models"
	"github.com/tomasohchom/motion/services/workspace/internal/store"
)

type UserServicer interface {
	GetUser(ctx context.Context, id string) (models.User, error)
	CreateUser(ctx context.Context, params models.CreateUserParams) error
}

type UserService struct {
	s *store.Store
}

// Compile time interface implementation check
var _ UserServicer = (*UserService)(nil)

func (s *UserService) GetUser(ctx context.Context, id string) (models.User, error) {
	user, err := s.s.Queries.GetUserByID(ctx, id)
	if err != nil {
		return models.User{}, err
	}
	return user, nil
}

func (s *UserService) CreateUser(ctx context.Context, params models.CreateUserParams) error {
	_, err := s.s.Queries.CreateUser(ctx, params)
	return err

}
