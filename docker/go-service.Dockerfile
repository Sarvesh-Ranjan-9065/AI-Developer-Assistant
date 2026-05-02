FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod ./
RUN go mod download || true

# Copy source code
COPY . .

# Build the application
RUN go build -o service .

# Final stage
FROM alpine:latest

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/service .

# Expose port 8080
EXPOSE 8080

# Run the service
CMD ["./service"]

# Made with Bob
