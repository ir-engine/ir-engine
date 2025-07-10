#!/bin/bash

# Script to remove shared hooks configuration from nested repositories

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "Removing shared git hooks configuration from nested repositories..."

# Find all nested git repositories
NESTED_REPOS=$(find "$ROOT_DIR/packages/projects/projects" -name ".git" -type d | sed 's|/.git$||')

for repo in $NESTED_REPOS; do
    echo "Removing shared hooks from: $repo"
    cd "$repo"
    git config --unset core.hooksPath
done

echo "✅ Shared hooks configuration removed from all nested repositories!"
