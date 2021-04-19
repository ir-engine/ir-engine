
import { System, SystemAttributes } from "../../ecs/classes/System";
import { UIPanelComponent } from "../components/UIPanelComponent";
import { update } from "../../assets/three-mesh-ui";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Group, Object3D, Raycaster } from "three";
import { Engine } from "../../ecs/classes/Engine";
import { MouseInput } from "../../input/enums/InputEnums";
import { UIBaseElement, UI_ELEMENT_SELECT_STATE } from "../classes/UIBaseElement";
import { InputValue } from "../../input/interfaces/InputValue";
import { NumericalType } from "../../common/types/NumericalTypes";
import { LifecycleValue } from "../../common/enums/LifecycleValue";

const getUIPanelFromHit = (hit: any) => {
  if(!hit.isUIElement) {
    if(!hit.parent) return null;
    return getUIPanelFromHit(hit.parent);
  }
  return hit;
}

// for internal use
export class UIPanelSystem extends System {

  raycaster: Raycaster = new Raycaster();
  panelContainer: Group = new Group();
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
    })

    this.queryResults.panels?.removed?.forEach((entity: Entity) => {
      const uiPanel = getComponent(entity, UIPanelComponent);
      this.panelContainer.remove(uiPanel.panel);
    })

    this.doRaycasts() 
    if (this.queryResults.panels?.all?.length) {
      update();
    }
  }

  doRaycasts() {
    if (Engine.xrSession) {

      // TODO

    } else {
      const mousePos = Engine.inputState.get(MouseInput.MousePosition) as InputValue<NumericalType>;
      const mouseDown = Engine.inputState.get(MouseInput.LeftButton) as InputValue<NumericalType>;
      
      if(!mousePos?.value) return;

      this.raycaster.setFromCamera({ x: mousePos.value[0], y: mousePos.value[1] }, Engine.camera);

      const hits = this.raycaster.intersectObjects(this.panelContainer.children, true)
      
      if(!hits || !hits[0]) return;
      const hit = hits[0].object as UIBaseElement;

      const uiElement = getUIPanelFromHit(hit);
      if(!uiElement) return console.warn('UIPanelSystem: Intersected with a object that does not belong to a panel, this should never happen.');

      if(this.lastRaycastTargets[0] !== uiElement) {
        this.lastRaycastTargets[0]?.setSelectState(UI_ELEMENT_SELECT_STATE.IDLE);
      }

      this.lastRaycastTargets[0] = uiElement;

      const isInputClicked = Boolean(mouseDown && mouseDown.value && mouseDown.lifecycleState === LifecycleValue.STARTED);

      uiElement.setSelectState(isInputClicked ? UI_ELEMENT_SELECT_STATE.SELECTED : UI_ELEMENT_SELECT_STATE.HOVERED);
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
