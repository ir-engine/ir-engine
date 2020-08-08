import { Entity } from "ecsy"
import Input from "../components/Input"
import Behavior from "../../common/interfaces/Behavior"
import { WebXRSecondController } from "../components/WebXRSecondController"
import { WebXRMainController } from "../components/WebXRMainController"
import { WebXRPointer } from "../components/WebXRPointer"
import {
  //WebXRSpace,
  WebXRViewPoint
} from "../components/WebXRViewPoint"

export function tracking(entity: Entity, { args: {} }) {
    const viewPoint = entity.getComponent(WebXRViewPoint)
    const pointer = entity.getComponent(WebXRPointer)
    const mainController = entity.getComponent(WebXRMainController)
    const secondController = entity.getComponent(WebXRSecondController)
    const poses = [viewPoint, pointer, mainController, secondController].map( ({pose}) => pose )


}