---
id: "editor_controls_inputmanager.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[editor/controls/InputManager](../modules/editor_controls_inputmanager.md).default

## Constructors

### constructor

\+ **new default**(`canvas`: *any*): [*default*](editor_controls_inputmanager.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`canvas` | *any* |

**Returns:** [*default*](editor_controls_inputmanager.default.md)

Defined in: [packages/engine/src/editor/controls/InputManager.ts:161](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L161)

## Properties

### boundingClientRect

• **boundingClientRect**: *any*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:160](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L160)

___

### canvas

• **canvas**: *any*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:154](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L154)

___

### initialState

• **initialState**: *any*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:157](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L157)

___

### mapping

• **mapping**: *any*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:156](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L156)

___

### mappings

• **mappings**: *Map*<any, any\>

Defined in: [packages/engine/src/editor/controls/InputManager.ts:155](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L155)

___

### mouseDownTarget

• **mouseDownTarget**: *any*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:161](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L161)

___

### resetKeys

• **resetKeys**: *any*[]

Defined in: [packages/engine/src/editor/controls/InputManager.ts:159](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L159)

___

### state

• **state**: *any*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:158](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L158)

## Methods

### disableInputMapping

▸ **disableInputMapping**(`key`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`key` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:188](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L188)

___

### dispose

▸ **dispose**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:590](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L590)

___

### enableInputMapping

▸ **enableInputMapping**(`key`: *any*, `mapping`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`key` | *any* |
`mapping` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:184](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L184)

___

### get

▸ **get**(`key`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`key` | *any* |

**Returns:** *any*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:587](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L587)

___

### handleEventMappings

▸ **handleEventMappings**(`eventMappings`: *any*, `event`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`eventMappings` | *any* |
`event` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:327](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L327)

___

### handleKeyMappings

▸ **handleKeyMappings**(`keyMappings`: *any*, `event`: *any*, `value`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`keyMappings` | *any* |
`event` | *any* |
`value` | *any* |

**Returns:** *boolean*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:337](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L337)

___

### handlePosition

▸ **handlePosition**(`positionAction`: *any*, `event`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`positionAction` | *any* |
`event` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:360](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L360)

___

### onClick

▸ **onClick**(`event`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:521](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L521)

___

### onContextMenu

▸ **onContextMenu**(`event`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:546](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L546)

___

### onDoubleClick

▸ **onDoubleClick**(`event`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:532](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L532)

___

### onKeyDown

▸ **onKeyDown**(`event`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:368](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L368)

___

### onKeyUp

▸ **onKeyUp**(`event`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:389](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L389)

___

### onMouseDown

▸ **onMouseDown**(`event`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:413](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L413)

___

### onMouseMove

▸ **onMouseMove**(`event`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:473](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L473)

___

### onMouseUp

▸ **onMouseUp**(`event`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:448](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L448)

___

### onResize

▸ **onResize**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:549](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L549)

___

### onWheel

▸ **onWheel**(`event`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *any* |

**Returns:** *boolean*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:498](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L498)

___

### onWindowBlur

▸ **onWindowBlur**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:552](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L552)

___

### onWindowMouseDown

▸ **onWindowMouseDown**(`event`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:410](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L410)

___

### onWindowMouseUp

▸ **onWindowMouseUp**(`event`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:439](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L439)

___

### reset

▸ **reset**(): *void*

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:570](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L570)

___

### setInputMapping

▸ **setInputMapping**(`mapping`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`mapping` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:234](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L234)

___

### update

▸ **update**(`dt`: *any*, `time`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`dt` | *any* |
`time` | *any* |

**Returns:** *void*

Defined in: [packages/engine/src/editor/controls/InputManager.ts:560](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/controls/InputManager.ts#L560)
