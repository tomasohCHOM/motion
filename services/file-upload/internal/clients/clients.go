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
	"github.com/tomasohchom/motion/services/file-upload/internal/storage"
	appconfig "github.com/tomasohchom/motion/services/file-upload/internal/config"
)

func NewStorageClient(cfg *appconfig.Config) (StorageClient, error) {
	awsCfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		return nil, err
	}
	s3Client := s3.NewFromConfig(awsCfg)
	return storage.NewS3Client(s3Client), nil
}
// type S3Config struct {
// 	Endpoint   string
// 	Region     string
// 	AccessKey  string
// 	SecretKey  string
// 	UseSSL     bool
// 	BucketName string
// }
//
// func GetS3Config() S3Config {
// 	env := os.Getenv("ENV")
//
// 	if env == "production" {
// 		return S3Config{
// 			Region:     os.Getenv("AWS_REGION"),
// 			AccessKey:  os.Getenv("AWS_ACCESS_KEY_ID"),
// 			SecretKey:  os.Getenv("AWS_SECRET_ACCESS_KEY"),
// 			UseSSL:     true,
// 			BucketName: os.Getenv("S3_BUCKET_NAME"),
// 		}
// 	}
//
// 	// minio server ~/minio-data
// 	log.Printf("Using Minio server at https://localhost:9000\n")
// 	return getTestS3Config()
// }
//
// func generateRandomString(length uint) string {
// 	ran_str := make([]byte, length)
// 	for i := 0; i < int(length); i++ {
// 		ran_str[i] = byte(65 + rand.Intn(25))
// 	}
//
// 	return string(ran_str)
// }
//
// func getTestS3Config() S3Config {
// 	return S3Config{
// 		Endpoint:   "http://localhost:9000",
// 		Region:     "us-east-1",
// 		AccessKey:  "minioadmin",
// 		SecretKey:  "minioadmin",
// 		UseSSL:     false,
// 		BucketName: "test-bucket-" + generateRandomString(8),
// 	}
// }
//
// func CreateS3Client(cfg S3Config) (*s3.Client, error) {
// 	var awsConfig aws.Config
// 	var err error
//
// 	if cfg.Endpoint != "" {
// 		awsConfig, err = config.LoadDefaultConfig(context.TODO(),
// 			config.WithRegion(cfg.Region),
// 			config.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(
// 				cfg.AccessKey,
// 				cfg.SecretKey,
// 				"",
// 			)),
// 		)
// 	} else {
// 		awsConfig, err = config.LoadDefaultConfig(context.TODO(),
// 			config.WithRegion(cfg.Region),
// 		)
// 	}
//
// 	if err != nil {
// 		return nil, err
// 	}
//
// 	return s3.NewFromConfig(awsConfig), nil
// }
