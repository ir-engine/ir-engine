import { Visible } from 'ecsy-three/src/extras/components'

export default function loadVisibleComponent (scene: any, entity: any, component: any): void {
  entity.addComponent(Visible, { value: component.data.visible })
}
