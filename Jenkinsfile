pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timestamps()
    }

    environment {
        DEPLOY_HOST    = 'rhel10-lab01.ad.afrokernel.com'
        DEPLOY_USER    = 'afrokernel-deploy'
        DEPLOY_KEY     = '/var/lib/jenkins/.ssh/afrokernel_deploy'

        // Old Freestyle job used production releases through build-8.
        // New Pipeline uses its own Jenkins build numbering.
        RELEASE_OFFSET = '8'
    }

    stages {

        stage('Environment') {
            steps {
                echo '================================'
                echo 'AfroKernel CI/CD Pipeline'
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
                    echo "================================"
                    echo "Creating Deployment Artifact"
                    echo "================================"

                    tar -czf afrokernel-build.tar.gz .output/

                    echo "Artifact created:"
                    ls -lh afrokernel-build.tar.gz
                '''

                archiveArtifacts artifacts: 'afrokernel-build.tar.gz',
                                 fingerprint: true
            }
        }

        /*
         * Production deployment stages run only when files that can
         * affect the application or deployment process have changed.
         *
         * Documentation and repository housekeeping changes such as
         * README files and .gitignore will still run CI, but will not
         * deploy a new production release.
         */

        stage('Prepare Release') {
            when {
                anyOf {
                    changeset "src/**"
                    changeset "public/**"
                    changeset "scripts/**"
                    changeset "package.json"
                    changeset "package-lock.json"
                    changeset "vite.config.*"
                    changeset "tsconfig*.json"
                    changeset "Jenkinsfile"
                }
            }

            steps {
                script {
                    env.RELEASE_NUMBER =
                        (env.BUILD_NUMBER.toInteger() +
                         env.RELEASE_OFFSET.toInteger()).toString()
                }

                echo '================================'
                echo 'Preparing Production Release'
                echo '================================'

                echo "Jenkins Pipeline Build: #${BUILD_NUMBER}"
                echo "Production Release: build-${RELEASE_NUMBER}"
            }
        }

        stage('Stage Release') {
            when {
                anyOf {
                    changeset "src/**"
                    changeset "public/**"
                    changeset "scripts/**"
                    changeset "package.json"
                    changeset "package-lock.json"
                    changeset "vite.config.*"
                    changeset "tsconfig*.json"
                    changeset "Jenkinsfile"
                }
            }

            steps {
                sh '''
                    RELEASE_DIR="/opt/afrokernel/releases/build-${RELEASE_NUMBER}"

                    echo "================================"
                    echo "Staging Production Release"
                    echo "================================"

                    echo "Release:"
                    echo "build-${RELEASE_NUMBER}"

                    echo "Target:"
                    echo "${DEPLOY_USER}@${DEPLOY_HOST}:${RELEASE_DIR}"

                    ssh \
                      -o BatchMode=yes \
                      -i "${DEPLOY_KEY}" \
                      "${DEPLOY_USER}@${DEPLOY_HOST}" \
                      "mkdir -p '${RELEASE_DIR}'"

                    echo "Transferring artifact..."

                    scp \
                      -o BatchMode=yes \
                      -i "${DEPLOY_KEY}" \
                      afrokernel-build.tar.gz \
                      "${DEPLOY_USER}@${DEPLOY_HOST}:${RELEASE_DIR}/"

                    echo "Artifact transfer: PASS"
                '''
            }
        }

        stage('Validate Release') {
            when {
                anyOf {
                    changeset "src/**"
                    changeset "public/**"
                    changeset "scripts/**"
                    changeset "package.json"
                    changeset "package-lock.json"
                    changeset "vite.config.*"
                    changeset "tsconfig*.json"
                    changeset "Jenkinsfile"
                }
            }

            steps {
                sh '''
                    RELEASE_DIR="/opt/afrokernel/releases/build-${RELEASE_NUMBER}"

                    echo "================================"
                    echo "Validating Release"
                    echo "================================"

                    ssh \
                      -o BatchMode=yes \
                      -i "${DEPLOY_KEY}" \
                      "${DEPLOY_USER}@${DEPLOY_HOST}" \
                      "cd '${RELEASE_DIR}' &&
                       gzip -t afrokernel-build.tar.gz &&
                       tar -xzf afrokernel-build.tar.gz &&
                       test -f .output/server/index.mjs"

                    echo "Artifact validation: PASS"
                '''
            }
        }

        stage('Promote Release') {
            when {
                anyOf {
                    changeset "src/**"
                    changeset "public/**"
                    changeset "scripts/**"
                    changeset "package.json"
                    changeset "package-lock.json"
                    changeset "vite.config.*"
                    changeset "tsconfig*.json"
                    changeset "Jenkinsfile"
                }
            }

            steps {
                sh '''
                    echo "================================"
                    echo "Promoting Release"
                    echo "================================"

                    echo "Production Release:"
                    echo "build-${RELEASE_NUMBER}"

                    ssh \
                      -o BatchMode=yes \
                      -i "${DEPLOY_KEY}" \
                      "${DEPLOY_USER}@${DEPLOY_HOST}" \
                      "sudo -n /usr/local/sbin/afrokernel-promote '${RELEASE_NUMBER}'"

                    echo "Promotion command completed."
                '''
            }
        }

        stage('Verify Production') {
            when {
                anyOf {
                    changeset "src/**"
                    changeset "public/**"
                    changeset "scripts/**"
                    changeset "package.json"
                    changeset "package-lock.json"
                    changeset "vite.config.*"
                    changeset "tsconfig*.json"
                    changeset "Jenkinsfile"
                }
            }

            steps {
                sh '''
                    echo "================================"
                    echo "Verifying Production"
                    echo "================================"

                    EXPECTED="/opt/afrokernel/releases/build-${RELEASE_NUMBER}"

                    ACTUAL=$(ssh \
                      -o BatchMode=yes \
                      -i "${DEPLOY_KEY}" \
                      "${DEPLOY_USER}@${DEPLOY_HOST}" \
                      "readlink -f /opt/afrokernel/current")

                    echo "Expected release:"
                    echo "${EXPECTED}"

                    echo "Current production release:"
                    echo "${ACTUAL}"

                    if [ "${ACTUAL}" != "${EXPECTED}" ]; then
                        echo "ERROR: Production release does not match expected release."
                        exit 1
                    fi

                    echo "Production verification: PASS"
                '''
            }
        }
    }

    post {
        success {
            echo '================================'
            echo 'AfroKernel Pipeline: SUCCESS'
            echo "Jenkins Pipeline Build: #${BUILD_NUMBER}"
            echo '================================'
        }

        failure {
            echo '================================'
            echo 'AfroKernel Pipeline: FAILED'
            echo "Jenkins Pipeline Build: #${BUILD_NUMBER}"
            echo '================================'
        }

        always {
            echo "Completed Jenkins Pipeline Build #${BUILD_NUMBER}"
        }
    }
}
