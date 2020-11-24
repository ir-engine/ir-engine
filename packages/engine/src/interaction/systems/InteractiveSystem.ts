import { System, SystemAttributes } from "../../ecs/classes/System";
import { Interactable } from "../components/Interactable";
import { Interactor } from "../components/Interactor";
import { interactRaycast } from "../behaviors/interactRaycast";
import { interactBoxRaycast } from "../behaviors/interactBoxRaycast";
import { calcBoundingBox } from "../behaviors/calcBoundingBox";
import { interact } from "../behaviors/interact";
import { addComponent, getMutableComponent, getComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions";
import { Object3DComponent } from "../../common/components/Object3DComponent";
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { Input } from "../../input/components/Input";
import { DefaultInput } from "../../templates/shared/DefaultInput";
import { BinaryValue } from "../../common/enums/BinaryValue";
import { InteractiveFocused } from "../components/InteractiveFocused";
import { BoundingBox } from "../components/BoundingBox";
import { SubFocused } from "../components/SubFocused";
import { Entity } from "../../ecs/classes/Entity";
import { VehicleBody } from '@xr3ngine/engine/src/physics/components/VehicleBody';
import { RigidBody } from "@xr3ngine/engine/src/physics/components/RigidBody";
import { interactFocused } from "../behaviors/interactFocused";
import { subFocused } from "../behaviors/subFocused";
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";


export class InteractiveSystem extends System {
  updateType = SystemUpdateType.Fixed;

  /**
   * Elements that was in focused state on last execution
   */
  focused: Set<Entity>
  /**
   * Elements that are focused on current execution
   */
  newFocused: Set<Entity>

  constructor(attributes?: SystemAttributes) {
    super(attributes);

    this.focused = new Set();
    this.newFocused = new Set();
  }

  dispose(): void {
    super.dispose();
    this.focused?.clear();
    this.newFocused?.clear();
  }

  execute(delta: number, time: number): void {
    this.newFocused.clear();

    this.queryResults.interactors?.all.forEach(entity => {
      if (this.queryResults.interactive?.all.length) {
        //interactRaycast(entity, { interactive: this.queryResults.interactive.all });
        interactBoxRaycast(entity, { interactive: this.queryResults.boundingBox.all });
        const interacts = getComponent(entity, Interactor);
        if (interacts.focusedInteractive) {
          this.newFocused.add(interacts.focusedInteractive);
          // TODO: can someone else focus object? should we update 'interacts' entity
          if (!hasComponent(interacts.focusedInteractive, InteractiveFocused)) {
            addComponent(interacts.focusedInteractive, InteractiveFocused, {interacts: entity});
          }
        }


        // unmark all unfocused
        this.queryResults.interactive?.all.forEach(entityInter => {
          if (!hasComponent(entityInter, BoundingBox) &&
              hasComponent(entityInter, Object3DComponent) &&
              hasComponent(entityInter, TransformComponent)
            ){

            addComponent(entityInter, BoundingBox, {
              dynamic: (hasComponent(entityInter, RigidBody) || hasComponent(entityInter, VehicleBody))
            })

          }
          if (entityInter !== interacts.focusedInteractive && hasComponent(entityInter, InteractiveFocused)) {
            removeComponent(entityInter, InteractiveFocused);
          }
          if (interacts.subFocusedArray.some(subFocusEntity => subFocusEntity.entity === entityInter)) {
            if (!hasComponent(entityInter, SubFocused)) {
              addComponent(entityInter, SubFocused);
            }
          } else {
            removeComponent(entityInter, SubFocused);
          }
        });
      }
    });


    this.queryResults.boundingBox.added?.forEach(entity => {
      calcBoundingBox(entity, null, delta);
    });

    // removal is the first because the hint must first be deleted, and then a new one appears
    this.queryResults.focus.removed?.forEach(entity => {
      interactFocused(entity, null, delta);
    });

    this.queryResults.focus.added?.forEach(entity => {
      interactFocused(entity, null, delta);
    });

    this.queryResults.subfocus.added?.forEach(entity => {
      subFocused(entity, null, delta);
    });
    this.queryResults.subfocus.removed?.forEach(entity => {
      subFocused(entity, null, delta);
    });

    this.focused.clear();
    this.newFocused.forEach(e => this.focused.add(e) );
  }

  static queries: any = {
    interactors: { components: [ Interactor ] },
    interactive: { components: [ Interactable ] },
    boundingBox: { components: [ BoundingBox ],
      listen: {
        added: true,
        removed: true
      }
    },
    focus: {
      components: [ Interactable, InteractiveFocused ],
      listen: {
        added: true,
        removed: true
      }
    },
    subfocus: {
      components: [ Interactable, SubFocused ],
      listen: {
        added: true,
        removed: true
      }
    },
  }
}
