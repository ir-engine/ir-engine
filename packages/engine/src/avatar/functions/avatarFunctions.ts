import { AnimationMixer, Group } from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { isClient } from '../../common/functions/isClient'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { AnimationManager } from '../AnimationManager'
import { AnimationComponent } from '../components/AnimationComponent'
import { AvatarComponent } from '../components/AvatarComponent'
import { SkeletonUtils } from '../SkeletonUtils'
import { AnimationRenderer } from '../animations/AnimationRenderer'
import { AvatarAnimationComponent } from '../components/AvatarAnimationComponent'
import { Entity } from '../../ecs/classes/Entity'
import {
  Mesh,
  PlaneGeometry,
  MeshBasicMaterial,
  AdditiveBlending,
  sRGBEncoding,
  ShaderMaterial,
  DoubleSide
} from 'three'
import { addComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { AvatarPendingComponent } from '../components/AvatarPendingComponent'
import { AvatarEffectComponent } from '../components/AvatarEffectComponent'

export const setAvatar = (entity, avatarId, avatarURL) => {
  const avatar = getComponent(entity, AvatarComponent)
  if (avatar) {
    avatar.avatarId = avatarId
    avatar.avatarURL = avatarURL
  }
  loadAvatar(entity)
}

export const loadAvatar = (entity: Entity) => {
  if (!isClient) return
  const avatarURL = getComponent(entity, AvatarComponent)?.avatarURL
  if (avatarURL) {
    loadAvatarFromURL(entity, avatarURL)
  } else {
    loadDefaultAvatar(entity)
  }
}

const loadDefaultAvatar = (entity: Entity) => {
  const avatar = getComponent(entity, AvatarComponent)
  const model = SkeletonUtils.clone(AnimationManager.instance._defaultModel)

  model.traverse((object) => {
    if (object.isMesh || object.isSkinnedMesh) {
      object.material = object.material.clone()
    }
  })
  model.children.forEach((child) => avatar.modelContainer.add(child))

  const animationComponent = getComponent(entity, AnimationComponent)
  animationComponent.mixer = new AnimationMixer(avatar.modelContainer)
}

const loadAvatarFromURL = (entity: Entity, avatarURL: string) => {
  AssetLoader.load(
    {
      url: avatarURL,
      castShadow: true,
      receiveShadow: true
    },
    async (asset: Group) => {
      asset.traverse((o) => {
        // TODO: Remove me when we add retargeting
        if (o.name.includes('mixamorig')) {
          o.name = o.name.replace('mixamorig', '')
        }
      })

      const model = SkeletonUtils.clone(asset)
      const avatar = getComponent(entity, AvatarComponent)
      const animationComponent = getComponent(entity, AnimationComponent)
      const avatarAnimationComponent = getComponent(entity, AvatarAnimationComponent)

      animationComponent.mixer.stopAllAction()
      avatar.modelContainer.children.forEach((child) => child.removeFromParent())

      const textureNoise = await AssetLoader.loadAsync({ url: '/noise.jpg' })

      let materialList = []

      model.traverse((object) => {
        if (typeof object.material !== 'undefined') {
          // object.material = object.material.clone()
          // object.visible = false
          materialList.push({
            id: object.uuid,
            material: object.material.clone()
          })

          const vertexNonUVShader = [
            'varying float posY;',
            'varying vec2 vUv;',
            '#include <skinning_pars_vertex>',
            'void main() {',
            '#include <skinbase_vertex>',
            '#include <begin_vertex>',
            '#include <skinning_vertex>',
            '#include <project_vertex>',
            'vec2 clipSpace = gl_Position.xy / gl_Position.w;',
            'vUv = clipSpace * 0.5 + 0.5;',
            'posY = position.y;',
            '}'
          ].join('\n')

          const vertexUVShader = [
            'varying vec2 vUv;',
            'varying float posY;',
            '#include <skinning_pars_vertex>',
            'void main() {',
            '#include <skinbase_vertex>',
            '#include <begin_vertex>',
            '#include <skinning_vertex>',
            '#include <project_vertex>',
            'vUv = uv;',
            'posY = position.y;',
            '}'
          ].join('\n')

          const fragmentColorShader = [
            'uniform vec3 color;',
            'varying vec2 vUv;',
            'varying float posY;',
            'uniform float time;',
            'uniform sampler2D texture_dissolve;',
            'float rand(float co) { return fract(sin(co*(91.3458)) * 47453.5453); }',
            'void main() {',
            ' vec4 dissolveData = texture2D( texture_dissolve, vUv );',
            ' float greyValue = dissolveData.g;',
            ' float difference = greyValue - time;',
            '	gl_FragColor = vec4(color.r, color.g, color.b, 1.0);',
            '	float offset = posY - time;',
            ' if(offset > (-0.01 - rand(time) * 0.3)){',
            '   gl_FragColor.r = 0.0;',
            '   gl_FragColor.g = 1.0;',
            '   gl_FragColor.b = 0.0;',
            ' }',
            ' if(offset > 0.0){',
            '   discard;',
            ' }',
            '}'
          ].join('\n')

          const fragmentTextureShader = [
            'uniform vec3 color;',
            'varying vec2 vUv;',
            'varying float posY;',
            'uniform float time;',
            'uniform sampler2D texture_dissolve;',
            'uniform sampler2D origin_texture;',
            'float rand(float co) { return fract(sin(co*(91.3458)) * 47453.5453); }',
            'void main() {',
            ' vec4 dissolveData = texture2D( texture_dissolve, vUv );',
            ' float greyValue = dissolveData.g;',
            ' float difference = greyValue - time;',
            '	gl_FragColor = texture2D(origin_texture, vUv);',
            '	float offset = posY - time;',
            ' if(offset > (-0.01 - rand(time) * 0.3)){',
            '   gl_FragColor.r = 0.0;',
            '   gl_FragColor.g = 1.0;',
            '   gl_FragColor.b = 0.0;',
            ' }',
            ' if(offset > 0.0){',
            '   discard;',
            ' }',
            '}'
          ].join('\n')

          const hasUV = object.geometry.hasAttribute('uv')
          const hasTexture = object.material.map !== null

          console.log(hasUV, hasTexture, object.material, object.uuid)
          const mat = new ShaderMaterial({
            uniforms: {
              color: {
                value: object.material.color
              },
              origin_texture: {
                value: object.material.map
              },
              texture_dissolve: {
                value: textureNoise
              },
              time: {
                value: -200
              }
            },
            vertexShader: hasUV ? vertexUVShader : vertexNonUVShader,
            fragmentShader: hasTexture ? fragmentTextureShader : fragmentColorShader
          })

          object.material = mat
        }
      })

      animationComponent.mixer = new AnimationMixer(avatar.modelContainer)
      model.children.forEach((child) => avatar.modelContainer.add(child))

      if (avatarAnimationComponent.currentState) {
        AnimationRenderer.mountCurrentState(entity)
      }

      // advance animation for a frame to eliminate potential t-pose
      animationComponent.mixer.update(1 / 60)

      const textureLight = await AssetLoader.loadAsync({ url: '/itemLight.png' })
      const texturePlate = await AssetLoader.loadAsync({ url: '/itemPlate.png' })
      textureLight.encoding = sRGBEncoding
      textureLight.needsUpdate = true
      texturePlate.encoding = sRGBEncoding
      texturePlate.needsUpdate = true

      const lightMesh = new Mesh(
        new PlaneGeometry(0.04, 3.2),
        new MeshBasicMaterial({
          transparent: true,
          map: textureLight,
          blending: AdditiveBlending,
          depthWrite: false,
          side: DoubleSide
        })
      )

      const plateMesh = new Mesh(
        new PlaneGeometry(1.6, 1.6),
        new MeshBasicMaterial({
          transparent: false,
          map: texturePlate,
          blending: AdditiveBlending,
          depthWrite: false
        })
      )

      lightMesh.geometry.computeBoundingSphere()
      plateMesh.geometry.computeBoundingSphere()
      lightMesh.name = 'growing_obj'
      plateMesh.name = 'growing_obj'
      addComponent(entity, AvatarPendingComponent, {
        light: lightMesh,
        plate: plateMesh
      })
      addComponent(entity, AvatarEffectComponent, {
        opacityMultiplier: 0,
        originMaterials: materialList
      })
    }
  )
}
