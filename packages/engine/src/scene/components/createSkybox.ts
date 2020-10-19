import { Vector3 } from 'three';
import { ScaleComponent } from '../../transform/components/ScaleComponent';
import { addObject3DComponent } from '../../common/behaviors/Object3DBehaviors';
import { getMutableComponent, createEntity, addComponent } from '../../ecs/functions/EntityFunctions';

export default function createSkybox (args: {
  obj;
  distance;
  inclination;
  azimuth;
  mieCoefficient;
  mieDirectionalG;
  rayleigh;
  turbidity;
  material;
}): void {
  const entity = createEntity();
  addObject3DComponent(entity, args.obj);
  // Add entity
  addComponent(entity, ScaleComponent);
  const scaleComponent = getMutableComponent<ScaleComponent>(entity, ScaleComponent);
  scaleComponent.scale = [args.distance, args.distance, args.distance];
  const uniforms = args.material.uniforms;
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
}
