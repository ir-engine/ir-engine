import { defineComponent, Entity, getComponent, getOptionalComponent } from '@ir-engine/ecs'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { useEffect } from 'react'
import { Material, Vector2 } from 'three'
import { CameraComponent } from '../../camera/components/CameraComponent'
import { getRendererEntity } from '../functions/useRendererEntity'
import { MaterialStateComponent } from '../materials/MaterialComponent'
import { removePlugin, setPlugin } from '../materials/materialFunctions'
import { getExtendedBreaks } from './CSM'
import { CSMComponent } from './CSMComponent'

export const CSMPluginComponent = defineComponent({
  name: 'CSMPluginComponent',

  schema: S.Object({}),

  reactor: (props: { entity: Entity }) => {
    const entity = props.entity
    useEffect(() => {
      const materialComponent = getOptionalComponent(entity, MaterialStateComponent)
      if (!materialComponent) return

      const material = materialComponent.material
      if (!material?.isMaterial) return

      const rendererEntity = getRendererEntity(entity)
      const csm = getOptionalComponent(rendererEntity, CSMComponent)
      if (!csm) return

      material.defines = material.defines || {}
      material.defines.USE_CSM = 1
      material.defines.CSM_CASCADES = csm.cascades

      if (csm.fade) {
        material.defines.CSM_FADE = ''
      }

      const breaksVec2: Vector2[] = []

      const callback = (shader: any) => {
        const camera = getComponent(Engine.instance.cameraEntity, CameraComponent)
        const far = Math.min(camera.far, csm.maxFar)
        const near = Math.min(csm.maxFar, camera.near)
        getExtendedBreaks(breaksVec2, rendererEntity)

        shader.uniforms.CSM_cascades = { value: breaksVec2 }
        shader.uniforms.cameraNear = { value: near }
        shader.uniforms.shadowFar = { value: far }
      }

      setPlugin(materialComponent.material as Material, callback)

      return () => {
        removePlugin(materialComponent.material as Material, callback)

        if (material.defines) {
          delete material.defines.USE_CSM
          delete material.defines.CSM_CASCADES
          delete material.defines.CSM_FADE
        }

        material.needsUpdate = true
      }
    }, [])

    return null
  }
})
