---
id: "src_terminal_components_terminal.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[src/terminal/components/Terminal](../modules/src_terminal_components_terminal.md).default

## Hierarchy

* *Component*<any, any\>

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`props`: *any*): [*default*](src_terminal_components_terminal.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *any* |

**Returns:** [*default*](src_terminal_components_terminal.default.md)

Overrides: void

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:75](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L75)

## Properties

### context

• **context**: *any*

If using the new style context, re-declare this in your class to be the
`React.ContextType` of your `static contextType`.
Should be used with type annotation or static contextType.

```ts
static contextType = MyContext
// For TS pre-3.7:
context!: React.ContextType<typeof MyContext>
// For TS 3.7 and above:
declare context: React.ContextType<typeof MyContext>
```

**`see`** https://reactjs.org/docs/context.html

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:469

___

### defaultCommands

• **defaultCommands**: *any*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:75](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L75)

___

### defaultDesciptions

• **defaultDesciptions**: *any*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:73](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L73)

___

### defaultShortcuts

• **defaultShortcuts**: *any*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L74)

___

### pluginData

• **pluginData**: *object*

#### Type declaration:

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:72](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L72)

___

### props

• `Readonly` **props**: *Readonly*<any\> & *Readonly*<{ `children?`: *boolean* \| *ReactElement*<any, string \| JSXElementConstructor<any\>\> \| ReactText \| ReactFragment \| *ReactPortal*  }\>

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:494

___

### refs

• **refs**: *object*

**`deprecated`** 
https://reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs

#### Type declaration:

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:500

___

### state

• **state**: *Readonly*<any\>

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:495

___

### childContextTypes

▪ `Static` **childContextTypes**: *object*

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

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L71)

___

### contextType

▪ `Optional` `Static` **contextType**: *Context*<any\>

If set, `this.context` will be set at runtime to the current value of the given Context.

Usage:

```ts
type MyContext = number
const Ctx = React.createContext<MyContext>(0)

class Foo extends React.Component {
  static contextType = Ctx
  context!: React.ContextType<typeof Ctx>
  render () {
    return <>My context's value: {this.context}</>;
  }
}
```

**`see`** https://reactjs.org/docs/context.html#classcontexttype

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:451

___

### defaultProps

▪ `Static` **defaultProps**: *object*

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

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:69](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L69)

___

### displayName

▪ `Static` **displayName**: *string*= 'Terminal'

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:63](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L63)

___

### propTypes

▪ `Static` **propTypes**: *object*

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

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:67](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L67)

___

### version

▪ `Static` **version**: *string*= '4.3.0'

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:65](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L65)

## Methods

### UNSAFE\_componentWillMount

▸ `Optional`**UNSAFE_componentWillMount**(): *void*

Called immediately before mounting occurs, and before `Component#render`.
Avoid introducing any side-effects or subscriptions in this method.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

**`deprecated`** 16.3, use componentDidMount or the constructor instead

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:707

___

### UNSAFE\_componentWillReceiveProps

▸ `Optional`**UNSAFE_componentWillReceiveProps**(`nextProps`: *Readonly*<any\>, `nextContext`: *any*): *void*

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling `Component#setState` generally does not trigger this method.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

**`deprecated`** 16.3, use static getDerivedStateFromProps instead

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Parameters:

Name | Type |
:------ | :------ |
`nextProps` | *Readonly*<any\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:739

___

### UNSAFE\_componentWillUpdate

▸ `Optional`**UNSAFE_componentWillUpdate**(`nextProps`: *Readonly*<any\>, `nextState`: *Readonly*<any\>, `nextContext`: *any*): *void*

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call `Component#setState` here.

This method will not stop working in React 17.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

**`deprecated`** 16.3, use getSnapshotBeforeUpdate instead

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Parameters:

Name | Type |
:------ | :------ |
`nextProps` | *Readonly*<any\> |
`nextState` | *Readonly*<any\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:767

___

### assembleCommands

▸ **assembleCommands**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:493](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L493)

___

### autocompleteValue

▸ **autocompleteValue**(`inputRef`: *any*): *any*[]

autocomplete with the command the have the best match

#### Parameters:

Name | Type |
:------ | :------ |
`inputRef` | *any* |

**Returns:** *any*[]

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:515](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L515)

___

### checkShortcuts

▸ **checkShortcuts**(`instance`: *any*, `key`: *any*, `e`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |
`key` | *any* |
`e` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:541](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L541)

___

### checkVersion

▸ **checkVersion**(`comp`: *any*, `ver`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`comp` | *any* |
`ver` | *any* |

**Returns:** *boolean*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:378](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L378)

___

### clearScreen

▸ **clearScreen**(`args`: *any*, `printLine`: *any*, `runCommand`: *any*, `instance`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`args` | *any* |
`printLine` | *any* |
`runCommand` | *any* |
`instance` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:536](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L536)

___

### componentDidCatch

▸ `Optional`**componentDidCatch**(`error`: Error, `errorInfo`: ErrorInfo): *void*

Catches exceptions generated in descendant components. Unhandled exceptions will cause
the entire component tree to unmount.

#### Parameters:

Name | Type |
:------ | :------ |
`error` | Error |
`errorInfo` | ErrorInfo |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:636

___

### componentDidMount

▸ **componentDidMount**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:172](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L172)

___

### componentDidUpdate

▸ `Optional`**componentDidUpdate**(`prevProps`: *Readonly*<any\>, `prevState`: *Readonly*<any\>, `snapshot?`: *any*): *void*

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<any\> |
`prevState` | *Readonly*<any\> |
`snapshot?` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:678

___

### componentWillMount

▸ `Optional`**componentWillMount**(): *void*

Called immediately before mounting occurs, and before `Component#render`.
Avoid introducing any side-effects or subscriptions in this method.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

**`deprecated`** 16.3, use componentDidMount or the constructor instead; will stop working in React 17

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:693

___

### componentWillReceiveProps

▸ `Optional`**componentWillReceiveProps**(`nextProps`: *Readonly*<any\>, `nextContext`: *any*): *void*

Called when the component may be receiving new props.
React may call this even if props have not changed, so be sure to compare new and existing
props if you only want to handle changes.

Calling `Component#setState` generally does not trigger this method.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

**`deprecated`** 16.3, use static getDerivedStateFromProps instead; will stop working in React 17

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Parameters:

Name | Type |
:------ | :------ |
`nextProps` | *Readonly*<any\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:722

___

### componentWillUnmount

▸ **componentWillUnmount**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:184](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L184)

___

### componentWillUpdate

▸ `Optional`**componentWillUpdate**(`nextProps`: *Readonly*<any\>, `nextState`: *Readonly*<any\>, `nextContext`: *any*): *void*

Called immediately before rendering when new props or state is received. Not called for the initial render.

Note: You cannot call `Component#setState` here.

Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
prevents this from being invoked.

**`deprecated`** 16.3, use getSnapshotBeforeUpdate instead; will stop working in React 17

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update

**`see`** https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path

#### Parameters:

Name | Type |
:------ | :------ |
`nextProps` | *Readonly*<any\> |
`nextState` | *Readonly*<any\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:752

___

### createTab

▸ **createTab**(`force?`: *boolean*): *void*

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`force` | *boolean* | false |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:189](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L189)

___

### editLine

▸ **editLine**(`args`: *any*, `printLine`: *any*, `runCommand`: *any*, `instance`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`args` | *any* |
`printLine` | *any* |
`runCommand` | *any* |
`instance` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:594](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L594)

___

### f

▸ **f**(`event`: KeyboardEvent): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`event` | KeyboardEvent |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:163](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L163)

___

### focusInput

▸ **focusInput**(`instance`: *any*, `pos`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |
`pos` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:782](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L782)

___

### forceUpdate

▸ **forceUpdate**(`callback?`: () => *void*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:486

___

### getAppContent

▸ **getAppContent**(): *Element*

**Returns:** *Element*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:245](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L245)

___

### getChildContext

▸ **getChildContext**(): *object*

**Returns:** *object*

Name | Type |
:------ | :------ |
`activeTabId` | *any* |
`closeWindow` | () => *void* |
`instances` | *any* |
`maximise` | *any* |
`maximiseWindow` | () => *void* |
`minimise` | *any* |
`minimiseWindow` | () => *void* |
`openWindow` | () => *void* |
`show` | *any* |
`tabsShowing` | *any* |
`toggleMaximise` | () => *void* |
`toggleMinimize` | () => *void* |
`toggleShow` | () => *void* |
`unmaximiseWindow` | () => *void* |
`unminimiseWindow` | () => *void* |

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:143](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L143)

___

### getContent

▸ **getContent**(): *Element*

**Returns:** *Element*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:251](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L251)

___

### getPluginData

▸ **getPluginData**(`name`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`name` | *any* |

**Returns:** *any*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:303](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L303)

___

### getPluginMethod

▸ **getPluginMethod**(`instance`: *any*, `name`: *any*, `method`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |
`name` | *any* |
`method` | *any* |

**Returns:** *any*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:752](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L752)

___

### getSnapshotBeforeUpdate

▸ `Optional`**getSnapshotBeforeUpdate**(`prevProps`: *Readonly*<any\>, `prevState`: *Readonly*<any\>): *any*

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<any\> |
`prevState` | *Readonly*<any\> |

**Returns:** *any*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:672

___

### handleChange

▸ **handleChange**(`instance`: *any*, `e`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |
`e` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:605](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L605)

___

### handlerKeyPress

▸ **handlerKeyPress**(`instance`: *any*, `e`: *any*, `inputRef`: *any*): *void*

Base of key code set the value of the input
with the history

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |
`e` | *any* |
`inputRef` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:669](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L669)

___

### loadPlugins

▸ **loadPlugins**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:739](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L739)

___

### pluginReleaseControl

▸ **pluginReleaseControl**(`instance`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:484](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L484)

___

### pluginTakeControl

▸ **pluginTakeControl**(`instance`: *any*, `controller`: *any*, `newPrompt`: *any*, `newPromptPrefix`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |
`controller` | *any* |
`newPrompt` | *any* |
`newPromptPrefix` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:472](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L472)

___

### printLine

▸ **printLine**(`instance`: *any*, `inp`: *any*, `std?`: *boolean*): *void*

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`instance` | *any* | - |
`inp` | *any* | - |
`std` | *boolean* | true |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:789](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L789)

___

### printToActive

▸ **printToActive**(...`args`: *any*[]): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`...args` | *any*[] |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:891](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L891)

___

### registerInstance

▸ **registerInstance**(`id`: *any*, `instance`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *any* |
`instance` | *any* |

**Returns:** () => *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:400](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L400)

___

### removeLine

▸ **removeLine**(`instance`: *any*, `lineNumber?`: *number*): *void*

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`instance` | *any* | - |
`lineNumber` | *number* | -1 |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:813](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L813)

___

### removeTab

▸ **removeTab**(`id`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`id` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:211](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L211)

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: void

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:936](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L936)

___

### runCommand

▸ **runCommand**(`instance`: *any*, `inputText`: *any*, `force?`: *boolean*): *any*

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`instance` | *any* | - |
`inputText` | *any* | - |
`force` | *boolean* | false |

**Returns:** *any*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:820](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L820)

___

### runCommandOnActive

▸ **runCommandOnActive**(`inputText`: *any*, `force?`: *boolean*): *void*

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`inputText` | *any* | - |
`force` | *boolean* | false |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:884](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L884)

___

### setActiveTab

▸ **setActiveTab**(`activeTabId`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`activeTabId` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:352](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L352)

___

### setCanScroll

▸ **setCanScroll**(`instance`: *any*, `force`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |
`force` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:768](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L768)

___

### setDescriptions

▸ **setDescriptions**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:309](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L309)

___

### setFalse

▸ **setFalse**(`name`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`name` | *any* |

**Returns:** () => *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:357](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L357)

___

### setFocusToCommandInput

▸ **setFocusToCommandInput**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:236](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L236)

___

### setPluginData

▸ **setPluginData**(`name`: *any*, `data`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`name` | *any* |
`data` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:306](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L306)

___

### setPromptPrefix

▸ **setPromptPrefix**(`instance`: *any*, `promptPrefix`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |
`promptPrefix` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:338](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L338)

___

### setPromptSymbol

▸ **setPromptSymbol**(`instance`: *any*, `prompt`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |
`prompt` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:345](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L345)

___

### setScrollPosition

▸ **setScrollPosition**(`instance`: *any*, `pos`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |
`pos` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:775](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L775)

___

### setShortcuts

▸ **setShortcuts**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:326](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L326)

___

### setState

▸ **setState**<K\>(`state`: *any*, `callback?`: () => *void*): *void*

#### Type parameters:

Name | Type |
:------ | :------ |
`K` | *string* \| *number* \| *symbol* |

#### Parameters:

Name | Type |
:------ | :------ |
`state` | *any* |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:481

___

### setTrue

▸ **setTrue**(`name`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`name` | *any* |

**Returns:** () => *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:360](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L360)

___

### setValueWithHistory

▸ **setValueWithHistory**(`instance`: *any*, `position`: *any*, `inputRef`: *any*): *void*

Set the input value with the possible history value

#### Parameters:

Name | Type |
:------ | :------ |
`instance` | *any* |
`position` | *any* |
`inputRef` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:366](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L366)

___

### shouldComponentUpdate

▸ `Optional`**shouldComponentUpdate**(`nextProps`: *Readonly*<any\>, `nextState`: *Readonly*<any\>, `nextContext`: *any*): *boolean*

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true.
`PureComponent` implements a shallow comparison on props and state and returns true if any
props or states have changed.

If false is returned, `Component#render`, `componentWillUpdate`
and `componentDidUpdate` will not be called.

#### Parameters:

Name | Type |
:------ | :------ |
`nextProps` | *Readonly*<any\> |
`nextState` | *Readonly*<any\> |
`nextContext` | *any* |

**Returns:** *boolean*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:626

___

### showHelp

▸ **showHelp**(`args`: *any*, `printLine`: *any*, `runCommand`: *any*, `instance`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`args` | *any* |
`printLine` | *any* |
`runCommand` | *any* |
`instance` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:904](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L904)

___

### showMsg

▸ **showMsg**(`args`: *any*, `printLine`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`args` | *any* |
`printLine` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:931](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L931)

___

### toggleState

▸ **toggleState**(`name`: *any*): *function*

#### Parameters:

Name | Type |
:------ | :------ |
`name` | *any* |

**Returns:** () => *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:490](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L490)

___

### toggleTerminalExpandedState

▸ **toggleTerminalExpandedState**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:231](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L231)

___

### watchConsoleLogging

▸ **watchConsoleLogging**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/terminal/components/Terminal/index.tsx:898](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/terminal/components/Terminal/index.tsx#L898)
