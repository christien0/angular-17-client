pipeline {
    agent any

    environment {
        REGISTRY = "your-docker-registry"
        SNAPSHOT_TAG = "your-image-name:snapshot"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                script {
                    bat '''
                        echo "=== STEP 1: BUILDING BACKEND DOCKER IMAGE ==="
                        docker build -f Dockerfile-backend -t %REGISTRY%/%SNAPSHOT_TAG% .
                    '''
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                script {
                    bat '''
                        echo "=== STEP 2: BUILDING FRONTEND DOCKER IMAGE ==="
                        docker build -f Dockerfile-frontend -t %REGISTRY%/%SNAPSHOT_TAG%-frontend .
                    '''
                }
            }
        }

        stage('Start Docker Containers') {
            steps {
                script {
                    bat '''
                        echo "=== STEP 3: STARTING DOCKER CONTAINERS ==="
                        docker-compose -f docker-compose.test.yml up -d
                    '''
                }
            }
        }

        stage('Wait For Services') {
            steps {
                echo 'Waiting 30 seconds for containers to be ready...'
                sleep 30
            }
        }

        stage('Run Integration & Regression Tests') {
            steps {
                script {
                    bat '''
                        echo "=== STEP 4: RUNNING PLAYWRIGHT REGRESSION TESTS ==="
                        npm install -D @playwright/test
                        npx playwright install --with-deps
                        npx playwright test test-1.spec.ts --reporter=junit,html
                    '''
                }
            }
            post {
                always {
                    echo "=== ARCHIVING PLAYWRIGHT TEST RESULTS ==="
                    junit 'playwright-report/results.xml'
                    archiveArtifacts artifacts: 'playwright-report/**', fingerprint: true

                    publishHTML(target: [
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Test Report'
                    ])
                }
            }
        }
    }

    post {
        always {
            echo "=== FINAL CLEANUP: STOPPING AND REMOVING CONTAINERS ==="
            bat '''
                docker-compose -f docker-compose.test.yml down -v 2>nul || echo "Cleanup done"
            '''
        }
    }
}
