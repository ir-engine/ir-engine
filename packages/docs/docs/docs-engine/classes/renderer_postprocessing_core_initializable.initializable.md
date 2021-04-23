---
id: "renderer_postprocessing_core_initializable.initializable"
title: "Class: Initializable"
sidebar_label: "Initializable"
custom_edit_url: null
hide_title: true
---

# Class: Initializable

[renderer/postprocessing/core/Initializable](../modules/renderer_postprocessing_core_initializable.md).Initializable

The initializable contract.

Implemented by objects that can be initialized.

**`interface`** 

## Constructors

### constructor

\+ **new Initializable**(): [*Initializable*](renderer_postprocessing_core_initializable.initializable.md)

**Returns:** [*Initializable*](renderer_postprocessing_core_initializable.initializable.md)

## Methods

### initialize

▸ **initialize**(`renderer`: *any*, `alpha`: *any*, `frameBufferType`: *any*): *void*

Performs initialization tasks.

#### Parameters:

Name | Type | Description |
:------ | :------ | :------ |
`renderer` | *any* | A renderer.   |
`alpha` | *any* | Whether the renderer uses the alpha channel.   |
`frameBufferType` | *any* | The type of the main frame buffers.    |

**Returns:** *void*

Defined in: [packages/engine/src/renderer/postprocessing/core/Initializable.ts:18](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/renderer/postprocessing/core/Initializable.ts#L18)
