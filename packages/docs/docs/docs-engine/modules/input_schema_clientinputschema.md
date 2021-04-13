---
id: "input_schema_clientinputschema"
title: "Module: input/schema/ClientInputSchema"
sidebar_label: "input/schema/ClientInputSchema"
custom_edit_url: null
hide_title: true
---

# Module: input/schema/ClientInputSchema

## Variables

### ClientInputSchema

• `Const` **ClientInputSchema**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`eventBindings` | *object* |
`eventBindings.contextmenu` | { `behavior`: (`args`: { `event`: MouseEvent  }) => *void*  }[] |
`eventBindings.gamepadconnected` | { `behavior`: (`args`: { `event`: *any*  }) => *void* ; `element`: *string* = 'window' }[] |
`eventBindings.gamepaddisconnected` | { `behavior`: (`args`: { `event`: *any*  }) => *void* ; `element`: *string* = 'window' }[] |
`eventBindings.keydown` | { `args`: { `value`: [*BinaryValue*](../enums/common_enums_binaryvalue.binaryvalue.md)  } ; `behavior`: (`args`: { `event`: KeyboardEvent ; `value`: [*BinaryType*](common_types_numericaltypes.md#binarytype)  }) => *any* ; `element`: *string* = 'document' }[] |
`eventBindings.keyup` | { `args`: { `value`: [*BinaryValue*](../enums/common_enums_binaryvalue.binaryvalue.md)  } ; `behavior`: (`args`: { `event`: KeyboardEvent ; `value`: [*BinaryType*](common_types_numericaltypes.md#binarytype)  }) => *any* ; `element`: *string* = 'document' }[] |
`eventBindings.mobilegamepadbuttondown` | { `args`: { `value`: [*BinaryValue*](../enums/common_enums_binaryvalue.binaryvalue.md)  } ; `behavior`: (`args`: { `event`: CustomEvent ; `value`: [*BinaryType*](common_types_numericaltypes.md#binarytype)  }) => *any* ; `element`: *string* = 'document' }[] |
`eventBindings.mobilegamepadbuttonup` | { `args`: { `value`: [*BinaryValue*](../enums/common_enums_binaryvalue.binaryvalue.md)  } ; `behavior`: (`args`: { `event`: CustomEvent ; `value`: [*BinaryType*](common_types_numericaltypes.md#binarytype)  }) => *any* ; `element`: *string* = 'document' }[] |
`eventBindings.mousedown` | { `args`: { `value`: [*BinaryValue*](../enums/common_enums_binaryvalue.binaryvalue.md)  } ; `behavior`: (`args`: { `event`: MouseEvent ; `value`: [*BinaryType*](common_types_numericaltypes.md#binarytype)  }) => *void*  }[] |
`eventBindings.mouseleave` | { `behavior`: (`args`: { `event`: MouseEvent  }) => *void*  }[] |
`eventBindings.mousemove` | { `behavior`: (`args`: { `event`: MouseEvent  }) => *void*  }[] |
`eventBindings.mouseup` | { `args`: { `value`: [*BinaryValue*](../enums/common_enums_binaryvalue.binaryvalue.md)  } ; `behavior`: (`args`: { `event`: MouseEvent ; `value`: [*BinaryType*](common_types_numericaltypes.md#binarytype)  }) => *void*  }[] |
`eventBindings.stickmove` | { `behavior`: (`args`: { `event`: *CustomEvent*<any\>  }) => *void* ; `element`: *string* = 'document' }[] |
`eventBindings.touchcancel` | { `args`: { `value`: [*BinaryValue*](../enums/common_enums_binaryvalue.binaryvalue.md)  } ; `behavior`: (`\_\_namedParameters`: { `event`: TouchEvent ; `value`: [*BinaryType*](common_types_numericaltypes.md#binarytype)  }) => *void* ; `passive`: *boolean* = true }[] |
`eventBindings.touchend` | { `args`: { `value`: [*BinaryValue*](../enums/common_enums_binaryvalue.binaryvalue.md)  } ; `behavior`: (`\_\_namedParameters`: { `event`: TouchEvent ; `value`: [*BinaryType*](common_types_numericaltypes.md#binarytype)  }) => *void* ; `passive`: *boolean* = true }[] |
`eventBindings.touchmove` | { `behavior`: (`args`: { `event`: TouchEvent  }) => *void* ; `passive`: *boolean* = true }[] |
`eventBindings.touchstart` | ({ `args`: { `value`: [*BinaryValue*](../enums/common_enums_binaryvalue.binaryvalue.md)  } ; `behavior`: (`\_\_namedParameters`: { `event`: TouchEvent ; `value`: [*BinaryType*](common_types_numericaltypes.md#binarytype)  }) => *void* ; `passive`: *boolean* = true } \| { `args`: *undefined* ; `behavior`: (`args`: { `event`: TouchEvent  }) => *void* ; `passive`: *boolean* = true })[] |
`eventBindings.wheel` | { `behavior`: (`args`: { `event`: WheelEvent  }) => *void* ; `passive`: *boolean* = true }[] |
`onAdded` | { `behavior`: () => *void*  }[] |
`onRemoved` | { `behavior`: () => *void*  }[] |

Defined in: [packages/engine/src/input/schema/ClientInputSchema.ts:605](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/input/schema/ClientInputSchema.ts#L605)
