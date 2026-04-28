import jenkins.model.*
def job = Jenkins.instance.getItemByFullName('aws-box-ap-ui-cicd-pilot')
job.scheduleBuild()
