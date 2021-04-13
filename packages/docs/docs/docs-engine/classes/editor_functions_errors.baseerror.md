---
id: "editor_functions_errors.baseerror"
title: "Class: BaseError"
sidebar_label: "BaseError"
custom_edit_url: null
hide_title: true
---

# Class: BaseError

[editor/functions/errors](../modules/editor_functions_errors.md).BaseError

## Hierarchy

* *Error*

  ↳ **BaseError**

  ↳↳ [*RethrownError*](editor_functions_errors.rethrownerror.md)

  ↳↳ [*MultiError*](editor_functions_errors.multierror.md)

## Constructors

### constructor

\+ **new BaseError**(`message`: *any*): [*BaseError*](editor_functions_errors.baseerror.md)

#### Parameters:

Name | Type |
:------ | :------ |
`message` | *any* |

**Returns:** [*BaseError*](editor_functions_errors.baseerror.md)

Overrides: void

Defined in: [packages/engine/src/editor/functions/errors.ts:20](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/functions/errors.ts#L20)

## Properties

### message

• **message**: *string*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.es5.d.ts:974

___

### name

• **name**: *string*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.es5.d.ts:973

___

### prepareStackTrace

• `Optional` **prepareStackTrace**: (`err`: Error, `stackTraces`: CallSite[]) => *any*

Optional override for formatting stack traces

**`see`** https://v8.dev/docs/stack-trace-api#customizing-stack-traces

#### Type declaration:

▸ (`err`: Error, `stackTraces`: CallSite[]): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`err` | Error |
`stackTraces` | CallSite[] |

**Returns:** *any*

Defined in: node_modules/@types/node/globals.d.ts:11

Defined in: node_modules/@types/node/globals.d.ts:11

___

### stack

• `Optional` **stack**: *string*

Inherited from: void

Defined in: node_modules/typescript/lib/lib.es5.d.ts:975

___

### stackTraceLimit

• **stackTraceLimit**: *number*

Defined in: node_modules/@types/node/globals.d.ts:13

## Methods

### captureStackTrace

▸ **captureStackTrace**(`targetObject`: *object*, `constructorOpt?`: Function): *void*

Create .stack property on a target object

#### Parameters:

Name | Type |
:------ | :------ |
`targetObject` | *object* |
`constructorOpt?` | Function |

**Returns:** *void*

Defined in: node_modules/@types/node/globals.d.ts:4
