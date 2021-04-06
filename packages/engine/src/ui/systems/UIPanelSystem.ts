
import { System, SystemAttributes } from "../../ecs/classes/System";
import { UIPanelComponent } from "../components/UIPanelComponent";
import { Keyboard, update } from "../../assets/three-mesh-ui";
import { createPanelComponent } from "../functions/createPanelComponent";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Group } from "three";
import { Engine } from "../../ecs/classes/Engine";
import SceneGallery from "../components/SceneGallery";

export class UIPanelSystem extends System {

  panelContainer: Group;

  constructor(attributes?: SystemAttributes) {
    super(attributes);
    this.panelContainer = new Group();
    Engine.scene.add(this.panelContainer);
    createPanelComponent({ panel: new SceneGallery() })
  }
  execute(): void {
    this.queryResults.panels?.added?.forEach((entity: Entity) => {
      const uiPanel = getComponent(entity, UIPanelComponent);
      this.panelContainer.add(uiPanel.panel)
    })

    this.queryResults.panels?.all?.forEach((entity: Entity) => {
      const uiPanel = getComponent(entity, UIPanelComponent);

    })
    this.queryResults.panels?.removed?.forEach((entity: Entity) => {
      const uiPanel = getComponent(entity, UIPanelComponent);
      this.panelContainer.remove(uiPanel.panel)
    })
    if(this.queryResults.panels?.all?.length) {
      update()
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
