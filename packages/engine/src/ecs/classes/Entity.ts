import { OpaqueType } from '@xrengine/common/src/interfaces/OpaqueType'

export type Entity = (OpaqueType<'entity'> & number) | number
