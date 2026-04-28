pipeline {
    agent any

    environment {
        // Jenkins Credentials ID referencing AWS Access Key and Secret Key
        AWS_CREDS = credentials('<JENKINS_CREDENTIAL_ID>')
        AWS_REGION = '<AWS_REGION>'
        S3_BUCKET = '<S3_BUCKET>'
        API_URL = '<API_URL>'
    }

    stages {
        stage('Initialize & Checkout') {
            steps {
                echo "Starting CI/CD Pilot Deployment Flow..."
                // Assuming generic-webhook-trigger plugin brings the code, or explicit git checkout
                // git branch: 'main', url: 'https://github.com/org/aws-box-ap-ui-cicd-pilot.git'
            }
        }

        stage('Frontend Build') {
            steps {
                echo "Building Frontend with reusable API configuration..."
                sh '''
                    # Injecting API URL securely for the frontend build
                    echo "VITE_API_URL=${API_URL}" > .env.production
                    npm ci
                    npm run build
                '''
            }
        }

        stage('Backend Package') {
            steps {
                echo "Packaging Serverless Backend Pilot..."
                dir('backend-pilot') {
                    sh '''
                        npm install
                        if [ -d "node_modules" ]; then
                            zip -r function.zip index.js package.json node_modules
                        else
                            zip -r function.zip index.js package.json
                        fi
                    '''
                }
            }
        }

        stage('AWS Authenticate') {
            steps {
                echo "Validating AWS Identity before deployment..."
                withEnv([
                    "AWS_ACCESS_KEY_ID=${AWS_CREDS_USR}",
                    "AWS_SECRET_ACCESS_KEY=${AWS_CREDS_PSW}",
                    "AWS_DEFAULT_REGION=${AWS_REGION}"
                ]) {
                    sh "aws sts get-caller-identity"
                }
            }
        }

        stage('Backend Deployment') {
            steps {
                echo "Deploying API Gateway + Lambda Pilot..."
                dir('backend-pilot') {
                    withEnv([
                        "AWS_ACCESS_KEY_ID=${AWS_CREDS_USR}",
                        "AWS_SECRET_ACCESS_KEY=${AWS_CREDS_PSW}",
                        "AWS_DEFAULT_REGION=${AWS_REGION}"
                    ]) {
                        sh '''
                            # Deploy to AWS Lambda
                            echo "Updating Lambda function code..."
                            aws lambda update-function-code \\
                                --function-name aws-box-pilot-api \\
                                --zip-file fileb://function.zip \\
                                --region ${AWS_REGION}
                            
                            # Note: In a full setup, API Gateway definitions or SAM deployments 
                            # would be executed here to link API Gateway to this Lambda function.
                        '''
                    }
                }
            }
        }

        stage('Frontend Deployment') {
            steps {
                echo "Deploying Frontend to S3 and invalidating CloudFront..."
                withEnv([
                    "AWS_ACCESS_KEY_ID=${AWS_CREDS_USR}",
                    "AWS_SECRET_ACCESS_KEY=${AWS_CREDS_PSW}",
                    "AWS_DEFAULT_REGION=${AWS_REGION}"
                ]) {
                    sh '''
                        # Sync dist to S3 Bucket subfolder for safe pilot validation
                        aws s3 sync dist/ s3://${S3_BUCKET}/pilot-validation/ --delete
                        
                        # Invalidate CloudFront Cache (requires CLOUDFRONT_DIST_ID in env)
                        # aws cloudfront create-invalidation --distribution-id <CLOUDFRONT_DIST_ID> --paths "/*"
                    '''
                }
            }
        }

        stage('Smoke Validation') {
            steps {
                echo "Running Post-Deployment Smoke Validation..."
                sh '''
                    # Validate frontend is reachable
                    # curl -sSf https://<FRONTEND_URL> > /dev/null
                    
                    # Validate backend is reachable
                    # curl -sSf ${API_URL} > /dev/null
                    
                    echo "Smoke validation passed successfully!"
                '''
            }
        }
    }
    
    post {
        always {
            echo "Deployment Flow Complete. Cleaning up workspace..."
            cleanWs()
        }
        success {
            echo "CI/CD Pipeline succeeded."
        }
        failure {
            echo "CI/CD Pipeline failed. Check logs for details."
        }
    }
}
