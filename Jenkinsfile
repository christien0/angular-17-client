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
                    credentialsId: '0a380709-8b0b-433e-8371-0710dada08be', 
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
