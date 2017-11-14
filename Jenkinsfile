node('NodeRaw') {

  try {
    stage ('Clone Source') {
        checkout scm
    }

    stage('Production Config') {
      configFileProvider([configFile(fileId: 'algohub_searchweb_solr_production', variable: 'CONFIG_SOLR')]) {
        sh "cp \"${CONFIG_SOLR}\" web/config/sorl.js"
      }
      configFileProvider([configFile(fileId: 'algohub_searchweb_server_production', variable: 'CONFIG_SERVER')]) {
        sh "cp \"${CONFIG_SERVER}\" web/config/server.js"
      }
      configFileProvider([configFile(fileId: 'algohub_searchweb_site_production', variable: 'CONFIG_SITE')]) {
        sh "cp \"${CONFIG_SITE}\" web/config/site.js"
      }
    }

    stage('Compile') {
      def NODE_VERSION = '7.8'
      docker.image("node:${NODE_VERSION}").inside {
        sh 'npm install --production'
      }
    }

    stage('Pre-build Image') {
      sh "echo 'web/server.js' > entrypoint"
      sh "rm Jenkinsfile || true"
      sh "rm .gitignore || true"
      sh "rm -rf .git || true"
    }

    stage('Build Docker image') {
      def newImage = docker.build("algohub-search-web")
      docker.withRegistry("https://239150759114.dkr.ecr.us-west-1.amazonaws.com", "ecr:us-west-1:aws-ecr-cred") {
        newImage.push("${env.BUILD_ID}")
        newImage.push("latest")
      }
    }

  } finally {
    stage('Cleanup') {
      cleanWs notFailBuild: true
    }
  }

}
