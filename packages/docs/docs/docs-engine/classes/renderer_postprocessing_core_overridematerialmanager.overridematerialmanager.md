---
id: "renderer_postprocessing_core_overridematerialmanager.overridematerialmanager"
title: "Class: OverrideMaterialManager"
sidebar_label: "OverrideMaterialManager"
custom_edit_url: null
hide_title: true
---

# Class: OverrideMaterialManager

[renderer/postprocessing/core/OverrideMaterialManager](../modules/renderer_postprocessing_core_overridematerialmanager.md).OverrideMaterialManager

An override material manager.

Includes a workaround that fixes override materials for skinned meshes and
instancing. Doesn't fix uniforms such as normal maps and displacement maps.
Using the workaround may have a negative impact on performance if the scene
contains a lot of meshes.

**`implements`** {Disposable}

## Constructors

### constructor

\+ **new OverrideMaterialManager**(`material?`: *any*): [*OverrideMaterialManager*](renderer_postprocessing_core_overridematerialmanager.overridematerialmanager.md)

Constructs a new override material manager.

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`material` | *any* | null |

**Returns:** [*OverrideMaterialManager*](renderer_postprocessing_core_overridematerialmanager.overridematerialmanager.md)

Defined in: [packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts#L25)

## Properties

### material

• **material**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts:23](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts#L23)

___

### materialInstanced

• **materialInstanced**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts:24](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts#L24)

___

### materialSkinning

• **materialSkinning**: *any*

Defined in: [packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts:25](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts#L25)

___

### originalMaterials

• **originalMaterials**: *Map*<any, any\>

Defined in: [packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts:22](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts#L22)

## Accessors

### workaroundEnabled

• `Static`get **workaroundEnabled**(): *boolean*

Indicates whether the override material workaround is enabled.

**Returns:** *boolean*

Defined in: [packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts:186](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts#L186)

• `Static`set **workaroundEnabled**(`value`: *boolean*): *void*

Enables or disables the override material workaround globally.

This only affects post processing passes and effects.

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *boolean* |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts:198](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts#L198)

## Methods

### dispose

▸ **dispose**(): *void*

Performs cleanup tasks.

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts:175](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts#L175)

___

### disposeMaterials

▸ `Private`**disposeMaterials**(): *void*

Deletes cloned override materials.

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts:161](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts#L161)

___

### render

▸ `Private`**render**(`renderer`: *any*, `scene`: *any*, `camera`: *any*): *void*

Renders the scene with the override material.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`renderer` | *any* | The renderer.   |
`scene` | *any* | A scene.   |
`camera` | *any* | A camera.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts:102](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts#L102)

___

### setMaterial

▸ **setMaterial**(`material`: *any*): *void*

Sets the override material.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`material` | *any* | The material.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/OverrideMaterialManager.ts#L78)
