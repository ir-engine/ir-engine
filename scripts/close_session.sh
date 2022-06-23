TARGET=$(ps aux | grep 'npm run dev' | head -n 1 | grep -Eo '[0-9]+' | head -n 1)
echo $TARGET
kill -9 $TARGET
