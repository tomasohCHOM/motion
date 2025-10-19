package services

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/tomasohchom/motion/services/workspace/internal/models"
	"github.com/tomasohchom/motion/services/workspace/internal/store"
)

// Domain errors
var (
	ErrUserNotFound      = errors.New("user not found")
	ErrInvalidUserData   = errors.New("invalid user data")
	ErrMissingUserFields = errors.New("missing required user fields")
)

type UserServicer interface {
	GetUser(ctx context.Context, id string) (models.User, error)
	CreateUser(ctx context.Context, id, email, firstName, lastName, userName string) error
}

type UserService struct {
	s *store.Store
}

// Compile time interface implementation check
var _ UserServicer = (*UserService)(nil)

func NewUserService(store *store.Store) *UserService {
	return &UserService{s: store}
}

func (s *UserService) GetUser(ctx context.Context, id string) (models.User, error) {
	// Business validation
	if id == "" {
		return models.User{}, ErrInvalidUserData
	}

	user, err := s.s.Queries.GetUserByID(ctx, id)
	if err != nil {
		// Translate database errors to domain errors
		if errors.Is(err, sql.ErrNoRows) {
			return models.User{}, ErrUserNotFound
		}
		return models.User{}, fmt.Errorf("failed to get user: %w", err)
	}
	return user, nil
}

func (s *UserService) CreateUser(ctx context.Context, id, email, firstName, lastName,
	userName string) error {

	// Business validation
	if id == "" || email == "" || firstName == "" || lastName == "" || userName == "" {
		return ErrMissingUserFields
	}

	_, err := s.s.Queries.CreateUser(ctx, models.CreateUserParams{
		ID:        id,
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
		Username:  userName,
	})
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}

	return nil
}
