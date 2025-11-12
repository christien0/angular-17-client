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
                    // Clean up any existing test containers
                    bat '''
                        docker-compose -f docker-compose.test.yml down -v 2>nul || echo "Cleanup completed"
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
                    
                    // Pull backend and start services
                    bat '''
                        docker pull christienmushoriwa/todoback:latest
                        docker-compose -f docker-compose.test.yml up -d
                    '''
                    
                    // Wait for Spring Boot to fully start (it takes ~10 seconds)
                    bat 'powershell -Command "Write-Host ''Waiting 20 seconds for Spring Boot...''; Start-Sleep -Seconds 20"'
                    
                    // Quick health check
                    bat '''
                        echo "=== Health Check ==="
                        curl -s http://localhost:8080/api/tutorials > nul && echo "✓ Backend ready" || echo "✗ Backend not ready"
                        curl -s http://localhost:8081/tutorials > nul && echo "✓ Frontend ready" || echo "✗ Frontend not ready"
                    '''
                    
                    // Run Playwright tests
                    bat '''
                        npx playwright install
                        npx playwright test test-1.spec.ts --reporter=list
                    '''
                }
            }
            post {
                always {
                    // Cleanup
                    bat '''
                        docker-compose -f docker-compose.test.yml down -v 2>nul || echo "Cleanup completed"
                    '''
                }
            }
        }
    }
}