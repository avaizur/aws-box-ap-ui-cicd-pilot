import jenkins.model.*
import org.jenkinsci.plugins.workflow.cps.*

def job = Jenkins.instance.getItemByFullName('aws-box-ap-ui-cicd-pilot')
def pipelineCode = '''pipeline {
    agent any
    environment {
        AWS_CREDS = credentials('aws-pilot-credentials')
        AWS_DEFAULT_REGION = 'eu-west-2'
    }
    stages {
        stage('AWS Connection Validation') {
            steps {
                script {
                    withEnv([
                        "AWS_ACCESS_KEY_ID=${AWS_CREDS_USR}",
                        "AWS_SECRET_ACCESS_KEY=${AWS_CREDS_PSW}",
                        "AWS_DEFAULT_REGION=${AWS_DEFAULT_REGION}"
                    ]) {
                        echo 'Probing AWS STS identity...'
                        sh 'aws sts get-caller-identity'
                    }
                }
            }
        }
    }
}'''
job.definition = new CpsFlowDefinition(pipelineCode, true)
job.save()
