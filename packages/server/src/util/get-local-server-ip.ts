import {networkInterfaces} from "os";

interface ServerAddress {
    ipAddress: string,
    port: string
}

export default (): ServerAddress => {
    const nets = networkInterfaces();
    const results = Object.create(null); // or just '{}', an empty object
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // skip over non-ipv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                if (!results[name]) {
                    results[name] = [];
                }

                results[name].push(net.address);
            }
        }
    }
    console.log('Non-internal local ports:')
    console.log(results)
    return {
        ipAddress: results.en0 ? results.en0[0] : results.eno1 ? results.eno1[0] : '127.0.0.1',
        port: '3030'
    }
}