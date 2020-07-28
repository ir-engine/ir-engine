import CollidableTagComponent from '../components/Collidable'

export default function loadCollidableComponent (scene: any, entity: any, component: any): void {
  entity.addComponent(CollidableTagComponent, scene)
}
