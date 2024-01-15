#!/bin/bash
if (( $EUID != 0 )); then
    echo "Please run as root"
    exit
fi
deflim="DefaultLimitNOFILE=65536"
echo $deflim >> /etc/systemd/system.conf
echo $deflim >> /etc/systemd/user.conf
echo "* - nofile 65536" >> /etc/security/limits.conf