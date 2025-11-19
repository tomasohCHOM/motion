# Dev stage
FROM golang:1.24.6-alpine AS dev

WORKDIR /app

RUN go install github.com/air-verse/air@v1.62.0

COPY go.mod go.sum ./

RUN go mod download

COPY . .

CMD ["air"]

# Build stage
FROM golang:1.24.6-alpine AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /app/file-upload ./cmd/server

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates curl

WORKDIR /app

COPY --from=builder /app/file-upload .

EXPOSE 8080

CMD ["./file-upload"]
