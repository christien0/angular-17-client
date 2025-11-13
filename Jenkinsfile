pipeline {
    agent any

    environment {
        DOCKER_USER = "christienmushoriwa"
        BACKEND_APP_NAME = "todoback"
        FRONTEND_APP_NAME = "todofront"
        IMAGE_TAG = "latest"
    }

    triggers {
        pollSCM('H/5 * * * *') // poll every 5 minutes
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
                    // Cleanup old containers and volumes
                    bat '''
                        echo "=== STEP 1: CLEANING UP OLD CONTAINERS ==="
                        docker-compose -f docker-compose.test.yml down -v 2>nul || echo Cleanup done
                    '''

                    // Dynamically write docker-compose.test.yml for backend & frontend images
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
                        echo "=== STEP 3: PULLING BACKEND IMAGE AND STARTING SERVICES ==="
                        docker pull ${DOCKER_USER}/${BACKEND_APP_NAME}:${IMAGE_TAG}
                        docker-compose -f docker-compose.test.yml up -d
                    """

                    // Wait 30 seconds for services to start
                    bat 'powershell -Command "Start-Sleep -Seconds 30"'

                    // Verify services are running
                    bat '''
                        echo "=== STEP 5: VERIFYING SERVICES ==="
                        docker ps
                        curl -f http://localhost:8080/api/tutorials && echo "✓ BACKEND OK" || exit /b 1
                        curl -f http://localhost:8081/tutorials && echo "✓ FRONTEND OK" || exit /b 1
                    '''

                    // Install and run Playwright tests - USING YOUR EXISTING TESTS
                    bat """
                        echo "=== STEP 6: INSTALLING PLAYWRIGHT ==="
                        call npm install -D @playwright/test
                        
                        echo "=== STEP 7: INSTALLING BROWSERS ==="
                        call npx playwright install
                        
                        echo "=== STEP 8: VERIFYING TESTS ARE FOUND ==="
                        npx playwright test --list
                        
                        echo "=== STEP 9: RUNNING PLAYWRIGHT TESTS IN HEADED MODE ==="
                        set PWDEBUG=1
                        npx playwright test --headed --reporter=html,junit,list
                    """
                }
            }

            post {
                always {
                    echo "=== ARCHIVING TEST RESULTS AND CLEANING UP ==="
                    // Archive JUnit test results
                    script {
                        def testResults = findFiles(glob: 'playwright-report/results.xml')
                        if (testResults.length > 0) {
                            junit 'playwright-report/results.xml'
                        } else {
                            echo "No test result files found to archive"
                        }
                    }

                    // Archive HTML report and screenshots
                    script {
                        def reportFiles = findFiles(glob: 'playwright-report/**/*')
                        def screenshotFiles = findFiles(glob: '*.png')
                        if (reportFiles.length > 0 || screenshotFiles.length > 0) {
                            archiveArtifacts artifacts: 'playwright-report/**/*, *.png', fingerprint: true
                        } else {
                            echo "No report files or screenshots found to archive"
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