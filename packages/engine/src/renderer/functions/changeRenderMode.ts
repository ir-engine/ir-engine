import { RenderPass } from 'postprocessing'
import { Light, MeshBasicMaterial, MeshNormalMaterial } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

import { RenderModes, RenderModesType } from '../constants/RenderModes'
import { accessEngineRendererState } from '../EngineRendererState'
import { EngineRenderer } from '../WebGLRendererSystem'
import { updateShadowMap } from './RenderSettingsFunction'

/**
 * Change render mode of the renderer
 * @param mode Mode which will be set to renderer
 */
export function changeRenderMode(mode: RenderModesType): void {
  const renderMode = accessEngineRendererState().renderMode.value

  // revert any changes made by a render mode
  switch (renderMode) {
    case RenderModes.UNLIT:
      Engine.instance.currentWorld.scene.traverse((obj: Light) => {
        if (obj.isLight && obj.userData.editor_disabled) {
          delete obj.userData.editor_disabled
          obj.visible = true
        }
      })
      break
    default:
      break
  }

  const passes = EngineRenderer.instance.effectComposer?.passes.filter((p) => p.name === 'RenderPass') as any
  const renderPass: RenderPass = passes ? passes[0] : undefined

  if (!renderPass) return

  switch (mode) {
    case RenderModes.UNLIT:
      Engine.instance.currentWorld.scene.traverse((obj: Light) => {
        if (obj.isLight && obj.visible) {
          obj.userData.editor_disabled = true
          obj.visible = false
        }
      })
      renderPass.overrideMaterial = null!
      break
    case RenderModes.LIT:
      renderPass.overrideMaterial = null!
      break
    case RenderModes.SHADOW:
      renderPass.overrideMaterial = null!
      break
    case RenderModes.WIREFRAME:
      renderPass.overrideMaterial = new MeshBasicMaterial({
        wireframe: true
      })
      break
    case RenderModes.NORMALS:
      renderPass.overrideMaterial = new MeshNormalMaterial()
      break
  }

  updateShadowMap(mode !== RenderModes.SHADOW)
}
