import jenkins.model.*
import org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition

def script = '''pipeline {
    agent any
    stages {
        stage('Instance Role Check') {
            steps {
                sh 'curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/ 2>&1 || echo NO_INSTANCE_ROLE'
            }
        }
        stage('Instance Creds Check') {
            steps {
                sh 'aws sts get-caller-identity 2>&1 || echo NO_DEFAULT_CREDS'
            }
        }
        stage('IAM Perms via Instance') {
            steps {
                sh 'aws iam list-attached-user-policies --user-name aws-appbox-pilot-ui 2>&1 || echo CANNOT_LIST'
                sh 'aws ecr describe-repositories --region eu-west-1 2>&1 || echo CANNOT_ECR'
            }
        }
    }
}'''

def job = Jenkins.instance.getItem('aws-box-ap-ui-cicd-pilot')
job.setDefinition(new CpsFlowDefinition(script, true))
job.save()
println "Updated with instance role diagnostic"
