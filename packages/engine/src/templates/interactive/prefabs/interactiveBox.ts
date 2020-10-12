import { AnimationMixer, BoxBufferGeometry, Mesh, MeshPhongMaterial } from "three";
import { Prefab } from "@xr3ngine/engine/src/common/interfaces/Prefab";
import { addObject3DComponent } from "@xr3ngine/engine/src/common/behaviors/Object3DBehaviors";
import { TransformComponent } from "@xr3ngine/engine/src/transform/components/TransformComponent";
import { addMeshCollider } from "@xr3ngine/engine/src/physics/behaviors/addMeshCollider";
import { addMeshRigidBody } from "@xr3ngine/engine/src/physics/behaviors/addMeshRigidBody";
import { Interactive } from "../../../interaction/components/Interactive";
import { onInteraction, onInteractionHover } from "../functions/interactiveBox";
import {
    removeComponent,
    addComponent,
    getComponent,
    getMutableComponent
} from "../../../ecs/functions/EntityFunctions";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { Engine } from "../../../ecs/classes/Engine";
import { CharacterComponent } from "../../character/components/CharacterComponent";

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
                    removeComponent(entity, AssetLoader, true)

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

                    addComponent(entity, AssetLoader, {
                        url: "models/avatars/" + nextAvatarSrc,
                        receiveShadow: true,
                        castShadow: true,
                        onLoaded: (entity, args) => {
                            console.log('loaded new avatar model', args);
                            const actor = getMutableComponent(entity, CharacterComponent);
                            actor.modelContainer.children = [ args.asset.scene ];
                            console.log('actor.mixer', actor.mixer);

                            // actor.mixer = new AnimationMixer(Engine.scene);
                            // const action = actor.mixer.clipAction(idleAnimation);
                            // action.setDuration(20);
                            // action.play();
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
