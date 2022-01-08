import { Color, CubeTextureLoader, PMREMGenerator, TextureLoader, sRGBEncoding } from 'three'

import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { addComponent } from '../../ecs/functions/ComponentFunctions'
import { SceneBackgroundProps, SkyTypeEnum } from '../../scene/constants/SkyBoxShaderProps'
import { Sky } from '../classes/Sky'
import { Object3DComponent } from '../components/Object3DComponent'
import { setSkyDirection } from '../functions/setSkyDirection'

export const createSkybox = (entity, args: SceneBackgroundProps) => {
  if (isClient) {
    const pmremGenerator = new PMREMGenerator(Engine.renderer)
    switch (args.backgroundType) {
      case SkyTypeEnum.skybox:
        const option = args.skyboxProps
        const sky = new Sky()
        addComponent(entity, Object3DComponent, { value: sky })

        sky.azimuth = option.azimuth
        sky.inclination = option.inclination

        const uniforms = Sky.material.uniforms
        uniforms.mieCoefficient.value = option.mieCoefficient
        uniforms.mieDirectionalG.value = option.mieDirectionalG
        uniforms.rayleigh.value = option.rayleigh
        uniforms.turbidity.value = option.turbidity
        uniforms.luminance.value = option.luminance
        setSkyDirection(uniforms.sunPosition.value)
        Engine.scene.background = sky.generateSkybox(Engine.renderer)
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
