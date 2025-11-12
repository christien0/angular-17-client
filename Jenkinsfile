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
                    
                    // Create docker-compose with different ports
                    writeFile file: 'docker-compose.test.yml', text: """
version: '3.8'
services:
  backend:
    image: christienmushoriwa/todoback:latest
    container_name: backend-test-%BUILD_NUMBER%
    ports:
      - "18080:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/tutorials"]
      interval: 10s
      timeout: 10s
      retries: 10
      start_period: 30s

  frontend:
    image: christienmushoriwa/todofront:latest
    container_name: frontend-test-%BUILD_NUMBER%
    ports:
      - "18081:80"
    depends_on:
      backend:
        condition: service_healthy
"""
                    
                    // Start backend and frontend
                    bat 'docker-compose -f docker-compose.test.yml up -d'
                    
                    // Windows-compatible health check wait
                    bat """
                        echo Waiting for backend to be healthy...
                        set MAX_RETRIES=12
                        set RETRY_COUNT=0
                        :RETRY_BACKEND
                        docker inspect --format="{{.State.Health.Status}}" backend-test-%BUILD_NUMBER% | find "healthy" > nul
                        if %errorlevel% equ 0 (
                            echo Backend is healthy!
                            goto BACKEND_HEALTHY
                        )
                        set /a RETRY_COUNT+=1
                        if %RETRY_COUNT% geq %MAX_RETRIES% (
                            echo Backend health check timeout after 120 seconds
                            exit 1
                        )
                        echo Backend not ready yet, waiting 10 seconds... (Attempt %RETRY_COUNT%/%MAX_RETRIES%)
                        timeout /t 10 /nobreak > nul
                        goto RETRY_BACKEND
                        :BACKEND_HEALTHY
                    """
                    
                    // Wait for frontend to be accessible
                    bat """
                        echo Waiting for frontend to be ready...
                        set MAX_RETRIES=12
                        set RETRY_COUNT=0
                        :RETRY_FRONTEND
                        curl -f http://localhost:18081/tutorials > nul 2>&1
                        if %errorlevel% equ 0 (
                            echo Frontend is ready!
                            goto FRONTEND_READY
                        )
                        set /a RETRY_COUNT+=1
                        if %RETRY_COUNT% geq %MAX_RETRIES% (
                            echo Frontend readiness check timeout after 120 seconds
                            exit 1
                        )
                        echo Frontend not ready yet, waiting 10 seconds... (Attempt %RETRY_COUNT%/%MAX_RETRIES%)
                        timeout /t 10 /nobreak > nul
                        goto RETRY_FRONTEND
                        :FRONTEND_READY
                    """
                    
                    // Modify test file to use new port (18081 instead of 8081)
                    bat '''
                        copy test-1.spec.ts test-ci.spec.ts
                        powershell -Command "(Get-Content test-ci.spec.ts) -replace '8081', '18081' | Set-Content test-ci.spec.ts"
                    '''
                    
                    // Install and run Playwright tests
                    bat '''
                        call npx playwright install
                        call npx playwright test test-ci.spec.ts --reporter=list
                    '''
                }
            }
            post {
                always {
                    // Capture logs for debugging
                    bat 'docker logs backend-test-%BUILD_NUMBER% > backend-logs.txt 2>&1 || echo "Could not get backend logs"'
                    bat 'docker logs frontend-test-%BUILD_NUMBER% > frontend-logs.txt 2>&1 || echo "Could not get frontend logs"'
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