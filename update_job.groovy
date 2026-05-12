import jenkins.model.*
import hudson.plugins.git.*
import org.jenkinsci.plugins.workflow.cps.*

def job = Jenkins.instance.getItemByFullName('aws-box-ap-ui-cicd-pilot')
def scm = new GitSCM("file:///tmp/pilot-repo")
scm.branches = [new BranchSpec("*/main")]
job.definition = new CpsScmFlowDefinition(scm, "Jenkinsfile")
job.save()
