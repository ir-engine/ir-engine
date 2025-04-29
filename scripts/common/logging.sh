#!/bin/bash
# Logging utility functions
# Place this file in scripts/common/logging.sh

# Log levels
LOG_LEVEL_DEBUG=0
LOG_LEVEL_INFO=1
LOG_LEVEL_WARNING=2
LOG_LEVEL_ERROR=3

# Default log level (can be overridden with LOG_LEVEL env var)
: "${LOG_LEVEL:=1}"  # Default to INFO level

# Colors for terminal output
COLOR_RESET='\033[0m'
COLOR_RED='\033[0;31m'
COLOR_GREEN='\033[0;32m'
COLOR_YELLOW='\033[0;33m'
COLOR_BLUE='\033[0;34m'
COLOR_GRAY='\033[0;90m'

# Determine if we're running in a CI environment
: "${CI:=false}"

# Function to log a message with timestamp and level
_log() {
  local level=$1
  local message=$2
  local level_name=$3
  local color=$4

  # Skip logging if level is below configured log level
  if [[ $level -lt $LOG_LEVEL ]]; then
    return 0
  fi

  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

  if [[ "$CI" == "true" ]]; then
    # In CI environment, output structured JSON logs
    echo "{\"timestamp\":\"$timestamp\",\"level\":\"$level_name\",\"message\":\"$message\"}" >&2
  else
    # In terminal, output colored logs
    echo -e "${color}[$timestamp] [$level_name] $message${COLOR_RESET}" >&2
  fi
}

# Public logging functions
log_debug() {
  _log $LOG_LEVEL_DEBUG "$1" "DEBUG" "$COLOR_GRAY"
}

log_info() {
  _log $LOG_LEVEL_INFO "$1" "INFO" "$COLOR_BLUE"
}

log_warning() {
  _log $LOG_LEVEL_WARNING "$1" "WARNING" "$COLOR_YELLOW"
}

log_error() {
  _log $LOG_LEVEL_ERROR "$1" "ERROR" "$COLOR_RED"
}

# Log command execution with timing
log_cmd() {
  local cmd=$1
  local start_time=$(date +%s)

  log_info "Executing: $cmd"

  # Execute the command
  eval "$cmd"
  local result=$?

  local end_time=$(date +%s)
  local duration=$((end_time - start_time))

  if [[ $result -eq 0 ]]; then
    log_info "Command completed successfully in ${duration}s: $cmd"
  else
    log_error "Command failed after ${duration}s with exit code $result: $cmd"
  fi

  return $result
}

# Output a section header to visually separate log sections
log_section() {
  local title=$1
  local line="===== $title ====="
  local border=$(echo "$line" | sed 's/./-/g')

  log_info "$border"
  log_info "$line"
  log_info "$border"
}

# Initialize logging
log_debug "Logging initialized with level: $LOG_LEVEL"