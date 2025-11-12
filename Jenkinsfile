stage('Run Integration Tests') {
    steps {
        script {
            // Clean up first
            bat 'docker-compose -f docker-compose.test.yml down -v 2>nul'
            
            // Pull backend
            bat 'docker pull christienmushoriwa/todoback:latest'
            
            // Create docker-compose
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
            
            // Start services
            bat 'docker-compose -f docker-compose.test.yml up -d'
            
            // Simple wait (no redirection)
            bat 'echo Waiting for services to start...'
            bat 'timeout /t 45 /nobreak'
            
            // Quick health checks
            bat 'curl http://localhost:8080/api/tutorials && echo Backend OK || echo Backend not ready'
            bat 'curl http://localhost:8081/tutorials && echo Frontend OK || echo Frontend not ready'
            
            // Prepare and run tests
            bat '''
                if not exist e2e mkdir e2e
                copy test-1.spec.ts e2e\\test-ci.spec.ts
                powershell -Command "(Get-Content e2e/test-ci.spec.ts) -replace '8081', '18081' | Set-Content e2e/test-ci.spec.ts"
                npx playwright install
                npx playwright test e2e/test-ci.spec.ts --reporter=list
            '''
        }
    }
    post {
        always {
            bat 'docker-compose -f docker-compose.test.yml down -v'
        }
    }
}