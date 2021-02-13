import { RigidBody } from "@xr3ngine/engine/src/physics/components/RigidBody";
import { VehicleBody } from '@xr3ngine/engine/src/physics/components/VehicleBody';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { Box3, Frustum, Matrix4, Mesh, Object3D, Scene, Vector3 } from "three";
import { FollowCameraComponent } from "../../camera/components/FollowCameraComponent";
import { isClient } from "../../common/functions/isClient";
import { vectorToScreenXYZ } from "../../common/functions/vectorToScreenXYZ";
import { Behavior } from "../../common/interfaces/Behavior";
import { Engine } from "../../ecs/classes/Engine";
import { Entity } from "../../ecs/classes/Entity";
import { System, SystemAttributes } from "../../ecs/classes/System";
import { Not } from "../../ecs/functions/ComponentFunctions";
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from "../../ecs/functions/EntityFunctions";
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
import { LocalInputReceiver } from "../../input/components/LocalInputReceiver";
import { NetworkObject } from "../../networking/components/NetworkObject";
import { HighlightComponent } from "../../renderer/components/HighlightComponent";
import { Object3DComponent } from "../../scene/components/Object3DComponent";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { NamePlateComponent } from "../../templates/character/components/NamePlateComponent";
import { BoundingBox } from "../components/BoundingBox";
import { Interactable } from "../components/Interactable";
import { InteractiveFocused } from "../components/InteractiveFocused";
import { Interactor } from "../components/Interactor";
import { SubFocused } from "../components/SubFocused";
import { InteractBehaviorArguments } from "../types/InteractionTypes";

export const subFocused:Behavior = (entity: Entity, args, delta: number): void => {
  if (!hasComponent(entity, Interactable)) {
    console.error('Attempted to call interact behavior, but target does not have Interactive component');
    return;
  }
  const subFocused = hasComponent(entity, SubFocused);

    if (subFocused){
      addComponent(entity, HighlightComponent);
    }
    else {
      removeComponent(entity, HighlightComponent);
    }

};

const interactFocused: Behavior = (entity: Entity, args, delta: number): void => {
  if (!hasComponent(entity, Interactable)) {
    console.error('Attempted to call interact behavior, but target does not have Interactive component');
    return;
  }

  const focused = hasComponent(entity, InteractiveFocused);
  //const subFocused = hasComponent(entity, SubFocused);

  const interactive = getComponent(entity, Interactable);
  if (interactive && typeof interactive.onInteractionFocused === 'function') {
    const entityFocuser = focused? getComponent(entity, InteractiveFocused).interacts : null;
    interactive.onInteractionFocused(entityFocuser, { focused }, delta, entity);
  }
};

/**
 * Checks if entity can interact with any of entities listed in 'interactive' array, checking distance, guards and raycast
 * @param entity
 * @param interactive
 * @param delta
 */

const interactBoxRaycast: Behavior = (entity: Entity, { raycastList }: InteractBehaviorArguments, delta: number): void => {

  if (!hasComponent(entity, FollowCameraComponent)) {
    const interacts = getMutableComponent(entity, Interactor);
    interacts.subFocusedArray = [];
    (interacts.BoxHitResult as any) = null;
    (interacts.focusedInteractive as any) = null;
    return;
  };

  const followCamera = getComponent(entity, FollowCameraComponent);
  if (!followCamera.raycastBoxOn) return;

  const transform = getComponent<TransformComponent>(entity, TransformComponent);
/*
  const raycastList: Array<Entity> = interactive
    .filter(interactiveEntity => {
      // - have object 3d to raycast
      if (!hasComponent(interactiveEntity, Object3DComponent)) {
        return false;
      }
      const interactive = getComponent(interactiveEntity, Interactable);
      // - onInteractionCheck is not set or passed
      return (typeof interactive.onInteractionCheck !== 'function' || interactive.onInteractionCheck(entity, interactiveEntity));
    });
*/

  if (!raycastList.length) {
    return;
  }

  const projectionMatrix = new Matrix4().makePerspective(
    followCamera.rx1,
    followCamera.rx2,
    followCamera.ry1,
    followCamera.ry2,
    Engine.camera.near,
    followCamera.farDistance
  );

  Engine.camera.updateMatrixWorld();
  Engine.camera.matrixWorldInverse.copy(Engine.camera.matrixWorld).invert();

  const viewProjectionMatrix = new Matrix4().multiplyMatrices(projectionMatrix, Engine.camera.matrixWorldInverse);
  const frustum = new Frustum().setFromProjectionMatrix(viewProjectionMatrix);


  const subFocusedArray = raycastList.map(entityIn => {

    const boundingBox = getComponent(entityIn, BoundingBox);
    const interactive = getComponent(entityIn, Interactable);
    if (boundingBox.boxArray.length) {
      // TO DO: static group object

      if (boundingBox.dynamic) {
        const arr = boundingBox.boxArray.map((object3D, index) => {
          if (interactive.onInteractionCheck(entity, entityIn, index)) {
            const aabb = new Box3();
            aabb.setFromObject(object3D);
            return [entityIn, frustum.intersectsBox(aabb), aabb.distanceToPoint(transform.position), index];
          }
          return [entityIn, false, null, index];
        }).filter(value => value[1]).sort((a: any, b: any) => a[2] - b[2]);

        if (arr.length) {
          return arr[0];
        } else {
          return [ null, false ];
        }
      }

    } else {

      if (boundingBox.dynamic) {
        const object3D = getComponent(entityIn, Object3DComponent);
        const aabb = new Box3();
        aabb.copy(boundingBox.box);
        aabb.applyMatrix4(object3D.value.matrixWorld);
        return [entityIn, frustum.intersectsBox(aabb), aabb.distanceToPoint(transform.position)];
      } else {
        return [entityIn, frustum.intersectsBox(boundingBox.box), boundingBox.box.distanceToPoint(transform.position)];
      }

    }
  }).filter(value => value[1]);

  const selectNearest = subFocusedArray.sort((a: any, b: any) => a[2] - b[2]);

  const interacts = getMutableComponent(entity, Interactor);
  interacts.subFocusedArray = subFocusedArray.map((v: any) => [ getComponent(v[0], Object3DComponent).value, v[3] ]);

  const newBoxHit = selectNearest.length ? selectNearest[0] : null;
  (interacts.BoxHitResult as any) = newBoxHit;
  (interacts.focusedInteractive as any) = newBoxHit ? newBoxHit[0] : null;
};


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
  previousEntity: Entity;
  previousEntity2DPosition: Vector3;

  constructor(attributes?: SystemAttributes) {
    super(attributes);

    this.previousEntity = null;
    this.previousEntity2DPosition = null;
    this.focused = new Set();
    this.newFocused = new Set();
  }

  dispose(): void {
    super.dispose();
    this.previousEntity = null;
    this.previousEntity2DPosition = null;
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
          if (this.previousEntity) {
            const userData = new CustomEvent('user-hover', { detail: { focused: false } });
            document.dispatchEvent(userData);

            this.previousEntity = null;
            this.previousEntity2DPosition = null;
          }
          return;
        }

        const networkUserID = getComponent(closestHoveredUser, NetworkObject)?.ownerId;
        const closestPosition = getComponent(closestHoveredUser, TransformComponent).position.clone();
        closestPosition.y = 2;
        const point2DPosition = vectorToScreenXYZ(closestPosition, camera, width, height);

        const nameplateData = {
          userId: networkUserID,
          position: {
            x: point2DPosition.x,
            y: point2DPosition.y,
            z: point2DPosition.z
          },
          focused: true
        };

        const userData = new CustomEvent('user-hover', { detail: nameplateData });

        if (!this.previousEntity2DPosition || !point2DPosition.equals(this.previousEntity2DPosition)) {
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


    this.queryResults.interactors?.all.forEach(entity => {
      if (this.queryResults.interactive?.all.length) {
        //interactRaycast(entity, { interactive: this.queryResults.interactive.all });
        interactBoxRaycast(entity, { raycastList: this.queryResults.boundingBox.all });
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
          if (interacts.subFocusedArray.some(v => v[0].entity === entityInter)) {
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
   const interactive = getMutableComponent(entity, Interactable);
   const calcBoundingBox = getMutableComponent(entity, BoundingBox);

   const object3D = getMutableComponent(entity, Object3DComponent);
   const transform = getComponent(entity, TransformComponent);

   object3D.value.position.copy(transform.position);
   object3D.value.rotation.setFromQuaternion(transform.rotation);

   if (!calcBoundingBox.dynamic) {
     object3D.value.updateMatrixWorld();
   }

     if (interactive.interactionParts.length) {

       const arr = interactive.interactionParts.map(name => getComponent(entity, Object3DComponent).value.children[0].getObjectByName(name));
       getMutableComponent(entity, BoundingBox).boxArray = arr;

     } else {

       const aabb = new Box3();
       let object3D = getComponent(entity, Object3DComponent).value;

       if (object3D instanceof Scene) object3D = object3D.children[0];
       if (object3D instanceof Mesh) {

         if( object3D.geometry.boundingBox == null) object3D.geometry.computeBoundingBox();
           aabb.copy(object3D.geometry.boundingBox);

           if(!calcBoundingBox.dynamic) {
             aabb.applyMatrix4( object3D.matrixWorld );
           }

        } else
        if (object3D instanceof Object3D) {
          aabb.setFromObject( object3D );
        }

       calcBoundingBox.box = aabb;
     }
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
