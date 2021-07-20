import { DirectionalLight, LinearToneMapping, PCFSoftShadowMap, ShadowMapType, ToneMapping } from 'three'
import { isClient } from '../../common/functions/isClient'
import { CSM } from '../../assets/csm/CSM'
import { Engine } from '../../ecs/classes/Engine'
import { WebGLRendererSystem } from '../../renderer/WebGLRendererSystem'
import { isMobile } from '../../common/functions/isMobile'

export type RenderSettingsProps = {
  overrideRendererSettings: boolean
  csm: boolean
  toneMapping: ToneMapping
  toneMappingExposure: number
  shadowMapType: ShadowMapType
}

export const configureCSM = (directionalLights: DirectionalLight[], remove?: boolean): void => {
  if (!isClient || !Engine.renderer.shadowMap.enabled) return

  if (remove) {
    if (!WebGLRendererSystem.instance.csm) return

    WebGLRendererSystem.instance.csm.remove()
    WebGLRendererSystem.instance.csm.dispose()
    WebGLRendererSystem.instance.csm = undefined

    return
  }

  if (Engine.isHMD || WebGLRendererSystem.instance.csm) return

  const csm = new CSM({
    cascades: directionalLights?.length,
    shadowMapSize: isMobile ? 512 : 2048,
    camera: Engine.camera,
    parent: Engine.scene,
    lights: directionalLights
  })

  csm.fade = true
  WebGLRendererSystem.instance.csm = csm
}

export const handleRendererSettings = (args: RenderSettingsProps, reset?: boolean): void => {
  if (!isClient) return

  if (reset) {
    Engine.renderer.shadowMap.enabled = true
    Engine.renderer.shadowMap.type = PCFSoftShadowMap
    Engine.renderer.shadowMap.needsUpdate = true

    Engine.renderer.toneMapping = LinearToneMapping
    Engine.renderer.toneMappingExposure = 0.8

    return
  }

  Engine.renderer.toneMapping = args.toneMapping
  Engine.renderer.toneMappingExposure = args.toneMappingExposure

  if (typeof args.shadowMapType === 'undefined') {
    Engine.renderer.shadowMap.enabled = false
  } else {
    Engine.renderer.shadowMap.enabled = true
    Engine.renderer.shadowMap.type = args.shadowMapType
    Engine.renderer.shadowMap.needsUpdate = true
  }
}
