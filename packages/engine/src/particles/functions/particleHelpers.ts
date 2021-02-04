import { ParticleEmitter } from "../components/ParticleEmitter";
import * as EasingFunctions from "@mozillareality/easing-functions";
import {
  Mesh,
  InstancedBufferGeometry,
  PlaneBufferGeometry,
  ShaderMaterial,
  Vector3,
  Color,
  InstancedBufferAttribute,
  AddEquation,
  Texture,
  BufferAttribute,
  RawShaderMaterial,
  Matrix4,
  UniformsUtils,
  UniformsLib,
  DynamicDrawUsage
} from "three";
import { addComponent } from "../../ecs/functions/EntityFunctions";
import loadTexture from "../../editor/functions/loadTexture";
import { lerp, clamp } from "../../common/functions/MathLerpFunctions";
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

interface ParticleEmitterGeometry extends InstancedBufferGeometry {
  attributes: {
    position: BufferAttribute;
    uv: BufferAttribute;
    particlePosition: InstancedBufferAttribute;
    particleColor: InstancedBufferAttribute;
    particleAngle: InstancedBufferAttribute;
  }
}

export const createParticleEmitter = (entity, configs): void => {
  // console.log(entity, configs);
  if (!isClient) return;
  // const args = JSON.parse(JSON.stringify(configs.objArgs));
  ParticleEmitterMesh.fromArgs(configs.objArgs).then(mesh => {
    console.debug("Adding emitter component =>", mesh);
    addComponent(entity, ParticleEmitter, { particleEmitterMesh: mesh });
    Engine.scene.add(mesh);
    console.debug("scene => ", Engine.scene)
  });
}



// export const createParticles = async (emitter: ParticleEmitter): Promise<void> => {
//   if (!isClient) return;
//   emitter.textureLoading = true;
//   const texture = await loadTexture(emitter.src);
//   emitter.textureLoading = false;

//   const planeGeometry = new PlaneBufferGeometry(1, 1, 1, 1);
//   const geometry = new InstancedBufferGeometry();
//   geometry.index = planeGeometry.index;
//   geometry.attributes = planeGeometry.attributes;

//   // const texture = (emitter.material as ShaderMaterial).uniforms.map.value;
//   emitter.particleMesh = new Mesh();
//   emitter.particleMesh.material = new ShaderMaterial({
//     uniforms: UniformsUtils.merge([{
//       map: { value: texture },
//       emitterMatrix: { value: new Matrix4() }
//     }, UniformsLib.fog]),
//     vertexShader,
//     fragmentShader,
//     transparent: true,
//     depthWrite: false,
//     fog: true,
//     blendEquation: AddEquation
//   });

//   const positions = [];
//   const colors = [];
//   const lifetimes = [];
//   const ages = [];
//   const initialAges = [];
//   const initialPositions = [];
//   const particleSizeRandomness = [];
//   const angles = [];

//   // emitter.getWorldScale(emitter.worldScale);

//   for (let i = 0; i < emitter.particleCount; i++) {
//     initialAges[i] = Math.random() * emitter.ageRandomness - emitter.ageRandomness;
//     lifetimes[i] = emitter.lifetime + Math.random() * 2 * emitter.lifetimeRandomness;
//     ages[i] = initialAges[i];
//     initialPositions[i * 3] = Math.random() * 2 - 1; // X
//     initialPositions[i * 3 + 1] = Math.random() * 2 - 1; // Y
//     initialPositions[i * 3 + 2] = 0; // Z
//     particleSizeRandomness[i] = Math.random() * emitter.sizeRandomness;

//     positions.push(initialPositions[i * 3]); // * emitter.particleMesh.worldScale.x);
//     positions.push(initialPositions[i * 3 + 1]); // * emitter.particleMesh.worldScale.y);
//     positions.push(initialPositions[i * 3 + 2]);
//     positions.push(emitter.startSize + particleSizeRandomness[i]);

//     angles.push(0);
//     colors.push(emitter.startColor.r, emitter.startColor.g, emitter.startColor.b, 0);
//   }
//   geometry.setAttribute(
//     "particlePosition",
//     new InstancedBufferAttribute(new Float32Array(positions), 4).setUsage(DynamicDrawUsage)
//   );
//   geometry.setAttribute("particleColor", new InstancedBufferAttribute(new Float32Array(colors), 4).setUsage(DynamicDrawUsage));
//   geometry.setAttribute("particleAngle", new InstancedBufferAttribute(new Float32Array(angles), 1).setUsage(DynamicDrawUsage));

//   emitter.particleMesh.geometry = geometry;
//   emitter.initialPositions = initialPositions;
//   emitter.particleSizeRandomness = particleSizeRandomness;
//   emitter.ages = ages;
//   emitter.initialAges = initialAges;
//   emitter.lifetimes = lifetimes;
//   emitter.colors = colors;
// }

// export const update = (emitter: ParticleEmitter, dt: number): void => {
//   if (!isClient) return;
//   if (!emitter || !emitter.particleMesh || emitter.textureLoading) return;

//   const geometry = emitter.particleMesh.geometry as ParticleEmitterGeometry;
//   // console.info("Updating...");
//   return;
//   const particlePosition = geometry.attributes.particlePosition.array as Float32Array;
//   const particleColor = geometry.attributes.particleColor.array as Float32Array;
//   const particleAngle = geometry.attributes.particleAngle.array as Float32Array;

//   // emitter.getWorldScale(emitter.worldScale);
//   // emitter.inverseWorldScale.set(
//   //   1 / emitter.worldScale.x,
//   //   1 / emitter.worldScale.y,
//   //   1 / emitter.worldScale.z
//   // );
  
//   const material = emitter.particleMesh.material as ShaderMaterial;
//   const emitterMatrix: Matrix4 = material.uniforms.emitterMatrix.value;
//   // emitterMatrix.copy(emitter.matrixWorld);
//   // emitterMatrix.scale(emitter.inverseWorldScale);

//   for (let i = 0; i < emitter.particleCount; i++) {
//     const prevAge = emitter.ages[i];
//     const curAge = (emitter.ages[i] += dt);

//     // Particle is dead
//     if (curAge < 0) {
//       continue;
//     }

//     // // Particle became alive
//     if (curAge > 0 && prevAge <= 0) {
//       particleColor[i * 4 + 3] = emitter.startOpacity;
//       particlePosition[i * 4] = emitter.initialPositions[i * 3]; // * emitter.worldScale.x;
//       particlePosition[i * 4 + 1] = emitter.initialPositions[i * 3 + 1]; // * emitter.worldScale.y;
//       particlePosition[i * 4 + 2] = 0;
//       particlePosition[i * 4 + 3] = emitter.startSize + emitter.particleSizeRandomness[i];
//       particleColor[i * 4] = emitter.startColor.r;
//       particleColor[i * 4 + 1] = emitter.startColor.g;
//       particleColor[i * 4 + 2] = emitter.startColor.b;
//       continue;
//     }

//     // Particle died
//     if (curAge > emitter.lifetimes[i]) {
//       emitter.ages[i] = emitter.initialAges[i];
//       particleColor[i * 4 + 3] = 0; // Set opacity to zero
//       continue;
//     }

//     const normalizedAge = clamp(0, 1, emitter.ages[i] / emitter.lifetimes[i]);

//     const _EasingFunctions = EasingFunctions as { [name: string]: (k: number) => number };

//     if (!_EasingFunctions[emitter.velocityCurve]) {
//       console.warn(`Unknown velocity curve type ${emitter.velocityCurve} in particle emitter. Falling back to linear.`)
//       emitter.velocityCurve = "linear";
//     }
//     if (!_EasingFunctions[emitter.sizeCurve]) {
//       console.warn(`Unknown size curve type ${emitter.sizeCurve} in particle emitter. Falling back to linear.`)
//       emitter.sizeCurve = "linear";
//     }
//     if (!_EasingFunctions[emitter.colorCurve]) {
//       console.warn(`Unknown color curve type ${emitter.colorCurve} in particle emitter. Falling back to linear.`)
//       emitter.colorCurve = "linear";
//     }
//     const velFactor = _EasingFunctions[emitter.velocityCurve](normalizedAge);
//     const sizeFactor = _EasingFunctions[emitter.sizeCurve](normalizedAge);
//     const colorFactor = _EasingFunctions[emitter.colorCurve](normalizedAge);

//     particlePosition[i * 4] += lerp(emitter.startVelocity.x, emitter.endVelocity.x, velFactor) * dt;
//     particlePosition[i * 4 + 1] += lerp(emitter.startVelocity.y, emitter.endVelocity.y, velFactor) * dt;
//     particlePosition[i * 4 + 2] += lerp(emitter.startVelocity.z, emitter.endVelocity.z, velFactor) * dt;
//     particlePosition[i * 4 + 3] = lerp(
//       emitter.startSize + emitter.particleSizeRandomness[i],
//       emitter.endSize + emitter.particleSizeRandomness[i],
//       sizeFactor
//     );
//     particleAngle[i] += emitter.angularVelocity * DEG2RAD * dt;

//     if (colorFactor <= 0.5) {
//       const colorFactor1 = colorFactor / 0.5;
//       particleColor[i * 4] = lerp(emitter.startColor.r, emitter.middleColor.r, colorFactor1);
//       particleColor[i * 4 + 1] = lerp(emitter.startColor.g, emitter.middleColor.g, colorFactor1);
//       particleColor[i * 4 + 2] = lerp(emitter.startColor.b, emitter.middleColor.b, colorFactor1);
//       particleColor[i * 4 + 3] = lerp(emitter.startOpacity, emitter.middleOpacity, colorFactor1);
//     } else if (colorFactor > 0.5) {
//       const colorFactor2 = (colorFactor - 0.5) / 0.5;
//       particleColor[i * 4] = lerp(emitter.middleColor.r, emitter.endColor.r, colorFactor2);
//       particleColor[i * 4 + 1] = lerp(emitter.middleColor.g, emitter.endColor.g, colorFactor2);
//       particleColor[i * 4 + 2] = lerp(emitter.middleColor.b, emitter.endColor.b, colorFactor2);
//       particleColor[i * 4 + 3] = lerp(emitter.middleOpacity, emitter.endOpacity, colorFactor2);
//     }
//   }

//   geometry.attributes.particlePosition.needsUpdate = true;
//   geometry.attributes.particleColor.needsUpdate = true;
//   geometry.attributes.particleAngle.needsUpdate = true;

//   emitter.particleMesh.geometry = geometry;
// }