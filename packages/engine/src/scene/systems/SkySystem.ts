import { Color, CubeTextureLoader, sRGBEncoding, TextureLoader, PMREMGenerator } from 'three'
import { Engine } from '../../ecs/classes/Engine'
import { System } from '../../ecs/classes/System'
import { World } from '../../ecs/classes/World'
import {
  addComponent,
  defineQuery,
  getComponent,
  hasComponent,
  removeComponent
} from '../../ecs/functions/ComponentFunctions'
import { Sky } from '../classes/Sky'
import { Object3DComponent } from '../components/Object3DComponent'
import { SkyboxComponent } from '../components/SkyboxComponent'
import { SkyTypeEnum } from '../constants/SkyTypeEnum'
import { setSkyDirection } from '../functions/setSkyDirection'

/**
 * @author Nayankumar Patel <github.com/NPatel10>
 */
export default async function SkySystem(_: World): Promise<System> {
  const skyboxQuery = defineQuery([SkyboxComponent])

  const negx = 'negx.jpg'
  const negy = 'negy.jpg'
  const negz = 'negz.jpg'
  const posx = 'posx.jpg'
  const posy = 'posy.jpg'
  const posz = 'posz.jpg'

  const cubeTextureLoader = new CubeTextureLoader()
  const textureLoader = new TextureLoader()
  let pmremGenerator: PMREMGenerator
  let sky: Sky

  return () => {
    for (const entity of skyboxQuery()) {
      const component = getComponent(entity, SkyboxComponent)

      if (!component.dirty) continue
      const hasSkyObject = hasComponent(entity, Object3DComponent)

      switch (component.backgroundType) {
        case SkyTypeEnum.color:
          Engine.scene.background = component.backgroundColor
          break

        case SkyTypeEnum.cubemap:
          cubeTextureLoader.setPath(component.cubemapPath).load(
            [posx, negx, posy, negy, posz, negz],
            (texture) => {
              texture.encoding = sRGBEncoding
              Engine.scene.background = texture
            },
            (_res) => {
              /* console.log(_res) */
            },
            (erro) => console.warn('Skybox texture could not be found!', erro)
          )
          break

        case SkyTypeEnum.equirectangular:
          textureLoader.load(component.equirectangularPath, (texture) => {
            texture.encoding = sRGBEncoding
            if (!pmremGenerator) pmremGenerator = new PMREMGenerator(Engine.renderer)
            Engine.scene.background = pmremGenerator.fromEquirectangular(texture).texture
          })
          break

        case SkyTypeEnum.skybox:
          sky = hasSkyObject
            ? (getComponent(entity, Object3DComponent).value as Sky)
            : (addComponent(entity, Object3DComponent, { value: new Sky() }).value as Sky)

          sky.azimuth = component.skyboxProps.azimuth
          sky.inclination = component.skyboxProps.inclination

          const uniforms = Sky.material.uniforms
          uniforms.mieCoefficient.value = component.skyboxProps.mieCoefficient
          uniforms.mieDirectionalG.value = component.skyboxProps.mieDirectionalG
          uniforms.rayleigh.value = component.skyboxProps.rayleigh
          uniforms.turbidity.value = component.skyboxProps.turbidity
          uniforms.luminance.value = component.skyboxProps.luminance
          setSkyDirection(uniforms.sunPosition.value)
          Engine.scene.background = sky.generateSkybox(Engine.renderer)
          break

        default:
          break
      }

      if (hasSkyObject && component.backgroundType !== SkyTypeEnum.skybox) {
        removeComponent(entity, Object3DComponent)
      }

      component.dirty = false
    }

    for (const _ of skyboxQuery.exit()) {
      Engine.scene.background = new Color('black')
    }
  }
}
