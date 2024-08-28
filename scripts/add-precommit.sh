# add precommit to all hooks

read -r -d '' pre_commit_commands << EOM
#!/bin/bash
echo \"running pre-commit\"
npx lint-staged
echo \"pre-commit done\"
EOM

add_precommit() {
  directory=$1;
  if [ -d ".git" ]; then
    if [ ! -e ".git/hooks/pre-commit" ]; then
      rm .git/hooks/pre-commit
    fi
    echo "$pre_commit_commands" > .git/hooks/pre-commit
    chmod ug+x .git/hooks/pre-commit
    echo "added pre_commit hook in $directory"
  fi
}

for directory in packages/projects/projects/ir-engine/* ;
 do (cd "$directory" && add_precommit $directory); 
done