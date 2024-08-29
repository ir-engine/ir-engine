import { OpaqueType } from './OpaqueType'

export type PeerID = OpaqueType<'PeerID'> & string
export type UserID = OpaqueType<'UserID'> & string
export type NetworkID = OpaqueType<'NetworkID'> & string
