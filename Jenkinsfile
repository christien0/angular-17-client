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
                echo "=== CHECKING OUT SOURCE CODE ==="
                git branch: 'main', url: 'https://github.com/christien0/angular-17-client.git'
            }
        }

        stage('Build Docker Image') {
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

        stage('Push Docker Image') {
            steps {
                echo "=== PUSHING IMAGE TO DOCKER HUB ==="
                bat 'docker push %DOCKER_USER%/%APP_NAME%:%IMAGE_TAG%'
            }
        }

        stage('Run Integration & Regression Tests') {
            steps {
                script {
                    // Step 1: Cleanup
                    bat '''
                        echo "=== STEP 1: CLEANING UP OLD CONTAINERS ==="
                        docker-compose -f docker-compose.test.yml down -v 2>nul || echo "Cleanup done"
                    '''

                    // Step 2: Write docker-compose.test.yml dynamically
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

                    // Step 3: Start containers
                    bat '''
                        echo "=== STEP 3: PULLING IMAGES AND STARTING SERVICES ==="
                        docker pull christienmushoriwa/todoback:latest
                        docker-compose -f docker-compose.test.yml up -d
                    '''

                    // Step 4: Wait for startup
                    bat '''
                        echo "=== STEP 4: WAITING 30 SECONDS FOR SERVICES TO INITIALIZE ==="
                        powershell -Command "Start-Sleep -Seconds 30"
                    '''

                    // Step 5: Verify service availability
                    bat '''
                        echo "=== STEP 5: VERIFYING SERVICES ==="
                        docker ps
                        curl -f http://localhost:8080/api/tutorials && echo "✓ BACKEND OK" || exit /b 1
                        curl -f http://localhost:8081/tutorials && echo "✓ FRONTEND OK" || exit /b 1
                    '''

                    // Step 6: Run Playwright regression tests with reporters
                    bat '''
                        echo "=== STEP 6: RUNNING PLAYWRIGHT TESTS WITH REPORTERS ==="
                        npm install -D @playwright/test
                        npx playwright install --with-deps
                        npx playwright test test-1.spec.ts --reporter=junit,html
                    '''
                }
            }

            post {
                always {
                    // Step 7: Archive and publish test results, then cleanup
                    junit 'playwright-report/results.xml'

                    archiveArtifacts artifacts: 'playwright-report/**', fingerprint: true

                    publishHTML(target: [
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright HTML Test Report'
                    ])

                    bat '''
                        echo "=== STEP 8: CLEANING UP SERVICES ==="
                        docker-compose -f docker-compose.test.yml down -v 2>nul || echo "Cleanup done"
                    '''
                }
            }
        }
    }
}
