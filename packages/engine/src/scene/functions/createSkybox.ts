import { Color, CubeTextureLoader, PMREMGenerator, sRGBEncoding, TextureLoader, Vector3 } from 'three'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { addComponent, getComponent } from '../../ecs/functions/EntityFunctions'
import { SceneBackgroundProps, SkyTypeEnum } from '@xrengine/engine/src/scene/constants/SkyBoxShaderProps'
import { Sky } from '../classes/Sky'
import { Object3DComponent } from '../components/Object3DComponent'
import { setSkyDirection } from '../functions/setSkyDirection'

export const createSkybox = (entity, args: SceneBackgroundProps) => {
  if (isClient) {
    const pmremGenerator = new PMREMGenerator(Engine.renderer)
    switch (args.backgroundType) {
      case SkyTypeEnum.skybox:
        const option = args.skyboxProps
        addComponent(entity, Object3DComponent, { value: new Sky() })

        const component = getComponent(entity, Object3DComponent)
        const skyboxObject3D = component.value
        const uniforms = Sky.material.uniforms
        const sun = new Vector3()
        const theta = Math.PI * (option.inclination - 0.5)
        const phi = 2 * Math.PI * (option.azimuth - 0.5)

        sun.x = Math.cos(phi)
        sun.y = Math.sin(phi) * Math.sin(theta)
        sun.z = Math.sin(phi) * Math.cos(theta)
        uniforms.mieCoefficient.value = option.mieCoefficient
        uniforms.mieDirectionalG.value = option.mieDirectionalG
        uniforms.rayleigh.value = option.rayleigh
        uniforms.turbidity.value = option.turbidity
        uniforms.luminance.value = option.luminance
        uniforms.sunPosition.value = sun
        setSkyDirection(sun)
        ;(skyboxObject3D as any).generateSkybox(Engine.renderer)
        break

      case SkyTypeEnum.cubemap:
        const negx = 'negx.jpg'
        const negy = 'negy.jpg'
        const negz = 'negz.jpg'
        const posx = 'posx.jpg'
        const posy = 'posy.jpg'
        const posz = 'posz.jpg'

        new CubeTextureLoader().setPath(args.cubemapPath).load(
          [posx, negx, posy, negy, posz, negz],
          (texture) => {
            texture.encoding = sRGBEncoding
            Engine.scene.background = texture
          },
          (res) => {
            console.log(res)
          },
          (erro) => {
            console.warn('Skybox texture could not be found!', erro)
          }
        )
        break

      case SkyTypeEnum.equirectangular:
        new TextureLoader().load(args.equirectangularPath, (texture) => {
          texture.encoding = sRGBEncoding
          Engine.scene.background = pmremGenerator.fromEquirectangular(texture).texture
        })
        break

      case SkyTypeEnum.color:
        Engine.scene.background = new Color(args.backgroundColor)
        break
    }
  }
}
