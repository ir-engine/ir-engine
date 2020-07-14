import Walkable from '../components/Walkable'

export default function loadWalkableComponent (scene: any, entity: any, component: any): void {
  entity.addComponent(Walkable)
}
