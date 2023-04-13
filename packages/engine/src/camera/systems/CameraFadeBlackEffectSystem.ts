import { useEffect } from 'react'
import { Color, Mesh, PlaneGeometry, ShaderMaterial } from 'three'

import { createActionQueue, defineState, getMutableState, getState, removeActionQueue } from '@etherealengine/hyperflux'

import { Engine } from '../../ecs/classes/Engine'
import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { addObjectToGroup } from '../../scene/components/GroupComponent'
import { ObjectLayers } from '../../scene/constants/ObjectLayers'
import { createTransitionState } from '../../xrui/functions/createTransitionState'
import { CameraActions } from '../CameraState'

const VERTEX_SHADER = 'void main() { vec3 newPosition = position * 2.0; gl_Position = vec4(newPosition, 1.0); }'

const FRAGMENT_SHADER =
  'uniform vec3 color; uniform float intensity; void main() { gl_FragColor = vec4(color, intensity); }'

const fadeActionQueue = createActionQueue(CameraActions.fadeToBlack.matches)

const CameraFadeBlackEffectSystemState = defineState({
  name: 'CameraFadeBlackEffectSystemState',
  initial: () => {
    return {
      transition: null! as ReturnType<typeof createTransitionState>,
      mesh: null! as Mesh<PlaneGeometry, ShaderMaterial>
    }
  }
})

const execute = () => {
  const { transition, mesh } = getState(CameraFadeBlackEffectSystemState)
  for (const action of fadeActionQueue()) {
    transition.setState(action.in ? 'IN' : 'OUT')
  }
  transition.update(Engine.instance.deltaSeconds, (alpha) => {
    mesh.material.uniforms.intensity.value = alpha
    mesh.visible = alpha > 0
  })
}

const reactor = () => {
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
  addObjectToGroup(Engine.instance.cameraEntity, mesh)
  mesh.visible = false
  mesh.layers.set(ObjectLayers.Camera)
  const transition = createTransitionState(0.25, 'OUT')

  getMutableState(CameraFadeBlackEffectSystemState).set({
    transition,
    mesh
  })

  useEffect(() => {
    return () => {
      removeActionQueue(fadeActionQueue)
    }
  }, [])
  return null
}

export const CameraFadeBlackEffectSystem = defineSystem({
  uuid: 'ee.engine.CameraFadeBlackEffectSystem',
  execute,
  reactor
})
