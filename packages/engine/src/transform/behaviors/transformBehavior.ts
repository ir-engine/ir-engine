import { vec3 } from 'gl-matrix';
import { Quaternion } from 'three';
import { Object3DComponent } from '../../common/components/Object3DComponent';
import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { TransformComponent } from '../components/TransformComponent';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';
const q: Quaternion = new Quaternion();
let transform: TransformComponent;
const _deltaV: vec3 = [0, 0, 0];
const _position: vec3 = [0, 0, 0];
const _velocity: vec3 = [0, 0, 0];

export const transformBehavior: Behavior = (entity: Entity, args: { event: MouseEvent }, delta): void => {
  transform = getMutableComponent<TransformComponent>(entity, TransformComponent);
  // TODO: remove this check? this.queryResults.transforms.all should be replaced with this.queryResults.transforms.changed?
  if (!transform) return;

  vec3.set(_position, transform.position[0], transform.position[1], transform.position[2]);
  vec3.set(_velocity, transform.velocity[0], transform.velocity[1], transform.velocity[2]);


  const object3DComponent = getMutableComponent<Object3DComponent>(entity, Object3DComponent);
  if (object3DComponent == undefined) return console.warn('No Object3D located ', console.log(entity.componentTypes));
  // Apply velocity to position

  if (Math.abs(vec3.length(_velocity)) > 0) {
    vec3.scale(_deltaV, _velocity, delta);
    vec3.add(_position, _position, _deltaV);
    transform.position[0] = _position[0];
    transform.position[1] = _position[1];
    transform.position[2] = _position[2];
  }

  object3DComponent.value.position.set(_position[0], _position[1], _position[2]);

  // TODO: Need to apply spin
  object3DComponent.value.rotation.setFromQuaternion(q.fromArray(transform.rotation));
};
