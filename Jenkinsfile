pipeline {
    agent any 

    environment {
        DOCKERHUB_CREDENTIALS = credentials('3bd8bf83-c1ec-4b92-b140-ff542d5c78c0')
        APP_NAME = "todofront"  
    }

    stages { 
        stage('SCM Checkout') {
            steps {
                git branch: 'main', url: ' https://github.com/christien0/angular-17-client.git'
            }
        }
        
        stage('Build docker image') {
            steps {  
                sh 'docker build -t $APP_NAME:$BUILD_NUMBER .'
            }
        }
        
        stage('login to dockerhub') {
            steps {
                sh 'echo $DOCKERHUB_CREDENTIALS_PSW | docker login -u $DOCKERHUB_CREDENTIALS_USR --password-stdin'
            }
        }
        
         stage('push image') {
            steps {
                sh 'docker push $APP_NAME:$BUILD_NUMBER'
            }
        }
    }
}