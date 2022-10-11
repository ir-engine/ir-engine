cp .env.local.default .env.local
replace "localhost:3000" "local.etherealengine.com" -- .env.local
replace "localhost:8642" "resources-local.etherealengine.com" -- .env.local
replace "localhost:3030" "api-local.etherealengine.com" -- .env.local

replace "VITE_APP_HOST=localhost" "VITE_APP_HOST=local.etherealengine.com" -- .env.local
replace "VITE_SERVER_HOST=localhost" "VITE_SERVER_HOST=api-local.etherealengine.com" -- .env.local
replace "VITE_INSTANCESERVER_HOST=localhost" "VITE_INSTANCESERVER_HOST=instanceserver-local.etherealengine.com" -- .env.local

npm run dev-reinit