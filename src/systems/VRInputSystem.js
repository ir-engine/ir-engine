// TODO: Remove requirement on threejs
import * as THREE from "three";
import { System } from "ecsy";
import {
  VRControlleBehaviour,
  VRControllerState,
  ControllerConnected
} from "../components/index.js";
import { WebGLRendererContext } from "./WebGLRendererSystem.js.js.js";

import { Object3DComponent } from "../../core/Object3DComponent.js";
// TODO: Remove requirement on threejs
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

var controllerModelFactory = new XRControllerModelFactory();

export class VRInputSystem extends System {
  init() {
    this.world
      .registerComponent(VRControllerState)
      .registerComponent(VRControlleBehaviour)
      .registerComponent(ControllerConnected);
  }

  execute() {
    let renderer = this.queries.rendererContext.results[0].getComponent(
      WebGLRendererContext
    ).value;

    this.queries.controllers.added.forEach(entity => {
      let controllerId = entity.getComponent(VRController).id;
      var controller = renderer.xr.getController(controllerId);
      controller.name = "controller";

      var group = new THREE.Group();
      group.add(controller);
      entity.addComponent(Object3DComponent, { value: group });

      controller.addEventListener("connected", () => {
        entity.addComponent(ControllerConnected);
      });

      controller.addEventListener("disconnected", () => {
        entity.removeComponent(ControllerConnected);
      });

      if (entity.hasComponent(VRControlleBehaviour)) {
        var behaviour = entity.getComponent(VRControlleBehaviour);
        Object.keys(behaviour).forEach(eventName => {
          if (behaviour[eventName]) {
            controller.addEventListener(eventName, behaviour[eventName]);
          }
        });
      }

      let controllerGrip = renderer.xr.getControllerGrip(controllerId);
      controllerGrip.add(
        controllerModelFactory.createControllerModel(controllerGrip)
      );
      controllerGrip.name = "model";
      group.add(controllerGrip);
    });

  }
}

VRInputSystem.queries = {
  controllers: {
    components: [VRControllerState],
    listen: {
      added: true
      //changed: [Visible]
    }
  },
  rendererContext: {
    components: [WebGLRendererContext],
    mandatory: true
  }
};
