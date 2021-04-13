
import { System, SystemAttributes } from "../../ecs/classes/System";
import { UIPanelComponent } from "../components/UIPanelComponent";
import { Keyboard, update } from "../../assets/three-mesh-ui";
import { createPanelComponent } from "../functions/createPanelComponent";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Group } from "three";
import { Engine } from "../../ecs/classes/Engine";
import { RaycastComponent } from "../../raycast/components/RaycastComponent";

export class UIPanelSystem extends System {

  panelContainer: Group;

  constructor(attributes?: SystemAttributes) {
    super(attributes);
    this.panelContainer = new Group();
    Engine.scene.add(this.panelContainer);
    
    
    createPanelComponent({ panel: new UIPanelComponent(), raycast: new RaycastComponent() });
  }
  execute(): void {
    this.queryResults.panels?.added?.forEach((entity: Entity) => {
      const uiPanel = getComponent(entity, UIPanelComponent);
      this.panelContainer.add(uiPanel.panel.panel);
    
      const raycast = getComponent(entity, RaycastComponent);
      this.panelContainer.add(raycast.raycast);
      
      uiPanel.panel.panel.pickables.forEach(element => {
        raycast.raycast.addObject(element);
      });
    })

    let raycaster = null;
    this.queryResults.panels?.all?.forEach((entity: Entity) => {
      const uiPanel = getComponent(entity, UIPanelComponent);

      const raycast = getComponent(entity, RaycastComponent);
      
      console.log('ui panel', uiPanel.panel.panel);
      uiPanel.panel.panel.update();

      raycaster = raycast.raycast;
    })
    this.queryResults.panels?.removed?.forEach((entity: Entity) => {
      const uiPanel = getComponent(entity, UIPanelComponent);
      this.panelContainer.remove(uiPanel.panel)
    })
    if(this.queryResults.panels?.all?.length) {
      update();
      raycaster.update(Engine.camera);
      // console.log('update!!!!', raycaster);
    }
  }

  dispose() {}
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
