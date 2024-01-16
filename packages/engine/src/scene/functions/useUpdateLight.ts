import { DirectionalLight, SpotLight, Vector3 } from 'three'
import { useExecute } from '../../ecs/functions/SystemFunctions'
import { TransformSystem } from '../../transform/TransformModule'

export const useUpdateLight = (light: DirectionalLight | SpotLight) => {
  useExecute(
    () => {
      light.getWorldDirection(_vec3)
      light.getWorldPosition(light.target.position).add(_vec3)
      light.target.updateMatrixWorld()
    },
    { after: TransformSystem }
  )
}

const _vec3 = new Vector3()
