#!/bin/bash

# reset, warning, error and success colors
RS="\033[0m"    # reset
FRED="\033[31m" # foreground red / error
FGRN="\033[32m" # foreground green / success
FYEL="\033[33m" # foreground yellow / warning

# check if .env file exist
if [ ! -e ./../.env ]; then
	echo -e "${FYEL}.env file doesn't exist. It's needed to run the project. Please contact with manager${RS}"
	exit 0
fi

# check if docker and docker-compose has installed
if ! [ -e /usr/bin/docker ] && [ -e /usr/bin/docker-compose ]; then
	echo -e "${FYEL}Please install docker and docker-compose for running database${RS}"
	exit 0
fi

# stop docker container if it's running
db_docker_image_id=`sudo docker ps -q -f name=xrengine`
if [ "$db_docker_image_id" ]; then
	echo -e "${FYEL}Database is running"
	echo -e "${RS}Stopping another database..."
	sudo docker container stop $db_docker_image_id
fi

server_command='npm run dev'
if [ "$1" = "-reinit-db" ] ; then
	server_command='npm run dev-reinit-db'
fi

# choose which terminal to run
echo -e "${RS}Please choose terminal what you want to run"
select terminal in Gnome Mate Xfce4 KDE Exit
do
	case $terminal in
	"Gnome")
		if [ -e /usr/bin/gnome-terminal ]; then
			terminal_command='gnome-terminal'
			break
		else
			echo -e "${FYEL}This terminal doesn't exist. Please choose another one ${RS}"
		fi
	;;
	"Mate")
		if [ -e /usr/bin/mate-terminal ]; then
			terminal_command='mate-terminal'
			break
		else
			echo -e "${FYEL}This terminal doesn't exist. Please choose another one ${RS}"
		fi
	;;
	"Xfce4")
		if [ -e /usr/bin/xfce4-terminal ]; then
			terminal_command='xfce4-terminal'
			break
		else
			echo -e "${FYEL}This terminal doesn't exist. Please choose another one ${RS}"
		fi
	;;
	"KDE")
		konsole --tabs-from-file konsole_tabs.desktop &
		echo -e "${FGRN}xrengine is running${RS}"
		exit 0
	;;
	"Exit")
		echo -e "${RS}Thanks for using our product!"
		exit 0
	;;
	*)
		echo -e "${FRED}Invalid entry!${RS}"
		exit 0
	;;
	esac
done

# run xrengine in terminal with tabs
${terminal_command} \
	--title 'xrengine servers' \
	--tab \
	--title db --working-directory=$PWD -e 'sudo ./start-db.sh' \
	--tab \
	--title agones --working-directory=$PWD -e './start-agones.sh' \
	--tab \
	--title server --working-directory=$PWD/../packages/server -e "$server_command" \
	--tab \
	--title client --working-directory=$PWD/../packages/client -e 'npm run dev' &

echo -e "${FGRN}xrengine is running${RS}"
exit 0
