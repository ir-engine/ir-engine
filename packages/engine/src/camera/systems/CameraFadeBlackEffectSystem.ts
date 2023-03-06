import { Color, Mesh, PlaneGeometry, ShaderMaterial } from 'three'

import { createActionQueue, removeActionQueue } from '@etherealengine/hyperflux'

import { World } from '../../ecs/classes/World'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { CameraActions } from '../CameraState'

const VERTEX_SHADER = 'void main() { vec3 newPosition = position * 2.0; gl_Position = vec4(newPosition, 1.0); }'

const FRAGMENT_SHADER =
  'uniform vec3 color; uniform float intensity; void main() { gl_FragColor = vec4(color, intensity); }'

export default async function CameraFadeBlackEffectSystem(world: World) {
  const geometry = new PlaneGeometry(1, 1)
  const material = new ShaderMaterial({
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthTest: false,
    uniforms: {
      color: { value: new Color('black') },
      intensity: { value: 0 }
    }
  })
  const mesh = new Mesh(geometry, material)
  mesh.name = 'Camera Fade Transition'
  addObjectToGroup(world.cameraEntity, mesh)
  mesh.visible = false
  mesh.layers.set(ObjectLayers.Camera)
  const transition = createTransitionState(0.25, 'OUT')

  const fadeActionQueue = createActionQueue(CameraActions.fadeToBlack.matches)

  const execute = () => {
    for (const action of fadeActionQueue()) {
      transition.setState(action.in ? 'IN' : 'OUT')
    }
    transition.update(world.deltaSeconds, (alpha) => {
      material.uniforms.intensity.value = alpha
      mesh.visible = alpha > 0
    })
  }

  const cleanup = async () => {
    removeActionQueue(fadeActionQueue)
  }

  return { execute, cleanup }
}
