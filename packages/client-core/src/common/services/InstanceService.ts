import { Paginated } from '@feathersjs/client'

import { Instance } from '@xrengine/common/src/interfaces/Instance'

import { API } from '../../API'

//Service
export const InstanceService = {
  checkRoom: async (roomCode: string) => {
    const { data } = (await API.instance.client
      .service('instance')
      .find({ query: { roomCode, ended: false, locationId: { $ne: null } } })) as Paginated<Instance>
    return data[0] as Instance
  }
}
