import { OpaqueType } from '@xrengine/common/src/interfaces/OpaqueType'

/**
* Entity type.
* @param {string} entity - Entity name.
* @param {number} id - Entity id.
*/
export type Entity = OpaqueType<'entity'> & number
