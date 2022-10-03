import { createState } from '@xrengine/hyperflux/functions/StateFunctions'
import { Entity } from '../../ecs/classes/Entity'
import { defineComponent } from '../../ecs/functions/ComponentFunctions'

export const UUIDComponent = defineComponent({
    name: 'UUIDComponent',

    onAdd: () => '',

    toJSON: (entity, uuid:string) => {
        return uuid
    },

    onUpdate: (entity, _, uuid:string) => {
        UUIDComponent.map[entity].set(uuid)
        UUIDComponent.entitiesByUUID[uuid].set(entity)
    },

    entitiesByUUID: createState({} as Record<string, Entity>)
})