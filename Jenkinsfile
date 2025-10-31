pipeline {
    agent any 

    environment {
        APP_NAME = "todofront"
        IMAGE_TAG = "latest"
    }

    stages { 
        stage('SCM Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/christien0/angular-17-client.git'
            }
        }

        stage('Build Docker Image') {
            steps {  
                bat 'docker build -t %APP_NAME%:%IMAGE_TAG% .'
            }
        }

        stage('Login to Docker Hub') {
            steps {
                // Securely inject Docker Hub username & token
                withCredentials([usernamePassword(
                    credentialsId: '3bd8bf83-c1ec-4b92-b140-ff542d5c78c0', 
                    usernameVariable: 'DOCKER_USER', 
                    passwordVariable: 'DOCKER_PASS')]) {
                    bat 'echo %DOCKER_PASS% | docker login -u %DOCKER_USER% --password-stdin'
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                bat 'docker push %APP_NAME%:%IMAGE_TAG%'
            }
        }
    }
}
