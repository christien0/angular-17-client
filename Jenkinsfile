pipeline {
    agent any

    environment {
        DOCKER_USER = "christienmushoriwa"
        BACKEND_APP_NAME = "todoback"
        FRONTEND_APP_NAME = "todofront"
        IMAGE_TAG = "latest"
    }

    triggers {
        pollSCM('H/1 * * * *') // poll every minute
    }

    stages {
        stage('SCM Checkout - Frontend') {
            steps {
                echo "=== CHECKING OUT FRONTEND SOURCE CODE ==="
                git branch: 'main', url: 'https://github.com/christien0/angular-17-client.git'
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                echo "=== BUILDING FRONTEND DOCKER IMAGE ==="
                bat "docker build -t ${DOCKER_USER}/${FRONTEND_APP_NAME}:${IMAGE_TAG} ."
            }
        }

        stage('Login to Docker Hub') {
            steps {
                echo "=== LOGGING INTO DOCKER HUB ==="
                withCredentials([usernamePassword(
                    credentialsId: '0a380709-8b0b-433e-8371-0710dada08be',
                    usernameVariable: 'DOCKER_USER_CRED',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat 'echo %DOCKER_PASS% | docker login -u %DOCKER_USER_CRED% --password-stdin'
                }
            }
        }

        stage('Push Frontend Docker Image') {
            steps {
                echo "=== PUSHING FRONTEND IMAGE TO DOCKER HUB ==="
                bat "docker push ${DOCKER_USER}/${FRONTEND_APP_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Run Integration & Regression Tests') {
            steps {
                script {
                    // Cleanup old containers
                    bat '''
                        echo "=== CLEANING UP OLD CONTAINERS ==="
                        docker-compose -f docker-compose.test.yml down -v 2>nul || echo Cleanup done
                    '''

                    // Write docker-compose.test.yml dynamically
                    writeFile file: 'docker-compose.test.yml', text: """
version: '3.8'
services:
  backend:
    image: ${DOCKER_USER}/${BACKEND_APP_NAME}:${IMAGE_TAG}
    ports:
      - "8080:8080"

  frontend:
    image: ${DOCKER_USER}/${FRONTEND_APP_NAME}:${IMAGE_TAG}
    ports:
      - "8081:80"
    depends_on:
      - backend
"""

                    // Pull backend image and start services
                    bat """
                        echo "=== STARTING DOCKER SERVICES ==="
                        docker pull ${DOCKER_USER}/${BACKEND_APP_NAME}:${IMAGE_TAG}
                        docker-compose -f docker-compose.test.yml up -d
                    """

                    // Wait for services to be ready
                    bat 'powershell -Command "Start-Sleep -Seconds 30"'

                    // Verify backend/frontend health
                    bat '''
                        echo "=== VERIFYING SERVICES ==="
                        docker ps
                        curl -f http://localhost:8080/api/tutorials && echo "✓ BACKEND OK" || exit /b 1
                        curl -f http://localhost:8081/tutorials && echo "✓ FRONTEND OK" || exit /b 1
                    '''

                    // Install Playwright and browsers
                    bat """
                        echo "=== INSTALLING PLAYWRIGHT ==="
                        call npm install -D @playwright/test

                        echo "=== INSTALLING BROWSERS ==="
                        call npx playwright install
                    """

                    // Run Playwright tests
                    bat """
                        echo "=== RUNNING PLAYWRIGHT TESTS ==="
                        npx playwright test --reporter=html,junit
                    """
                }
            }

            post {
                always {
                    echo "=== ARCHIVING TEST RESULTS AND CLEANING UP ==="

                    // Archive JUnit test results
                    script {
                        def junitFiles = findFiles(glob: 'playwright-report/results.xml')
                        if (junitFiles.length > 0) {
                            junit 'playwright-report/results.xml'
                        } else {
                            echo "No JUnit test results found"
                        }
                    }

                    // Archive HTML reports and screenshots
                    script {
                        def reports = findFiles(glob: 'playwright-report/**/*')
                        def screenshots = findFiles(glob: 'test-results/**/*.png')
                        if (reports.length > 0 || screenshots.length > 0) {
                            archiveArtifacts artifacts: 'playwright-report/**/*, test-results/**/*', fingerprint: true
                        } else {
                            echo "No HTML reports or screenshots to archive"
                        }
                    }

                    // Publish HTML report
                    script {
                        def htmlReport = findFiles(glob: 'playwright-report/index.html')
                        if (htmlReport.length > 0) {
                            publishHTML(target: [
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'playwright-report',
                                reportFiles: 'index.html',
                                reportName: 'Playwright HTML Test Report'
                            ])
                        } else {
                            echo "No HTML report found to publish"
                        }
                    }

                    // Cleanup containers
                    bat '''
                        echo "=== CLEANING UP DOCKER CONTAINERS ==="
                        docker-compose -f docker-compose.test.yml down -v 2>nul || echo Cleanup done
                    '''
                }
            }
        }
    }
}
