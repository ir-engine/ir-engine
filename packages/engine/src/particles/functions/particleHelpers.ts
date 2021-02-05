import { ParticleEmitter } from "../components/ParticleEmitter";
import {
  Matrix4,
} from "three";
import { addComponent, getComponent } from "../../ecs/functions/EntityFunctions";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { isClient } from "../../common/functions/isClient";
import { ParticleEmitterMesh } from "./ParticleEmitterMesh";
import { Engine } from "../../ecs/classes/Engine";

export const DEG2RAD = 0.0174533;

export const vertexShader = `
  #include <common>
  attribute vec4 particlePosition;
  attribute vec4 particleColor;
  attribute float particleAngle;
  varying vec4 vColor;
  varying vec2 vUV;
  uniform mat4 emitterMatrix;
  #include <fog_pars_vertex>
  void main() {
    vUV = uv;
    vColor = particleColor;
    float particleScale = particlePosition.w;
    vec4 mvPosition = viewMatrix * emitterMatrix * vec4(particlePosition.xyz, 1.0);
    
    vec3 rotatedPosition = position;
    rotatedPosition.x = cos( particleAngle ) * position.x - sin( particleAngle ) * position.y;
    rotatedPosition.y = sin( particleAngle ) * position.x + cos( particleAngle ) * position.y;
    mvPosition.xyz += rotatedPosition * particleScale;
    gl_Position = projectionMatrix * mvPosition;
    #include <fog_vertex>
  }
`;

export const fragmentShader = `
  #include <common>
  #include <fog_pars_fragment>
  uniform sampler2D map;
  varying vec2 vUV;
  varying vec4 vColor;
  void main() {
    gl_FragColor = texture2D(map,  vUV) * vColor;
    #include <fog_fragment>
  }
`;

export const createParticleEmitter = (entity, configs): void => {
  ParticleEmitterMesh.fromArgs(configs.objArgs).then(mesh => {
    addComponent(entity, ParticleEmitter, { particleEmitterMesh: mesh });
    Engine.scene.add(mesh);
  });
}

export const applyTransform = (entity, emitter): void => {
  if (!isClient) return;
  const transform = getComponent(entity, TransformComponent);
  const transformMatrix = new Matrix4();
  transformMatrix.compose(
    transform.position,
    transform.rotation,
    transform.scale,
  );
  emitter.applyMatrix4(transformMatrix)  
}

// export const applyTransform = (entity, childMatrix = undefined) => {
//     const object3D = getComponent(entity, Object3DComponent);
//     const transform = getComponent<TransformComponent>(entity, TransformComponent);

//     if (object3D) {
//       return childMatrix ? childMatrix.multiply(object3D["value"].matrixWorld) : object3D["value"].matrixWorld;
//     } else if (transform) {
//       const transformMatrix = new Matrix4();
//       const scale = new Vector3();
//       transformMatrix.compose(
//         transform.position,
//         transform.rotation,
//         scale.set(1, 1, 1)
//       );

//       if (childMatrix) {
//         transformMatrix.premultiply(childMatrix);
//       }

//       const parent = getComponent(entity, TransformParentComponent);
//       return parent ? applyTransform(parent['value'], transformMatrix) : transformMatrix;
//     } else {
//       return new Matrix4();
//     }
//   };