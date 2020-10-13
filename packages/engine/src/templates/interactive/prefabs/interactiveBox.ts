import { BoxBufferGeometry, Group, Mesh, MeshPhongMaterial } from "three";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";
import { addMeshRigidBody } from "@xr3ngine/engine/src/physics/behaviors/addMeshRigidBody";
import { Interactive } from "../../../interaction/components/Interactive";
import { onInteractionHover } from "../functions/interactiveBox";
import {
    addComponent,
    getComponent,
    getMutableComponent,
    removeComponent
} from "../../../ecs/functions/EntityFunctions";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { CharacterComponent } from "../../character/components/CharacterComponent";
import { AssetLoaderState } from "../../../assets/components/AssetLoaderState";
import { State } from "../../../state/components/State";
import { LifecycleValue } from "../../../common/enums/LifecycleValue";

const boxGeometry = new BoxBufferGeometry(1, 1, 1);
const boxMaterial = new MeshPhongMaterial({ color: 'blue' });
const boxMesh = new Mesh(boxGeometry, boxMaterial);

export const interactiveBox: Prefab = {
    components: [
        { type: TransformComponent, data: { position: [-3, 2,-3] } },
        {
            type: Interactive,
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
                        parent: tmpGroup,
                        onLoaded: (entity, args) => {
                            // console.log('loaded new avatar model', args);

                            // if (actor.currentAnimationAction) {
                            //     // should we do something here?
                            // }
                            actor.mixer.stopAllAction();
                            // forget that we have any animation playing
                            actor.currentAnimationAction = null;

                            // clear current avatar mesh
                            ([ ...actor.modelContainer.children ])
                              .forEach(child => actor.modelContainer.remove(child) );
                            console.log('actor.mixer', actor.mixer);

                            tmpGroup.children.forEach(child => actor.modelContainer.add(child));

                            const stateComponent = getComponent(entity, State);
                            // trigger all states to restart?
                            stateComponent.data.forEach(data => data.lifecycleState = LifecycleValue.STARTED);
                        }
                    });
                    //debugger;
                }
            }
        }
    ],
    onCreate: [
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
