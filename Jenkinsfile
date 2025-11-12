pipeline {
    agent any 

    environment {
        DOCKER_USER = "christienmushoriwa" 
        APP_NAME = "todofront"
        IMAGE_TAG = "latest"
    }

    stages { 
        stage('Debug Setup') {
            steps {
                script {
                    // Clean everything first
                    bat '''
                        echo "=== CLEANING EVERYTHING ==="
                        docker-compose -f docker-compose.test.yml down -v 2>nul || echo "No compose cleanup needed"
                        docker stop to-do-front-backend-1 to-do-front-frontend-1 2>nul || echo "No containers to stop"
                        docker rm to-do-front-backend-1 to-do-front-frontend-1 2>nul || echo "No containers to remove"
                        docker system prune -f 2>nul || echo "Prune failed"
                    '''
                    
                    // Create docker-compose with more visibility
                    writeFile file: 'docker-compose.test.yml', text: """
services:
  backend:
    image: christienmushoriwa/todoback:latest
    ports:
      - "8080:8080"
    restart: unless-stopped

  frontend:
    image: christienmushoriwa/todofront:latest
    ports:
      - "8081:80"
    depends_on:
      - backend
    restart: unless-stopped
"""
                    
                    // Check if backend image exists
                    bat '''
                        echo "=== CHECKING BACKEND IMAGE ==="
                        docker images | findstr "todoback" || echo "Backend image not found locally"
                        docker pull christienmushoriwa/todoback:latest || echo "Failed to pull backend image"
                    '''
                    
                    // Start services in foreground to see what happens
                    bat '''
                        echo "=== STARTING SERVICES ==="
                        docker-compose -f docker-compose.test.yml up -d
                        
                        echo "=== IMMEDIATE CONTAINER STATUS ==="
                        docker ps -a
                        
                        echo "=== WAITING 10 SECONDS ==="
                        powershell -Command "Start-Sleep -Seconds 10"
                        
                        echo "=== CONTAINER STATUS AFTER 10 SECONDS ==="
                        docker ps -a
                        
                        echo "=== CHECKING BACKEND CONTAINER ==="
                        docker logs to-do-front-backend-1 2>nul || echo "Backend container not found or has no logs"
                        
                        echo "=== CHECKING FRONTEND CONTAINER ==="
                        docker logs to-do-front-frontend-1 2>nul || echo "Frontend container not found or has no logs"
                    '''
                    
                    // Test backend manually
                    bat '''
                        echo "=== TESTING BACKEND MANUALLY ==="
                        docker run -d --name test-backend -p 8080:8080 christienmushoriwa/todoback:latest
                        powershell -Command "Start-Sleep -Seconds 10"
                        docker ps -a | findstr "test-backend"
                        docker logs test-backend 2>nul || echo "Test backend has no logs"
                        curl -v http://localhost:8080/api/tutorials 2>nul && echo "Backend working!" || echo "Backend not responding"
                        docker stop test-backend
                        docker rm test-backend
                    '''
                    
                    // Test frontend manually
                    bat '''
                        echo "=== TESTING FRONTEND MANUALLY ==="
                        docker run -d --name test-frontend -p 8081:80 christienmushoriwa/todofront:latest
                        powershell -Command "Start-Sleep -Seconds 10"
                        docker ps -a | findstr "test-frontend"
                        docker logs test-frontend 2>nul || echo "Test frontend has no logs"
                        curl -v http://localhost:8081/tutorials 2>nul && echo "Frontend working!" || echo "Frontend not responding"
                        docker stop test-frontend
                        docker rm test-frontend
                    '''
                }
            }
        }
    }
}