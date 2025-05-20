#!/bin/bash
# Enhanced build script with improved error handling, logging, and structure
# Last updated: April 2, 2025

# Enable strict mode
set -euo pipefail

# Source common utility functions
source "$(dirname "$0")/common/logging.sh"
source "$(dirname "$0")/common/error-handling.sh"

###################
# Configuration
###################

# Set default values for optional environment variables
: "${BUILDER_TIMEOUT:=3600}"          # Default timeout for builder (1 hour)
: "${BUILD_PARALLEL:=true}"           # Default to parallel builds
: "${KEEP_IMAGES:=5}"                 # Default number of images to keep when pruning
: "${BUILD_WAIT_INTERVAL:=10}"        # Default interval for checking (10 seconds)
: "${BUILD_WAIT_TIMEOUT:=1800}"       # Default timeout for checking build status (30 minutes)

# Record timestamps for performance tracking
START_TIME=`date +"%Y-%m-%dT%H-%M-%S"`
START_TIMESTAMP=$(date +%s)

log_info "Build process started at $START_TIME"

###################
# Validation
###################

validate_required_vars() {
  local required_vars=(
    "RELEASE_NAME"
    "DESTINATION_REPO_PROVIDER"
    "DESTINATION_REPO_URL"
    "DESTINATION_REPO_NAME_STEM"
    "STORAGE_REGION"
    "NODE_ENV"
    "TAG"
  )

  for var in "${required_vars[@]}"; do
    if [[ -z "${!var:-}" ]]; then
      log_error "Required environment variable $var is not set"
      exit 1
    else
      log_debug "Required variable $var is set to '${!var}'"
    fi
  done

  # Validate provider-specific variables
  case "$DESTINATION_REPO_PROVIDER" in
    aws)
      if [[ -z "${EKS_AWS_ACCESS_KEY_ID:-}" || -z "${EKS_AWS_ACCESS_KEY_SECRET:-}" ]]; then
        log_error "AWS provider requires EKS_AWS_ACCESS_KEY_ID and EKS_AWS_ACCESS_KEY_SECRET"
        exit 1
      fi
      ;;
    gcp)
      # Add GCP-specific validation if needed
      ;;
    *)
      log_warning "Unknown repository provider: $DESTINATION_REPO_PROVIDER"
      ;;
  esac
}

###################
# Setup Functions
###################

wait_for_builds_finished() {
  sleep $BUILD_WAIT_INTERVAL
  API_SLICE=($(kubectl get pods | grep ir-engine-kaniko-api))
  API_STATUS=${API_SLICE[2]}
  CLIENT_SLICE=($(kubectl get pods | grep ir-engine-kaniko-client))
  CLIENT_STATUS=${CLIENT_SLICE[2]}
  INSTANCESERVER_SLICE=($(kubectl get pods | grep ir-engine-kaniko-instanceserver))
  INSTANCESERVER_STATUS=${INSTANCESERVER_SLICE[2]}

  if [[ "$API_STATUS" == "Running" ]] || [[ "$API_STATUS" == "Failed" ]]
  then
    API_KANIKO_POD=$(kubectl get pods | grep ir-engine-kaniko-api | tail -n 1 | cut -d ' ' -f 1)
    kubectl logs $API_KANIKO_POD >api-build-error.txt
  fi

  if [[ "$CLIENT_STATUS" == "Running" ]] || [[ "$CLIENT_STATUS" == "Failed" ]]
  then
    CLIENT_KANIKO_POD=$(kubectl get pods | grep ir-engine-kaniko-client | tail -n 1 | cut -d ' ' -f 1)
    kubectl logs $CLIENT_KANIKO_POD >client-build-error.txt
  fi

  if [[ "$INSTANCESERVER_STATUS" == "Running" ]] || [[ "$INSTANCESERVER_STATUS" == "Failed" ]]
  then
    INSTANCESERVER_KANIKO_POD=$(kubectl get pods | grep ir-engine-kaniko-instanceserver | tail -n 1 | cut -d ' ' -f 1)
    kubectl logs $INSTANCESERVER_KANIKO_POD >instanceserver-build-error.txt
  fi

  if [[ "$API_STATUS" != "Running" && "$API_STATUS" != "Pending" && "$CLIENT_STATUS" != "Running" && "$CLIENT_STATUS" != "Pending" && "$INSTANCESERVER_STATUS" != "Running" && "$INSTANCESERVER_STATUS" != "Pending" ]]
  then
    return 0
  else
    wait_for_builds_finished
  fi
}

record_build_error() {
  local service=$1

  SLICE=($(kubectl get pods | grep ir-engine-kaniko-$service))
  STATUS=${SLICE[2]}

  if [[ "$STATUS" != "Completed" ]]
  then
    local error_file="${service}-build-error.txt"
    echo "Error in building $service"
    cat $error_file
    npm run record-build-error -- --service="$service"
  fi
}

setup_cloud_provider() {
  log_info "Setting up cloud provider: $DESTINATION_REPO_PROVIDER"

  case "$DESTINATION_REPO_PROVIDER" in
    aws)
      log_info "Setting up AWS credentials and configuration"
      bash ./scripts/setup_aws.sh "$EKS_AWS_ACCESS_KEY_ID" "$EKS_AWS_ACCESS_KEY_SECRET" \
        "$STORAGE_REGION" "$CLUSTER_NAME" "${EKS_AWS_ROLE_ARN:-}"
        ;;
    gcp)
      log_info "Setting up GCP credentials and configuration"
      # Call GCP setup script when implemented
      # bash ./scripts/setup_gcp.sh
      ;;
    *)
      log_warning "Unknown repository provider: $DESTINATION_REPO_PROVIDER"
      ;;
  esac
}

###################
# Database and Setup Functions
###################

setup_database() {
  log_info "Setting up database environment"

  npx ts-node --swc scripts/check-db-exists.ts || {
    log_error "Database check failed"
    return 1
  }

  log_info "Preparing database"
  npm run prepare-database || {
    log_error "Database preparation failed"
    return 1
  }

  log_info "Creating build status"
  npm run create-build-status || {
    log_error "Build status creation failed"
    return 1
  }
}

install_projects() {
  log_info "Installing projects"

  npx ts-node --swc scripts/install-projects.js >project-install-build-logs.txt 2>project-install-build-error.txt ||
    npm run record-build-error -- --service=project-install

  if [[ -s project-install-build-error.txt ]]; then
    log_warning "Project installation had errors, recording them"
    npm run record-build-error -- --service=project-install
  else
    log_info "Projects installed successfully"
  fi
}

setup_package_environment() {
  log_info "Setting up package environment"

  # Create root package.json
  npx ts-node --swc scripts/create-root-package-json.ts || {
    log_error "Failed to create root package.json"
    return 1
  }

  # Swap package.json temporarily
  mv package.json package.jsonmoved
  mv package-root-build.json package.json

  # Install dependencies
  npm install || {
    log_error "Failed to install dependencies"
    # Restore original package.json
    rm -f package.json
    mv package.jsonmoved package.json
    return 1
  }
  
  # Determine suffix based on APP_HOST
  if [[ "$APP_HOST" =~ "studio" ]] || [[ "$APP_HOST" =~ "mt-stg" ]]; then
    SUFFIX="mt"
  elif [[ "$APP_HOST" =~ "mt-rc" ]]; then
    SUFFIX="-mt-rc"
  elif [[ "$APP_HOST" =~ "mt-int" ]]; then
    SUFFIX="-mt-int"
  elif [[ "$APP_HOST" =~ "mt-qat" ]]; then
    SUFFIX="-mt-qat"
  elif [[ "$APP_HOST" =~ "mt" ]]; then
    SUFFIX="-mt"
  elif [[ "$APP_HOST" =~ "qat" ]]; then
    SUFFIX="-qat"
  else
    SUFFIX=""
  fi

  # Restore original package.json
  rm -f package.json
  mv package.jsonmoved package.json

  # Prepare database again
  npm run prepare-database >prepare-database-build-logs.txt 2>prepare-database-build-error.txt ||
    npm run record-build-error -- --service=prepare-database

  if [[ -s prepare-database-build-error.txt ]]; then
    log_warning "Database preparation had errors, recording them"
    npm run record-build-error -- --service=prepare-database
  fi

  # Create production environment
  npx ts-node --swc packages/client/scripts/create-env-production.ts >buildenv-build-logs.txt 2>buildenv-build-error.txt ||
    npm run record-build-error -- --service=buildenv

  if [[ -s buildenv-build-error.txt ]]; then
    log_warning "Environment creation had errors, recording them"
    npm run record-build-error -- --service=buildenv
  fi

  # Set up TWA link if needed
  if [[ -n "${TWA_LINK:-}" ]]; then
    log_info "Setting up TWA Link: $TWA_LINK"
    npx ts-node --swc packages/client/scripts/populate-assetlinks.ts >populate-assetlinks-build-logs.txt 2>populate-assetlinks-build-error.txt ||
      npm run record-build-error -- --service=populate-assetlinks

    if [[ -s populate-assetlinks-build-error.txt ]]; then
      log_warning "Asset links population had errors, recording them"
      npm run record-build-error -- --service=populate-assetlinks
    fi
  fi
}

install_project_dependencies() {
  log_info "Installing project dependencies"

  mkdir -p ./project-package-jsons/projects/default-project
  cp packages/projects/default-project/package.json ./project-package-jsons/projects/default-project

  find packages/projects/projects/ -name package.json -exec bash -c 'mkdir -p ./project-package-jsons/$(dirname $1) && cp $1 ./project-package-jsons/$(dirname $1)' - '{}' \;
}

###################
# Build Functions
###################

build_service() {
  local service=$1
  local build_type=$2

  log_info "Building service: $service (type: $build_type)"

  local log_file="${service}-build-logs.txt"
  touch $log_file

  DESTINATION_REPO_NAME=$DESTINATION_REPO_NAME_STEM-$service
  SOURCE_REPO_NAME=$SOURCE_REPO_NAME_STEM-root

  if [[ $SOURCE_REPO_PROVIDER = "gcp" ]]
  then
    local suffix=$(determine_gcp_suffix)
    SOURCE_REPO_NAME="$SOURCE_REPO_NAME_STEM-root/$SOURCE_REPO_NAME_STEM-root"
    if [ -n "$suffix" ]; then
      SOURCE_REPO_NAME="$SOURCE_REPO_NAME_STEM-root-$suffix/$SOURCE_REPO_NAME_STEM-root"
    fi
  fi

  if [[ $DESTINATION_REPO_PROVIDER = "gcp" ]]
  then
    local suffix=$(determine_gcp_suffix)
    DESTINATION_REPO_NAME=$DESTINATION_REPO_NAME_STEM-$service/$DESTINATION_REPO_NAME_STEM-$service
    if [ -n "$suffix" ]; then
      DESTINATION_REPO_NAME="$DESTINATION_REPO_NAME_STEM-$service-$suffix/$DESTINATION_REPO_NAME_STEM-$service"
    fi
  fi

  VARNAME_SOURCE=SOURCE_REPO_NAME_${service^^}
  declare -gx "$VARNAME_SOURCE"="$SOURCE_REPO_NAME"
  VARNAME_DEST=DESTINATION_REPO_NAME_${service^^}
  declare -gx "$VARNAME_DEST"="$DESTINATION_REPO_NAME"
  kubectl delete job --ignore-not-found=true "$RELEASE_NAME-kaniko-ir-engine-kaniko-$service"
}

prune_aws_images() {
  local service=$1
  local region=${2:-$STORAGE_REGION}
  local public_flag=${3:-}

  log_info "Pruning AWS ECR images for service: $service (region: $region, public: ${public_flag:-false})"

  local cmd=("npx" "ts-node" "--swc" "./scripts/prune_ecr_images.ts"
             "--repoName" "$DESTINATION_REPO_NAME_STEM-$service"
             "--region" "$region"
             "--service" "$service"
             "--releaseName" "$RELEASE_NAME"
             "--keepImages" "${KEEP_IMAGES:-5}")

  if [[ -n "$public_flag" ]]; then
    cmd+=("--public")
  fi

  "${cmd[@]}" || log_warning "Failed to prune images for $service"
}

prune_gcp_images() {
  local service=$1
  local suffix=$2

  log_info "Pruning GCP Artifact Registry images for service: $service (suffix: $suffix)"

  npx ts-node --swc ./scripts/prune_gcp_ar_images.ts \
    --repoUrl "$DESTINATION_REPO_URL" \
    --repoName "$DESTINATION_REPO_NAME_STEM-$service-$suffix" \
    --packageName "$DESTINATION_PACKAGE_NAME_STEM-$service" \
    --service "$service" \
    --releaseName "$RELEASE_NAME"
}

determine_gcp_suffix() {
  local app_host="${APP_HOST:-}"
  local suffix=""

  if [[ "$app_host" =~ "studio" ]] || [[ "$app_host" =~ "mt-stg" ]]; then
    suffix="mt"
  elif [[ "$app_host" =~ "mt-rc" ]]; then
    suffix="mt-rc"
  elif [[ "$app_host" =~ "mt-int" ]]; then
    suffix="mt-int"
  elif [[ "$app_host" =~ "mt-qat" ]]; then
    suffix="mt-qat"
  elif [[ "$app_host" =~ "mt" ]]; then
    suffix="mt"
  elif [[ "$app_host" =~ "qat" ]]; then
    suffix="qat"
  elif [[ "$app_host" =~ "mt-nightly" ]]; then
    suffix="mt-nightly"
  elif [[ "$app_host" =~ "mt-weekly" ]]; then
    suffix="mt-weekly"
  elif [[ "$app_host" =~ "mt-prdmirr" ]]; then
    suffix="mt-prdmirr"
  else
    suffix=""
  fi

  # Do not remove, this is how the suffix is returned
  echo "$suffix"
}

###################
# Build Process
###################

build_with_storage_provider() {
  log_info "Building services (serving client from storage provider)"

  # Generate deletable client files list
  npx ts-node --swc scripts/get-deletable-client-files.ts || {
    log_warning "Failed to get deletable client files"
  }

  build_service "api" "api"
  build_service "client" "client-serve-static"
  build_service "instanceserver" "instanceserver"
  # build_service "taskserver" "taskserver"

  helm upgrade --reuse-values --set builder.extraEnv.SOURCE_REPO_NAME_API=$SOURCE_REPO_NAME_API,builder.extraEnv.SOURCE_REPO_NAME_CLIENT=$SOURCE_REPO_NAME_CLIENT,builder.extraEnv.SOURCE_REPO_NAME_INSTANCESERVER=$SOURCE_REPO_NAME_INSTANCESERVER,builder.extraEnv.SOURCE_REPO_URL=$SOURCE_REPO_URL,builder.extraEnv.DESTINATION_REPO_NAME_API=$DESTINATION_REPO_NAME_API,builder.extraEnv.DESTINATION_REPO_NAME_CLIENT=$DESTINATION_REPO_NAME_CLIENT,builder.extraEnv.DESTINATION_REPO_NAME_INSTANCESERVER=$DESTINATION_REPO_NAME_INSTANCESERVER,builder.extraEnv.DESTINATION_REPO_URL=$DESTINATION_REPO_URL,builder.extraEnv.TAG=$TAG,builder.extraEnv.START_TIME=$START_TIME $RELEASE_NAME-kaniko ir-engine/ir-engine-kaniko

  echo "Waiting for Kaniko builds to finish"
  wait_for_builds_finished

  record_build_error "api"
  record_build_error "client"
  record_build_error "instanceserver"

  # Prune old images based on repo provider
  prune_repo_images "api" "client" "instanceserver" "builder" # "taskserver"
}

build_with_api_serving_client() {
  log_info "Building services (serving client from API)"

  build_service "api" "api-client"
  build_service "instanceserver" "instanceserver"
  # build_service "taskserver" "taskserver"

  helm upgrade --reuse-values --set builder.extraEnv.SOURCE_REPO_NAME_API=$SOURCE_REPO_NAME_API,builder.extraEnv.SOURCE_REPO_NAME_CLIENT=$SOURCE_REPO_NAME_CLIENT,builder.extraEnv.SOURCE_REPO_NAME_INSTANCESERVER=$SOURCE_REPO_NAME_INSTANCESERVER,builder.extraEnv.SOURCE_REPO_URL=$SOURCE_REPO_URL,builder.extraEnv.DESTINATION_REPO_NAME_API=$DESTINATION_REPO_NAME_API,builder.extraEnv.DESTINATION_REPO_NAME_CLIENT=$DESTINATION_REPO_NAME_CLIENT,builder.extraEnv.DESTINATION_REPO_NAME_INSTANCESERVER=$DESTINATION_REPO_NAME_INSTANCESERVER,builder.extraEnv.DESTINATION_REPO_URL=$DESTINATION_REPO_URL,builder.extraEnv.TAG=$TAG,builder.extraEnv.START_TIME=$START_TIME $RELEASE_NAME-kaniko ir-engine/ir-engine-kaniko

  echo "Waiting for Kaniko builds to finish"
  wait_for_builds_finished

  record_build_error "api"
  record_build_error "instanceserver"

  # Prune old images based on repo provider
  prune_repo_images "api" "instanceserver" "builder" # "taskserver"
}

build_standard() {
  log_info "Building services (standard configuration)"

  build_service "api" "api"
  build_service "client" "client"
  build_service "instanceserver" "instanceserver"
  # build_service "taskserver" "taskserver"

  helm upgrade --reuse-values --set builder.extraEnv.SOURCE_REPO_NAME_API=$SOURCE_REPO_NAME_API,builder.extraEnv.SOURCE_REPO_NAME_CLIENT=$SOURCE_REPO_NAME_CLIENT,builder.extraEnv.SOURCE_REPO_NAME_INSTANCESERVER=$SOURCE_REPO_NAME_INSTANCESERVER,builder.extraEnv.SOURCE_REPO_URL=$SOURCE_REPO_URL,builder.extraEnv.DESTINATION_REPO_NAME_API=$DESTINATION_REPO_NAME_API,builder.extraEnv.DESTINATION_REPO_NAME_CLIENT=$DESTINATION_REPO_NAME_CLIENT,builder.extraEnv.DESTINATION_REPO_NAME_INSTANCESERVER=$DESTINATION_REPO_NAME_INSTANCESERVER,builder.extraEnv.DESTINATION_REPO_URL=$DESTINATION_REPO_URL,builder.extraEnv.TAG=$TAG,builder.extraEnv.START_TIME=$START_TIME $RELEASE_NAME-kaniko ir-engine/ir-engine-kaniko

  echo "Waiting for Kaniko builds to finish"
  wait_for_builds_finished

  record_build_error "api"
  record_build_error "client"
  record_build_error "instanceserver"

  # Prune old images based on repo provider
  prune_repo_images "api" "client" "instanceserver" "builder"# "taskserver"
}

prune_repo_images() {
  local services=("$@")

  log_info "Pruning repository images for services: ${services[*]}"

  case "$DESTINATION_REPO_PROVIDER" in
    aws)
      log_info "Pruning AWS ECR images"

      if [[ "${PRIVATE_REPO:-false}" == "true" ]]; then
        log_info "Pruning private ECR repos in region $STORAGE_REGION"
        for service in "${services[@]}"; do
          prune_aws_images "$service" "$STORAGE_REGION"
        done
      else
        log_info "Pruning public ECR repos in region us-east-1"
        for service in "${services[@]}"; do
          prune_aws_images "$service" "us-east-1" "--public"
        done
      fi
      ;;

    gcp)
      log_info "Pruning GCP Artifact Registry repos"

      local suffix=$(determine_gcp_suffix)
      log_info "Using GCP suffix: $suffix"

      for service in "${services[@]}"; do
        prune_gcp_images "$service" "$suffix"
      done
      ;;

    *)
      log_warning "Unknown repository provider: $DESTINATION_REPO_PROVIDER, skipping pruning"
      ;;
  esac
}

###################
# Deployment Functions
###################

deploy_to_kubernetes() {
  local tag="${TAG}__${START_TIME}"

  log_info "Deploying to Kubernetes with tag: $tag"

  bash ./scripts/deploy.sh "$RELEASE_NAME" "$tag" || {
    log_error "Deployment failed"
    return 1
  }

  log_info "Updating cronjob image"
  npx ts-node --swc scripts/update-cronjob-image.ts \
    --repoName="${DESTINATION_REPO_NAME_STEM}" \
    --tag="${TAG}" \
    --repoUrl="${DESTINATION_REPO_URL}" \
    --startTime="${START_TIME}" || {
    log_warning "Failed to update cronjob image"
  }
}

cleanup_old_files() {
  log_info "Performing cleanup operations"

  log_info "Clearing needsRebuild on projects"
  npx ts-node --swc scripts/clear-projects-rebuild.ts || {
    log_warning "Failed to clear projects rebuild"
  }

  # Delete old S3 files if using S3 for client storage
  if [[ "${SERVE_CLIENT_FROM_STORAGE_PROVIDER:-false}" == "true" ]]; then
    log_info "Deleting old client files from storage provider"
    npx ts-node --swc scripts/delete-old-storage-provider-files.ts || {
      log_warning "Failed to delete old client files from storage provider"
    }
  fi

  npx ts-node --swc scripts/prune-kaniko-context.ts >prune-kaniko-context-build-logs.txt 2>prune-kaniko-context-build-error.txt ||
     npm run record-build-error -- --service=prune-kaniko-context
}

record_build_success() {
  log_info "Recording build success"
  npm run record-build-success || {
    log_warning "Failed to record build success"
  }
}

handle_job_completion() {
  # Check if this is a job-based builder
  if kubectl get jobs | grep "$RELEASE_NAME-builder-ir-engine-builder"; then
    echo "Done with builder job"
  else
    log_info "Non-job builder, sleeping indefinitely"
    # Sleep but respond to signals
    while true; do
      sleep 3600 & wait $!
    done
  fi
}

push_context() {
  tar -C /app -zcf /builder-context-$START_TIME.tar.gz *
  npx ts-node --swc scripts/push-kaniko-context.ts --startTime="${START_TIME}" >push-kaniko-context-build-logs.txt 2>push-kaniko-context-build-error.txt ||
    npm run record-build-error -- --service=push-kaniko-context
}

###################
# Main Execution
###################

main() {
  # Add trap for logging execution time even if script fails
  trap 'log_perf_metrics' EXIT

  log_info "Starting builder with configuration:"
  log_info "  - Release name: $RELEASE_NAME"
  log_info "  - Repo provider: $DESTINATION_REPO_PROVIDER"
  log_info "  - Node environment: $NODE_ENV"

  # Validate required variables
  validate_required_vars

  # Create file with build number
  touch ./builder-started.txt

  # Set up database and environment
  setup_database
  install_projects
  setup_package_environment

  # Set up cloud provider
  setup_cloud_provider

  # Backup project package files
  install_project_dependencies

  push_context

  # Build services based on configuration
  if [[ "${SERVE_CLIENT_FROM_STORAGE_PROVIDER:-false}" == "true" ]]; then
    build_with_storage_provider
  elif [[ "${SERVE_CLIENT_FROM_API:-false}" == "true" ]]; then
    build_with_api_serving_client
  else
    build_standard
  fi

  # Deploy to Kubernetes
  deploy_to_kubernetes

  # Clean up and record success
  cleanup_old_files
  record_build_success

  # Record completion time
  DEPLOY_TIME=$(date +"%Y-%m-%dT%H:%M:%S")
  END_TIME=$(date +"%Y-%m-%dT%H:%M:%S")
  END_TIMESTAMP=$(date +%s)
  DURATION=$((END_TIMESTAMP - START_TIMESTAMP))

  log_info "Build process completed:"
  log_info "  - Started:  $START_TIME"
  log_info "  - Deployed: $DEPLOY_TIME"
  log_info "  - Finished: $END_TIME"
  log_info "  - Duration: $DURATION seconds"

  # Sleep for 3 minutes before checking job status
  sleep 3m

  # Handle job completion
  handle_job_completion
}

# Function to log performance metrics
log_perf_metrics() {
  local exit_code=$?
  local end_timestamp=$(date +%s)
  local duration=$((end_timestamp - START_TIMESTAMP))

  log_info "Build process $([[ $exit_code -eq 0 ]] && echo "succeeded" || echo "failed") after $duration seconds with exit code $exit_code"

  # Send metrics to your metrics collection system if available
  # Example: curl -X POST "http://metrics-collector/api/v1/build-metrics" -d "{ ... }"
}

# Run the main function
main