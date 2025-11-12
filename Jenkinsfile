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
                echo "=== CHECKING OUT FRONTEND SOURCE CODE ==="
                git branch: 'main', url: 'https://github.com/christien0/angular-17-client.git'
            }
        }

        stage('Build Frontend Docker Image') {
            steps {  
                echo "=== BUILDING FRONTEND DOCKER IMAGE ==="
                bat 'docker build -t %DOCKER_USER%/%APP_NAME%:%IMAGE_TAG% .'
            }
        }

        stage('Login to Docker Hub') {
            steps {
                echo "=== LOGGING INTO DOCKER HUB ==="
                withCredentials([usernamePassword(
                    credentialsId: '0a380709-8b0b-433e-8371-0710dada08be', 
                    usernameVariable: 'DOCKER_USER', 
                    passwordVariable: 'DOCKER_PASS')]) {
                    bat 'echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin'
                }
            }
        }

        stage('Push Frontend Docker Image') {
            steps {
                echo "=== PUSHING FRONTEND IMAGE TO DOCKER HUB ==="
                bat 'docker push %DOCKER_USER%/%APP_NAME%:%IMAGE_TAG%'
            }
        }

        stage('Run Integration & Regression Tests') {
            steps {
                script {
                    // Write docker-compose file dynamically for tests
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

                    // Bring up backend and frontend from images
                    bat '''
                        docker pull christienmushoriwa/todoback:latest
                        docker pull christienmushoriwa/todofront:latest
                        docker-compose -f docker-compose.test.yml up -d
                    '''

                    // Wait for services to be ready
                    bat 'powershell -Command "Start-Sleep -Seconds 30"'

                    // Check backend and frontend health
                    bat '''
                        curl -f http://localhost:8080/api/tutorials && echo Backend is up || exit /b 1
                        curl -f http://localhost:8081/tutorials && echo Frontend is up || exit /b 1
                    '''

                    // Run Playwright tests
                    bat '''
                        npm install -D @playwright/test
                        npx playwright install --with-deps
                        npx playwright test test-1.spec.ts --reporter=list
                    '''
                }
            }

            post {
                always {
                    bat '''
                        docker-compose -f docker-compose.test.yml down -v || echo Cleanup done
                    '''
                }
            }
        }
    }
}
