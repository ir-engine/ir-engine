import { Sky } from '@xr3ngine/engine/src/scene/classes/Sky';
import { Vector3 } from 'three';
import { addObject3DComponent } from '../../common/behaviors/Object3DBehaviors';
import { addComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { ScaleComponent } from '../../transform/components/ScaleComponent';
import { SkyboxComponent } from '../components/SkyboxComponent';

export default function createSkybox (entity, args: {
  obj3d;
  objArgs: any
}): void {
  console.log("Creating skybox");
  addObject3DComponent(entity, { obj3d: args.obj3d });
  addObject3DComponent(entity, { obj3d: args.obj3d });
  addComponent(entity, SkyboxComponent);
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
}
