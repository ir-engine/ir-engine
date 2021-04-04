---
id: "components_terminal_components_types"
title: "Module: components/terminal/components/types"
sidebar_label: "components/terminal/components/types"
custom_edit_url: null
hide_title: true
---

# Module: components/terminal/components/types

## Variables

### TerminalContextTypes

• `Const` **TerminalContextTypes**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`activeTabId` | *Requireable*<string\> |
`closeWindow` | *Requireable*<(...`args`: *any*[]) => *any*\> |
`instances` | *Requireable*<any[]\> |
`maximise` | *Requireable*<boolean\> |
`maximiseWindow` | *Requireable*<(...`args`: *any*[]) => *any*\> |
`minimise` | *Requireable*<boolean\> |
`minimiseWindow` | *Requireable*<(...`args`: *any*[]) => *any*\> |
`openWindow` | *Requireable*<(...`args`: *any*[]) => *any*\> |
`show` | *Requireable*<boolean\> |
`tabsShowing` | *Requireable*<boolean\> |
`toggleMaximise` | *Requireable*<(...`args`: *any*[]) => *any*\> |
`toggleMinimize` | *Requireable*<(...`args`: *any*[]) => *any*\> |
`toggleShow` | *Requireable*<(...`args`: *any*[]) => *any*\> |
`unmaximiseWindow` | *Requireable*<(...`args`: *any*[]) => *any*\> |
`unminimiseWindow` | *Requireable*<(...`args`: *any*[]) => *any*\> |

Defined in: [packages/client-core/components/terminal/components/types.tsx:58](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/types.tsx#L58)

___

### TerminalDefaultProps

• `Const` **TerminalDefaultProps**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`allowTabs` | *boolean* |
`backgroundColor` | *string* |
`closedMessage` | *string* |
`closedTitle` | *string* |
`color` | *string* |
`commandPassThrough` | *boolean* |
`commands` | *object* |
`commands.ecs` | *object* |
`commands.ecs.method` | (`args`: *any*, `print`: *any*, `runCommand`: *any*) => *void* |
`commands.ecs.options` | ({ `defaultValue`: *string* = 'console.log("Eval says: feed me code!")'; `description`: *string* = 'query the ecs engine for information on the current scene'; `name`: *string* = 'ecs' } \| { `defaultValue`: *undefined* = 'console.log("Eval says: feed me code!")'; `description`: *string* = ''; `name`: *string* = 'a' })[] |
`commands.eval` | *object* |
`commands.eval.method` | (`args`: *any*, `print`: *any*, `runCommand`: *any*) => *void* |
`commands.eval.options` | { `defaultValue`: *string* = 'console.log("Eval says: feed me code!")'; `description`: *string* = 'execute arbitrary js'; `name`: *string* = 'eval' }[] |
`commands.helloworld` | () => *void* |
`descriptions` | *object* |
`descriptions.ecs` | *string* |
`msg` | *string* |
`plugins` | *any*[] |
`prompt` | *string* |
`promptSymbol` | *string* |
`shortcuts` | *object* |
`showActions` | *boolean* |
`startState` | *string* |
`style` | *object* |
`style.bottom` | *string* |
`style.fontSize` | *string* |
`style.fontWeight` | *string* |
`style.position` | *string* |
`style.width` | *string* |
`style.zIndex` | *number* |
`watchConsoleLogging` | *boolean* |

Defined in: [packages/client-core/components/terminal/components/types.tsx:76](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/types.tsx#L76)

___

### TerminalPropTypes

• `Const` **TerminalPropTypes**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`actionHandlers` | *Requireable*<InferProps<{ `handleClose`: *Requireable*<(...`args`: *any*[]) => *any*\> ; `handleMaximise`: *Requireable*<(...`args`: *any*[]) => *any*\> ; `handleMinimise`: *Requireable*<(...`args`: *any*[]) => *any*\>  }\>\> |
`afterChange` | *Requireable*<(...`args`: *any*[]) => *any*\> |
`allowTabs` | *Requireable*<boolean\> |
`backgroundColor` | *Requireable*<string\> |
`closedMessage` | *Requireable*<string\> |
`closedTitle` | *Requireable*<string\> |
`color` | *Requireable*<string\> |
`commandPassThrough` | *Requireable*<boolean \| (...`args`: *any*[]) => *any*\> |
`commandWasRun` | *Requireable*<(...`args`: *any*[]) => *any*\> |
`commands` | *Requireable*<{}\> |
`descriptions` | *Requireable*<{}\> |
`msg` | *Requireable*<string\> |
`outputColor` | *Requireable*<string\> |
`plugins` | *Requireable*<((...`args`: *any*[]) => *any* \| InferProps<{ `class`: *Requireable*<(...`args`: *any*[]) => *any*\> ; `config`: *Requireable*<object\>  }\>)[]\> |
`prompt` | *Requireable*<string\> |
`promptSymbol` | *Requireable*<string\> |
`shortcuts` | *Requireable*<{}\> |
`showActions` | *Requireable*<boolean\> |
`startState` | *Requireable*<string\> |
`style` | *Requireable*<object\> |
`watchConsoleLogging` | *Requireable*<boolean\> |

Defined in: [packages/client-core/components/terminal/components/types.tsx:21](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/types.tsx#L21)

___

### commandsPropType

• `Const` **commandsPropType**: *Requireable*<{}\>

Defined in: [packages/client-core/components/terminal/components/types.tsx:4](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/types.tsx#L4)

___

### descriptionsPropType

• `Const` **descriptionsPropType**: *Requireable*<{}\>

Defined in: [packages/client-core/components/terminal/components/types.tsx:16](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/types.tsx#L16)
