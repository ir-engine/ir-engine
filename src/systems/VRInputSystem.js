import { System } from "ecsy";
import {
  VRInputBehaviour,
  VRInputState,
  ControllerConnected
} from "../components/index.js";

export class VRInputSystem extends System {    
  set debug(debug){
      this.debug = debug
  }
  
  init() {
    this.world
      .registerComponent(VRInputState)
      .registerComponent(VRInputBehaviour)
      .registerComponent(ControllerConnected);
  }

  execute() {

    this.queries.controllers.added.forEach(entity => {
      let controllerId = entity.getComponent(VRController).id;
      var controller = renderer.xr.getController(controllerId);
      controller.name = "controller";

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
      controllerGrip.name = "model";
    });

  }
}

VRInputSystem.queries = {
  controllers: {
    components: [VRInputState],
    listen: {
      added: true
    }
  }
};
