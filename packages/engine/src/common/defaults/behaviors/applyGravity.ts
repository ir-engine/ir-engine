import { quat, vec3, mat3, mat4 } from 'gl-matrix';
import { NumericalType, Vector2, Vector3, Vector4, Matrix3, Matrix4 } from '../../types/NumericalTypes';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { Behavior } from '../../interfaces/Behavior';
import { Actor } from '../components/Actor';
import { Entity } from '../../../ecs/classes/Entity';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';

const _deltaV: vec3 = [0, 0, 0];
const _position: vec3 = [0, 0, 0];
const _velocity: vec3 = [0, 1, 0];

let actor: Actor;
let transform: TransformComponent;

const gravity = 9.81;

export const applyGravity: Behavior = (entity: Entity, args, delta: number): void => {

  transform = getComponent(entity, TransformComponent);
  actor = getMutableComponent<Actor>(entity, Actor);
  if (transform.velocity[1] > 0) {
    _velocity[1] = _velocity[1] - (gravity * (delta * delta)) / 2
    //transform.velocity[1] = transform.velocity[1] - (gravity * (delta * delta)) / 2;
    vec3.transformQuat(_velocity, _velocity, quat.fromValues(transform.rotation[0],transform.rotation[1],transform.rotation[2],transform.rotation[3]))
    vec3.scale(_deltaV, _velocity, delta);
    vec3.add(_position, _position, _deltaV);
    transform.position[0] = _position[0];
    transform.position[1] = _position[1];
    transform.position[2] = _position[2];

  } else if (transform.velocity[1] < 0.00001) {
    transform.velocity[1] = 0;
    transform.position[1] = 0;
  }







};
