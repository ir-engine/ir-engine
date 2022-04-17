import { OpaqueType } from './OpaqueType'

export type UserId = OpaqueType<'userId'> & string
