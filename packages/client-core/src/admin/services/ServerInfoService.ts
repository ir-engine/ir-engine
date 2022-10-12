import { ServerInfoInterface } from '@xrengine/common/src/interfaces/ServerInfo'

import { API } from '../../API'

//Service
export const ServerInfoService = {
  fetchServerInfo: async () => {
    const serverInfo: ServerInfoInterface[] = await API.instance.client.service('server-info').find()
    return serverInfo
  }
}
