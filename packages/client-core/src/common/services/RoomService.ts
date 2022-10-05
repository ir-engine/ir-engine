import { Paginated } from '@feathersjs/client'

import { RoomInterface } from '@xrengine/common/src/interfaces/RoomInterface'

import { API } from '../../API'

//Service
export const RoomService = {
  fetchRoom: async (roomCode: string) => {
    const projects = (await API.instance.client
      .service('room-instance')
      .find({ query: { roomCode } })) as Paginated<RoomInterface>
    return projects
  }
}
