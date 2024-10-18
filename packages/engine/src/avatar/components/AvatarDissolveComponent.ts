/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'
import {
  Material,
  Mesh,
  MeshBasicMaterial,
  ShaderLib,
  ShaderMaterial,
  SkinnedMesh,
  UniformsLib,
  UniformsUtils
} from 'three'

import {
  defineComponent,
  getComponent,
  getMutableComponent,
  hasComponent,
  removeComponent
} from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { useEntityContext } from '@ir-engine/ecs/src/EntityFunctions'
import { S } from '@ir-engine/ecs/src/schemas/JSONSchemas'
import { MeshComponent } from '@ir-engine/spatial/src/renderer/components/MeshComponent'
import { SkinnedMeshComponent } from '@ir-engine/spatial/src/renderer/components/SkinnedMeshComponent'
import { iterateEntityNode } from '@ir-engine/spatial/src/transform/components/EntityTree'

export type MaterialMap = {
  entity: Entity
  material: Material
}

export const AvatarDissolveComponent = defineComponent({
  name: 'AvatarDissolveComponent',

  schema: S.Object({
    height: S.Number(1),
    currentTime: S.Number(0),
    dissolveMaterials: S.Array(S.Type<ShaderMaterial>()),
    originMaterials: S.Array(
      S.Object({
        entity: S.Entity(),
        material: S.Type<Material>()
      })
    )
  }),

  reactor: () => {
    const entity = useEntityContext()

    useEffect(() => {
      const materialList: Array<MaterialMap> = []
      const dissolveMatList: Array<ShaderMaterial> = []

      iterateEntityNode(entity, (entity: Entity) => {
        if (!hasComponent(entity, SkinnedMeshComponent)) return

        const mesh = getComponent(entity, SkinnedMeshComponent) as SkinnedMesh<any, any>
        if (mesh.material) {
          const material = mesh.material
          materialList.push({
            entity,
            material: material
          })
          mesh.material = AvatarDissolveComponent.createDissolveMaterial(mesh as any)
          dissolveMatList.push(mesh.material)
        }
      })

      getMutableComponent(entity, AvatarDissolveComponent).merge({
        dissolveMaterials: dissolveMatList,
        originMaterials: materialList
      })

      return () => {
        for (const originalMaterial of materialList) {
          const avatarObject = getComponent(originalMaterial.entity, MeshComponent)
          if (avatarObject) {
            avatarObject.material = originalMaterial.material
          }
        }
      }
    }, [])

    return null
  },

  createDissolveMaterial(object: Mesh<any, MeshBasicMaterial & ShaderMaterial>): any {
    const isShaderMaterial = object.material.type == 'ShaderMaterial'
    const material = object.material
    const hasTexture = !!material.map

    const shaderNameMapping = {
      MeshLambertMaterial: 'lambert',
      MeshBasicMaterial: 'basic',
      MeshStandardMaterial: 'standard',
      MeshPhongMaterial: 'phong',
      MeshMatcapMaterial: 'matcap',
      MeshToonMaterial: 'toon',
      PointsMaterial: 'points',
      LineDashedMaterial: 'dashed',
      MeshDepthMaterial: 'depth',
      MeshNormalMaterial: 'normal',
      MeshDistanceMaterial: 'distanceRGBA',
      SpriteMaterial: 'sprite'
    }

    let uniforms = {
      color: {
        value: (material as any).color
      },
      diffuse: {
        value: (material as any).color
      },
      time: {
        value: -200
      }
    }

    let fragmentShader = ''
    let vertexShader = ''

    if (isShaderMaterial) {
      uniforms = UniformsUtils.merge([material.uniforms, uniforms])
      fragmentShader = material.fragmentShader
      vertexShader = material.vertexShader
    } else {
      // built-in material
      const shader = ShaderLib[shaderNameMapping[material.type] ?? 'standard']
      fragmentShader = shader.fragmentShader
      vertexShader = shader.vertexShader
      Object.keys(shader.uniforms).forEach((key) => {
        if (material[key]) {
          uniforms[key] = { value: material[key] }
        }
      })
    }

    uniforms = UniformsUtils.merge([UniformsLib['lights'], uniforms])

    const vertexUVShader = `
      #include <fog_vertex>
      vUv3 = uv;
      vPosition = position.y;
    `

    let textureShader = `gl_FragColor = textureColor;`
    if (hasTexture && (material as any).map.isVideoTexture) {
      textureShader = `gl_FragColor = sRGBToLinear(textureColor);`
    }

    const fragmentTextureShader = `
      #include <opaque_fragment>
      float offset = vPosition - time;
      vec4 textureColor = texture2D(map, vUv3);
      ${textureShader}
      if(offset > (-0.01 - rand(time) * 0.3)){
      gl_FragColor.r = 0.0;
      gl_FragColor.g = 1.0;
      gl_FragColor.b = 0.0;
      }
      if(offset > 0.0){
      discard;
      }
    `

    const vertexHeaderShader = `
      #include <clipping_planes_pars_vertex>
      varying vec2 vUv3;
      varying float vPosition;
    `

    const fragmentHeaderShader = `
      #include <clipping_planes_pars_fragment>
      varying vec2 vUv3;
      varying float vPosition;
      uniform float time;
      uniform sampler2D map;
      float rand(float co) { return fract(sin(co*(91.3458)) * 47453.5453); }
      vec4 sRGBToLinear( in vec4 value ) {
        return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
      }
    `

    vertexShader = vertexShader.replace('#include <clipping_planes_pars_vertex>', vertexHeaderShader)
    vertexShader = vertexShader.replace('#include <fog_vertex>', vertexUVShader)
    fragmentShader = fragmentShader.replace('#include <clipping_planes_pars_fragment>', fragmentHeaderShader)
    fragmentShader = fragmentShader.replace('#include <opaque_fragment>', fragmentTextureShader)

    if (isShaderMaterial) {
      material.vertexShader = vertexShader
      material.fragmentShader = fragmentShader
      material.uniforms = uniforms
      material.needsUpdate = true
      return material
    } else {
      const myMaterial = new ShaderMaterial({
        uniforms,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        lights: true,
        // @ts-ignore
        fog: false,
        transparent: material.transparent
      })

      if (myMaterial.uniforms.map) {
        myMaterial.uniforms.map.value = (material as any).map
      }

      myMaterial.needsUpdate = true
      myMaterial.visible = material.visible
      return myMaterial
    }
  },

  updateDissolveEffect(dissolveMaterials: ShaderMaterial[], entity: Entity, dt: number) {
    const dissolveComponent = getComponent(entity, AvatarDissolveComponent)
    if (!dissolveComponent) return false
    dissolveComponent.currentTime += dt
    for (let i = 0; i < dissolveMaterials.length; i++) {
      const material = dissolveMaterials[i]
      if (material === undefined) continue
      material.uniforms.time.value = dissolveComponent.currentTime
    }

    if (dissolveComponent.currentTime >= dissolveComponent.height) removeComponent(entity, AvatarDissolveComponent)
  }
})
