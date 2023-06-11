import internalIp from 'internal-ip'

import configFile from '../appconfig'

export interface ServerAddress {
  ipAddress: string
  port: string
}

export default async (isMediaInstance: boolean): Promise<ServerAddress> => {
  const ip = configFile.instanceserver.domain === 'localhost' ? await internalIp.v4() : configFile.instanceserver.domain
  return {
    ipAddress: ip!,
    port: isMediaInstance ? '3032' : '3031'
  }
}
