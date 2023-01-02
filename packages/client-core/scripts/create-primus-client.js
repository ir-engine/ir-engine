const fs = require("fs");
const Primus = require('primus');
const http = require('http');

(() => {
    const options = Object.assign({}, { pingInterval: false, pathname: '/primus/cool/pants/shirts' });
    const server = http.createServer()
    const primus = new Primus(server, options)
    primus.save(__dirname + '/primus.js', function save(err) {
        console.log('saved', err)
    })
})();