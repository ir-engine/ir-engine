import { PMREMGenerator, sRGBEncoding, TextureLoader } from 'three';
import { isClient } from '../../common/functions/isClient';
import { Behavior } from '../../common/interfaces/Behavior';
import { Engine } from '../../ecs/classes/Engine';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
import { envmapPhysicalParsReplace, worldposReplace } from '../../editor/nodes/helper/BPCEMShader';
import CubemapCapturer from '../../editor/nodes/helper/CubemapCapturer';
import { ReflectionProbeSettings, ReflectionProbeTypes } from '../../editor/nodes/ReflectionProbeNode';
import { SceneObjectSystem } from '../systems/SceneObjectSystem';

export const setReflectionProbe: Behavior = (entity, args: {}) => {

  if (!isClient) {
    return;
  }

  const options: ReflectionProbeSettings = args["options"];

  EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, () => SceneIsLoaded());

  const SceneIsLoaded = async () => {

    switch (options.reflectionType) {
      case ReflectionProbeTypes.Baked:
        const envMapAddress = `/ReflectionProbe/${options.lookupName}.png`;
        new TextureLoader().load(envMapAddress, (texture) => {
          Engine.scene.environment = CubemapCapturer.convertEquiToCubemap(Engine.renderer, texture, options.resolution).texture;
          texture.dispose();
        });

        break;
      case ReflectionProbeTypes.Realtime:
        const map = new CubemapCapturer(Engine.renderer, Engine.scene, options.resolution, '');
        const EnvMap = (await map.update(options.probePosition)).cubeRenderTarget.texture;
        Engine.scene.environment = EnvMap;
        break;
    }

    SceneObjectSystem.instance.bpcemOptions["probeScale"] = options.probeScale;
    SceneObjectSystem.instance.bpcemOptions["probePositionOffset"] = options.probePositionOffset;
    SceneObjectSystem.instance.bpcemOptions["intensity"] = options.intensity;
  }
}
