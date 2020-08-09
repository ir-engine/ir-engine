import { Entity } from "ecsy"
import { Behavior } from "../../common/interfaces/Behavior"
import { WebXRMainController } from "../components/WebXRMainController"
import { WebXRPointer } from "../components/WebXRPointer"
import { WebXRSecondController } from "../components/WebXRSecondController"
import {
  //WebXRSpace,
  WebXRViewPoint
} from "../components/WebXRViewPoint"

export const tracking: Behavior = (entity: Entity) => {
  const viewPoint = entity.getComponent(WebXRViewPoint)
  const pointer = entity.getComponent(WebXRPointer)
  const mainController = entity.getComponent(WebXRMainController)
  const secondController = entity.getComponent(WebXRSecondController)
  const poses = [viewPoint, pointer, mainController, secondController].map(({ pose }) => pose)
  console.log(poses)
}
