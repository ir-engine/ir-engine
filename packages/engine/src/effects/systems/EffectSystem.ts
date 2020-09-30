import { Object3DComponent } from "../../common/components/Object3DComponent"
import { HighlightComponent } from "../components/HighlightComponent"
import { System, SystemAttributes } from "../../ecs/classes/System"
import { registerComponent } from "../../ecs/functions/ComponentFunctions"
import { getComponent, addComponent, removeComponent } from "../../ecs/functions/EntityFunctions"
import { RendererComponent } from "../../renderer/components/RendererComponent"


export class HighlightSystem extends System {
  constructor(attributes?: SystemAttributes) {
    super()
    registerComponent(HighlightComponent)    
  }
  
  execute(deltaTime, time): void {
   
    for (let entity of this.queryResults.hightlights.added) {
      const hightlightedObject = getComponent(entity, Object3DComponent).value;
      if (hightlightedObject){
      RendererComponent.instance.composer.outlineEffect?.selection.add(hightlightedObject);
    }
  }
  for (let entity of this.queryResults.hightlights.removed) {
    const hightlightedObject = getComponent(entity, Object3DComponent).value;
    if (hightlightedObject){
      RendererComponent.instance.composer.outlineEffect?.selection.delete(hightlightedObject);
    }
  }
}

HighlightSystem.queries = {
  hightlights: {
    components: [HighlightComponent],
    listen: {
      removed: true,
      added: true
    }
  }
}