import {
  PresentationSystemGroup,
  defineQuery,
  defineSystem,
  getComponent,
  getOptionalComponent
} from '@etherealengine/ecs'
import { materialFromId } from '../../scene/materials/functions/MaterialLibraryFunctions'
import { TransparencyDitheringComponent, maxDitherPoints } from '../components/TransparencyDitheringComponent'

const TransparencyDitheringQuery = defineQuery([TransparencyDitheringComponent[0]])
const execute = () => {
  for (const entity of TransparencyDitheringQuery()) {
    const ditherComponent = getComponent(entity, TransparencyDitheringComponent[0])
    for (const id of ditherComponent.materialIds) {
      const material = materialFromId(id).material
      for (let i = 0; i < maxDitherPoints; i++) {
        const ditherComponent = getOptionalComponent(entity, TransparencyDitheringComponent[i])
        if (!ditherComponent) break
        if (!material.shader) return
        if (material.shader.uniforms.centers) material.shader.uniforms.centers.value[i] = ditherComponent.center
        if (material.shader.uniforms.exponents) material.shader.uniforms.exponents.value[i] = ditherComponent.exponent
        if (material.shader.uniforms.distances) material.shader.uniforms.distances.value[i] = ditherComponent.distance
        if (material.shader.uniforms.useWorldCalculation)
          material.shader.uniforms.useWorldCalculation.value[i] = ditherComponent.calculationType
      }
    }
  }
}

export const TransparencyDitheringSystem = defineSystem({
  uuid: 'TransparencyDitheringSystem',
  insert: { with: PresentationSystemGroup },
  execute
})
