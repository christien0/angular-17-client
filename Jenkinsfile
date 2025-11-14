pipeline {
    agent any

    environment {
        DOCKER_USER = "christienmushoriwa"
        BACKEND_APP_NAME = "todoback"
        FRONTEND_APP_NAME = "todofront"
        IMAGE_TAG = "latest"
    }

    triggers {
        pollSCM('H/1 * * * *')
    }

    stages {

        stage('SCM Checkout - Frontend') {
            steps {
                echo "=== CHECKING OUT FRONTEND SOURCE CODE ==="
                git branch: 'main', url: 'https://github.com/christien0/angular-17-client.git'
            }
        }

        /* -------------------------------------------------------------
         *  RUN ALL TESTS FIRST BEFORE BUILDING FRONTEND IMAGE
         * ----------------------------------------------------------- */
        stage('Run Integration & Regression Tests') {
            steps {
                script {
                    bat '''
                        echo "=== CLEANING UP OLD CONTAINERS ==="
                        docker-compose -f docker-compose.test.yml down -v 2>nul || echo Cleanup done
                    '''

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

                    bat """
                        echo "=== STARTING DOCKER SERVICES ==="
                        docker pull ${DOCKER_USER}/${BACKEND_APP_NAME}:${IMAGE_TAG}
                        docker pull ${DOCKER_USER}/${FRONTEND_APP_NAME}:${IMAGE_TAG}
                        docker-compose -f docker-compose.test.yml up -d
                    """

                    bat 'powershell -Command "Start-Sleep -Seconds 30"'

                    bat '''
                        echo "=== VERIFYING SERVICES ==="
                        docker ps
                        curl -f http://localhost:8080/api/tutorials || exit /b 1
                        curl -f http://localhost:8081/tutorials || exit /b 1
                    '''

                    bat """
                        echo "=== INSTALLING PLAYWRIGHT ==="
                        call npm install -D @playwright/test
                        call npx playwright install
                    """

                    bat """
                        echo "=== RUNNING PLAYWRIGHT TESTS ==="
                        npx playwright test --reporter=html,junit
                    """
                }
            }

            post {
                always {
                    echo "=== ARCHIVING TEST RESULTS AND CLEANING UP ==="

                    script {
                        def junitFiles = findFiles(glob: 'playwright-report/results.xml')
                        if (junitFiles.length > 0) {
                            junit 'playwright-report/results.xml'
                        }
                    }

                    script {
                        def reports = findFiles(glob: 'playwright-report/**/*')
                        def screenshots = findFiles(glob: 'test-results/**/*.png')

                        if (reports.length > 0 || screenshots.length > 0) {
                            archiveArtifacts artifacts: 'playwright-report/**/*, test-results/**/*', fingerprint: true
                        }
                    }

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
                        }
                    }

                    bat '''
                        echo "=== CLEANING UP DOCKER CONTAINERS ==="
                        docker-compose -f docker-compose.test.yml down -v 2>nul || echo Cleanup done
                    '''
                }
            }
        }

        /* -------------------------------------------------------------
         *  ONLY IF TESTS PASS → BUILD FRONTEND IMAGE
         * ----------------------------------------------------------- */
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
    }
}
