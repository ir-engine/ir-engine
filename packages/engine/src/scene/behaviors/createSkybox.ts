import { Sky } from '../../scene/classes/Sky';
import { PMREMGenerator, sRGBEncoding, TextureLoader, Vector3 } from 'three';
import { isClient } from '../../common/functions/isClient';
import { Engine } from '../../ecs/classes/Engine';
import { addComponent, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { ScaleComponent } from '../../transform/components/ScaleComponent';
import { Object3DComponent } from '../components/Object3DComponent';
import { addObject3DComponent } from './addObject3DComponent';
import { CubeTextureLoader } from '../../assets/loaders/tex/CubeTextureLoader';
import { WebGLRendererSystem } from '../../renderer/WebGLRendererSystem';

export default function createSkybox(entity, args: any): void {
  
  if (!isClient) {
    return;
  }
  
  const renderer = Engine.renderer

  const pmremGenerator = new PMREMGenerator(renderer);

  const negx = "negx.jpg";
  const negy = "negy.jpg";
  const negz = "negz.jpg";
  const posx = "posx.jpg";
  const posy = "posy.jpg";
  const posz = "posz.jpg";

  if (args.skytype === "cubemap") {
    new CubeTextureLoader()
      .setPath(args.texture)
      .load([posx, negx, posy, negy, posz, negz],
      (texture) => {
        const EnvMap = pmremGenerator.fromCubemap(texture).texture;

        Engine.scene.background = EnvMap;
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
  }
  else if (args.skytype === "equirectangular") {
    new TextureLoader().load(args.texture, (texture) => {
      const EnvMap = pmremGenerator.fromEquirectangular(texture).texture;

      Engine.scene.background = EnvMap;
      Engine.scene.environment = EnvMap;

      Engine.scene.background.encoding = sRGBEncoding;

      texture.dispose();
      pmremGenerator.dispose();
    });
  }
  else {
    addObject3DComponent(entity, { obj3d: Sky, objArgs: args });
    addComponent(entity, ScaleComponent);

    const component = getComponent(entity, Object3DComponent);
    const skyboxObject3D = component.value;
    const scaleComponent = getMutableComponent<ScaleComponent>(entity, ScaleComponent);
    scaleComponent.scale = [args.distance, args.distance, args.distance];
    const uniforms = Sky.material.uniforms;
    const sun = new Vector3();
    const theta = Math.PI * (args.inclination - 0.5);
    const phi = 2 * Math.PI * (args.azimuth - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);
    uniforms.mieCoefficient.value = args.mieCoefficient;
    uniforms.mieDirectionalG.value = args.mieDirectionalG;
    uniforms.rayleigh.value = args.rayleigh;
    uniforms.turbidity.value = args.turbidity;
    uniforms.sunPosition.value = sun;
    WebGLRendererSystem.instance.csm?.lightDirection.set(-sun.x, -sun.y, -sun.z);

    const skyboxTexture = (skyboxObject3D as any).generateEnvironmentMap(renderer);

    Engine.scene.background = skyboxTexture;
    Engine.scene.environment = skyboxTexture;
  }
}
