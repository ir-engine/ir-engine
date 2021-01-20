#!/bin/bash

server_command='yarn dev'
if [ "$1" = "-reinit-db" ] ; then
	server_command='yarn dev-reinit-db'
fi

if [ -e /usr/bin/gnome-terminal ]; then
	terminal_command='gnome-terminal'
elif [ -e /usr/bin/mate-terminal ]; then
	terminal_command='mate-terminal'
elif [ -e /usr/bin/xfce4-terminal ]; then
	terminal_command='xfce4-terminal'
elif [ -e /usr/bin/konsole ]; then
	konsole --tabs-from-file konsole_tabs.desktop &
	exit 0
fi

${terminal_command} \
	--title 'xr3ngine servers' \
	--tab \
	--title db --working-directory=$PWD/scripts -e 'sudo ./start-db.sh' \
	--tab \
	--title agones --working-directory=$PWD/scripts -e './start-agones.sh' \
	--tab \
	--title server --working-directory=$PWD/packages/server -e "$server_command" \
	--tab \
	--title client --working-directory=$PWD/packages/client -e 'yarn dev' &

