set -e
# We inject random tokens into the build that will be replaced at run webhook/deploy time with the actual runtime configs.
export NEXT_PUBLIC_API_SERVER="$(echo "NEXT_PUBLIC_API_SERVER" | sha256sum | cut -d' ' -f1)" # HACK need a trailing slash so webpack'ed semantics line up
