import { Color, CubeTextureLoader, PMREMGenerator, sRGBEncoding, TextureLoader, Vector3 } from 'three';
import { isClient } from '../../common/functions/isClient';
import { Engine } from '../../ecs/classes/Engine';
import { addComponent, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { SceneBackgroundProps } from '../../editor/nodes/SkyboxNode';
import { WebGLRendererSystem } from '../../renderer/WebGLRendererSystem';
import { ScaleComponent } from '../../transform/components/ScaleComponent';
import { Sky } from '../classes/Sky';
import { Object3DComponent } from '../components/Object3DComponent';
import { SCENE_ASSET_TYPES, WorldScene } from '../functions/SceneLoading';
import { addObject3DComponent } from './addObject3DComponent';



export const createSkybox = (entity, args: SceneBackgroundProps): any => {
  if(isClient) {
    switch(args.backgroundType) {
      case 'skybox':
        const op=args.skyboxProps as any;
        addObject3DComponent(entity, { obj3d: Sky, objArgs: args });
        addComponent(entity, ScaleComponent);
  
        const component = getComponent(entity, Object3DComponent);
        const skyboxObject3D = component.value;
        const scaleComponent = getMutableComponent<ScaleComponent>(entity, ScaleComponent);
        scaleComponent.scale = [op.distance, op.distance, op.distance];
        const uniforms = Sky.material.uniforms;
        const sun = new Vector3();
        const theta = Math.PI * (op.inclination - 0.5);
        const phi = 2 * Math.PI * (op.azimuth - 0.5);
  
        sun.x = Math.cos(phi);
        sun.y = Math.sin(phi) * Math.sin(theta);
        sun.z = Math.sin(phi) * Math.cos(theta);
        uniforms.mieCoefficient.value = op.mieCoefficient;
        uniforms.mieDirectionalG.value = op.mieDirectionalG;
        uniforms.rayleigh.value = op.rayleigh;
        uniforms.turbidity.value = op.turbidity;
        uniforms.luminance.value = op.luminance;
        uniforms.sunPosition.value = sun;
        WebGLRendererSystem.instance.csm?.lightDirection.set(-sun.x, -sun.y, -sun.z);
        const skyboxTexture = (skyboxObject3D as any).generateEnvironmentMap(Engine.renderer);
        Engine.scene.background = skyboxTexture;
        break;


      case 'cubemap':
        const negx = "negx.jpg";
        const negy = "negy.jpg";
        const negz = "negz.jpg";
        const posx = "posx.jpg";
        const posy = "posy.jpg";
        const posz = "posz.jpg";

        new CubeTextureLoader()
        .setPath(args.cubemapPath)
        .load([posx, negx, posy, negy, posz, negz],
        (texture) => {
          const renderer = Engine.renderer
          const pmremGenerator = new PMREMGenerator(renderer);
          const EnvMap = pmremGenerator.fromCubemap(texture).texture;
          EnvMap.encoding = sRGBEncoding;
          Engine.scene.environment = EnvMap;
          texture.dispose();
          pmremGenerator.dispose();
        },
        (res)=> {
          console.log(res);
        },
        (erro) => {
          console.warn('Skybox texture could not be found!', erro);
        }
        );
        break;

      case 'equilateral':
        new TextureLoader().load(args.equilateralPath, (texture) => {
          Engine.scene.background = texture;
        })
        break;

      case 'color': 
        Engine.scene.background = new Color(args.backgroundColor);
      break;
    }
  }
};
