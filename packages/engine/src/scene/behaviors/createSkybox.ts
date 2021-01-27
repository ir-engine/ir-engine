import { Sky } from '@xr3ngine/engine/src/scene/classes/Sky';
import { CanvasTexture, CubeTextureLoader, RGBFormat, sRGBEncoding } from 'three';
import { CubeTexture, TextureLoader } from 'three';
import { CubeRefractionMapping } from 'three';
import { EquirectangularReflectionMapping } from 'three';
import { Vector3 } from 'three';
import { addObject3DComponent } from '../../common/behaviors/Object3DBehaviors';
import { isClient } from '../../common/functions/isClient';
import { Engine } from '../../ecs/classes/Engine';
import { addComponent, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { ScaleComponent } from '../../transform/components/ScaleComponent';

export default function createSkybox(entity, args: {
  obj3d;
  objArgs: any
}): void {
  if (!isClient) {
    return;
  }

  if (args.objArgs.skytype === "cubemap") {
    Engine.scene.background = new CubeTextureLoader()
      .setPath(args.objArgs.texture)
      .load(['posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg']);
  }
  else if (args.objArgs.skytype === "equirectangular") {
    Engine.scene.background = new TextureLoader().load(args.objArgs.texture);
    Engine.scene.background.encoding = sRGBEncoding;
    Engine.scene.background.mapping = EquirectangularReflectionMapping;
  }
  else {
    addObject3DComponent(entity, { obj3d: Sky, objArgs: args.objArgs });
    addComponent(entity, ScaleComponent);
    const scaleComponent = getMutableComponent<ScaleComponent>(entity, ScaleComponent);
    scaleComponent.scale = [args.objArgs.distance, args.objArgs.distance, args.objArgs.distance];
    const uniforms = Sky.material.uniforms;
    const sun = new Vector3();
    const theta = Math.PI * (args.objArgs.inclination - 0.5);
    const phi = 2 * Math.PI * (args.objArgs.azimuth - 0.5);

    sun.x = Math.cos(phi);
    sun.y = Math.sin(phi) * Math.sin(theta);
    sun.z = Math.sin(phi) * Math.cos(theta);
    uniforms.mieCoefficient.value = args.objArgs.mieCoefficient;
    uniforms.mieDirectionalG.value = args.objArgs.mieDirectionalG;
    uniforms.rayleigh.value = args.objArgs.rayleigh;
    uniforms.turbidity.value = args.objArgs.turbidity;
    uniforms.sunPosition.value = sun;
    Engine.csm.lightDirection.set(-sun.x, -sun.y, -sun.z);
  }
}
