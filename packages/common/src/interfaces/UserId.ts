import { OpaqueType } from './OpaqueType'

/** prefer `ID` over `Id` */
export type UserID = OpaqueType<'UserID'> & string

/** @todo deprecate */
// /**@deprecated */
export type UserId = UserID
