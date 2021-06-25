import { Color, sRGBEncoding, TextureLoader } from 'three';
import { isClient } from '../../common/functions/isClient';
import { Behavior } from '../../common/interfaces/Behavior';
import { Engine } from '../../ecs/classes/Engine';
import { EngineEvents } from '../../ecs/classes/EngineEvents';

export type SceneBackgroundProps = {
  backgroundColor: number
  backgroundPath: string
  backgroundType: 'color' | 'texture' | 'envmap'
}

export const createBackground: Behavior = (entity, args: SceneBackgroundProps) => {
  if(isClient) {
    switch(args.backgroundType) {
      case 'envmap':
        EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, async () => {
          Engine.scene.background = Engine.scene.environment;
          Engine.scene.background.encoding = sRGBEncoding;
        })
      break;
      case 'texture': 
        new TextureLoader().load(args.backgroundPath, (texture) => {
          Engine.scene.background = texture;
        })
      break;
      case 'color': 
        Engine.scene.background = new Color(args.backgroundColor);
      break;
    }
  }
};
