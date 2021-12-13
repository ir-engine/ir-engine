import internalIp from 'internal-ip'

interface ServerAddress {
  ipAddress: string
  port: string
}

export default async (isChannelInstance: boolean): Promise<ServerAddress> => {
  const ip = await internalIp.v4()
  return {
    ipAddress: ip!,
    port: isChannelInstance ? '3032' : '3031'
  }
}
