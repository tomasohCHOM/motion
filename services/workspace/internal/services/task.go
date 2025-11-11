package services

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/tomasohchom/motion/services/workspace/internal/models"
	"github.com/tomasohchom/motion/services/workspace/internal/store"
)

// Domain errors
var (
	ErrTaskNotFound    = errors.New("task not found")
	ErrInvalidTaskData = errors.New("invalid task data")
)

type TaskServicer interface {
	CreateNewTask(ctx context.Context, workspaceID, title, description,
		assigneeId, status, priority string, dueDate time.Time) (models.Task, error)
	GetWorkspaceTasks(ctx context.Context, workspaceID string) ([]models.GetTasksByWorkspaceRow, error)
	GetTask(ctx context.Context, taskID string) (models.GetTaskByIDRow, error)
	UpdateTask(ctx context.Context, taskID, title, description, assigneeId, status, priority string, dueDate time.Time) (models.Task, error)
	DeleteTask(ctx context.Context, taskID string) error
}

type TaskService struct {
	s *store.Store
}

// Compile time interface implementation check
var _ TaskServicer = (*TaskService)(nil)

func NewTaskService(store *store.Store) *TaskService {
	return &TaskService{s: store}
}

func (s *TaskService) CreateNewTask(ctx context.Context, workspaceID, title,
	description, assigneeId, status, priority string, dueDate time.Time) (models.Task, error) {
	if workspaceID == "" || title == "" {
		return models.Task{}, ErrInvalidTaskData
	}

	var wid pgtype.UUID
	if err := wid.Scan(workspaceID); err != nil {
		return models.Task{}, ErrInvalidTaskData
	}

	params := models.CreateNewTaskParams{
		WorkspaceID: wid,
		Title:       title,
		Description: pgtype.Text{String: description, Valid: description != ""},
		AssigneeID:  pgtype.Text{String: assigneeId},
		Status:      models.TaskStatus(status),
		Priority:    models.NullTaskPriority{TaskPriority: models.TaskPriority(priority)},
		DueDate:     pgtype.Timestamptz{Time: dueDate},
	}

	task, err := s.s.Queries.CreateNewTask(ctx, params)
	if err != nil {
		return models.Task{}, fmt.Errorf("failed to create task: %w", err)
	}

	return task, nil
}

func (s *TaskService) GetWorkspaceTasks(ctx context.Context, workspaceID string) ([]models.GetTasksByWorkspaceRow, error) {
	if workspaceID == "" {
		return nil, ErrInvalidTaskData
	}

	var wid pgtype.UUID
	if err := wid.Scan(workspaceID); err != nil {
		return nil, ErrInvalidTaskData
	}

	tasks, err := s.s.Queries.GetTasksByWorkspace(ctx, wid)
	if err != nil {
		return nil, fmt.Errorf("failed to get workspace tasks: %w", err)
	}

	if tasks == nil {
		tasks = make([]models.GetTasksByWorkspaceRow, 0)
	}

	return tasks, nil
}

func (s *TaskService) GetTask(ctx context.Context, taskID string) (models.GetTaskByIDRow, error) {
	if taskID == "" {
		return models.GetTaskByIDRow{}, ErrInvalidTaskData
	}

	var tid pgtype.UUID
	if err := tid.Scan(taskID); err != nil {
		return models.GetTaskByIDRow{}, ErrInvalidTaskData
	}

	task, err := s.s.Queries.GetTaskByID(ctx, tid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.GetTaskByIDRow{}, ErrTaskNotFound
		}
		return models.GetTaskByIDRow{}, fmt.Errorf("failed to get task: %w", err)
	}

	return task, nil
}

func (s *TaskService) UpdateTask(ctx context.Context, taskID, title, description, assigneeId, status, priority string, dueDate time.Time) (models.Task, error) {
	if taskID == "" {
		return models.Task{}, ErrInvalidTaskData
	}

	var tid pgtype.UUID
	if err := tid.Scan(taskID); err != nil {
		return models.Task{}, ErrInvalidTaskData
	}

	params := models.UpdateTaskParams{
		ID:          tid,
		Title:       title,
		Description: pgtype.Text{String: description, Valid: description != ""},
		AssigneeID:  pgtype.Text{String: assigneeId},
		Status:      models.TaskStatus(status),
		Priority:    models.NullTaskPriority{TaskPriority: models.TaskPriority(priority)},
		DueDate:     pgtype.Timestamptz{Time: dueDate},
	}

	task, err := s.s.Queries.UpdateTask(ctx, params)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return models.Task{}, ErrTaskNotFound
		}
		return models.Task{}, fmt.Errorf("failed to update task: %w", err)
	}

	return task, nil
}

func (s *TaskService) DeleteTask(ctx context.Context, taskID string) error {
	if taskID == "" {
		return ErrInvalidTaskData
	}

	var tid pgtype.UUID
	if err := tid.Scan(taskID); err != nil {
		return ErrInvalidTaskData
	}

	err := s.s.Queries.DeleteTask(ctx, tid)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return ErrTaskNotFound
		}
		return fmt.Errorf("failed to delete task: %w", err)
	}

	return nil
}
