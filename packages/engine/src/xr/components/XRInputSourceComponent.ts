import { Group } from 'three'
import { createMappedComponent } from '../../ecs/functions/ComponentFunctions'
import { QuaternionSchema, Vector3Schema } from '../../transform/components/TransformComponent'

export type XRInputSourceComponentType = {
  // Flatten the controller hirearchy
  // to be able to send the data over network
  controllerLeftParent: Group
  controllerRightParent: Group
  controllerGripLeftParent: Group
  controllerGripRightParent: Group

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

const GroupSchema = {
  position: Vector3Schema,
  quaternion: QuaternionSchema
}

const XRInputSourceSchema = {
  controllerLeftParent: GroupSchema,
  controllerRightParent: GroupSchema,
  controllerGripLeftParent: GroupSchema,
  controllerGripRightParent: GroupSchema,

  controllerLeft: GroupSchema,
  controllerRight: GroupSchema,
  controllerGripLeft: GroupSchema,
  controllerGripRight: GroupSchema,
  container: GroupSchema,
  head: GroupSchema
}

export const XRInputSourceComponent = createMappedComponent<XRInputSourceComponentType, typeof XRInputSourceSchema>(
  'XRInputSourceComponent',
  XRInputSourceSchema
)
