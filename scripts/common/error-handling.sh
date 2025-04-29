#!/bin/bash
# Error handling utility functions
# Place this file in scripts/common/error-handling.sh

# Source the logging functions if they haven't been sourced yet
if ! declare -F log_error &>/dev/null; then
  source "$(dirname "$0")/logging.sh"
fi

# Set default timeout for operations
: "${DEFAULT_TIMEOUT:=300}"  # 5 minutes default timeout

# Function to run a command with a timeout and proper error handling
run_with_timeout() {
  local cmd=$1
  local timeout=${2:-$DEFAULT_TIMEOUT}
  local error_msg=${3:-"Command timed out after ${timeout}s: $cmd"}

  log_debug "Running command with ${timeout}s timeout: $cmd"

  # Use timeout command to execute the command
  timeout $timeout bash -c "$cmd"
  local result=$?

  if [[ $result -eq 124 ]]; then
    # Timeout occurred
    log_error "$error_msg"
    return 124
  elif [[ $result -ne 0 ]]; then
    # Command failed
    log_error "Command failed with exit code $result: $cmd"
    return $result
  fi

  return 0
}

# Function to try a command multiple times before failing
retry() {
  local cmd=$1
  local max_attempts=${2:-3}
  local delay=${3:-5}
  local attempt=1
  local result=0

  while [[ $attempt -le $max_attempts ]]; do
    log_info "Attempt $attempt/$max_attempts: $cmd"

    # Execute the command
    eval "$cmd"
    result=$?

    if [[ $result -eq 0 ]]; then
      # Command succeeded
      [[ $attempt -gt 1 ]] && log_info "Command succeeded after $attempt attempts"
      return 0
    fi

    # Command failed
    log_warning "Command failed on attempt $attempt/$max_attempts with exit code $result"

    if [[ $attempt -lt $max_attempts ]]; then
      # Wait before retrying
      log_info "Waiting ${delay}s before retrying..."
      sleep $delay

      # Increase the delay for the next attempt (exponential backoff)
      delay=$((delay * 2))
    fi

    attempt=$((attempt + 1))
  done

  log_error "Command failed after $max_attempts attempts: $cmd"
  return $result
}

# Function to check if required executables are available
check_required_commands() {
  local commands=("$@")
  local missing=()

  for cmd in "${commands[@]}"; do
    if ! command -v "$cmd" &>/dev/null; then
      missing+=("$cmd")
    fi
  done

  if [[ ${#missing[@]} -gt 0 ]]; then
    log_error "Required commands not found: ${missing[*]}"
    return 1
  fi

  return 0
}

# Function to validate file existence
check_required_files() {
  local files=("$@")
  local missing=()

  for file in "${files[@]}"; do
    if [[ ! -f "$file" ]]; then
      missing+=("$file")
    fi
  done

  if [[ ${#missing[@]} -gt 0 ]]; then
    log_error "Required files not found: ${missing[*]}"
    return 1
  fi

  return 0
}

# Function to create a backup of a file before modifying it
backup_file() {
  local file=$1
  local backup="${file}.bak.$(date +%Y%m%d%H%M%S)"

  if [[ -f "$file" ]]; then
    log_debug "Creating backup of $file to $backup"
    cp "$file" "$backup" || {
      log_error "Failed to create backup of $file"
      return 1
    }
  else
    log_warning "File $file does not exist, cannot create backup"
    return 1
  fi

  return 0
}

# Function to check disk space before potentially large operations
check_disk_space() {
  local required_mb=$1
  local path=${2:-"/"}

  local available_kb=$(df -k "$path" | awk 'NR==2 {print $4}')
  local available_mb=$((available_kb / 1024))

  if [[ $available_mb -lt $required_mb ]]; then
    log_error "Insufficient disk space: ${available_mb}MB available, ${required_mb}MB required on $path"
    return 1
  fi

  log_debug "Disk space check passed: ${available_mb}MB available, ${required_mb}MB required on $path"
  return 0
}

# Set up trap to catch errors and exit signals
trap_errors() {
  local trap_function=$1

  # Set up trap for common signals
  trap "$trap_function EXIT" EXIT
  trap "$trap_function INT" INT
  trap "$trap_function TERM" TERM
  trap "$trap_function ERR" ERR
}

# Cleanup function template (should be customized for your needs)
cleanup() {
  local exit_code=$?

  log_debug "Running cleanup with exit code: $exit_code"

  # Add your cleanup logic here

  # If non-zero exit code, log as error
  if [[ $exit_code -ne 0 ]]; then
    log_error "Script failed with exit code $exit_code"
  fi

  return $exit_code
}