import { Color, TextureLoader } from 'three';
import { isClient } from '../../common/functions/isClient';
import { Engine } from '../../ecs/classes/Engine';
import { SCENE_ASSET_TYPES, WorldScene } from '../functions/SceneLoading';

export type SceneBackgroundProps = {
  backgroundColor: number
  backgroundPath: string
  backgroundType: 'color' | 'texture' | 'envmap'
}

export const createBackground = (entity, args: SceneBackgroundProps): any => {
  if(isClient) {
    switch(args.backgroundType) {
      case 'envmap':
        WorldScene.pushAssetTypeLoadCallback(SCENE_ASSET_TYPES.ENVMAP, () => {
          Engine.scene.background = Engine.scene.environment;
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
