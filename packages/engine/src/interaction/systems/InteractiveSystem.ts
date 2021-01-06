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
import { NamePlateComponent } from "../../templates/character/components/NamePlateComponent";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { isClient } from "../../common/functions/isClient";
import { Engine } from "../../ecs/classes/Engine";
import { NetworkObject } from "../../networking/components/NetworkObject";
import { vectorToScreenXYZ } from "../../common/functions/vectorToScreenXYZ";
import { Vector3 } from "three";
import { LocalInputReceiver } from "../../input/components/LocalInputReceiver";
import { Not } from "../../ecs/functions/ComponentFunctions";


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
  previousEntity: any;
  previousEntity2DPosition: any;

  constructor(attributes?: SystemAttributes) {
    super(attributes);
    
    this.previousEntity = null;
    this.previousEntity2DPosition = null;
    this.focused = new Set();
    this.newFocused = new Set();
  }

  dispose(): void {
    super.dispose();
    this.previousEntity?.clear();
    this.previousEntity2DPosition?.clear();
    this.focused?.clear();
    this.newFocused?.clear();
  }

  execute(delta: number, time: number): void {
    this.newFocused.clear();

    if (isClient) {
      const canvas = Engine.renderer.domElement;
      const width = canvas.width;
      const height = canvas.height;

      this.queryResults.local_user?.all.forEach(entity => {
        const camera = Engine.camera;

        const localTransform = getComponent(entity, TransformComponent);
        const localCharacter = getComponent(entity, CharacterComponent);

        const closestHoveredUser = this.queryResults.network_user.all?.filter(entity => {
          const transform = getComponent(entity, TransformComponent);
          const dir = transform.position.clone().sub(localTransform.position).normalize();
          return localCharacter.viewVector.dot(dir) > 0.7;
        })?.reduce((closestEntity, currentEntity) => {
          if (!closestEntity) {
            return currentEntity;
          }
          const closestTransform = getComponent(closestEntity, TransformComponent);
          const currentTransform = getComponent(currentEntity, TransformComponent);

          if (currentTransform.position.distanceTo(localTransform.position) < closestTransform.position.distanceTo(localTransform.position)) {
            return currentEntity;
          }
          else {
            return closestEntity;
          }
        }, null);

        if (!closestHoveredUser) {
          const userData = new CustomEvent('user-hover', { detail: { focused: false } });
          document.dispatchEvent(userData);
          return;
        }

        const networkUserID = getComponent(closestHoveredUser, NetworkObject)?.ownerId;
        const closestPosition = getComponent(closestHoveredUser, TransformComponent).position.clone();
        closestPosition.y = 2;
        const point2DPosition = vectorToScreenXYZ(closestPosition, camera, width, height);

        const nameplateData = {
          userId: networkUserID,
          position: point2DPosition,
          focused: true
        };

        const userData = new CustomEvent('user-hover', { detail: nameplateData });

        if (point2DPosition !== this.previousEntity2DPosition) {
          if (closestHoveredUser !== this.previousEntity) {

            document.dispatchEvent(userData);

            this.previousEntity = closestHoveredUser;
            this.previousEntity2DPosition = point2DPosition;
          } else {
            if (localTransform.position.distanceTo(closestPosition) < 5) {

              document.dispatchEvent(userData);
            } else {
              nameplateData.focused = false;
              document.dispatchEvent(userData);
            }
          }
        }
      });
    }

    this.queryResults.interactors?.all.forEach(entity => {
      if (this.queryResults.interactive?.all.length) {
        //interactRaycast(entity, { interactive: this.queryResults.interactive.all });
        interactBoxRaycast(entity, { interactive: this.queryResults.boundingBox.all });
        const interacts = getComponent(entity, Interactor);
        if (interacts.focusedInteractive) {
          this.newFocused.add(interacts.focusedInteractive);
          // TODO: can someone else focus object? should we update 'interacts' entity
          if (!hasComponent(interacts.focusedInteractive, InteractiveFocused)) {
            addComponent(interacts.focusedInteractive, InteractiveFocused, { interacts: entity });
          }
        }

        // unmark all unfocused
        this.queryResults.interactive?.all.forEach(entityInter => {
          if (!hasComponent(entityInter, BoundingBox) &&
            hasComponent(entityInter, Object3DComponent) &&
            hasComponent(entityInter, TransformComponent)
          ) {
            addComponent(entityInter, BoundingBox, {
              dynamic: (hasComponent(entityInter, RigidBody) || hasComponent(entityInter, VehicleBody))
            });
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
    this.newFocused.forEach(e => this.focused.add(e));
  }

  static queries: any = {
    interactors: { components: [Interactor] },
    interactive: { components: [Interactable] },
    boundingBox: {
      components: [BoundingBox],
      listen: {
        added: true,
        removed: true
      }
    },
    focus: {
      components: [Interactable, InteractiveFocused],
      listen: {
        added: true,
        removed: true
      }
    },
    subfocus: {
      components: [Interactable, SubFocused],
      listen: {
        added: true,
        removed: true
      }
    },
    local_user: {
      components: [LocalInputReceiver, CharacterComponent, TransformComponent],
      listen: {
        added: true,
        removed: true
      }
    },
    network_user: {
      components: [Not(LocalInputReceiver), NamePlateComponent, CharacterComponent, TransformComponent],
      listen: {
        added: true,
        removed: true
      }
    }
  }
}
