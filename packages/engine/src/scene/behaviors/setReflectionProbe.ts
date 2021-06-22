import { TextureLoader } from 'three';
import { isClient } from '../../common/functions/isClient';
import { Behavior } from '../../common/interfaces/Behavior';
import { Engine } from '../../ecs/classes/Engine';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
import CubemapCapturer from '../../editor/nodes/helper/CubemapCapturer';
import { ReflectionProbeSettings, ReflectionProbeTypes } from '../../editor/nodes/ReflectionProbeNode';
import { SceneObjectSystem } from '../systems/SceneObjectSystem';

export const setReflectionProbe: Behavior = (entity, args: { options: ReflectionProbeSettings }) => {

  if (!isClient) {
    return;
  }

  SceneObjectSystem.instance.bpcemOptions.probeScale = args.options.probeScale;
  SceneObjectSystem.instance.bpcemOptions.probePositionOffset = args.options.probePositionOffset;
  SceneObjectSystem.instance.bpcemOptions.intensity = args.options.intensity;

  EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, async () => {

    switch (args.options.reflectionType) {
      case ReflectionProbeTypes.Baked:
        const envMapAddress = `/ReflectionProbe/${args.options.lookupName}.png`;
        new TextureLoader().load(envMapAddress, (texture) => {
          Engine.scene.environment = CubemapCapturer.convertEquiToCubemap(Engine.renderer, texture, args.options.resolution).texture;
          texture.dispose();
        });

        break;
      case ReflectionProbeTypes.Realtime:
        const map = new CubemapCapturer(Engine.renderer, Engine.scene, args.options.resolution, '');
        const EnvMap = (await map.update(args.options.probePosition)).cubeRenderTarget.texture;
        Engine.scene.environment = EnvMap;
        break;
    }
  });
};
