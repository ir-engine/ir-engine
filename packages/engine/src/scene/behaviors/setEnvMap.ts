import { Color, CubeTextureLoader, DataTexture, Material, PMREMGenerator, RGBFormat, sRGBEncoding, TextureLoader, Vector3 } from 'three';
import { isClient } from '../../common/functions/isClient';
import { Behavior } from '../../common/interfaces/Behavior';
import { Engine } from '../../ecs/classes/Engine';
import { EngineEvents } from '../../ecs/classes/EngineEvents';
import { addComponent, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import CubemapCapturer from '../../editor/nodes/helper/CubemapCapturer';
import { ReflectionProbeSettings, ReflectionProbeTypes } from '../../editor/nodes/ReflectionProbeNode';
import { WebGLRendererSystem } from '../../renderer/WebGLRendererSystem';
import { ScaleComponent } from '../../transform/components/ScaleComponent';
import { Sky } from '../classes/Sky';
import { Object3DComponent } from '../components/Object3DComponent';
import { EnvMapSourceType, EnvMapTextureType } from '../constants/EnvMapEnum';
import { SCENE_ASSET_TYPES, WorldScene } from '../functions/SceneLoading';
import { SceneObjectSystem } from '../systems/SceneObjectSystem';
import { addObject3DComponent } from './addObject3DComponent';

export const setEnvMap: Behavior = (entity, args:any) => {

  if (!isClient) {
    return;
  }

  const pmremGenerator = new PMREMGenerator(Engine.renderer);

  
  switch(args.type){

    case EnvMapSourceType.Color:
      const src=args.envMapSourceColor;
      const col=new Color(src);
      const resolution =1;
      const data=new Uint8Array(3*resolution*resolution);
      for(let i=0; i<resolution*resolution;i++){
          data[i]=Math.floor(col.r*255);
          data[i+1]=Math.floor(col.g*255);
          data[i+2]=Math.floor(col.b*255);
      }
      const texture=new DataTexture(data,resolution,resolution,RGBFormat);
      texture.encoding=sRGBEncoding;
      Engine.scene.environment=pmremGenerator.fromEquirectangular(texture).texture;
      break;

    case EnvMapSourceType.Texture:
      
      switch(args.envMapTextureType){
        case EnvMapTextureType.Cubemap:

          const negx = "negx.jpg";
          const negy = "negy.jpg";
          const negz = "negz.jpg";
          const posx = "posx.jpg";
          const posy = "posy.jpg";
          const posz = "posz.jpg";

          new CubeTextureLoader()
          .setPath(args.envMapSourceURL)
          .load([posx, negx, posy, negy, posz, negz],
          (texture) => {
            const EnvMap = pmremGenerator.fromCubemap(texture).texture;
            EnvMap.encoding = sRGBEncoding;
            Engine.scene.environment = EnvMap;
            texture.dispose();
          },
          (res)=> {
            console.log(res);
          },
          (erro) => {
            console.warn('Skybox texture could not be found!', erro);
          }
          );
          
          break;
        case EnvMapTextureType.Equirectangular:
          new TextureLoader().load(args.envMapSourceURL,(texture)=>{
            const EnvMap = pmremGenerator.fromEquirectangular(texture).texture;
            EnvMap.encoding = sRGBEncoding;
            Engine.scene.environment=EnvMap;
            texture.dispose();
          });
          break;
        default:
          console.log("Can't find type of env texture");
          break;

          
        } 
        

    

    // case EnvMapSourceType.Default:
    //   const op=args.options;
    //   addObject3DComponent(entity, { obj3d: Sky, objArgs: args });
    //   addComponent(entity, ScaleComponent);

    //   const component = getComponent(entity, Object3DComponent);
    //   const skyboxObject3D = component.value;
    //   const scaleComponent = getMutableComponent<ScaleComponent>(entity, ScaleComponent);
    //   scaleComponent.scale = [op.distance, op.distance, op.distance];
    //   const uniforms = Sky.material.uniforms;
    //   const sun = new Vector3();
    //   const theta = Math.PI * (op.inclination - 0.5);
    //   const phi = 2 * Math.PI * (op.azimuth - 0.5);

    //   sun.x = Math.cos(phi);
    //   sun.y = Math.sin(phi) * Math.sin(theta);
    //   sun.z = Math.sin(phi) * Math.cos(theta);
    //   uniforms.mieCoefficient.value = op.mieCoefficient;
    //   uniforms.mieDirectionalG.value = op.mieDirectionalG;
    //   uniforms.rayleigh.value = op.rayleigh;
    //   uniforms.turbidity.value = op.turbidity;
    //   uniforms.luminance.value = op.luminance;
    //   uniforms.sunPosition.value = sun;
    //   WebGLRendererSystem.instance.csm?.lightDirection.set(-sun.x, -sun.y, -sun.z);
    //   const skyboxTexture = (skyboxObject3D as any).generateEnvironmentMap(Engine.renderer);
    //   Engine.scene.environment = skyboxTexture;
    //   break;



    // case "ReflectionProbe":
    //   const options =args.options as ReflectionProbeSettings;
    //   SceneObjectSystem.instance.bpcemOptions.probeScale = options.probeScale;
    //   SceneObjectSystem.instance.bpcemOptions.probePositionOffset = options.probePositionOffset;
    //   SceneObjectSystem.instance.bpcemOptions.intensity = options.intensity;
      
    //   EngineEvents.instance.once(EngineEvents.EVENTS.SCENE_LOADED, async () => {
        
    //     switch (options.reflectionType) {
    //       case ReflectionProbeTypes.Baked:
    //         const envMapAddress = `/ReflectionProbe/${options.lookupName}.png`;
    //         new TextureLoader().load(envMapAddress, (texture) => {
    //           Engine.scene.environment = CubemapCapturer.convertEquiToCubemap(Engine.renderer, texture, options.resolution).texture;
    //           texture.dispose();
    //         });
            
    //         break;
    //         case ReflectionProbeTypes.Realtime:
    //           const map = new CubemapCapturer(Engine.renderer, Engine.scene, options.resolution, '');
    //           const EnvMap = (await map.update(options.probePosition)).cubeRenderTarget.texture;
    //           Engine.scene.environment = EnvMap;
    //           break;
    //         }
    //     });
    //   break;
  }
  pmremGenerator.dispose();

  SceneObjectSystem.instance.envMapIntensity=args.envMapIntensity;
  console.log("Setting up EnvMap");
  console.log("Setting up EnvMap");

};
