import {
  Engine,
  defineComponent,
  getComponent,
  getOptionalComponent,
  useComponent,
  useEntityContext
} from '@etherealengine/ecs'
import { TransformComponent } from '@etherealengine/spatial'
import { MeshComponent } from '@etherealengine/spatial/src/renderer/components/MeshComponent'
import { iterateEntityNode } from '@etherealengine/spatial/src/transform/components/EntityTree'
import { isArray } from 'lodash'
import { useEffect } from 'react'
import { Material } from 'three'
import matches from 'ts-matches'
import { ModelComponent } from '../../scene/components/ModelComponent'
import { ditheringAlphatestChunk, ditheringUniform, ditheringVertex } from '../functions/ditherShaderChunk'

export const TransparencyDitheringComponent = defineComponent({
  name: 'TransparencyDitheringComponent',
  onInit: (entity) => {
    return {
      ditheringDistance: 0.5,
      ditheringExponent: 2
    }
  },

  onSet: (entity, component, json) => {
    if (!json) return
    if (matches.number.test(json.ditheringDistance)) component.ditheringDistance.set(json.ditheringDistance)
    if (matches.number.test(json.ditheringExponent)) component.ditheringExponent.set(json.ditheringExponent)
  },

  reactor: () => {
    const entity = useEntityContext()
    const modelComponent = useComponent(entity, ModelComponent)
    /** Injects dithering logic into avatar materials */
    useEffect(() => {
      const ditheringComponent = getComponent(entity, TransparencyDitheringComponent)
      const { ditheringExponent, ditheringDistance } = ditheringComponent
      iterateEntityNode(entity, (node) => {
        const mesh = getOptionalComponent(node, MeshComponent)
        if (!mesh) return
        const material = mesh.material
        if (isArray(material)) material.forEach((m) => injectDitheringLogic(m, ditheringDistance, ditheringExponent))
        else injectDitheringLogic(material, ditheringDistance, ditheringExponent)
      })
    }, [modelComponent.scene])
    return null
  }
})

const injectDitheringLogic = (material: Material, ditheringDistance: number, ditheringExponent: number) => {
  material.alphaTest = 0.5
  material.onBeforeCompile = (shader, renderer) => {
    if (!shader.vertexShader.startsWith('varying vec3 vWorldPosition')) {
      shader.vertexShader = shader.vertexShader.replace(/#include <common>/, '#include <common>\n' + ditheringUniform)
      shader.vertexShader = shader.vertexShader.replace(
        /#include <worldpos_vertex>/,
        '	#include <worldpos_vertex>\n' + ditheringVertex
      )
    }

    if (!shader.fragmentShader.startsWith('varying vec3 vWorldPosition'))
      shader.fragmentShader = shader.fragmentShader.replace(
        /#include <common>/,
        '#include <common>\n' + ditheringUniform
      )

    shader.fragmentShader = shader.fragmentShader.replace(/#include <alphatest_fragment>/, ditheringAlphatestChunk)
    shader.uniforms.cameraPosition = {
      value: getComponent(Engine.instance.cameraEntity, TransformComponent).position
    }
    console.log(shader.vertexShader)
    console.log(shader.fragmentShader)
  }
}
