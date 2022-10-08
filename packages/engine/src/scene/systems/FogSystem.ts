import { Fog, FogExp2, Mesh, MeshStandardMaterial } from 'three'

import { OBCType } from '../../common/constants/OBCTypes'
import { addOBCPlugin, PluginType, removeOBCPlugin } from '../../common/functions/OnBeforeCompilePlugin'
import { World } from '../../ecs/classes/World'
import { FogType } from '../constants/FogType'
import { initBrownianMotionFogShader, initHeightFogShader, removeFogShader } from '../functions/FogShaders'

const getFogPlugin = (world: World): PluginType => {
  return {
    id: OBCType.FOG,
    priority: 0,
    compile: (shader) => {
      world.fogShaders.push(shader)
      shader.uniforms.fogTime = { value: 0.0 }
      shader.uniforms.fogTimeScale = { value: 1 }
      shader.uniforms.heightFactor = { value: world.sceneMetadata.fog.height.value }
    }
  }
}

export default async function FogSystem(world: World) {
  const updateFogType = () => {
    const scene = world.scene
    const fogData = world.sceneMetadata.fog.get({ noproxy: true })
    switch (fogData.type) {
      case FogType.Linear:
        scene.fog = new Fog(fogData.color, fogData.near, fogData.far)
        removeFogShader()
        break

      case FogType.Exponential:
        scene.fog = new FogExp2(fogData.color, fogData.density)
        removeFogShader()
        break

      case FogType.Brownian:
        scene.fog = new FogExp2(fogData.color, fogData.density)
        initBrownianMotionFogShader()
        break

      case FogType.Height:
        scene.fog = new FogExp2(fogData.color, fogData.density)
        initHeightFogShader()
        break

      default:
        scene.fog = null
        removeFogShader()
        break
    }
  }

  const updateFogColor = () => {
    const scene = world.scene
    const fogData = world.sceneMetadata.fog.get({ noproxy: true })
    if (scene.fog) scene.fog.color.set(fogData.color)
  }

  const updateFogDensity = () => {
    const scene = world.scene
    const fogData = world.sceneMetadata.fog.get({ noproxy: true })
    if (scene.fog && fogData.type !== FogType.Linear) (scene.fog as FogExp2).density = fogData.density
  }
  const updateFogNear = () => {
    const scene = world.scene
    const fogData = world.sceneMetadata.fog.get({ noproxy: true })
    if (scene.fog && fogData.type === FogType.Linear) (scene.fog as Fog).near = fogData.near
  }

  const updateFogFar = () => {
    const scene = world.scene
    const fogData = world.sceneMetadata.fog.get({ noproxy: true })
    if (scene.fog && fogData.type === FogType.Linear) (scene.fog as Fog).far = fogData.far
  }

  const updateFogTimeScale = () => {
    const scene = world.scene
    const fogData = world.sceneMetadata.fog.get({ noproxy: true })
    if (scene.fog && (fogData.type === FogType.Brownian || fogData.type === FogType.Height))
      for (const s of world.fogShaders) s.uniforms.heightFactor.value = fogData.height
  }

  const updateFogHeight = () => {
    const scene = world.scene
    const fogData = world.sceneMetadata.fog.get({ noproxy: true })
    if (scene.fog && fogData.type === FogType.Brownian)
      for (const s of world.fogShaders) {
        s.uniforms.fogTimeScale.value = fogData.timeScale
        s.uniforms.fogTime.value = world.fixedElapsedSeconds
      }
  }

  world.sceneMetadata.fog.type.subscribe(updateFogType)
  world.sceneMetadata.fog.color.subscribe(updateFogColor)
  world.sceneMetadata.fog.density.subscribe(updateFogDensity)
  world.sceneMetadata.fog.near.subscribe(updateFogNear)
  world.sceneMetadata.fog.far.subscribe(updateFogFar)
  world.sceneMetadata.fog.timeScale.subscribe(updateFogTimeScale)
  world.sceneMetadata.fog.height.subscribe(updateFogHeight)

  updateFogType()
  updateFogColor()
  updateFogDensity()
  updateFogNear()
  updateFogFar()
  updateFogTimeScale()
  updateFogHeight()

  const type = world.sceneMetadata.fog.type

  const execute = () => {
    const customShader = type.value === FogType.Brownian || type.value === FogType.Height

    if (customShader) {
      world.scene.traverse((obj: Mesh<any, MeshStandardMaterial>) => {
        if (!obj.material || !obj.material.fog || obj.material.userData.fogPlugin) return
        obj.material.userData.fogPlugin = getFogPlugin(world)
        addOBCPlugin(obj.material, obj.material.userData.fogPlugin)
        obj.material.needsUpdate = true
      })
    } else {
      /** remove fog shader */
      world.scene.traverse((obj: Mesh<any, MeshStandardMaterial>) => {
        if (!obj.material?.userData?.fogPlugin) return

        removeOBCPlugin(obj.material, obj.material.userData.fogPlugin)
        delete obj.material.userData.fogPlugin

        // material.needsUpdate is not working. Therefore have to invalidate the cache manually
        const key = Math.random()
        obj.material.customProgramCacheKey = () => key.toString()
      })
      world.fogShaders = []
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
