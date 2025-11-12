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
                    // STEP 1: Clean up
                    bat '''
                        echo "=== CLEANING UP ==="
                        docker-compose -f docker-compose.test.yml down -v 2>nul || echo "Cleanup done"
                    '''
                    
                    // STEP 2: Create docker-compose file
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
                    
                    // STEP 3: Start services
                    bat '''
                        echo "=== STARTING SERVICES ==="
                        docker pull christienmushoriwa/todoback:latest
                        docker-compose -f docker-compose.test.yml up -d
                    '''
                    
                    // STEP 4: Wait for services
                    bat '''
                        echo "=== WAITING FOR SERVICES ==="
                        powershell -Command "Start-Sleep -Seconds 30"
                    '''
                    
                    // STEP 5: Check services
                    bat '''
                        echo "=== CHECKING SERVICES ==="
                        docker ps
                        curl -f http://localhost:8080/api/tutorials && echo "BACKEND OK" || echo "BACKEND FAILED"
                        curl -f http://localhost:8081/tutorials && echo "FRONTEND OK" || echo "FRONTEND FAILED"
                    '''
                    
                    // STEP 6: Run tests
                    bat '''
                        echo "=== RUNNING PLAYWRIGHT TESTS ==="
                        npx playwright install
                        npx playwright test test-1.spec.ts --reporter=list
                    '''
                }
            }
            post {
                always {
                    // STEP 7: Cleanup
                    bat '''
                        echo "=== FINAL CLEANUP ==="
                        docker-compose -f docker-compose.test.yml down -v 2>nul || echo "Final cleanup done"
                    '''
                }
            }
        }
    }
}