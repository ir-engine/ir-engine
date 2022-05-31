	sudo su
	cd
	apt install git python3-pip

	curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash


	export NVM_DIR="$([ -z "${XDG_CONFIG_HOME-}" ] && printf %s "${HOME}/.nvm" || printf %s "${XDG_CONFIG_HOME}/nvm")"
	[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" 

	nvm install 16

	nvm use 16

	python3

	sudo apt update
	sudo apt install apt-transport-https ca-certificates curl software-properties-common
	curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
	sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable"

	sudo apt update
	apt-cache policy docker-ce

	sudo apt install docker-ce

	sudo systemctl status docker


	sudo usermod -aG docker ${USER}

	su - ${USER}

	id -nG


	docker

	docker info

	apt install docker-compose

	git clone https://github.com/XRFoundation/XREngine --depth 1

	cd XREngine/
	node --version

	npm install mediasoup@3 --save

	npm install -g node-gyp

	sudo su
	sudo apt-get update
	sudo apt install wget libnss3-tools

	curl -s https://api.github.com/repos/FiloSottile/mkcert/releases/latest| grep browser_download_url  | grep linux-amd64 | cut -d '"' -f 4 | wget -qi -


	mv mkcert-v*-linux-amd64 mkcert

	chmod a+x mkcert

	sudo mv mkcert /usr/local/bin/


	npm install

	npm run dev-docker

	brew install mkcert


	npm run dev-reinit

	npm run dev

	mkcert --install

	cd certs/

	mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 ::1


	cp .env.local.default .env.local
	nano .env.local

	#
	all localhost to ip
	#
	npm run dev-reinit

	npm run dev
