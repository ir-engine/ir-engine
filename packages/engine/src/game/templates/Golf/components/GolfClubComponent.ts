import { Group, Mesh, Vector3 } from 'three';
import { Body, SceneQuery } from 'three-physx';
import { Component } from '../../../../ecs/classes/Component';
import { Types } from '../../../../ecs/types/Types';

export class GolfClubComponent extends Component<GolfClubComponent> {

  canDoChipShots: boolean;
  neckObject: Mesh;
  handleObject: Mesh;
  headGroup: Group;
  meshGroup: Group;
  raycast: SceneQuery;
  canHitBall: boolean;
  body: Body;
  velocityPositionsToCalculate: number = 4;
  lastPositions: Vector3[] = [];
  velocity: Vector3;
  swingVelocity: number;

  static _schema = {
    canDoChipShots: { default: false, type: Types.Boolean },
  }
}
