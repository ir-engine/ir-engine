import { Behavior } from '../../common/interfaces/Behavior';
import { Engine } from '../../ecs/classes/Engine';
import { addComponent, getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { addObject3DComponent, getObject3D } from '../../common/behaviors/Object3DBehaviors';
import { Vector3, PMREMGenerator } from 'three';
import { LinkModel } from '../classes/LinkModel';
import { ScaleComponent } from '../../transform/components/ScaleComponent';

export const createLink: Behavior = (entity, args: {objArgs: any}) => {
    console.log("TODO: handle link, args are", args);

    const renderer = Engine.renderer;
    const pmremGenerator = new PMREMGenerator(renderer);

    addObject3DComponent(entity, { obj3d: LinkModel, objArgs: args.objArgs });
    addComponent(entity, ScaleComponent);

    // const linkModel = getObject3D(entity) as LinkModel;
    const scaleComponent = getMutableComponent<ScaleComponent>(entity, ScaleComponent);
    scaleComponent.scale = [args.objArgs.distance, args.objArgs.distance, args.objArgs.distance];
    const uniforms = LinkModel.material.uniforms;
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
    Engine.csm && Engine.csm.lightDirection.set(-sun.x, -sun.y, -sun.z);
  }
};
