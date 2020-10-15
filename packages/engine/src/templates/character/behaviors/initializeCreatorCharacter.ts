import { Vec3 } from "cannon-es";
import { AnimationMixer, BoxGeometry, Group, Mesh, MeshLambertMaterial, Vector3, AnimationClip } from "three";
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
import { GLTFLoader } from "../../../assets/loaders/glTF/GLTFLoader";

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
        // Model container is used to reliably ground the actor, as animation can alter the position of the model itself
        actor.modelContainer = new Group();
        actor.modelContainer.name = 'Actor (modelContainer)';
        actor.modelContainer.position.y = -actor.rayCastLength;

        const components: { [key: number]: any } = entity.components;
        const componentValues: any[] = Object.values(components);
        for (let i = 0, len = componentValues.length; i < len; i++) {
            const component = componentValues[i];
            if (component.name == "FollowCameraComponent") {
                // Enable camera zooming with mouse wheel
                document.addEventListener("wheel", (e: WheelEvent) => {
                    // Prevent page from scrolling
                    e.preventDefault();

                    // Zoom in or out
                    if (!component.targetDistance) {
                        component.targetDistance = component.distance;

                        // Zoom interpolation
                        setInterval(() => {
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

        // by default all asset childs are moved into entity object3dComponent, which is tiltContainer
        // we should keep it clean till asset loaded and all it's content moved into modelContainer
        while (actor.tiltContainer.children.length) {
            actor.modelContainer.add(actor.tiltContainer.children[0])
        }

        // now move model container inside empty tilt container
        actor.tiltContainer.add(actor.modelContainer);

        actor.mixer = new AnimationMixer(Engine.scene);

        let idleAnimation;
        new GLTFLoader("models/characters/Animation.glb").loadGLTF().then( ({ scene }) => {
            actor.animations = scene.animations;
            idleAnimation = AnimationClip.findByName(actor.animations, 'idle');
            const action = actor.mixer.clipAction(idleAnimation);
            action.setDuration(20);
            action.play();
        });

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

        // Load character models
        const models = { "Rose": null, "Allison": null, "Andy": null, "Erik": null, "Geoff": null, "Jace": null };
        const modelNames = Object.keys(models);
        let currentModel = modelNames[0];
        let numLoaded = 0;
        for (let i = 0, len = modelNames.length; i < len; i++) {
            const modelName = modelNames[i];
            new GLTFLoader("models/characters/" + modelName + ".glb").loadGLTF().then( ({ scene }) => {
                models[modelName] = scene;
                numLoaded++
                if (numLoaded == len) {
                    const leftArrow = document.createElement("button");
                    const rightArrow = document.createElement("button");

                    leftArrow.innerHTML = `<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M34.52 239.03L228.87 44.69c9.37-9.37 24.57-9.37 33.94 0l22.67 22.67c9.36 9.36 9.37 24.52.04 33.9L131.49 256l154.02 154.75c9.34 9.38 9.32 24.54-.04 33.9l-22.67 22.67c-9.37 9.37-24.57 9.37-33.94 0L34.52 272.97c-9.37-9.37-9.37-24.57 0-33.94z"></path></svg>`;
                    rightArrow.innerHTML = `<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path fill="currentColor" d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.484 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"></path></svg>`;

                    leftArrow.getElementsByTagName("svg")[0].style.setProperty("filter", "drop-shadow(0px 1px 2px #00000091)");
                    rightArrow.getElementsByTagName("svg")[0].style.setProperty("filter", "drop-shadow(0px 1px 2px #00000091)");

                    const filterStyle = "drop-shadow(0px 3px 6px #0066ff)";

                    leftArrow.style.setProperty("position", "absolute");
                    leftArrow.style.setProperty("left", "40%");
                    leftArrow.style.setProperty("top", "20%");
                    leftArrow.style.setProperty("color", "white");
                    leftArrow.style.setProperty("border", "0");
                    leftArrow.style.setProperty("outline", "0");
                    leftArrow.style.setProperty("cursor", "pointer");
                    leftArrow.style.setProperty("width", "48px");
                    leftArrow.style.setProperty("height", "64px");
                    leftArrow.style.setProperty("font-size", "42px");
                    leftArrow.style.setProperty("padding", "10px");
                    leftArrow.style.setProperty("border-radius", "0.25rem");
                    leftArrow.style.setProperty("background", "linear-gradient(20deg, #0066ff, #00b8ff)");
                    leftArrow.style.setProperty("filter", filterStyle);

                    rightArrow.style.setProperty("position", "absolute");
                    rightArrow.style.setProperty("left", "calc(60% - 48px)");
                    rightArrow.style.setProperty("top", "20%");
                    rightArrow.style.setProperty("color", "white");
                    rightArrow.style.setProperty("border", "0");
                    rightArrow.style.setProperty("outline", "0");
                    rightArrow.style.setProperty("cursor", "pointer");
                    rightArrow.style.setProperty("width", "48px");
                    rightArrow.style.setProperty("height", "64px");
                    rightArrow.style.setProperty("padding", "10px");
                    rightArrow.style.setProperty("font-size", "42px");
                    rightArrow.style.setProperty("border-radius", "0.25rem");
                    rightArrow.style.setProperty("background", "linear-gradient(20deg, #0066ff, #00b8ff)");
                    rightArrow.style.setProperty("filter", filterStyle);

                    document.body.appendChild(leftArrow);
                    document.body.appendChild(rightArrow);

                    function mouseenter(this: HTMLElement) {
                        this.style.setProperty("filter", filterStyle + " brightness(0.75)");
                    }

                    function mousedown(this: HTMLElement) {
                        this.style.setProperty("filter", filterStyle + " brightness(0.5)");
                    }

                    function resetFilter(this: HTMLElement) {
                        this.style.setProperty("filter", filterStyle);
                    }

                    leftArrow.addEventListener("mouseenter", mouseenter);
                    rightArrow.addEventListener("mouseenter", mouseenter);
                    leftArrow.addEventListener("mousedown", mousedown);
                    rightArrow.addEventListener("mousedown", mousedown);
                    leftArrow.addEventListener("mouseleave", resetFilter);
                    rightArrow.addEventListener("mouseleave", resetFilter);
                    leftArrow.addEventListener("mouseup", resetFilter);
                    rightArrow.addEventListener("mouseup", resetFilter);

                    leftArrow.addEventListener("click", () => {
                        const currentIndex = modelNames.indexOf(currentModel);
                        let newIndex = currentIndex - 1;
                        if (newIndex < 0) {
                            newIndex = modelNames.length - 1;
                        }
                        currentModel = modelNames[newIndex];
                        actor.modelContainer.children = [models[currentModel].scene];

                        actor.mixer = new AnimationMixer(Engine.scene);
                        const action = actor.mixer.clipAction(idleAnimation);
                        action.setDuration(20);
                        action.play();
                    });

                    rightArrow.addEventListener("click", () => {
                        const currentIndex = modelNames.indexOf(currentModel);
                        let newIndex = currentIndex + 1;
                        if (newIndex > modelNames.length - 1) {
                            newIndex = 0;
                        }
                        currentModel = modelNames[newIndex];
                        actor.modelContainer.children = [models[currentModel].scene];

                        actor.mixer = new AnimationMixer(Engine.scene);
                        const action = actor.mixer.clipAction(idleAnimation);
                        action.setDuration(20);
                        action.play();
                    });
                }
            });
        }
    };
};
