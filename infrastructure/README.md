# Infrastructure
Motion uses a microservice architecture for separation of concerns and high
availablity.

## Terraform
Our entire stack is managed by Terraform using providers for Vercel and AWS.  
  
There are two workspaces:
- default (dev): Uses minimum resources to get services up and running.
- production: Production deployment that uses a multi-AZ deployment with load
balancers for high availability.

## Frontend
Terraform deploys the frontend to Vercel, automatically setting environment
variables for backend services that get created.

## Microservices

### 1. Mailing Service

The mailing service is built on a serverless, event-driven architecture to handle internal messaging and external email notifications.

* **Architecture**: Event-Driven & Serverless.
* **AWS Services Used**:
    * **Amazon SQS (Simple Queue Service)**: Acts as a message queue to decouple the application from the email delivery process. When a user sends a message, the application places the message event into the SQS queue.
    * **AWS Lambda**: A Lambda function continuously polls the SQS queue for new messages. When a message is retrieved, the function processes it and calls SES to send the email.
    * **Amazon SES (Simple Email Service)**: Handles the final delivery of the external email notification to the recipient, ensuring high deliverability.

#### Data Flow:
1.  A user sends a message via the Go application.
2.  The application validates the request and publishes a message event to an SQS queue.
3.  An AWS Lambda function, triggered by the SQS queue, retrieves the event.
4.  The Lambda function calls Amazon SES to send the email to the final recipient.
5.  The message is also saved to a database for internal retrieval

---

### 2. File Upload & Sharing Service

This service uses a microservices pattern with an external object storage system to manage file uploads, downloads, and permissions.

* **Architecture**: Microservice with Object Storage Integration
* **AWS Services Used**:
    * **Amazon S3 (Simple Storage Service)**: Used as the object storage backend to store all user-uploaded files (documents, images, etc.). The system generates pre-signed URLs for direct, secure uploads and downloads to and from S3, bypassing the backend server to reduce load and latency
    * **Load Balancer**: Routes incoming user requests to either the Upload Service or the Download Service.
    * **Metadata Database (e.g., PostgreSQL)**: While not a specific AWS service is mandated, a relational database like Amazon RDS for PostgreSQL would run on AWS to store file metadata (filename, uploader, permissions, timestamp).

#### Data Flow:
1.  **Upload**: A user requests to upload a file through a Load Balancer. The Upload Service validates permissions and generates a pre-signed S3 URL, which is returned to the client. The client then uploads the file directly to S3 using this URL.
2.  **Download**: A user requests a download via the Load Balancer. The Download Service validates permissions by checking the metadata database and generates a pre-signed S3 URL for the client to download the file directly from S3.

---

### 3. Real-Time Group Messaging Service

This service provides real-time chat functionality and is designed for high scalability and low latency using a containerized microservice architecture.

* **Architecture**: Horizontally Scalable Microservice.
* **AWS Services Used**:
    * **Amazon DynamoDB**: A managed NoSQL database used for persistent storage of all chat messages. The schema is optimized for fast retrieval based on `project_id` (Partition Key) and `timestamp` (Sort Key).
    * **AWS ECS (Elastic Container Service) with Fargate**: The Node.js messaging application is containerized with Docker and deployed on ECS using the Fargate serverless compute engine. This allows the service to run without managing underlying EC2 instances.
    * **AWS Application Load Balancer (ALB)**: Manages incoming traffic, distributing WebSocket connections across multiple container instances of the messaging service to ensure scalability and high availability.
    * **Redis Pub/Sub (e.g., Amazon ElastiCache for Redis)**: Used to broadcast real-time events and messages across all horizontally scaled container instances. This ensures a user connected to one instance receives messages sent from a user connected to another instance.
