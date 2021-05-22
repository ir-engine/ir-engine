import { Object3D, Vector3 } from 'three';
import { Component } from '../../ecs/classes/Component';

/**
 *
 * @author Avaer Kazmer
 */

export default class IKLeg<T> extends Component<T>{
  transform: Object3D;
  upperLeg: Object3D;
  lowerLeg: Object3D;
  foot: Object3D;
  upperLegLength: number;
  lowerLegLength: number;
  legLength: number;
  eyesToUpperLegOffset: Vector3;
  stepping: boolean;
  balance: number;
}
