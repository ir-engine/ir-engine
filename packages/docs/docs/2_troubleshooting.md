---
id: troubleshooting
title: Troubleshooting
---

   #### Invalid Certificate errors in local environment

   As of this writing, the cert provided in the xrengine package for local use
   is not adequately signed. Browsers will throw up warnings about going to insecure pages.
   You should be able to tell the browser to ignore it, usually by clicking on some sort
   of 'advanced options' button or link and then something along the lines of 'go there anyway'.

   Chrome sometimes does not show a clickable option on the warning. If so, just
   type ```badidea``` or ```thisisunsafe``` when on that page. You don't enter that into the
   address bar or into a text box, Chrome is just passively listening for those commands.

   ##### Allow gameserver address connection via installing local Certificate Authority
   For more detailed instructions check: https://github.com/FiloSottile/mkcert

   Short version (common for development process on Ubuntu):
   1. `sudo apt install libnss3-tools`
   2. `brew install mkcert` (if you don't have brew, check it's page: https://brew.sh/)
   3. `mkcert --install`
   4. navigate to `./certs` folder
   5. mkcert -key-file key.pem -cert-file cert.pem localhost 127.0.0.1 ::1

   ##### Allow gameserver address connection with invalid certificate

   The gameserver functionality is hosted on an address other than 127.0.0.1 in the local
   environment. Accepting an invalid certificate for 127.0.0.1 will not apply to this address.
   Open the dev console for Chrome/Firefox by pressing ```Ctrl+Shift+i``` simultaneously, and
   go to the Console or Network tabs.

   If you see errors about not being able to connect to
   something like ```https://192.168.0.81/socket.io/?location=<foobar>```, right click on
   that URL and open it in a new tab. You should again get a warning page about an invalid
   certificate, and you again need to allow it.  

   #### AccessDenied connecting to mariadb

   Make sure you don't have another instance of mariadb running on port 3306
   ```
       lsof -i :3306
   ```

   On Linux, you can also check if any processes are running on port 3306 with
   ```sudo netstat -utlp | grep 3306```
   The last column should look like ```<ID>/<something```
   You can kill any running process with ```sudo kill <ID>```

   #### Error: listen EADDRINUSE :::3030

   check which process is using port 3030 and kill
   ```
       killall -9 node
   ```
       OR
   ```
       lsof -i :3030
   	kill -3 <proccessIDfromPreviousCommand>
   ```

   #### 'TypeError: Cannot read property 'position' of undefined' when accessing /location/home
       As of this writing, there's a bug with the default seeded test location.
       Go to /editor/projects and open the 'Test' project. Save the project, and
       the error should go away.

   #### Weird issues with your database?
   Try
   ```
   npm run dev-reinit-db // in server package
   ```
