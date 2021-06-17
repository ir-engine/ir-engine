import { Group } from 'three';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

export class IKComponent extends Component<IKComponent> {
  head: Group;
  headGroup: Group;
  controllersGroup: Group;
  controllerLeft: Group;
  controllerRight: Group;
  controllerGripLeft: Group;
  controllerGripRight: Group;

  static _schema = {
    head: { type: Types.Ref, default: new Group() },
    headGroup: { type: Types.Ref, default: new Group() },
    controllersGroup: { type: Types.Ref, default: new Group() },
    controllerLeft: { type: Types.Ref, default: new Group() },
    controllerRight: { type: Types.Ref, default: new Group() },
    controllerGripLeft: { type: Types.Ref, default: new Group() },
    controllerGripRight: { type: Types.Ref, default: new Group() },
  }
}
