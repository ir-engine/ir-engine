#!/bin/bash

#function defs
delay(){
echo -e "\e[32mSleeping for thirty seconds while database starts"
for i in {1..30}
    do
        echo "$i..."
        sleep 1
    done
clear_table
}

clear_table(){
    echo -e "\e[32mClearing exsting table and creating a new one"
    echo -e "\e[33mErrors will happen if deletion fails because the table didn't exist, that's fine"
docker exec xrchat_db sudo mysql -u root -pxrchatrootpa$$w0rd -e "SHOW DATABASES; DROP DATABASE xrchat; CREATE DATABASE xrchat; USE xrchat;"
}

init_db(){
echo -e "\e[32mInitializing mariadb..."
docker stop xrchat_db
docker rm xrchat_db
docker-compose up
}

# actual script calls
delay &
init_db
