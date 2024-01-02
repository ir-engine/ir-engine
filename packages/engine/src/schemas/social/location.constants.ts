import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'

export const locationPath = 'location'

export type RoomCode = OpaqueType<'RoomCode'> & string
export type LocationID = OpaqueType<'LocationID'> & string
