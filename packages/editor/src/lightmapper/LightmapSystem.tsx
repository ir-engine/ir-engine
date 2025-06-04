import config from '@ir-engine/common/src/config'
import {
  defineSystem,
  Entity,
  Layers,
  PresentationSystemGroup,
  useChildrenWithComponents,
  useComponent
} from '@ir-engine/ecs'
import { QueryReactor } from '@ir-engine/ecs/src/QueryFunctions'
import { MaterialStateComponent } from '@ir-engine/spatial/src/renderer/materials/MaterialComponent'
import React, { useEffect } from 'react'
import { MeshStandardMaterial } from 'three'
import { commitProperty } from '../components/properties/Util'
import { LightmapComponent } from './LightmapComponent'

const MaterialReactor = (props: { lightmapEntity: Entity; entity: Entity }) => {
  const { lightmapEntity, entity } = props
  const materialState = useComponent(entity, MaterialStateComponent)
  const lightmapComponent = useComponent(lightmapEntity, LightmapComponent)

  const material = materialState.material.value as MeshStandardMaterial

  useEffect(() => {
    console.log('Material reactor', material)
    if (!material) return

    //debug only
    commitProperty(MaterialStateComponent, 'parameters.map.source' as any, [entity])(
      config.client.fileServer + '/projects/ir-engine/default-project/assets/UV.png'
    )
    commitProperty(MaterialStateComponent, 'parameters.map.channel' as any, [entity])(2)

    material.needsUpdate = true
  }, [material])

  return null
}

const LightmapReactor = ({ entity }) => {
  // temporarily hierarchy based, todo use volumes
  const childMaterials = useChildrenWithComponents(entity, [MaterialStateComponent])

  return (
    <>
      {childMaterials.map((materialEntity) => (
        <MaterialReactor key={materialEntity} entity={materialEntity} lightmapEntity={entity} />
      ))}
    </>
  )
}

export const LightmapSystem = defineSystem({
  uuid: 'ee.engine.LightmapSystem',
  insert: { with: PresentationSystemGroup },
  reactor: () => (
    <QueryReactor Components={[LightmapComponent]} ChildEntityReactor={LightmapReactor} layer={Layers.Authoring} />
  )
})
