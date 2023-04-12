import { OpaqueType } from '@etherealengine/common/src/interfaces/OpaqueType'

type FilterComponents<T> = T //extends {isComponent:true} ? T : never

/**
 * Entity or Entity<[]> means an entity that can NOT be used with any component without type errors
 * Entity<[Component1, Component2]> means an entity that is typed to ONLY have Component1 and Component2
 */
export type Entity<C extends readonly any[] = []> = OpaqueType<'entity'> &
  number & {
    __components: {
      [key in FilterComponents<C>[number]['name']]: true
    } & {
      [key: string]: true
    }
  }

export const UndefinedEntity = 0 as Entity
