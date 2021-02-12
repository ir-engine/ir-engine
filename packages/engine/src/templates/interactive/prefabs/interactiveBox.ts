import { BoxBufferGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/scene/behaviors/addObject3DComponent";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";
import { addMeshRigidBody } from "@xr3ngine/engine/src/physics/behaviors/addMeshRigidBody";
import { Interactable } from "../../../interaction/components/Interactable";
import {
    addComponent,
    getComponent,
    getMutableComponent,
    hasComponent,
    removeComponent
} from "../../../ecs/functions/EntityFunctions";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { CharacterComponent } from "../../character/components/CharacterComponent";
import { AssetLoaderState } from "../../../assets/components/AssetLoaderState";
import { State } from "../../../state/components/State";
import { LifecycleValue } from "@xr3ngine/engine/src/common/enums/LifecycleValue";
import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { Object3DComponent } from "@xr3ngine/engine/src/scene/components/Object3DComponent";
import { ColliderComponent } from "../../../physics/components/ColliderComponent";

const boxGeometry = new BoxBufferGeometry(1, 1, 1);
const boxMaterial = new MeshPhongMaterial({ color: 'blue' });
const boxMesh = new Mesh(boxGeometry, boxMaterial);

export const onInteraction: Behavior = (entity, args, delta, entityOut, time) => {
  if (!hasComponent(entityOut, Object3DComponent)) {
    return;
  }

  const collider = getMutableComponent(entityOut, ColliderComponent);
  collider.collider.velocity.x += 0.1 * Math.random();
  collider.collider.velocity.y += 1;
  collider.collider.velocity.z += 0.1 * Math.random();
};

export const onInteractionHover: Behavior = (entity, { focused }: { focused: boolean }, delta, entityOut, time) => {
  if (!hasComponent(entityOut, Object3DComponent)) {
    return;
  }

  const object3d = getMutableComponent(entityOut, Object3DComponent).value as Mesh;
  if (typeof object3d.material !== "undefined") {
    (object3d.material as MeshPhongMaterial).color.setColorName(focused? 'yellow' : 'blue');
  }
};
export const interactiveBox: Prefab = {
    localClientComponents: [
        { type: TransformComponent, data: { position: [-3, 2,-3] } },
        {
            type: Interactable,
            data: {
                interactiveDistance: 3,
                onInteractionFocused: onInteractionHover,
                onInteraction: (entity, args, delta, entity2): void => {
                    removeComponent(entity, AssetLoader, true);
                    removeComponent(entity, AssetLoaderState, true);

                    const avatarsList = [
                        'Allison.glb',
                        'Andy.glb',
                        'Animation.glb',
                        'Erik.glb',
                        'Geoff.glb',
                        'Jace.glb',
                        'Rose.glb',
                    ];
                    const nextAvatarIndex = Math.round((avatarsList.length-1) * Math.random());
                    console.log('nextAvatarIndex', nextAvatarIndex);
                    const nextAvatarSrc = avatarsList[nextAvatarIndex];
                    console.log('nextAvatarSrc', nextAvatarSrc);

                    const actor = getMutableComponent(entity, CharacterComponent);

                    const tmpGroup = new Group();
                    addComponent(entity, AssetLoader, {
                        url: "models/avatars/" + nextAvatarSrc,
                        receiveShadow: true,
                        castShadow: true,
                        parent: tmpGroup
                    });

                    const loader = getMutableComponent(entity, AssetLoader)
                    
                    loader.onLoaded.push((entity, args) => {
                        // console.log('loaded new avatar model', args);

                        // if (actor.currentAnimationAction) {
                        //     // should we do something here?
                        // }
                        actor.mixer.stopAllAction();
                        // forget that we have any animation playing
                        actor.currentAnimationAction = [];

                        // clear current avatar mesh
                        ([ ...actor.modelContainer.children ])
                          .forEach(child => actor.modelContainer.remove(child) );
                        console.log('actor.mixer', actor.mixer);

                        tmpGroup.children.forEach(child => actor.modelContainer.add(child));

                        const stateComponent = getComponent(entity, State);
                        // trigger all states to restart?
                        stateComponent.data.forEach(data => data.lifecycleState = LifecycleValue.STARTED);
                    })

                    //debugger;
                }
            }
        }
    ],
    onAfterCreate: [
        {
            behavior: addObject3DComponent,
            args: {
                obj3d: boxMesh,
            }
        },
        {
            behavior: addMeshCollider,
            args: {
               type: 'box', scale: [1, 1, 1], mass: 10
            }
        },
        {
            behavior: addMeshRigidBody
        }
    ]
};
