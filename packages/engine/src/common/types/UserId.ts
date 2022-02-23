import { OpaqueType } from '@xrengine/engine/src/common/types/OpaqueType'

export type UserId = OpaqueType<'userId'> & string
export type HostUserId = UserId & { readonly __host: true }
