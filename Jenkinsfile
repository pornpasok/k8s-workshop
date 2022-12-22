pipeline {
    agent any
    environment {
        APP_GIT_URL = "https://github.com/pornpasok/k8s-workshop"
        APP_BRANCH = "main"
        APP_TAG = "latest"
        APP_NAME = "ton-app"
        APP_PORT = "3000"
        DEV_PROJECT = "workshop"
        SQ_SERVER = "https://sq.gmmo.tech"
        ECR_SERVER = "299745677970.dkr.ecr.ap-southeast-1.amazonaws.com"
        AWS_DEFAULT_REGION = "ap-southeast-1"
        AWS_DEFAULT_PROFILE = "default"
        DOMAIN_NAME = "gmmo.tech"

    }
    
    stages {
        stage('Clean') {
            steps {
                echo 'Clean Workspace'
                sh '''
                    env
                    rm -rf *
                '''
                echo 'Clean App'
                sh '''
                    if kubectl get deployment ${APP_NAME} -n ${DEV_PROJECT}; then echo exists && kubectl delete deployment ${APP_NAME} -n ${DEV_PROJECT} && kubectl delete svc ${APP_NAME} -n ${DEV_PROJECT}; else echo no deployment; fi
                '''
            }
        }

        stage('SCM') {
            steps {
                echo 'Pull code from SCM'
                git(
                    url: "${APP_GIT_URL}",
                    //credentialsId: 'gmmo-gitlab',
                    branch: "${APP_BRANCH}"
                )
            }
        }

        // stage('Source Code Scan') {
        //     steps {
        //         echo 'Source Code Scan SonarQube'
        //         withCredentials([string(credentialsId: 'sq-token', variable: 'SQ_TOKEN')]) {
        //             sh '''
        //                 sonar-scanner \
        //                 -Dsonar.projectKey="${APP_NAME}" \
        //                 -Dsonar.sources=. \
        //                 -Dsonar.host.url="${SQ_SERVER}" \
        //                 -Dsonar.login="$SQ_TOKEN"
        //             '''
        //         }
        //     }
        // }

        stage('Logging into AWS ECR') {
            steps {
                echo "Logging into AWS ECR"
                sh '''
                    aws ecr get-login-password --region ${AWS_DEFAULT_REGION} --profile ${AWS_DEFAULT_PROFILE}| docker login --username AWS --password-stdin ${ECR_SERVER}
                '''  
            }
        }

        stage('Build Docker Images') {
            steps {
                echo 'Build Docker Images'
                sh '''
                    docker build -t ${ECR_SERVER}/${APP_NAME}:${APP_TAG} .
                '''
            }
        }

        stage('Push Images to Artifactory') {
            steps {
                echo 'Push Images to Artifactory'
                sh '''
                    # Docker Tag
                    docker tag ${ECR_SERVER}/${APP_NAME}:${APP_TAG} ${ECR_SERVER}/${APP_NAME}:${APP_TAG}

                    # Docker Push
                    docker push ${ECR_SERVER}/${APP_NAME}:${APP_TAG}
                '''
            }
        }

        stage('Deploy to Dev ENV') {
            steps {
                echo 'Deploy to Dev ENV'
                sh '''
                    kubectl create deployment ${APP_NAME} -n ${DEV_PROJECT} --image=${ECR_SERVER}/${APP_NAME}:${APP_TAG}
                '''
            }
        }

        stage('Expose Service to Dev ENV') {
            steps {
                echo 'Expose Service to Dev ENV'
                sh '''
                    kubectl expose deployment ${APP_NAME} -n ${DEV_PROJECT} --port=80 --target-port=${APP_PORT}
                '''

            }
        }

        stage('Create Ingress') {
            steps {
                echo 'Create Ingress'
                sh '''
                    cat <<EOF | kubectl apply -f -
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${APP_NAME}
  namespace: ${DEV_PROJECT}
  annotations:
    kubernetes.io/ingress.class: nginx
spec:
  rules:
  - host: ${APP_NAME}-${DEV_PROJECT}.${DOMAIN_NAME}
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${APP_NAME}
            port: 
              number: 80
EOF
                '''

            }
        }


        stage('Scale App') {
            steps {
                echo 'Scale App'
                sh '''
                    kubectl scale deployment ${APP_NAME} -n ${DEV_PROJECT} --replicas=1
                '''
            }
        }

        // stage('Get App Endpoint') {
        //     steps {
        //         echo 'Get App Endpoint'
        //         sh '''
        //             sleep 30
        //             kubectl get service ${APP_NAME} -n ${DEV_PROJECT} | tail -n +2 | awk '{print $4}'
        //             ELB_ENDPOINT=$(kubectl get service ${APP_NAME} -n ${DEV_PROJECT} | tail -n +2 | awk '{print $4}')
        //             echo "ELB_ENDPOINT: http://$ELB_ENDPOINT"
        //         '''
        //     }
        // }

        stage('Check App') {
            steps {
                echo 'Check App'
                sh '''
                    sleep 30
                    # AWS ELB 
                    #STATUSCODE=$(curl -s -o /dev/null -I -w "%{http_code}" http://$ELB_ENDPOINT)

                    # Service
                    STATUSCODE=$(curl -s -o /dev/null -I -w "%{http_code}" http://${APP_NAME}-${DEV_PROJECT}.${DOMAIN_NAME})
                    if test $STATUSCODE -ne 200; then echo ERROR:$STATUSCODE && exit 1; else echo SUCCESS; fi;
                '''
            }
        }

    }
}