import { Group } from 'three'
import { Component } from '../../ecs/classes/Component'
import { Types } from '../../ecs/types/Types'

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
  controllerLeft: Group
  controllerRight: Group

  /**
   * @property {Group} controllerGripLeft
   * @property {Group} controllerGripRight
   * controller grips hold the information for grips, which are where the user grabs things from
   */
  controllerGripLeft: Group
  controllerGripRight: Group

  /**
   * @property {Group} controllerGroup is the group that holds all the controller groups,
   * so they can be transformed together
   */
  controllerGroup: Group

  /**
   * @property {Group} head
   */
  head: Group

  static _schema = {
    head: { type: Types.Ref, default: new Group() },
    controllerGroup: { type: Types.Ref, default: new Group() },
    controllerLeft: { type: Types.Ref, default: new Group() },
    controllerRight: { type: Types.Ref, default: new Group() },
    controllerGripLeft: { type: Types.Ref, default: new Group() },
    controllerGripRight: { type: Types.Ref, default: new Group() }
  }
}
