import { Group } from 'three';
import { Component } from '../../ecs/classes/Component';
import { Types } from '../../ecs/types/Types';

/**
 * 
 * @author Josh Field <github.com/HexaField>
 */

export class XRInputSourceComponent extends Component<XRInputSourceComponent> {
  
  /**
   * @property {Group} controllerLeft
   * @property {Group} controllerRight 
   * the controllers
   */
  controllerLeft: Group;
  controllerRight: Group;

  /**
   * @property {Group} controllerGripLeft
   * @property {Group} controllerGripRight 
   * controller grips hold the information for grips, which are where the user grabs things from
   */
  controllerGripLeft: Group;
  controllerGripRight: Group;

  /**
   * @property {Group} controllerGroup is the group that holds all the controller groups,
   * so they can be transformed together
   */
  controllerGroup: Group;

  /**
   * @property {Group} head is the camera on the client,
   * and a group to represent the camera on the server and remote clients
   */
  head: Group;

  /**
   * @property {Group} headGroup is the group to contain and transform the head and camera
   */
  headGroup: Group;

  static _schema = {
    head: { type: Types.Ref, default: new Group() },
    headGroup: { type: Types.Ref, default: new Group() },
    controllerGroup: { type: Types.Ref, default: new Group() },
    controllerLeft: { type: Types.Ref, default: new Group() },
    controllerRight: { type: Types.Ref, default: new Group() },
    controllerGripLeft: { type: Types.Ref, default: new Group() },
    controllerGripRight: { type: Types.Ref, default: new Group() },
  }
}
