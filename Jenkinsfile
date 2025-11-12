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

                    // Pull backend image and start services - FIXED: Use bat with double quotes for env var expansion
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

                    // Create a basic Playwright test file if it doesn't exist
                    writeFile file: 'test-1.spec.ts', text: """
import { test, expect } from '@playwright/test';

test('frontend application loads', async ({ page }) => {
  console.log('Navigating to frontend...');
  await page.goto('http://localhost:8081');
  
  // Wait for the app to load
  await page.waitForTimeout(5000);
  
  // Check if the page title is correct
  const title = await page.title();
  expect(title).toBe('Angular17Crud');
  
  console.log('Frontend loaded successfully');
});

test('backend API is accessible', async ({ request }) => {
  console.log('Testing backend API...');
  const response = await request.get('http://localhost:8080/api/tutorials');
  expect(response.status()).toBe(200);
  
  const responseBody = await response.json();
  console.log('Backend API response received');
});

test('frontend tutorials page loads', async ({ page }) => {
  console.log('Testing tutorials page...');
  await page.goto('http://localhost:8081/tutorials');
  
  // Wait for page to load
  await page.waitForTimeout(3000);
  
  // Take a screenshot for debugging
  await page.screenshot({ path: 'tutorials-page.png' });
  console.log('Tutorials page test completed');
});
"""

                    // Create Playwright config file
                    writeFile file: 'playwright.config.ts', text: """
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  reporter: [
    ['html', { outputFolder: 'playwright-report' }],
    ['junit', { outputFile: 'playwright-report/results.xml' }]
  ],
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
});
"""

                    // Run Playwright tests with proper setup
                    bat """
                        echo "=== STEP 6: INSTALLING PLAYWRIGHT ==="
                        npm install -D @playwright/test
                        
                        echo "=== STEP 7: INSTALLING BROWSERS ==="
                        npx playwright install --with-deps
                        
                        echo "=== STEP 8: RUNNING PLAYWRIGHT TESTS ==="
                        npx playwright test test-1.spec.ts --reporter=html,junit
                    """
                }
            }

            post {
                always {
                    echo "=== ARCHIVING TEST RESULTS AND CLEANING UP ==="
                    // Archive JUnit test results
                    junit 'playwright-report/results.xml'

                    // Archive HTML report and screenshots
                    archiveArtifacts artifacts: 'playwright-report/**/*, *.png', fingerprint: true

                    // Publish HTML report
                    publishHTML(target: [
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright HTML Test Report'
                    ])

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