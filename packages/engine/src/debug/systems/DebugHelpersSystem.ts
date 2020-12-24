import { System } from "../../ecs/classes/System";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { ArrowHelper, Object3D, Vector3 } from "three";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Engine } from "../../ecs/classes/Engine";
import { Entity } from "../../ecs/classes/Entity";
import { TransformComponent } from "../../transform/components/TransformComponent";

export class DebugHelpersSystem extends System {
  private helpersByEntity: Record<string, Map<Entity,Object3D>>;

  constructor() {
    super();

    this.helpersByEntity = {
      "viewVector": new Map()
    };
  }

  execute(delta: number, time: number): void {

    this.queryResults.viewVectorHelper?.added?.forEach(entity => {
      const actor = getComponent(entity, CharacterComponent);

      const origin = new Vector3( 0, 2, 0 );
      const length = 0.5;
      const hex = 0xffff00;

      const arrowHelper = new ArrowHelper( actor.viewVector.clone().normalize(), origin, length, hex );
      Engine.scene.add( arrowHelper );

      this.helpersByEntity.viewVector.set(entity, arrowHelper);
    });

    this.queryResults.viewVectorHelper?.all?.forEach(entity => {
      const actor = getComponent(entity, CharacterComponent);
      const transform = getComponent(entity, TransformComponent);
      const arrowHelper = this.helpersByEntity.viewVector.get(entity) as ArrowHelper;

      arrowHelper.setDirection(actor.viewVector.clone().setY(0).normalize());
      arrowHelper.position.copy(transform.position);
    });
  }
}

DebugHelpersSystem.queries = {
  viewVectorHelper: {
    components: [ CharacterComponent ],
    listen: {
      added: true,
      removed: true
    }
  }
};