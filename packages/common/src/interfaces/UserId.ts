import { OpaqueType } from './OpaqueType'

export type UserId = OpaqueType<'userId'> & string
export type HostUserId = UserId & { readonly __host: true }
