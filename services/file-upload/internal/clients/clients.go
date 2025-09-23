/**
 * Stuff for configuting and creating S3 clients
 */

package clients

import (
	"context"
	// "log"
	// "math/rand"
	// "os"
	//
	// "github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	// "github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	appconfig "github.com/tomasohchom/motion/services/file-upload/internal/config"
	"github.com/tomasohchom/motion/services/file-upload/internal/storage"
)

func NewStorageClient(cfg *appconfig.Config) (StorageClient, error) {
	if cfg.Storage.Provider == "minio" {
		return storage.NewMinIOClient(cfg.Storage)
	}
	awsCfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, err
	}
	s3Client := s3.NewFromConfig(awsCfg)
	return storage.NewS3Client(s3Client), nil
}
