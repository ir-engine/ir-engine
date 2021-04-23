---
id: "editor_functions_errors.rethrownerror"
title: "Class: RethrownError"
sidebar_label: "RethrownError"
custom_edit_url: null
hide_title: true
---

# Class: RethrownError

[editor/functions/errors](../modules/editor_functions_errors.md).RethrownError

## Hierarchy

* [*BaseError*](editor_functions_errors.baseerror.md)

  ↳ **RethrownError**

## Constructors

### constructor

\+ **new RethrownError**(`message`: *any*, `error`: *any*): [*RethrownError*](editor_functions_errors.rethrownerror.md)

#### Parameters:

Name | Type |
:------ | :------ |
`message` | *any* |
`error` | *any* |

**Returns:** [*RethrownError*](editor_functions_errors.rethrownerror.md)

Overrides: [BaseError](editor_functions_errors.baseerror.md)

Defined in: [packages/engine/src/editor/functions/errors.ts:33](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/engine/src/editor/functions/errors.ts#L33)

## Properties

### message

• **message**: *string*

Inherited from: [BaseError](editor_functions_errors.baseerror.md).[message](editor_functions_errors.baseerror.md#message)

Defined in: node_modules/typescript/lib/lib.es5.d.ts:974

___

### name

• **name**: *string*

Inherited from: [BaseError](editor_functions_errors.baseerror.md).[name](editor_functions_errors.baseerror.md#name)

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

Inherited from: [BaseError](editor_functions_errors.baseerror.md).[prepareStackTrace](editor_functions_errors.baseerror.md#preparestacktrace)

Defined in: node_modules/@types/node/globals.d.ts:11

___

### stack

• `Optional` **stack**: *string*

Inherited from: [BaseError](editor_functions_errors.baseerror.md).[stack](editor_functions_errors.baseerror.md#stack)

Defined in: node_modules/typescript/lib/lib.es5.d.ts:975

___

### stackTraceLimit

• **stackTraceLimit**: *number*

Inherited from: [BaseError](editor_functions_errors.baseerror.md).[stackTraceLimit](editor_functions_errors.baseerror.md#stacktracelimit)

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

Inherited from: [BaseError](editor_functions_errors.baseerror.md)

Defined in: node_modules/@types/node/globals.d.ts:4
