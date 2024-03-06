#!/bin/bash
test -f .env.local || (printf "\033[0;33mNo .env.local found creating one with default config\033[0m\n" && cp .env.local.default .env.local && sleep 2)