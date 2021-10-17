import { Group } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'

export type XRInputSourceComponentType = {
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
  container: Group

  /**
   * @property {Group} head
   */
  head: Group
}

export const XRInputSourceComponent = createMappedComponent<XRInputSourceComponentType>('XRInputSourceComponent')
