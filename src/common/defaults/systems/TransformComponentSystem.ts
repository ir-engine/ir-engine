import { System, Entity } from "ecsy"
import { Object3DComponent } from 'ecsy-three'
import { Transform } from 'ecsy-three/src/extras/components'
import { TransformComponent } from '../components/TransformComponent'
import Input from '../../../input/components/Input'

export default class TransformComponentSystem extends System {
  public execute(delta: number, time: number): void {

    this.queries.transforms.added?.forEach(entity => {
      console.log('TransformComponentSystem query added')
      const armadaTransform: TransformComponent = entity.getComponent(TransformComponent)
      const transform: Transform = entity.getMutableComponent(Transform)
      const input: Input = entity.getMutableComponent(Input)

      let pos = (armadaTransform as any).position
      let rot = (armadaTransform as any).rotation
      transform.position.set(pos[0], pos[1], pos[2])
      transform.rotation.set(rot[0], rot[1], rot[2])
    })

    this.queries.transforms.changed?.forEach(entity => {
      const armadaTransform: TransformComponent = entity.getComponent(TransformComponent)
      const transform: Transform = entity.getMutableComponent(Transform)

      let pos = (armadaTransform as any).position
      let rot = (armadaTransform as any).rotation
      transform.position.set(pos[0], pos[1], pos[2])
      transform.rotation.set(rot[0], rot[1], rot[2])
    })
  }
}

TransformComponentSystem.queries = {
  transforms: {
    components: [Transform, TransformComponent],
    listen: {
      added: true,
      changed: true,
      removed: true
    }
  }
}
