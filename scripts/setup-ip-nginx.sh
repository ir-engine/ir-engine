cp .env.local.default .env.local
replace "localhost:3000" "local.etherealengine.org" -- .env.local
replace "localhost:8642" "resources-local.etherealengine.org" -- .env.local
replace "localhost:3030" "api-local.etherealengine.org" -- .env.local

replace "VITE_APP_HOST=localhost" "VITE_APP_HOST=local.etherealengine.org" -- .env.local
replace "VITE_SERVER_HOST=localhost" "VITE_SERVER_HOST=api-local.etherealengine.org" -- .env.local
replace "VITE_INSTANCESERVER_HOST=localhost" "VITE_INSTANCESERVER_HOST=instanceserver-local.etherealengine.org" -- .env.local

npm run dev-reinit