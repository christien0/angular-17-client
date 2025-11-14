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
        stage('Checkout Frontend Code') {
            steps {
                echo "=== CHECKING OUT FRONTEND SOURCE CODE ==="
                git branch: 'main', url: 'https://github.com/christien0/angular-17-client.git'
            }
        }

        stage('Run Regression Tests') {
            steps {
                script {
                    echo "=== CLEANING UP OLD TEST CONTAINERS ==="
                    bat 'docker-compose -f docker-compose.test.yml down -v 2>nul || echo Cleanup done'

                    echo "=== WRITING docker-compose.test.yml ==="
                    writeFile file: 'docker-compose.test.yml', text: """
version: '3.8'
services:
  backend:
    image: ${DOCKER_USER}/${BACKEND_APP_NAME}:${IMAGE_TAG}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://backend:8080/api/tutorials"]
      interval: 5s
      timeout: 3s
      retries: 5

  frontend:
    image: ${DOCKER_USER}/${FRONTEND_APP_NAME}:${IMAGE_TAG}
    depends_on:
      backend:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://frontend"]
      interval: 5s
      timeout: 3s
      retries: 5

  playwright:
    image: mcr.microsoft.com/playwright:v1.45.0-focal
    working_dir: /tests
    volumes:
      - ./:/tests
    depends_on:
      backend:
        condition: service_healthy
      frontend:
        condition: service_healthy
    command: >
      bash -c "
      npm install -D @playwright/test &&
      npx playwright install &&
      # Run your existing script explicitly
      npx playwright test tests/test-1.spec.ts --reporter=html,junit
      "
"""

                    echo "=== STARTING TEST CONTAINERS ==="
                    bat 'docker-compose -f docker-compose.test.yml up --abort-on-container-exit'
                }
            }

            post {
                always {
                    echo "=== ARCHIVING TEST RESULTS ==="

                    script {
                        def junitFiles = findFiles(glob: 'playwright-report/results.xml')
                        if (junitFiles.length > 0) {
                            junit 'playwright-report/results.xml'
                        } else {
                            echo "No JUnit test results found"
                        }

                        def reports = findFiles(glob: 'playwright-report/**/*')
                        if (reports.length > 0) {
                            archiveArtifacts artifacts: 'playwright-report/**/*', fingerprint: true
                        } else {
                            echo "No HTML reports found to archive"
                        }

                        def htmlReport = findFiles(glob: 'playwright-report/index.html')
                        if (htmlReport.length > 0) {
                            publishHTML(target: [
                                allowMissing: false,
                                alwaysLinkToLastBuild: true,
                                keepAll: true,
                                reportDir: 'playwright-report',
                                reportFiles: 'index.html',
                                reportName: 'Playwright Regression Report'
                            ])
                        } else {
                            echo "No HTML report found to publish"
                        }
                    }

                    echo "=== CLEANING UP TEST CONTAINERS ==="
                    bat 'docker-compose -f docker-compose.test.yml down -v 2>nul || echo Cleanup done'
                }
            }
        }

        stage('Build & Push Frontend Docker Image') {
            steps {
                echo "=== BUILDING FRONTEND DOCKER IMAGE ==="
                bat "docker build -t ${DOCKER_USER}/${FRONTEND_APP_NAME}:${IMAGE_TAG} ."

                echo "=== LOGGING INTO DOCKER HUB ==="
                withCredentials([usernamePassword(
                    credentialsId: '0a380709-8b0b-433e-8371-0710dada08be',
                    usernameVariable: 'DOCKER_USER_CRED',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    bat 'echo %DOCKER_PASS% | docker login -u %DOCKER_USER_CRED% --password-stdin'
                }

                echo "=== PUSHING FRONTEND IMAGE TO DOCKER HUB ==="
                bat "docker push ${DOCKER_USER}/${FRONTEND_APP_NAME}:${IMAGE_TAG}"
            }
        }
    }
}
