import { LinearToneMapping, sRGBEncoding, TextureEncoding, ToneMapping } from 'three';
import { isClient } from '../../common/functions/isClient';
import { CSM } from '../../assets/csm/CSM';
import { Engine } from '../../ecs/classes/Engine';
import { WebGLRendererSystem } from '../../renderer/WebGLRendererSystem';

export type RenderSettingsProps = {
  overrideRendererSettings: boolean;
  csm: boolean;
  toneMapping: ToneMapping;
  toneMappingExposure: number;
  physicallyCorrectLights: boolean;
  outputEncoding: TextureEncoding;
}

export const handleRendererSettings = (args?: RenderSettingsProps): void => {
  if(!isClient) return;
  if(args) {
    Engine.renderer.physicallyCorrectLights = args.physicallyCorrectLights;
    Engine.renderer.outputEncoding = args.outputEncoding;
    Engine.renderer.toneMapping = args.toneMapping;
    Engine.renderer.toneMappingExposure = args.toneMappingExposure;
    if(!args.csm && WebGLRendererSystem.instance.csm) {
      WebGLRendererSystem.instance.csm.remove()
      WebGLRendererSystem.instance.csm.dispose()
    }
    if(!Engine.isHMD && args.csm && !WebGLRendererSystem.instance.csm) {
      const csm = new CSM({
        cascades: 4,
        lightIntensity: 1,
        shadowMapSize: 1024,
        maxFar: 100,
        camera: Engine.camera,
        parent: Engine.scene
      });
      csm.fade = true;
      WebGLRendererSystem.instance.csm = csm;
    }
  } else {
    Engine.renderer.physicallyCorrectLights = true;
    Engine.renderer.outputEncoding = sRGBEncoding;
    Engine.renderer.toneMapping = LinearToneMapping;
    Engine.renderer.toneMappingExposure = 0.8;
  }
};
