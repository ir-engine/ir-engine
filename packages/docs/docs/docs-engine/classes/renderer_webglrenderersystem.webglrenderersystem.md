---
id: "renderer_webglrenderersystem.webglrenderersystem"
title: "Class: WebGLRendererSystem"
sidebar_label: "WebGLRendererSystem"
custom_edit_url: null
hide_title: true
---

# Class: WebGLRendererSystem

[renderer/WebGLRendererSystem](../modules/renderer_webglrenderersystem.md).WebGLRendererSystem

## Hierarchy

* [*System*](ecs_classes_system.system.md)

  ↳ **WebGLRendererSystem**

## Constructors

### constructor

\+ **new WebGLRendererSystem**(`attributes?`: [*SystemAttributes*](../interfaces/ecs_classes_system.systemattributes.md)): [*WebGLRendererSystem*](renderer_webglrenderersystem.webglrenderersystem.md)

Constructs WebGL Renderer System.

#### Parameters:

Name | Type |
:------ | :------ |
`attributes?` | [*SystemAttributes*](../interfaces/ecs_classes_system.systemattributes.md) |

**Returns:** [*WebGLRendererSystem*](renderer_webglrenderersystem.webglrenderersystem.md)

Overrides: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:72](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L72)

## Properties

### \_mandatoryQueries

• **\_mandatoryQueries**: *any*

Inherited from: [System](ecs_classes_system.system.md).[_mandatoryQueries](ecs_classes_system.system.md#_mandatoryqueries)

Defined in: [packages/engine/src/ecs/classes/System.ts:69](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L69)

___

### \_queries

• **\_queries**: *object*

Queries of system instances.

#### Type declaration:

Inherited from: [System](ecs_classes_system.system.md).[_queries](ecs_classes_system.system.md#_queries)

Defined in: [packages/engine/src/ecs/classes/System.ts:98](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L98)

___

### downgradeTimer

• **downgradeTimer**: *number*= 0

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:49](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L49)

___

### enabled

• **enabled**: *boolean*

Whether the system will execute during the world tick.

Inherited from: [System](ecs_classes_system.system.md).[enabled](ecs_classes_system.system.md#enabled)

Defined in: [packages/engine/src/ecs/classes/System.ts:92](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L92)

___

### executeTime

• **executeTime**: *number*

Inherited from: [System](ecs_classes_system.system.md).[executeTime](ecs_classes_system.system.md#executetime)

Defined in: [packages/engine/src/ecs/classes/System.ts:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L71)

___

### forcePostProcessing

• **forcePostProcessing**: *boolean*= false

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:72](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L72)

___

### initialized

• **initialized**: *boolean*

Inherited from: [System](ecs_classes_system.system.md).[initialized](ecs_classes_system.system.md#initialized)

Defined in: [packages/engine/src/ecs/classes/System.ts:72](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L72)

___

### maxQualityLevel

• **maxQualityLevel**: *number*= 5

Maximum Quality level of the rendered. **Default** value is 4.

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:52](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L52)

___

### maxRenderDelta

• **maxRenderDelta**: *number*

point at which we upgrade quality level (small delta)

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:58](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L58)

___

### minRenderDelta

• **minRenderDelta**: *number*

point at which we downgrade quality level (large delta)

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:60](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L60)

___

### name

• **name**: *string*

Name of the System.

Inherited from: [System](ecs_classes_system.system.md).[name](ecs_classes_system.system.md#name)

Defined in: [packages/engine/src/ecs/classes/System.ts:95](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L95)

___

### postProcessingSchema

• **postProcessingSchema**: [*PostProcessingSchema*](../interfaces/renderer_postprocessing_postprocessingschema.postprocessingschema.md)

Postprocessing schema.

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:47](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L47)

___

### prevQualityLevel

• **prevQualityLevel**: *number*

Previous Quality leve.

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:56](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L56)

___

### priority

• **priority**: *number*

Inherited from: [System](ecs_classes_system.system.md).[priority](ecs_classes_system.system.md#priority)

Defined in: [packages/engine/src/ecs/classes/System.ts:70](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L70)

___

### qualityLevel

• **qualityLevel**: *number*

Current quality level.

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:54](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L54)

___

### queryResults

• **queryResults**: *object*

The results of the queries.
Should be used inside of execute.

#### Type declaration:

Inherited from: [System](ecs_classes_system.system.md).[queryResults](ecs_classes_system.system.md#queryresults)

Defined in: [packages/engine/src/ecs/classes/System.ts:80](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L80)

___

### renderContext

• **renderContext**: WebGLRenderingContext

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:70](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L70)

___

### renderPass

• **renderPass**: [*RenderPass*](renderer_postprocessing_passes_renderpass.renderpass.md)

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:69](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L69)

___

### updateType

• **updateType**: [*SystemUpdateType*](../enums/ecs_functions_systemupdatetype.systemupdatetype.md)

Inherited from: [System](ecs_classes_system.system.md).[updateType](ecs_classes_system.system.md#updatetype)

Defined in: [packages/engine/src/ecs/classes/System.ts:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L74)

___

### upgradeTimer

• **upgradeTimer**: *number*= 0

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:50](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L50)

___

### EVENTS

▪ `Static` **EVENTS**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`QUALITY_CHANGED` | *string* |
`SET_POST_PROCESSING` | *string* |
`SET_RESOLUTION` | *string* |
`SET_SHADOW_QUALITY` | *string* |
`SET_USE_AUTOMATIC` | *string* |

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:31](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L31)

___

### automatic

▪ `Static` **automatic**: *boolean*= true

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L62)

___

### composer

▪ `Static` **composer**: [*EffectComposer*](renderer_postprocessing_core_effectcomposer.effectcomposer.md)

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:42](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L42)

___

### instance

▪ `Static` **instance**: [*WebGLRendererSystem*](renderer_webglrenderersystem.webglrenderersystem.md)

Is system Initialized.

Overrides: [System](ecs_classes_system.system.md).[instance](ecs_classes_system.system.md#instance)

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:40](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L40)

___

### isSystem

▪ `Static` **isSystem**: *true*

Inherited from: [System](ecs_classes_system.system.md).[isSystem](ecs_classes_system.system.md#issystem)

Defined in: [packages/engine/src/ecs/classes/System.ts:68](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L68)

___

### needsResize

▪ `Static` **needsResize**: *boolean*

Is resize needed?

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:44](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L44)

___

### queries

▪ `Static` **queries**: [*SystemQueries*](../interfaces/ecs_classes_system.systemqueries.md)

Inherited from: [System](ecs_classes_system.system.md).[queries](ecs_classes_system.system.md#queries)

Defined in: [packages/engine/src/ecs/classes/System.ts:63](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L63)

___

### scaleFactor

▪ `Static` **scaleFactor**: *number*= 1

Resoulion scale. **Default** value is 1.

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:67](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L67)

___

### shadowQuality

▪ `Static` **shadowQuality**: *number*= 5

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:65](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L65)

___

### usePBR

▪ `Static` **usePBR**: *boolean*= true

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:63](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L63)

___

### usePostProcessing

▪ `Static` **usePostProcessing**: *boolean*= true

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:64](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L64)

## Methods

### changeQualityLevel

▸ **changeQualityLevel**(`delta`: *number*): *void*

Change the quality of the renderer.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`delta` | *number* | Time since last frame.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:271](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L271)

___

### clearEventQueues

▸ **clearEventQueues**(): *void*

Clears event queues.

**Returns:** *void*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:244](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L244)

___

### configurePostProcessing

▸ `Private`**configurePostProcessing**(): *void*

Configure post processing.
Note: Post processing effects are set in the PostProcessingSchema provided to the system.

**Returns:** *void*

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:171](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L171)

___

### dispatchSettingsChangeEvent

▸ **dispatchSettingsChangeEvent**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:305](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L305)

___

### dispose

▸ **dispose**(): *void*

Removes resize listener.

**Returns:** *void*

Overrides: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:160](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L160)

___

### execute

▸ **execute**(`delta`: *number*): *void*

Executes the system. Called each frame by default from the Engine.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`delta` | *number* | Time since last frame.    |

**Returns:** *void*

Overrides: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:218](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L218)

___

### getQuery

▸ **getQuery**(`components`: ([*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<any\> \| [*NotComponent*](../interfaces/ecs_classes_system.notcomponent.md)<any\>)[]): [*Query*](ecs_classes_query.query.md)

Get query from the component.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`components` | ([*ComponentConstructor*](../interfaces/ecs_interfaces_componentinterfaces.componentconstructor.md)<any\> \| [*NotComponent*](../interfaces/ecs_classes_system.notcomponent.md)<any\>)[] | List of components either component or not component.    |

**Returns:** [*Query*](ecs_classes_query.query.md)

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:223](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L223)

___

### onResize

▸ **onResize**(): *void*

Called on resize, sets resize flag.

**Returns:** *void*

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:155](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L155)

___

### play

▸ **play**(): *void*

Plays the system.

**Returns:** *void*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:239](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L239)

___

### setResolution

▸ **setResolution**(`resolution`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`resolution` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:329](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L329)

___

### setShadowQuality

▸ **setShadowQuality**(`shadowSize`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`shadowSize` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:336](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L336)

___

### setUseAutomatic

▸ **setUseAutomatic**(`automatic`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`automatic` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:316](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L316)

___

### setUsePostProcessing

▸ **setUsePostProcessing**(`usePostProcessing`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`usePostProcessing` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/WebGLRendererSystem.ts:349](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/WebGLRendererSystem.ts#L349)

___

### stop

▸ **stop**(): *void*

Stop the system.

**Returns:** *void*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:233](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L233)

___

### toJSON

▸ **toJSON**(): *any*

Serialize the System

**Returns:** *any*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:268](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L268)

___

### getName

▸ `Static`**getName**(): *string*

Get name of the System

**Returns:** *string*

Inherited from: [System](ecs_classes_system.system.md)

Defined in: [packages/engine/src/ecs/classes/System.ts:214](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/ecs/classes/System.ts#L214)
