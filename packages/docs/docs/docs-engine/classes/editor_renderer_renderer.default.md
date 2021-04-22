---
id: "editor_renderer_renderer.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/renderer/Renderer](../modules/editor_renderer_renderer.md).default

## Constructors

### constructor

\+ **new default**(`editor`: *any*, `canvas`: *any*): [*default*](editor_renderer_renderer.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`canvas` | *any* |

**Returns:** [*default*](editor_renderer_renderer.default.md)

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:164](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L164)

## Properties

### camera

• **camera**: *any*

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:163](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L163)

___

### canvas

• **canvas**: *any*

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:157](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L157)

___

### editor

• **editor**: *any*

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:156](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L156)

___

### onUpdateStats

• **onUpdateStats**: *any*

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:164](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L164)

___

### renderMode

• **renderMode**: *LitRenderMode*

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:159](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L159)

___

### renderModes

• **renderModes**: *any*[]

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:161](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L161)

___

### renderer

• **renderer**: *any*

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:158](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L158)

___

### screenshotRenderer

• **screenshotRenderer**: *any*

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:162](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L162)

___

### shadowsRenderMode

• **shadowsRenderMode**: *ShadowsRenderMode*

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:160](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L160)

## Methods

### addBatchedObject

▸ **addBatchedObject**(`object`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`object` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:213](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L213)

___

### dispose

▸ **dispose**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:280](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L280)

___

### onResize

▸ **onResize**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:219](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L219)

___

### onSceneSet

▸ **onSceneSet**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:210](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L210)

___

### removeBatchedObject

▸ **removeBatchedObject**(`object`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`object` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:216](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L216)

___

### setRenderMode

▸ **setRenderMode**(`mode`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`mode` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:205](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L205)

___

### takeScreenshot

▸ **takeScreenshot**(`width?`: *number*, `height?`: *number*): *Promise*<any\>

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`width` | *number* | 1920 |
`height` | *number* | 1080 |

**Returns:** *Promise*<any\>

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:232](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L232)

___

### update

▸ **update**(`dt`: *any*, `_time`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`dt` | *any* |
`_time` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/renderer/Renderer.ts:196](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/renderer/Renderer.ts#L196)
