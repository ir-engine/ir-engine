import { Position, Rotation, Scale } from 'ecsy-three/src/extras/components'

export default function loadTransformComponent (scene: any, entity: any, component: any): void {
  entity.addComponent(Position, { value: component.data.position })
  entity.addComponent(Rotation, { rotation: component.data.rotation })
  entity.addComponent(Scale, { value: component.data.scale })
}
