pipeline {
    agent any 

    environment {
        DOCKER_USER = "christienmushoriwa" 
        APP_NAME = "todofront"
        IMAGE_TAG = "latest"
    }

    stages { 
        stage('Detailed Debug') {
            steps {
                script {
                    // Clean everything
                    bat '''
                        echo "=== COMPLETE CLEANUP ==="
                        docker-compose down 2>nul || echo "No compose files"
                        docker stop $(docker ps -aq) 2>nul || echo "No containers to stop"
                        docker rm $(docker ps -aq) 2>nul || echo "No containers to remove"
                        docker system prune -f
                    '''
                    
                    // Test Backend in foreground to see real-time logs
                    bat '''
                        echo "=== TESTING BACKEND WITH REAL-TIME LOGS ==="
                        echo "Starting backend container..."
                        docker run --name debug-backend -p 8080:8080 christienmushoriwa/todoback:latest &
                        echo "Backend started in background, waiting 30 seconds..."
                        powershell -Command "Start-Sleep -Seconds 30"
                        
                        echo "=== BACKEND STATUS ==="
                        docker ps -a | findstr "debug-backend"
                        
                        echo "=== BACKEND LOGS (last 100 lines) ==="
                        docker logs --tail 100 debug-backend 2>nul || echo "No backend logs available"
                        
                        echo "=== BACKEND PROCESS CHECK ==="
                        docker exec debug-backend ps aux 2>nul || echo "Cannot check processes - container may not be running"
                        
                        echo "=== BACKEND PORT CHECK ==="
                        netstat -ano | findstr :8080 || echo "Nothing listening on port 8080"
                        
                        echo "=== BACKEND HTTP TEST ==="
                        curl -v --max-time 10 http://localhost:8080/api/tutorials && echo "SUCCESS: Backend responded!" || echo "FAILED: Backend not responding"
                        
                        docker stop debug-backend
                        docker rm debug-backend
                    '''
                    
                    // If backend works, test frontend
                    bat '''
                        echo "=== TESTING FRONTEND WITH REAL-TIME LOGS ==="
                        echo "Starting frontend container..."
                        docker run --name debug-frontend -p 8081:80 christienmushoriwa/todofront:latest &
                        echo "Frontend started in background, waiting 20 seconds..."
                        powershell -Command "Start-Sleep -Seconds 20"
                        
                        echo "=== FRONTEND STATUS ==="
                        docker ps -a | findstr "debug-frontend"
                        
                        echo "=== FRONTEND LOGS (last 100 lines) ==="
                        docker logs --tail 100 debug-frontend 2>nul || echo "No frontend logs available"
                        
                        echo "=== FRONTEND PROCESS CHECK ==="
                        docker exec debug-frontend ps aux 2>nul || echo "Cannot check processes - container may not be running"
                        
                        echo "=== FRONTEND PORT CHECK ==="
                        netstat -ano | findstr :8081 || echo "Nothing listening on port 8081"
                        
                        echo "=== FRONTEND HTTP TEST ==="
                        curl -v --max-time 10 http://localhost:8081/tutorials && echo "SUCCESS: Frontend responded!" || echo "FAILED: Frontend not responding"
                        
                        docker stop debug-frontend
                        docker rm debug-frontend
                    '''
                    
                    // Test both together
                    bat '''
                        echo "=== TESTING BOTH SERVICES TOGETHER ==="
                        writeFile file: 'debug-compose.yml', text: """
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
                        
                        docker-compose -f debug-compose.yml up -d
                        echo "Waiting 60 seconds for both services..."
                        powershell -Command "Start-Sleep -Seconds 60"
                        
                        echo "=== COMBINED STATUS ==="
                        docker ps -a
                        
                        echo "=== BACKEND DETAILS ==="
                        docker logs --tail 50 to-do-front-backend-1 2>nul || echo "No backend compose logs"
                        
                        echo "=== FRONTEND DETAILS ==="
                        docker logs --tail 50 to-do-front-frontend-1 2>nul || echo "No frontend compose logs"
                        
                        echo "=== FINAL CONNECTIVITY TEST ==="
                        curl -s http://localhost:8080/api/tutorials > nul && echo "✓ Backend accessible" || echo "✗ Backend not accessible"
                        curl -s http://localhost:8081/tutorials > nul && echo "✓ Frontend accessible" || echo "✗ Frontend not accessible"
                        
                        docker-compose -f debug-compose.yml down
                    '''
                }
            }
        }
    }
}