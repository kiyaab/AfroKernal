pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    stages {
        stage('Environment') {
            steps {
                echo '================================'
                echo 'AfroKernel Pipeline'
                echo '================================'

                sh '''
                    echo "Running as:"
                    whoami

                    echo "Git:"
                    git --version

                    echo "Node.js:"
                    node --version

                    echo "npm:"
                    npm --version

                    echo "Workspace:"
                    pwd
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Create Artifact') {
            steps {
                sh '''
                    tar -czf afrokernel-build.tar.gz .output/
                    ls -lh afrokernel-build.tar.gz
                '''

                archiveArtifacts artifacts: 'afrokernel-build.tar.gz',
                                 fingerprint: true
            }
        }
    }

    post {
        success {
            echo 'AfroKernel CI Pipeline: SUCCESS'
        }

        failure {
            echo 'AfroKernel CI Pipeline: FAILED'
        }

        always {
            echo "Completed Jenkins build #${BUILD_NUMBER}"
        }
    }
}
