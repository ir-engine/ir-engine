import { ShapeType, SHAPES, Body, BodyType, Transform, PhysXInstance } from 'three-physx';
import { Behavior } from '../../common/interfaces/Behavior'
import { addComponent, getComponent } from '../../ecs/functions/EntityFunctions';
import { ColliderComponent } from '../../physics/components/ColliderComponent';
import { CollisionGroups } from '../../physics/enums/CollisionGroups';
import { TransformComponent } from '../../transform/components/TransformComponent';
import { TriggerVolumeComponent } from '../components/TriggerVolumeComponent'

export const createTriggerVolume: Behavior = (entity, args: {
target: any
}) => {
  // console.warn("TODO: create trigger volume, args are", args);
  const triggerVolume = addComponent(entity, TriggerVolumeComponent);

  console.log("args are", args);

  const transform = getComponent(entity, TransformComponent)
  const pos = transform.position ?? { x: 0, y: 0, z: 0 }
  const rot = transform.rotation ?? { x: 0, y: 0, z: 0, w: 1 }
  const scale = transform.scale ?? { x: 1, y: 1, z: 1 }

  const shapeBox: ShapeType = {
    shape: SHAPES.Box,
    options: { boxExtents: { x: scale.x / 2, y: scale.y / 2, z: scale.z / 2 } },
    config: {
      isTrigger: true,
      collisionLayer: CollisionGroups.Trigger,
      collisionMask: CollisionGroups.Avatars
    }
  }

  const body = new Body({
    shapes: [shapeBox],
    type: BodyType.STATIC,
    transform: new Transform({
      translation: { x: pos.x, y: pos.y, z: pos.z },
      rotation: { x: rot.x, y: rot.y, z: rot.z, w: rot.w }
    })
  })

  PhysXInstance.instance.addBody(body)

  body.userData = entity

  addComponent(entity, ColliderComponent, { body })

  // TODO: this is wrong
  // how do we capture the trigger target?
  const t = args.target

  triggerVolume.target = t


  // 3. Set it to reference
  // 4. Create trigger
  // 5. Add trigger callbacks


const handleTriggerEnter = () => {
  console.log("handleTriggerEnter");
}

const handleTriggerExit = () => {
  console.log("handleTriggerExit");
}

triggerVolume.onTriggerEnter = handleTriggerEnter
triggerVolume.onTriggerExit = handleTriggerExit

}
