node('master') {
	stage('Choose Label') {
		LABEL = 'jenkins-agent-machine-1'
	}
}

pipeline {

	environment {
		registry = 'nexus.iex.ec'
	}

	agent {
		node {
			label "${LABEL}"
		}
	}

	stages {

		stage('Graph Cli Build') {
			agent {
				docker {
					image 'node:11'
					label "${LABEL}"
				}
			}
			steps{
				sh "echo 'Starting build'"
				sh "npm install"
				sh "npm run codegen"
				sh "npm run build"
				archiveArtifacts artifacts: 'generated/**'
				archiveArtifacts artifacts: 'build/**'
			}
		}

	}
}
