import { useEffect } from 'react'
import { defineComponent, setComponent, useComponent } from '../../ecs/functions/ComponentFunctions'
import { useEntityContext } from '../../ecs/functions/EntityFunctions'
import { EntityTreeComponent, iterateEntityNode } from '../../ecs/functions/EntityTree'
import { ObjectLayers } from '../constants/ObjectLayers'
import { ObjectLayerMaskComponent } from './ObjectLayerComponent'

export const ModelPreviewComponent = defineComponent({
  name: 'ModelPreviewComponent',
  reactor: () => {
    const entity = useEntityContext()
    const entityTreeComponent = useComponent(entity, EntityTreeComponent)
    useEffect(() => {
      console.log(entityTreeComponent.value)
      iterateEntityNode(entity, (childEntity) => {
        setComponent(childEntity, ObjectLayerMaskComponent)
        ObjectLayerMaskComponent.setLayer(childEntity, ObjectLayers.Panel)
      })
    }, [entityTreeComponent.children])
    return null
  }
})
