
import { System, SystemAttributes } from "../../ecs/classes/System";
import { UIPanelComponent } from "../components/UIPanelComponent";
import { update } from "../../assets/three-mesh-ui";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Group, Raycaster } from "three";
import { Engine } from "../../ecs/classes/Engine";
import { MouseInput } from "../../input/enums/InputEnums";
import { UIBaseElement, UI_ELEMENT_SELECT_STATE } from "../classes/UIBaseElement";


// for internal use
export class UIPanelSystem extends System {

  raycaster: Raycaster = new Raycaster();
  panelContainer: Group = new Group();
  panelRaycastTargets: UIBaseElement[] = [];
  lastRaycastTargets: UIBaseElement[] = [];

  constructor(attributes?: SystemAttributes) {
    super(attributes);
    this.panelContainer;
    Engine.scene.add(this.panelContainer);
  }

  execute(): void {
    this.queryResults.panels?.added?.forEach((entity: Entity) => {
      const uiPanel = getComponent(entity, UIPanelComponent);
      this.panelContainer.add(uiPanel.panel);

      uiPanel.panel.elements.forEach(element => {
        this.panelRaycastTargets.push(element);
      });
    })

    this.queryResults.panels?.removed?.forEach((entity: Entity) => {
      const uiPanel = getComponent(entity, UIPanelComponent);
      this.panelContainer.remove(uiPanel.panel)

      uiPanel.panel.elements.forEach(element => {
        this.panelRaycastTargets.splice(this.panelRaycastTargets.indexOf(element), 1);
      });
    })

    if (Engine.xrSession) {

      // TODO
      // extend the raycast functionality to be a function that takes input state (pos & click, controller & squeeze)

    } else {
      const mousePos = Engine.inputState.get(MouseInput.MousePosition);
      const mouseDown = Engine.inputState.get(MouseInput.LeftButton);
      if(!mousePos) return;

      this.raycaster.setFromCamera(mousePos.value, Engine.camera);

      const hits = this.raycaster.intersectObjects(this.panelRaycastTargets)
      if(!hits || !hits[0]) return;
      const hit = hits[0].object as UIBaseElement;

      if(this.lastRaycastTargets[0] != hit) {
        this.lastRaycastTargets[0].setSelectState(UI_ELEMENT_SELECT_STATE.IDLE);
      }

      hit.setSelectState(mouseDown.value ? UI_ELEMENT_SELECT_STATE.SELECTED : UI_ELEMENT_SELECT_STATE.HOVERED);
    }

    if (this.queryResults.panels?.all?.length) {
      update();
    }
  }

  dispose() { }
}

UIPanelSystem.queries = {
  panels: {
    components: [UIPanelComponent],
    listen: {
      added: true,
      removed: true
    }
  },
};
