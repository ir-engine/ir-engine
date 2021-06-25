import { LinearToneMapping, sRGBEncoding, TextureEncoding, ToneMapping } from 'three'
import { isClient } from '../../common/functions/isClient'
import { CSM } from '../../assets/csm/CSM'
import { Engine } from '../../ecs/classes/Engine'
import { WebGLRendererSystem } from '../../renderer/WebGLRendererSystem'

export type RenderSettingsProps = {
  overrideRendererSettings: boolean
  csm: boolean
  toneMapping: ToneMapping
  toneMappingExposure: number
}

const enableCSM = (enable: boolean) => {

  if(enable) {
    if(WebGLRendererSystem.instance.csm) return;
    const csm = new CSM({
      cascades: 4,
      lightIntensity: 1,
      shadowMapSize: 1024,
      maxFar: 100,
      camera: Engine.camera,
      parent: Engine.scene
    })
    csm.fade = true
    WebGLRendererSystem.instance.csm = csm
  } else { 
    if(!WebGLRendererSystem.instance.csm) return;
    WebGLRendererSystem.instance.csm.remove()
    WebGLRendererSystem.instance.csm.dispose()
    WebGLRendererSystem.instance.csm = undefined
  }

}

export const handleRendererSettings = (args?: RenderSettingsProps): void => {
  if(!isClient) return

  if(args) {
    Engine.renderer.toneMapping = args.toneMapping
    Engine.renderer.toneMappingExposure = args.toneMappingExposure
    enableCSM(!Engine.isHMD && args.csm)
  } else {
    Engine.renderer.toneMapping = LinearToneMapping
    Engine.renderer.toneMappingExposure = 0.8
    enableCSM(!Engine.isHMD && true)
  }
}
