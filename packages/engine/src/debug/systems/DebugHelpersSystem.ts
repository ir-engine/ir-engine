import { System } from "../../ecs/classes/System";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { ArrowHelper, Box3, Box3Helper, BoxHelper, Object3D, Vector3 } from "three";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Engine } from "../../ecs/classes/Engine";
import { Entity } from "../../ecs/classes/Entity";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { BoundingBox } from "../../interaction/components/BoundingBox";
import { Object3DComponent } from "../../common/components/Object3DComponent";

export class DebugHelpersSystem extends System {
  private helpersByEntity: Record<string, Map<Entity,Object3D>>;

  constructor() {
    super();

    this.helpersByEntity = {
      "viewVector": new Map()
    };
  }

  execute(delta: number, time: number): void {

    // view vector

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

    // bounding box
    this.queryResults.boundingBoxComponent?.added.forEach(entity => {
      const boundingBox = getComponent(entity, BoundingBox);
      if (boundingBox.boxArray.length) {
        if (boundingBox.dynamic) {
          boundingBox.boxArray.forEach((object3D, index) => {
            const helper = new BoxHelper(object3D);
            Engine.scene.add(helper);
          });
        }
      } else {
        const box3 = new Box3();
        box3.copy(boundingBox.box);
        if (boundingBox.dynamic) {
          const object3D = getComponent(entity, Object3DComponent);
          box3.applyMatrix4(object3D.value.matrixWorld);
        }
        const helper = new Box3Helper(box3);
        Engine.scene.add(helper);
      }
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
  },
  boundingBoxComponent: {
    components: [ BoundingBox ],
    listen: {
      added: true,
      removed: true
    }
  }

};