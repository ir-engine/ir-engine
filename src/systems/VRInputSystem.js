// TODO: Abstract requirement on threejs
import * as THREE from "three";
import { System } from "ecsy";
import {
  VRInputBehaviour,
  VRInputState,
  ControllerConnected
} from "../components/index.js";
import { WebGLRendererContext } from "./WebGLRendererSystem.js.js.js";

import { Object3DComponent } from "../../core/Object3DComponent.js";
// TODO: Remove requirement on threejs
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory.js";

var controllerModelFactory = new XRControllerModelFactory();

export class VRInputSystem extends System {
  set debug(debug) {
    this.debug = debug;
  }

  init() {
    this.world
      .registerComponent(VRInputState)
      .registerComponent(VRInputBehaviour)
      .registerComponent(ControllerConnected);
  }

  execute() {
    let renderer = this.queries.rendererContext.results[0].getComponent(
      WebGLRendererContext
    ).value;

    this.queries.controllers.added.forEach(entity => {
      let controllerId = entity.getComponent(VRInputState).id;
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

      if (entity.hasComponent(VRInputBehaviour)) {
        var behaviour = entity.getComponent(VRInputBehaviour);
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
    components: [VRInputState],
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
