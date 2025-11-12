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
                    // Clean up any existing containers first
                    bat 'docker-compose -f docker-compose.test.yml down -v 2>nul'
                    
                    // Pull backend image
                    bat 'docker pull christienmushoriwa/todoback:latest'
                    
                    // Create simple docker-compose
                    writeFile file: 'docker-compose.test.yml', text: """
services:
  backend:
    image: christienmushoriwa/todoback:latest
    ports:
      - "18080:8080"

  frontend:
    image: christienmushoriwa/todofront:latest
    ports:
      - "18081:80"
    depends_on:
      - backend
"""
                    
                    // Start services
                    bat 'docker-compose -f docker-compose.test.yml up -d'
                    
                    // Wait for services (Windows compatible)
                    bat 'timeout /t 30 /nobreak'
                    
                    // Check if services are running
                    bat 'docker ps'
                    
                    // Wait for backend API to be ready
                    bat """
                        echo Waiting for backend API to be ready...
                        set MAX_RETRIES=12
                        set RETRY_COUNT=0
                        :RETRY_BACKEND
                        curl -f http://localhost:18080/api/tutorials > nul
                        if !errorlevel! == 0 (
                            echo Backend API is ready!
                            goto BACKEND_READY
                        )
                        set /a RETRY_COUNT=RETRY_COUNT+1
                        if !RETRY_COUNT! geq !MAX_RETRIES! (
                            echo Backend API not ready after 120 seconds
                            docker logs to-do-front-backend-1
                            exit 1
                        )
                        echo Backend API not ready yet, waiting 10 seconds... (Attempt !RETRY_COUNT!/!MAX_RETRIES!)
                        timeout /t 10 /nobreak
                        goto RETRY_BACKEND
                        :BACKEND_READY
                    """
                    
                    // Wait for frontend to be ready
                    bat """
                        echo Waiting for frontend to be ready...
                        set MAX_RETRIES=12
                        set RETRY_COUNT=0
                        :RETRY_FRONTEND
                        curl -f http://localhost:18081/tutorials > nul
                        if !errorlevel! == 0 (
                            echo Frontend is ready!
                            goto FRONTEND_READY
                        )
                        set /a RETRY_COUNT=RETRY_COUNT+1
                        if !RETRY_COUNT! geq !MAX_RETRIES! (
                            echo Frontend not ready after 120 seconds
                            docker logs to-do-front-frontend-1
                            exit 1
                        )
                        echo Frontend not ready yet, waiting 10 seconds... (Attempt !RETRY_COUNT!/!MAX_RETRIES!)
                        timeout /t 10 /nobreak
                        goto RETRY_FRONTEND
                        :FRONTEND_READY
                    """
                    
                    // Create test directory and copy test file
                    bat '''
                        if not exist e2e mkdir e2e
                        copy test-1.spec.ts e2e\\test-ci.spec.ts
                    '''
                    
                    // Modify test file to use new port (18081 instead of 8081)
                    bat '''
                        powershell -Command "(Get-Content e2e/test-ci.spec.ts) -replace '8081', '18081' | Set-Content e2e/test-ci.spec.ts"
                    '''
                    
                    // Install and run Playwright tests
                    bat '''
                        npx playwright install
                        npx playwright test e2e/test-ci.spec.ts --reporter=list
                    '''
                }
            }
            post {
                always {
                    script {
                        // Capture logs for debugging
                        bat 'docker logs to-do-front-backend-1 > backend-logs.txt 2>nul || echo "Could not get backend logs"'
                        bat 'docker logs to-do-front-frontend-1 > frontend-logs.txt 2>nul || echo "Could not get frontend logs"'
                        
                        // Print logs to console
                        bat 'type backend-logs.txt 2>nul || echo "No backend logs available"'
                        bat 'type frontend-logs.txt 2>nul || echo "No frontend logs available"'
                        
                        // Cleanup
                        bat 'docker-compose -f docker-compose.test.yml down -v'
                    }
                }
            }
        }
    }
}