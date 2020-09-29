import { Vec3 } from "cannon-es";
import { AnimationMixer, Bone, BoxGeometry, Group, Mesh, MeshLambertMaterial, Object3D, Vector3, BufferGeometry } from "three";
import { ConvexHull } from "three/examples/jsm/math/ConvexHull";
import { AssetLoader } from "../../../assets/components/AssetLoader";
import { Behavior } from "../../../common/interfaces/Behavior";
import { addComponent, getMutableComponent, hasComponent } from "../../../ecs/functions/EntityFunctions";
import { CapsuleCollider } from "../../../physics/components/CapsuleCollider";
import { RelativeSpringSimulator } from "../../../physics/classes/RelativeSpringSimulator";
import { VectorSpringSimulator } from "../../../physics/classes/VectorSpringSimulator";
import { CollisionGroups } from "../../../physics/enums/CollisionGroups";
import { addState } from "../../../state/behaviors/StateBehaviors";
import { CharacterComponent } from "../components/CharacterComponent";
import { CharacterStateTypes } from "../CharacterStateTypes";
import { Engine } from "../../../ecs/classes/Engine";
import { PhysicsManager } from "../../../physics/components/PhysicsManager";
import { addObject3DComponent } from "../../../common/behaviors/Object3DBehaviors";

export const initializeCreatorCharacter: Behavior = (entity): void => {
    console.log("Init creator character")
    console.log("**** Initializing creator character!");
    if (!hasComponent(entity, CharacterComponent as any))
        addComponent(entity, CharacterComponent as any);

    const actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
    // The visuals group is centered for easy actor tilting
    actor.tiltContainer = new Group();
    actor.tiltContainer.name = 'Actor (tiltContainer)';
    // by default all asset childs are moved into entity object3dComponent, which is tiltContainer
    // we should keep it clean till asset loaded and all it's content moved into modelContainer
    addObject3DComponent(entity, { obj3d: actor.tiltContainer })
    const assetLoader = getMutableComponent<AssetLoader>(entity, AssetLoader as any);
    assetLoader.onLoaded = (entity, { asset }) => {
        actor.animations = asset.animations;
        console.log("Components on character")
        console.log(entity.components)

        // Model container is used to reliably ground the actor, as animation can alter the position of the model itself
        actor.modelContainer = new Group();
        actor.modelContainer.name = 'Actor (modelContainer)';
        actor.modelContainer.position.y = -actor.rayCastLength;

        // Enable camera zooming with mouse wheel
        const components: { [key: number]: any } = entity.components;
        const componentValues: any[] = Object.values(components);
        for (let i = 0, len = componentValues.length; i < len; i++) {
            const component = componentValues[i];
            if (component.name == "FollowCameraComponent") {
                document.addEventListener("wheel", (e: WheelEvent) => {
                    // Prevent page from scrolling
                    e.preventDefault();

                    // Zoom in or out
                    if (!component.targetDistance) {
                        component.targetDistance = component.distance;

                        // Zoom interpolation
                        setInterval(function () {
                            if (component.targetDistance != component.distance) {
                                component.distance += (component.targetDistance - component.distance) * 0.25;
                            }
                        }, 20);
                    }
                    component.targetDistance += e.deltaY / 100;

                    // Zoom limits
                    if (component.targetDistance > component.maxDistance) {
                        component.targetDistance = component.maxDistance;
                    } else if (component.targetDistance < component.minDistance) {
                        component.targetDistance = component.minDistance;
                    }
                }, { passive: false }); // Wheel event bubbles and should not be treated as passive - https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event

                break;
            }
        }

        // TODO: make this work with new characters
        /*const LOD = 0;
        const bodyParts: { [key: string]: Object3D[] } = {};
        const childrenToAdd: Object3D[] = []; // Make sure not to change array length while looping
        actor.tiltContainer.traverse((child: Object3D) => {
            if (child instanceof Object3D) {
                const meshName = child.name;
                const anyLOD = meshName.includes("LOD");
                const specifiedLOD = meshName.includes("LOD" + LOD.toString());
                const isBody = meshName.includes("Body") && !meshName.includes("CC");
                if (anyLOD || specifiedLOD || isBody) {
                    if (specifiedLOD || isBody) {
                        const meshType = meshName.split("_")[0];
                        if (bodyParts[meshType]) {
                            bodyParts[meshType].push(child);
                        } else {
                            bodyParts[meshType] = [child];
                        }
                    } else if (!anyLOD) {
                        childrenToAdd.push(child);
                    }
                }
            }
        });*/

        // Choose a random part from each category to add
        /*let pickedBody: Object3D | null = null;
        const pickedClothes: Object3D[] = [];
        for (const bodyPartKey of Object.keys(bodyParts)) {
            const bodyPartList = bodyParts[bodyPartKey];
            const pickedPart = bodyPartList[Math.floor(Math.random() * bodyPartList.length)];
            childrenToAdd.push(pickedPart);
            if (bodyPartKey == "Body") {
                pickedBody = pickedPart;
            } else {
                pickedClothes.push(pickedPart);
            }
        }

        // Remove parts that weren't randomly chosen
        for (let i = 0, len = actor.tiltContainer.children.length; i < len; i++) {
            const child = actor.tiltContainer.children[i];
            if (child.name == "Armature") {
                const childrenToRemove = []; // Make sure not to change array length while looping
                for (let j = 0, len2 = child.children.length; j < len2; j++) {
                    const subChild = child.children[j];
                    if (subChild.name.includes("LOD")) {
                        if (!childrenToAdd.includes(subChild)) {
                            childrenToRemove.push(subChild);
                        }
                    } else if (!(subChild instanceof Bone)) {
                        if (!childrenToAdd.includes(subChild) || subChild.name.includes("CC")) {
                            childrenToRemove.push(subChild);
                        }
                    }
                }
                child.remove(...childrenToRemove);
                break;
            }
        }*/

        // TODO: Fit clothes on character
        /*if (pickedBody) {
            const numClothes = pickedClothes.length;
            if (numClothes > 0) {
                const cachedVector = new Vector3();
                const bodyHull = new ConvexHull();
                bodyHull.setFromObject(pickedBody);
                const bodyVertices = bodyHull.vertices;
                const numBodyVertices = bodyVertices.length;

                for (let i = 0; i < numClothes; i++) {
                    const pickedClothing: Object3D = pickedClothes[i];
                    let clothingMesh: Mesh | null = null;
                    pickedClothing.traverse(function (obj: Object3D) {
                        if (obj instanceof Mesh) {
                            clothingMesh = obj;
                        }
                    });

                    if (clothingMesh) {
                        const newPoints: Vector3[] = [];
                        const clothingGeometry = clothingMesh.geometry as BufferGeometry;
                        const positions = clothingGeometry.getAttribute("position").array;
                        const normals = clothingGeometry.getAttribute("normal").array;
                        for (let j = 0, t = 0, numPositions = positions.length; j < numPositions; j++) {
                            cachedVector.set(positions[t], positions[t + 1], positions[t + 2]);
                            if (bodyHull.containsPoint(cachedVector)) {
                                const normal = normals[Math.floor(j / 3)];
                                let nearestPoint: Vector3 | null = null;
                                for (let k = 0; k < numBodyVertices; k++) {
                                    const bodyPoint = bodyVertices[k].point;
                                    const distanceToBody = cachedVector.distanceTo(bodyPoint);
                                    if (!nearestPoint || cachedVector.distanceTo(nearestPoint) > distanceToBody) {
                                        nearestPoint = bodyPoint;
                                    }
                                }
                                newPoints.push(nearestPoint.clone().addScalar(normal * 0.02));
                            } else {
                                newPoints.push(cachedVector.clone());
                            }
                            t += 3;
                        }

                        clothingMesh.geometry.setFromPoints(newPoints);
                    } else {
                        console.error("Failed to fit character's clothing - clothing mesh not found!");
                    }
                }
            }
        }*/

        // by default all asset childs are moved into entity object3dComponent, which is tiltContainer
        // we should keep it clean till asset loaded and all it's content moved into modelContainer
        while (actor.tiltContainer.children.length) {
            actor.modelContainer.add(actor.tiltContainer.children[0])
        }

        // now move model container inside empty tilt container
        actor.tiltContainer.add(actor.modelContainer);

        actor.mixer = new AnimationMixer(Engine.scene);

        actor.velocitySimulator = new VectorSpringSimulator(60, actor.defaultVelocitySimulatorMass, actor.defaultVelocitySimulatorDamping);
        actor.rotationSimulator = new RelativeSpringSimulator(60, actor.defaultRotationSimulatorMass, actor.defaultRotationSimulatorDamping);

        actor.viewVector = new Vector3();

        // Physics
        // Player Capsule
        addComponent(entity, CapsuleCollider as any, {
            mass: 1,
            position: new Vec3(),
            actor_height: 0.5,
            radius: 0.25,
            segments: 8,
            friction: 0.0
        });
        actor.actorCapsule = getMutableComponent<CapsuleCollider>(entity, CapsuleCollider)
        actor.actorCapsule.body.shapes.forEach((shape) => {
            shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
        });
        actor.actorCapsule.body.allowSleep = false;
        actor.actorCapsule.body.position = new Vec3(0, 1, 0);
        // Move actor to different collision group for raycasting
        actor.actorCapsule.body.collisionFilterGroup = 2;

        // Disable actor rotation
        actor.actorCapsule.body.fixedRotation = true;
        actor.actorCapsule.body.updateMassProperties();

        // If this entity has an object3d, get the position of that
        // if(hasComponent(entity, Object3DComponent)){
        // 	actor.actorCapsule.body.position = cannonFromThreeVector(getComponent<Object3DComponent>(entity, Object3DComponent).value.position)
        //   } else {
        //	actor.actorCapsule.body.position = new Vec3()
        //   }

        // Ray cast debug
        const boxGeo = new BoxGeometry(0.1, 0.1, 0.1);
        const boxMat = new MeshLambertMaterial({
            color: 0xff0000
        });
        actor.raycastBox = new Mesh(boxGeo, boxMat);
        actor.raycastBox.visible = true;
        Engine.scene.add(actor.raycastBox)
        PhysicsManager.instance.physicsWorld.addBody(actor.actorCapsule.body);

        // Physics pre/post step callback bindings
        // States
        addState(entity, { state: CharacterStateTypes.IDLE });
        actor.initialized = true;

    };
};
