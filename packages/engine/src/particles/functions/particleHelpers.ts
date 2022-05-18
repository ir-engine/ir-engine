import { ParticleEmitterComponent } from '../components/ParticleEmitter'
import { addComponent, getComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { isClient } from '../../common/functions/isClient'
import { ParticleEmitterMesh } from './ParticleEmitterMesh'
import { Engine } from '../../ecs/classes/Engine'

export const DEG2RAD = 0.0174533

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
`

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
`

export const createParticleEmitterObject = (entity, configs): void => {
  if (!isClient) return
  ParticleEmitterMesh.fromArgs(configs).then((mesh) => {
    addComponent(entity, ParticleEmitterComponent, { particleEmitterMesh: mesh })
    Engine.scene.add(mesh)
  })
}

export const applyTransform = (entity, emitter): void => {
  if (!isClient) return
  const mesh = emitter.particleEmitterMesh
  if (mesh) {
    const transform = getComponent(entity, TransformComponent)
    mesh.position.set(transform.position.x, transform.position.y, transform.position.z)
    mesh.quaternion.set(transform.rotation.x, transform.rotation.y, transform.rotation.z, transform.rotation.w)
    mesh.scale.set(transform.scale.x, transform.scale.y, transform.scale.z)
    mesh.updateMatrix()
  }
}
