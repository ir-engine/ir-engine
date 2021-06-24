import { LinearToneMapping, sRGBEncoding, TextureEncoding, ToneMapping } from 'three';
import { isClient } from '../../common/functions/isClient';
import { Behavior } from '../../common/interfaces/Behavior';
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
    WebGLRendererSystem.instance.csmEnabled = args.csm;
  } else {
    Engine.renderer.physicallyCorrectLights = true;
    Engine.renderer.outputEncoding = sRGBEncoding;
    Engine.renderer.toneMapping = LinearToneMapping;
    Engine.renderer.toneMappingExposure = 0.8;
    WebGLRendererSystem.instance.csmEnabled = true;
  }
};
