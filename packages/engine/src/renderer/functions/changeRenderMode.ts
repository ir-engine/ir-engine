import { RenderPass } from 'postprocessing'
import { Light, MeshBasicMaterial, MeshNormalMaterial } from 'three'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { getMutableState } from '@etherealengine/hyperflux'

import { RenderModes } from '../constants/RenderModes'
import { RendererState } from '../RendererState'
import { EngineRenderer } from '../WebGLRendererSystem'
import { updateShadowMap } from './RenderSettingsFunction'

/**
 * Change render mode of the renderer
 * @param mode Mode which will be set to renderer
 */
export function changeRenderMode() {
  const renderMode = getMutableState(RendererState).renderMode.value

  // revert any changes made by a render mode
  switch (renderMode) {
    case RenderModes.UNLIT:
      Engine.instance.scene.traverse((obj: Light) => {
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

  switch (renderMode) {
    case RenderModes.UNLIT:
      Engine.instance.scene.traverse((obj: Light) => {
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

  updateShadowMap()
}
