---
id: "ecs_classes_component.component"
title: "Class: Component<C>"
sidebar_label: "Component"
custom_edit_url: null
hide_title: true
---

# Class: Component<C\>

[ecs/classes/Component](../modules/ecs_classes_component.md).Component

Components are added to entities to define behavior.\
Component functions can be found at [ComponentFunctions](../modules/ecs_functions_componentfunctions.md).

## Type parameters

Name |
:------ |
`C` |

## Hierarchy

* **Component**

  ↳ [*AudioEnabled*](audio_components_audioenabled.audioenabled.md)

  ↳ [*BackgroundMusic*](audio_components_backgroundmusic.backgroundmusic.md)

  ↳ [*PlaySoundEffect*](audio_components_playsoundeffect.playsoundeffect.md)

  ↳ [*PositionalAudioComponent*](audio_components_positionalaudiocomponent.positionalaudiocomponent.md)

  ↳ [*SoundEffect*](audio_components_soundeffect.soundeffect.md)

  ↳ [*CameraComponent*](camera_components_cameracomponent.cameracomponent.md)

  ↳ [*FollowCameraComponent*](camera_components_followcameracomponent.followcameracomponent.md)

  ↳ [*AnimationComponent*](character_components_animationcomponent.animationcomponent.md)

  ↳ [*IKComponent*](character_components_ikcomponent.ikcomponent.md)

  ↳ [*BehaviorComponent*](common_components_behaviorcomponent.behaviorcomponent.md)

  ↳ [*SystemStateComponent*](ecs_classes_systemstatecomponent.systemstatecomponent.md)

  ↳ [*DelegatedInputReceiver*](input_components_delegatedinputreceiver.delegatedinputreceiver.md)

  ↳ [*LocalInputReceiver*](input_components_localinputreceiver.localinputreceiver.md)

  ↳ [*XRInputReceiver*](input_components_xrinputreceiver.xrinputreceiver.md)

  ↳ [*BoundingBox*](interaction_components_boundingbox.boundingbox.md)

  ↳ [*EquippedComponent*](interaction_components_equippedcomponent.equippedcomponent.md)

  ↳ [*Interactable*](interaction_components_interactable.interactable.md)

  ↳ [*InteractiveFocused*](interaction_components_interactivefocused.interactivefocused.md)

  ↳ [*Interactor*](interaction_components_interactor.interactor.md)

  ↳ [*SubFocused*](interaction_components_subfocused.subfocused.md)

  ↳ [*NetworkObject*](networking_components_networkobject.networkobject.md)

  ↳ [*ParticleEmitterComponent*](particles_components_particleemitter.particleemittercomponent.md)

  ↳ [*CapsuleCollider*](physics_components_capsulecollider.capsulecollider.md)

  ↳ [*ColliderComponent*](physics_components_collidercomponent.collidercomponent.md)

  ↳ [*InterpolationComponent*](physics_components_interpolationcomponent.interpolationcomponent.md)

  ↳ [*PlayerInCar*](physics_components_playerincar.playerincar.md)

  ↳ [*RigidBody*](physics_components_rigidbody.rigidbody.md)

  ↳ [*HighlightComponent*](renderer_components_highlightcomponent.highlightcomponent.md)

  ↳ [*default*](scene_components_audiosource.default.md)

  ↳ [*default*](scene_components_collidable.default.md)

  ↳ [*default*](scene_components_floorplan.default.md)

  ↳ [*FogComponent*](scene_components_fogcomponent.fogcomponent.md)

  ↳ [*default*](scene_components_groundplane.default.md)

  ↳ [*default*](scene_components_imagecomponent.default.md)

  ↳ [*default*](scene_components_lightcomponent.default.md)

  ↳ [*Object3DComponent*](scene_components_object3dcomponent.object3dcomponent.md)

  ↳ [*AudioTagComponent*](scene_components_object3dtagcomponents.audiotagcomponent.md)

  ↳ [*AudioListenerTagComponent*](scene_components_object3dtagcomponents.audiolistenertagcomponent.md)

  ↳ [*PositionalAudioTagComponent*](scene_components_object3dtagcomponents.positionalaudiotagcomponent.md)

  ↳ [*ArrayCameraTagComponent*](scene_components_object3dtagcomponents.arraycameratagcomponent.md)

  ↳ [*CameraTagComponent*](scene_components_object3dtagcomponents.cameratagcomponent.md)

  ↳ [*CubeCameraTagComponent*](scene_components_object3dtagcomponents.cubecameratagcomponent.md)

  ↳ [*OrthographicCameraTagComponent*](scene_components_object3dtagcomponents.orthographiccameratagcomponent.md)

  ↳ [*PerspectiveCameraTagComponent*](scene_components_object3dtagcomponents.perspectivecameratagcomponent.md)

  ↳ [*ImmediateRenderObjectTagComponent*](scene_components_object3dtagcomponents.immediaterenderobjecttagcomponent.md)

  ↳ [*AmbientLightTagComponent*](scene_components_object3dtagcomponents.ambientlighttagcomponent.md)

  ↳ [*AmbientLightProbeTagComponent*](scene_components_object3dtagcomponents.ambientlightprobetagcomponent.md)

  ↳ [*DirectionalLightTagComponent*](scene_components_object3dtagcomponents.directionallighttagcomponent.md)

  ↳ [*HemisphereLightTagComponent*](scene_components_object3dtagcomponents.hemispherelighttagcomponent.md)

  ↳ [*HemisphereLightProbeTagComponent*](scene_components_object3dtagcomponents.hemispherelightprobetagcomponent.md)

  ↳ [*LightTagComponent*](scene_components_object3dtagcomponents.lighttagcomponent.md)

  ↳ [*LightProbeTagComponent*](scene_components_object3dtagcomponents.lightprobetagcomponent.md)

  ↳ [*PointLightTagComponent*](scene_components_object3dtagcomponents.pointlighttagcomponent.md)

  ↳ [*RectAreaLightTagComponent*](scene_components_object3dtagcomponents.rectarealighttagcomponent.md)

  ↳ [*SpotLightTagComponent*](scene_components_object3dtagcomponents.spotlighttagcomponent.md)

  ↳ [*BoneTagComponent*](scene_components_object3dtagcomponents.bonetagcomponent.md)

  ↳ [*GroupTagComponent*](scene_components_object3dtagcomponents.grouptagcomponent.md)

  ↳ [*InstancedMeshTagComponent*](scene_components_object3dtagcomponents.instancedmeshtagcomponent.md)

  ↳ [*LODTagComponent*](scene_components_object3dtagcomponents.lodtagcomponent.md)

  ↳ [*LineTagComponent*](scene_components_object3dtagcomponents.linetagcomponent.md)

  ↳ [*LineLoopTagComponent*](scene_components_object3dtagcomponents.linelooptagcomponent.md)

  ↳ [*LineSegmentsTagComponent*](scene_components_object3dtagcomponents.linesegmentstagcomponent.md)

  ↳ [*MeshTagComponent*](scene_components_object3dtagcomponents.meshtagcomponent.md)

  ↳ [*PointsTagComponent*](scene_components_object3dtagcomponents.pointstagcomponent.md)

  ↳ [*SkinnedMeshTagComponent*](scene_components_object3dtagcomponents.skinnedmeshtagcomponent.md)

  ↳ [*SpriteTagComponent*](scene_components_object3dtagcomponents.spritetagcomponent.md)

  ↳ [*SceneTagComponent*](scene_components_object3dtagcomponents.scenetagcomponent.md)

  ↳ [*VisibleTagComponent*](scene_components_object3dtagcomponents.visibletagcomponent.md)

  ↳ [*default*](scene_components_scenepreviewcamera.default.md)

  ↳ [*default*](scene_components_shadowcomponent.default.md)

  ↳ [*SkyboxComponent*](scene_components_skyboxcomponent.skyboxcomponent.md)

  ↳ [*default*](scene_components_spawnpointcomponent.default.md)

  ↳ [*default*](scene_components_teleporttospawnpoint.default.md)

  ↳ [*default*](scene_components_transformgizmo.default.md)

  ↳ [*default*](scene_components_video.default.md)

  ↳ [*default*](scene_components_volumetriccomponent.default.md)

  ↳ [*default*](scene_components_walkable.default.md)

  ↳ [*CharacterComponent*](templates_character_components_charactercomponent.charactercomponent.md)

  ↳ [*EnteringVehicle*](templates_character_components_enteringvehicle.enteringvehicle.md)

  ↳ [*NamePlateComponent*](templates_character_components_nameplatecomponent.nameplatecomponent.md)

  ↳ [*VehicleComponent*](templates_vehicle_components_vehiclecomponent.vehiclecomponent.md)

  ↳ [*CopyTransformComponent*](transform_components_copytransformcomponent.copytransformcomponent.md)

  ↳ [*DesiredTransformComponent*](transform_components_desiredtransformcomponent.desiredtransformcomponent.md)

  ↳ [*ScaleComponent*](transform_components_scalecomponent.scalecomponent.md)

  ↳ [*TransformChildComponent*](transform_components_transformchildcomponent.transformchildcomponent.md)

  ↳ [*TransformComponent*](transform_components_transformcomponent.transformcomponent.md)

  ↳ [*TransformParentComponent*](transform_components_transformparentcomponent.transformparentcomponent.md)

## Constructors

### constructor

\+ **new Component**<C\>(`props?`: *false* \| *Partial*<Omit<C, keyof [*Component*](ecs_classes_component.component.md)<any\>\>\>): [*Component*](ecs_classes_component.component.md)<C\>

Component class constructor.

#### Type parameters:

Name |
:------ |
`C` |

#### Parameters:

Name | Type |
:------ | :------ |
`props?` | *false* \| *Partial*<Omit<C, keyof [*Component*](ecs_classes_component.component.md)<any\>\>\> |

**Returns:** [*Component*](ecs_classes_component.component.md)<C\>

Defined in: [packages/engine/src/ecs/classes/Component.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L39)

## Properties

### \_pool

• **\_pool**: *any*

The pool an individual instantiated component is attached to.
Each component type has a pool, pool size is set on engine initialization.

Defined in: [packages/engine/src/ecs/classes/Component.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L24)

___

### \_typeId

• **\_typeId**: *any*= -1

The type ID of this component, should be the same as the component's constructed class.

Defined in: [packages/engine/src/ecs/classes/Component.ts:29](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L29)

___

### entity

• **entity**: *any*= ""

The "entity" this component is attached to.

Defined in: [packages/engine/src/ecs/classes/Component.ts:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L39)

___

### name

• **name**: *any*= ""

The name of the component instance, derived from the class name.

Defined in: [packages/engine/src/ecs/classes/Component.ts:34](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L34)

___

### \_schema

▪ `Static` **\_schema**: [*ComponentSchema*](../interfaces/ecs_interfaces_componentinterfaces.componentschema.md)

Defines the attributes and attribute types on the constructed component class.\
All component variables should be reflected in the component schema.

Defined in: [packages/engine/src/ecs/classes/Component.ts:13](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L13)

___

### \_typeId

▪ `Static` **\_typeId**: *number*

The unique ID for this type of component (C).

Defined in: [packages/engine/src/ecs/classes/Component.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L18)

## Methods

### checkUndefinedAttributes

▸ **checkUndefinedAttributes**(`src`: *any*): *void*

Make sure attributes on this component have been defined in the schema

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/Component.ts:142](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L142)

___

### clone

▸ **clone**(): *any*

Default logic for cloning component.
Each component class can override this.

**Returns:** *any*

a new component as a clone of itself.

Defined in: [packages/engine/src/ecs/classes/Component.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L98)

___

### copy

▸ **copy**(`source`: *any*): *any*

Default logic for copying component.
Each component class can override this.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`source` | *any* | Source Component.   |

**Returns:** *any*

this new component as a copy of the source.

Defined in: [packages/engine/src/ecs/classes/Component.ts:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L78)

___

### dispose

▸ **dispose**(): *void*

Put the component back into it's component pool.
Called when component is removed from an entity.

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/Component.ts:125](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L125)

___

### reset

▸ **reset**(): *void*

Default logic for resetting attributes to default schema values.
Each component class can override this.

**Returns:** *void*

Defined in: [packages/engine/src/ecs/classes/Component.ts:106](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L106)

___

### getName

▸ `Static`**getName**(): *string*

Get the name of this component class.
Useful for JSON serialization, etc.

**Returns:** *string*

Defined in: [packages/engine/src/ecs/classes/Component.ts:135](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/Component.ts#L135)
