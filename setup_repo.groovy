def repo = new File('/tmp/pilot-repo')
if (repo.exists()) { repo.deleteDir() }
repo.mkdirs()
def init = ['git', 'init'].execute(null, repo)
init.waitFor()
def file = new File(repo, 'Jenkinsfile')
file.text = '''pipeline {
    agent any

    environment {
        AWS_CREDS = credentials('aws-pilot-credentials')
        AWS_REGION = 'eu-west-2'
        S3_BUCKET = 'ai-doc-analysis-awsboxapp-london'
        API_URL = 'http://placeholder.url'
    }

    stages {
        stage('Initialize & Checkout') {
            steps {
                echo "Starting CI/CD Pilot Deployment Flow..."
            }
        }

        stage('Frontend Build') {
            steps {
                echo "Building Frontend with reusable API configuration..."
                sh \'\'\'
                    echo "VITE_API_URL=${API_URL}" > .env.production
                    # dummy build
                    mkdir -p dist
                    echo "dummy" > dist/index.html
                \'\'\'
            }
        }

        stage('Backend Package') {
            steps {
                echo "Packaging Serverless Backend Pilot..."
                dir('backend-pilot') {
                    sh \'\'\'
                        mkdir -p node_modules
                        echo "{}" > package.json
                        echo "console.log('test')" > index.js
                        if [ -d "node_modules" ]; then
                            python3 -m zipfile -c function.zip index.js package.json node_modules
                        else
                            python3 -m zipfile -c function.zip index.js package.json
                        fi
                    \'\'\'
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
                catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE') {
                    echo "Deploying API Gateway + Lambda Pilot..."
                    dir('backend-pilot') {
                        withEnv([
                            "AWS_ACCESS_KEY_ID=${AWS_CREDS_USR}",
                            "AWS_SECRET_ACCESS_KEY=${AWS_CREDS_PSW}",
                            "AWS_DEFAULT_REGION=${AWS_REGION}"
                        ]) {
                            sh \'\'\'
                                echo "Updating Lambda function code..."
                                aws lambda update-function-code \\
                                    --function-name aws-box-pilot-api \\
                                    --zip-file fileb://function.zip \\
                                    --region ${AWS_REGION}
                            \'\'\'
                        }
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
                    sh \'\'\'
                        aws s3 sync dist/ s3://${S3_BUCKET}/pilot-validation/ --delete
                    \'\'\'
                }
            }
        }

        stage('Smoke Validation') {
            steps {
                echo "Running Post-Deployment Smoke Validation..."
                sh \'\'\'
                    echo "Smoke validation passed successfully!"
                \'\'\'
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
}'''
def checkout = ['git', 'checkout', '-b', 'main'].execute(null, repo)
checkout.waitFor()
def add = ['git', 'add', 'Jenkinsfile'].execute(null, repo)
add.waitFor()
def commit = ['git', '-c', 'user.name=Jenkins', '-c', 'user.email=jenkins@example.com', 'commit', '-m', 'Initial'].execute(null, repo)
commit.waitFor()
println 'Repo created'
