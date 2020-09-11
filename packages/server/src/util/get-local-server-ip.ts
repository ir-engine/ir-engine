import internalIp from 'internal-ip';

interface ServerAddress {
    ipAddress: string;
    port: string;
}

export default async (): Promise<ServerAddress> => {
    const ip = await internalIp.v4()
    console.log('internal ip:');
    console.log(ip);
    return {
        ipAddress: ip,
        port: '3030'
    }
}