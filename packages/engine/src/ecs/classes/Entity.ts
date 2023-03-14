import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'

export type Entity = OpaqueType<'entity'> & number

export const UndefinedEntity = 0 as Entity
