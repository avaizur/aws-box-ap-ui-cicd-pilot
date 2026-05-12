import jenkins.model.*
import org.jenkinsci.plugins.workflow.job.WorkflowJob
import org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition

def jobName = 'aws-box-ap-ui-cicd-pilot'
def job = Jenkins.instance.getItem(jobName)

if (job == null) {
    println "ERROR: Job '${jobName}' not found"
    return
}

def script = '''pipeline {
    agent any

    environment {
        AWS_CREDS_ID = 'aws-pilot-credentials'
        AWS_REGION = 'eu-west-1'
        PROJECT_NAME = 'aws-box-ap-val'
        DB_PASSWORD = credentials('rds-db-password')
    }

    stages {
        stage('Backend Build & Push') {
            steps {
                dir('aws-box-ap-ui-work/aws-box-app-api') {
                    script {
                        withCredentials([usernamePassword(
                            credentialsId: "${AWS_CREDS_ID}",
                            usernameVariable: 'AWS_ACCESS_KEY_ID',
                            passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                            withEnv(["AWS_DEFAULT_REGION=${AWS_REGION}"]) {
                                def repoUrl = sh(script: "aws ecr describe-repositories --repository-names ${PROJECT_NAME}-repo --query 'repositories[0].repositoryUri' --output text", returnStdout: true).trim()

                                sh "aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin ${repoUrl}"

                                sh "docker build -t ${repoUrl}:latest ."
                                sh "docker push ${repoUrl}:latest"
                            }
                        }
                    }
                }
            }
        }

        stage('Infrastructure Provisioning') {
            steps {
                dir('infrastructure') {
                    script {
                        withCredentials([usernamePassword(
                            credentialsId: "${AWS_CREDS_ID}",
                            usernameVariable: 'AWS_ACCESS_KEY_ID',
                            passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                            withEnv(["AWS_DEFAULT_REGION=${AWS_REGION}"]) {
                                sh 'terraform init'
                                sh "terraform apply -auto-approve -var='db_password=${DB_PASSWORD}' -var='project_name=${PROJECT_NAME}' -var='aws_region=${AWS_REGION}'"

                                env.API_URL = sh(script: "terraform output -raw service_url", returnStdout: true).trim()
                            }
                        }
                    }
                }
            }
        }

        stage('Frontend Build & Deploy') {
            steps {
                dir('aws-box-app-ui') {
                    sh "echo 'VITE_API_URL=https://${env.API_URL}/api' > .env.production"
                    sh 'npm install'
                    sh 'npm run build'

                    withCredentials([usernamePassword(
                        credentialsId: "${AWS_CREDS_ID}",
                        usernameVariable: 'AWS_ACCESS_KEY_ID',
                        passwordVariable: 'AWS_SECRET_ACCESS_KEY')]) {
                        withEnv(["AWS_DEFAULT_REGION=${AWS_REGION}"]) {
                            sh "aws s3 sync dist/ s3://${PROJECT_NAME}-frontend/pilot-validation/ --delete"
                        }
                    }
                }
            }
        }

        stage('Smoke Validation') {
            steps {
                script {
                    echo "Running Extended Smoke Validation..."

                    echo "Checking API Health at: https://${env.API_URL}/api/v3/api-docs"
                    def response = sh(script: "curl -s -o /dev/null -w '%{http_code}' https://${env.API_URL}/api/v3/api-docs", returnStdout: true).trim()

                    if (response == "200") {
                        echo "SUCCESS: Backend is UP and responding to API requests."
                    } else {
                        error "FAILURE: Backend responded with HTTP ${response}"
                    }

                    echo "Smoke validation passed successfully!"
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}'''

job.setDefinition(new CpsFlowDefinition(script, true))
job.save()
println "Job '${jobName}' updated successfully with fixed validation pipeline."
