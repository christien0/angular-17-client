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
                    // STEP 1: Clean up (ignore errors)
                    bat """
                        echo "=== STEP 1: CLEANING UP ==="
                        if exist docker-compose.test.yml (
                            docker-compose -f docker-compose.test.yml down -v || echo "Cleanup failed, continuing..."
                        ) else (
                            echo "No docker-compose.test.yml found, skipping cleanup."
                        )
                    """

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
                        echo "=== STEP 3: STARTING SERVICES ==="
                        docker pull christienmushoriwa/todoback:latest
                        docker-compose -f docker-compose.test.yml up -d
                    '''

                    // STEP 4: Wait for services
                    bat '''
                        echo "=== STEP 4: WAITING 30 SECONDS FOR SERVICES ==="
                        powershell -Command "Start-Sleep -Seconds 30"
                    '''

                    // STEP 5: Check services
                    bat '''
                        echo "=== STEP 5: CHECKING SERVICES ==="
                        docker ps
                        curl -f http://localhost:8080/api/tutorials && echo "✓ BACKEND OK" || echo "✗ BACKEND FAILED"
                        curl -f http://localhost:8081/tutorials && echo "✓ FRONTEND OK" || echo "✗ FRONTEND FAILED"
                    '''
                }
            }
            post {
                always {
                    bat '''
                        echo "=== STEP 7: FINAL CLEANUP ==="
                        if exist docker-compose.test.yml (
                            docker-compose -f docker-compose.test.yml down -v || echo "Final cleanup failed, continuing..."
                        ) else (
                            echo "No docker-compose.test.yml found, skipping cleanup."
                        )
                    '''
                }
            }
        } // ← closes the Run Integration Tests stage
    } // ← closes stages
} // ← closes pipeline
