# Portable Jenkins + AWS CLI + Preinstalled Plugins for Ticket 1 Pilot
FROM jenkins/jenkins:lts

USER root
# Install AWS CLI minimally
RUN apt-get update && \
    apt-get install -y awscli && \
    rm -rf /var/lib/apt/lists/*

USER jenkins
# Preinstall the minimal plugin set for Ticket 1
# This tool handles dependencies automatically
RUN jenkins-plugin-cli --plugins \
    workflow-aggregator \
    git \
    generic-webhook-trigger \
    credentials-binding
