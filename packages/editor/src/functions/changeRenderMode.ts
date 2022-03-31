import { RenderPass } from 'postprocessing'
import { Light, MeshBasicMaterial, MeshNormalMaterial } from 'three'

import { store } from '@xrengine/client-core/src/store'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'

import { RenderModes, RenderModesType } from '../constants/RenderModes'
import { ModeAction } from '../services/ModeServices'
import { SceneState } from './sceneRenderFunctions'

/**
 * Change render mode of the renderer
 * @param mode Mode which will be set to renderer
 */
export function changeRenderMode(mode: RenderModesType): void {
  // revert any changes made by a render mode
  switch (SceneState.renderMode) {
    case RenderModes.UNLIT:
      Engine.scene.traverse((obj: Light) => {
        if (obj.isLight && obj.userData.editor_disabled) {
          delete obj.userData.editor_disabled
          obj.visible = true
        }
      })
      break
    default:
      break
  }

  SceneState.renderMode = mode

  const passes = Engine.effectComposer?.passes.filter((p) => p.name === 'RenderPass') as any
  const renderPass: RenderPass = passes ? passes[0] : undefined

  if (!renderPass) return

  switch (mode) {
    case RenderModes.UNLIT:
      Engine.renderer.shadowMap.enabled = false
      Engine.scene.traverse((obj: Light) => {
        if (obj.isLight && obj.visible) {
          obj.userData.editor_disabled = true
          obj.visible = false
        }
      })
      renderPass.overrideMaterial = null!
      break
    case RenderModes.LIT:
      Engine.renderer.shadowMap.enabled = false
      renderPass.overrideMaterial = null!
      break
    case RenderModes.SHADOW:
      Engine.renderer.shadowMap.enabled = true
      renderPass.overrideMaterial = null!
      break
    case RenderModes.WIREFRAME:
      Engine.renderer.shadowMap.enabled = false
      renderPass.overrideMaterial = new MeshBasicMaterial({
        wireframe: true
      })
      break
    case RenderModes.NORMALS:
      Engine.renderer.shadowMap.enabled = false
      renderPass.overrideMaterial = new MeshNormalMaterial()
      break
  }

  Engine.renderer.shadowMap.needsUpdate = true
  store.dispatch(ModeAction.changedRenderMode(mode))
}
