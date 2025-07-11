#!/bin/sh

# Cross-platform script to configure all nested git repositories to use shared hooks
# Compatible with Mac, Windows (Git Bash), and Linux

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SHARED_HOOKS_DIR="$ROOT_DIR/shared-hooks"

echo "Setting up shared git hooks for nested repositories..."
echo "Root directory: $ROOT_DIR"
echo "Shared hooks directory: $SHARED_HOOKS_DIR"
echo "Platform: $(uname -s 2>/dev/null || echo 'Windows')"

# Find all nested git repositories and process them one by one
find "$ROOT_DIR/packages/projects/projects" -name ".git" -type d | while IFS= read -r git_dir; do
    repo_dir="${git_dir%/.git}"
    echo ""
    echo "Configuring repository: $repo_dir"

    # Calculate relative path from repo to shared hooks
    RELATIVE_PATH=$(python3 -c "
import os
print(os.path.relpath('$SHARED_HOOKS_DIR', '$repo_dir'))
")

    echo "  Setting core.hooksPath to: $RELATIVE_PATH"

    # Configure the repository to use shared hooks
    cd "$repo_dir"
    git config core.hooksPath "$RELATIVE_PATH"

    # Verify the configuration
    CONFIGURED_PATH=$(git config core.hooksPath)
    echo "  Verified configuration: $CONFIGURED_PATH"
done

echo ""
echo "✅ All nested repositories configured to use shared hooks!"
echo ""
echo "To test, try making a commit in any of the nested repositories."
echo "To revert, run: git config --unset core.hooksPath (in each repo)"
