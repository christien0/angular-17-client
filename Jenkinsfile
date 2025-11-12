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
                    // Step 1: Clean up everything first
                    bat '''
                        echo Cleaning up previous containers...
                        docker-compose -f docker-compose.test.yml down -v 2>nul || echo No previous containers to clean
                        docker stop to-do-front-backend-1 to-do-front-frontend-1 2>nul || echo No containers to stop
                        docker rm to-do-front-backend-1 to-do-front-frontend-1 2>nul || echo No containers to remove
                    '''
                    
                    // Step 2: Kill processes using ports 8080 and 8081
                    bat '''
                        echo Checking for processes using ports 8080 and 8081...
                        for /f "tokens=5" %%p in ('netstat -ano ^| findstr :8080') do (
                            echo Killing process %%p using port 8080
                            taskkill /F /PID %%p 2>nul
                        )
                        for /f "tokens=5" %%p in ('netstat -ano ^| findstr :8081') do (
                            echo Killing process %%p using port 8081
                            taskkill /F /PID %%p 2>nul
                        )
                    '''
                    
                    // Step 3: Pull backend image
                    bat 'docker pull christienmushoriwa/todoback:latest'
                    
                    // Step 4: Create docker-compose with health checks
                    writeFile file: 'docker-compose.test.yml', text: """
services:
  backend:
    image: christienmushoriwa/todoback:latest
    ports:
      - "8080:8080"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/api/tutorials"]
      interval: 10s
      timeout: 5s
      retries: 10
      start_period: 40s

  frontend:
    image: christienmushoriwa/todofront:latest
    ports:
      - "8081:80"
    depends_on:
      backend:
        condition: service_healthy
"""
                    
                    // Step 5: Start services
                    bat 'docker-compose -f docker-compose.test.yml up -d'
                    
                    // Step 6: Wait using PowerShell (reliable)
                    bat 'powershell -Command "Write-Host ''Waiting for services to start...''; Start-Sleep -Seconds 45"'
                    
                    // Step 7: Check container status
                    bat '''
                        echo Container status:
                        docker ps
                        echo Backend logs:
                        docker logs to-do-front-backend-1
                        echo Frontend logs:
                        docker logs to-do-front-frontend-1
                    '''
                    
                    // Step 8: Wait for backend to be ready
                    bat '''
                        echo Waiting for backend to be ready...
                        set RETRY_COUNT=0
                        :CHECK_BACKEND
                        curl -f http://localhost:8080/api/tutorials > nul 2>&1
                        if !errorlevel! equ 0 (
                            echo Backend is ready!
                            goto BACKEND_READY
                        )
                        set /a RETRY_COUNT+=1
                        if !RETRY_COUNT! geq 15 (
                            echo ERROR: Backend not ready after 150 seconds
                            docker logs to-do-front-backend-1
                            exit 1
                        )
                        echo Backend not ready yet, retrying in 10 seconds... (!RETRY_COUNT!/15)
                        powershell -Command "Start-Sleep -Seconds 10"
                        goto CHECK_BACKEND
                        :BACKEND_READY
                    '''
                    
                    // Step 9: Wait for frontend to be ready
                    bat '''
                        echo Waiting for frontend to be ready...
                        set RETRY_COUNT=0
                        :CHECK_FRONTEND
                        curl -f http://localhost:8081/tutorials > nul 2>&1
                        if !errorlevel! equ 0 (
                            echo Frontend is ready!
                            goto FRONTEND_READY
                        )
                        set /a RETRY_COUNT+=1
                        if !RETRY_COUNT! geq 15 (
                            echo ERROR: Frontend not ready after 150 seconds
                            docker logs to-do-front-frontend-1
                            exit 1
                        )
                        echo Frontend not ready yet, retrying in 10 seconds... (!RETRY_COUNT!/15)
                        powershell -Command "Start-Sleep -Seconds 10"
                        goto CHECK_FRONTEND
                        :FRONTEND_READY
                    '''
                    
                    // Step 10: Final health check
                    bat '''
                        echo Final health check:
                        curl -f http://localhost:8080/api/tutorials && echo Backend API: OK
                        curl -f http://localhost:8081/tutorials && echo Frontend: OK
                    '''
                    
                    // Step 11: Run tests (NO PORT MODIFICATION NEEDED)
                    bat '''
                        echo Installing Playwright...
                        npx playwright install
                        echo Running tests...
                        npx playwright test test-1.spec.ts --reporter=list
                    '''
                }
            }
            post {
                always {
                    script {
                        // Capture logs
                        bat '''
                            echo === BACKEND LOGS ===
                            docker logs to-do-front-backend-1 > backend.log 2>&1
                            type backend.log
                            echo === FRONTEND LOGS ===
                            docker logs to-do-front-frontend-1 > frontend.log 2>&1
                            type frontend.log
                        '''
                        
                        // Cleanup
                        bat 'docker-compose -f docker-compose.test.yml down -v'
                    }
                }
            }
        }
    }
}