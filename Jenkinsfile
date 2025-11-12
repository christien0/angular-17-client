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
                    // Clean up any existing containers
                    bat '''
                        echo "=== Cleaning up previous containers ==="
                        docker-compose -f docker-compose.test.yml down -v 2>nul || echo "No previous containers"
                        docker stop to-do-front-backend-1 to-do-front-frontend-1 2>nul || echo "No containers to stop"
                        docker rm to-do-front-backend-1 to-do-front-frontend-1 2>nul || echo "No containers to remove"
                    '''
                    
                    // Create docker-compose file
                    writeFile file: 'docker-compose.test.yml', text: """
services:
  backend:
    image: christienmushoriwa/todoback:latest
    ports:
      - "8080:8080"

  frontend:
    image: christienmushoriwa/todofront:latest
    ports:
      - "8081:80"
    depends_on:
      - backend
"""
                    
                    // Start services in background
                    bat '''
                        echo "=== Starting services ==="
                        docker pull christienmushoriwa/todoback:latest
                        docker-compose -f docker-compose.test.yml up -d
                    '''
                    
                    // Wait for Spring Boot to fully start
                    bat '''
                        echo "=== Waiting 30 seconds for Spring Boot to fully start ==="
                        powershell -Command "Start-Sleep -Seconds 30"
                    '''
                    
                    // Verify services are running
                    bat '''
                        echo "=== Service Status ==="
                        docker ps
                        echo.
                        echo "=== Backend Check ==="
                        curl -f http://localhost:8080/api/tutorials > nul && echo "✓ Backend API is working" || echo "✗ Backend API not working"
                        echo.
                        echo "=== Frontend Check ==="
                        curl -f http://localhost:8081/tutorials > nul && echo "✓ Frontend is working" || echo "✗ Frontend not working"
                    '''
                    
                    // Run Playwright tests
                    bat '''
                        echo "=== Running Playwright Tests ==="
                        npx playwright install
                        npx playwright test test-1.spec.ts --reporter=list
                    '''
                }
            }
            post {
                always {
                    script {
                        // Capture final logs for debugging
                        bat '''
                            echo "=== Final Logs ==="
                            docker logs to-do-front-backend-1 --tail 50 2>nul || echo "No backend logs"
                            docker logs to-do-front-frontend-1 --tail 50 2>nul || echo "No frontend logs"
                        '''
                        
                        // Cleanup
                        bat '''
                            echo "=== Cleaning Up ==="
                            docker-compose -f docker-compose.test.yml down -v 2>nul || echo "Cleanup completed"
                        '''
                    }
                }
            }
        }
    }
}