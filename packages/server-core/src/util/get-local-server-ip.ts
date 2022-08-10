import internalIp from 'internal-ip'

import configFile from '../appconfig'

export interface ServerAddress {
  ipAddress: string
  port: string
}

export default async (isChannelInstance: boolean): Promise<ServerAddress> => {
  const ip =
    configFile.instanceserver.hostname === 'localhost' ? await internalIp.v4() : configFile.instanceserver.hostname
  return {
    ipAddress: ip!,
    port: isChannelInstance ? '3032' : '3031'
  }
}
