pipeline {
    agent any 

    environment {
        DOCKER_USER = "christienmushoriwa" 
        APP_NAME = "todofront"
        IMAGE_TAG = "latest"
    }
    triggers {
        pollSCM('H/5 * * * *') 
    }

    stages { 
        stage('SCM Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/christien0/angular-17-client.git'
            }
        }

        stage('Build Docker Image') {
            steps {  
                bat 'docker build -t %DOCKER_USER%/%APP_NAME%:%IMAGE_TAG% .'
            }
        }

        stage('Login to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: '0a380709-8b0b-433e-8371-0710dada08be', 
                    usernameVariable: 'DOCKER_USER', 
                    passwordVariable: 'DOCKER_PASS')]) {
                    bat 'echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                bat 'docker push %DOCKER_USER%/%APP_NAME%:%IMAGE_TAG%'
            }
        }

        stage('Run Integration Tests') {
            steps {
                script {
                    // Pull backend image first
                    bat 'docker pull christienmushoriwa/todoback:latest || echo "Backend image pull failed, but continuing"'
                    
                    // Create docker-compose with proper network and health checks
                    writeFile file: 'docker-compose.test.yml', text: """
version: '3.8'
services:
  backend:
    image: christienmushoriwa/todoback:latest
    container_name: backend-test
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/tutorials"]
      interval: 10s
      timeout: 10s
      retries: 10
      start_period: 30s

  frontend:
    image: christienmushoriwa/todofront:latest
    container_name: frontend-test
    ports:
      - "8081:80"
    depends_on:
      backend:
        condition: service_healthy
    environment:
      - API_BASE_URL=http://backend:8080
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80/tutorials"]
      interval: 10s
      timeout: 10s
      retries: 10
      start_period: 30s
"""
                    
                    // Start backend and frontend
                    bat 'docker-compose -f docker-compose.test.yml up -d'
                    
                    // Wait for backend to be healthy
                    bat 'timeout 120 /bin/bash -c "while [ \\\"$(docker inspect --format=\\\"{{.State.Health.Status}}\\\" backend-test)\\\" != \\\"healthy\\\" ]; do echo \\\"Waiting for backend...\\\"; sleep 10; done"'
                    
                    // Wait for frontend to be healthy
                    bat 'timeout 120 /bin/bash -c "while [ \\\"$(docker inspect --format=\\\"{{.State.Health.Status}}\\\" frontend-test)\\\" != \\\"healthy\\\" ]; do echo \\\"Waiting for frontend...\\\"; sleep 10; done"'
                    
                    // Verify services are accessible
                    bat 'curl -f http://localhost:8080/api/tutorials || echo "Backend API check failed"'
                    bat 'curl -f http://localhost:8081/tutorials || echo "Frontend check failed"'
                    
                    // Run Playwright tests
                    bat '''
                        npx playwright install
                        npx playwright test test-1.spec.ts --reporter=list
                    '''
                }
            }
            post {
                always {
                    // Capture logs for debugging
                    bat 'docker logs backend-test > backend-logs.txt 2>&1 || echo "Could not get backend logs"'
                    bat 'docker logs frontend-test > frontend-logs.txt 2>&1 || echo "Could not get frontend logs"'
                    bat 'type backend-logs.txt'
                    bat 'type frontend-logs.txt'
                    
                    // Cleanup
                    bat 'docker-compose -f docker-compose.test.yml down -v'
                    bat 'docker system prune -f'
                }
            }
        }
    }
}