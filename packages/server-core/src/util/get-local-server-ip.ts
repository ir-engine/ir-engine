import internalIp from 'internal-ip'
import configFile from '../appconfig'

interface ServerAddress {
  ipAddress: string
  port: string
}

export default async (isChannelInstance: boolean): Promise<ServerAddress> => {
  const ip = configFile.gameserver.hostname
  return {
    ipAddress: ip!,
    port: isChannelInstance ? '3032' : '3031'
  }
}
