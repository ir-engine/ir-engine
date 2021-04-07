---
id: "components_terminal_components_content.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[components/terminal/components/Content](../modules/components_terminal_components_content.md).default

## Hierarchy

* *Component*<any\>

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`props`: *any*): [*default*](components_terminal_components_content.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *any* |

**Returns:** [*default*](components_terminal_components_content.default.md)

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:472

\+ **new default**(`props`: *any*, `context`: *any*): [*default*](components_terminal_components_content.default.md)

**`deprecated`** 

**`see`** https://reactjs.org/docs/legacy-context.html

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *any* |
`context` | *any* |

**Returns:** [*default*](components_terminal_components_content.default.md)

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:474

## Properties

### com

• **com**: *any*= null

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:73](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L73)

___

### contentWrapper

• **contentWrapper**: *any*= null

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:72](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L72)

___

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

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:472

___

### inputWrapper

• **inputWrapper**: *any*= null

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:71](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L71)

___

### props

• `Readonly` **props**: *Readonly*<any\> & *Readonly*<{ `children?`: *boolean* \| *ReactElement*<any, string \| JSXElementConstructor<any\>\> \| ReactText \| ReactFragment \| *ReactPortal*  }\>

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:497

___

### refs

• **refs**: *object*

**`deprecated`** 
https://reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs

#### Type declaration:

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:503

___

### state

• **state**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`canScroll` | *boolean* |
`controller` | *any* |
`history` | *any*[] |
`historyCounter` | *number* |
`input` | *any*[] |
`keyInputs` | *any*[] |
`prompt` | *string* |
`promptPrefix` | *string* |
`summary` | *any*[] |

Overrides: void

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:34](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L34)

___

### unregister

• **unregister**: *any*= null

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:70](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L70)

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

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:454

___

### contextTypes

▪ `Static` **contextTypes**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`activeTabId` | *Requireable*<string\> |
`instances` | *Requireable*<any[]\> |
`maximise` | *Requireable*<boolean\> |
`tabsShowing` | *Requireable*<boolean\> |

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:22](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L22)

___

### defaultProps

▪ `Static` **defaultProps**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`oldData` | *object* |
`prompt` | *string* |

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:29](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L29)

___

### displayName

▪ `Static` **displayName**: *string*= 'Content'

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:11](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L11)

___

### propTypes

▪ `Static` **propTypes**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`handleChange` | *Requireable*<(...`args`: *any*[]) => *any*\> |
`handlerKeyPress` | *Validator*<(...`args`: *any*[]) => *any*\> |
`id` | *Requireable*<string\> |
`oldData` | *Requireable*<object\> |
`prompt` | *Requireable*<string\> |
`register` | *Requireable*<(...`args`: *any*[]) => *any*\> |

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:13](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L13)

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

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:708

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

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:740

___

### UNSAFE\_componentWillUpdate

▸ `Optional`**UNSAFE_componentWillUpdate**(`nextProps`: *Readonly*<any\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextState` | *Readonly*<{}\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:768

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

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:637

___

### componentDidMount

▸ **componentDidMount**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:46](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L46)

___

### componentDidUpdate

▸ **componentDidUpdate**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:61](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L61)

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

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:694

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

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:723

___

### componentWillUnmount

▸ **componentWillUnmount**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:66](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L66)

___

### componentWillUpdate

▸ `Optional`**componentWillUpdate**(`nextProps`: *Readonly*<any\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextState` | *Readonly*<{}\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:753

___

### focusInput

▸ **focusInput**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:82](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L82)

___

### forceUpdate

▸ **forceUpdate**(`callback?`: () => *void*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:489

___

### getSnapshotBeforeUpdate

▸ `Optional`**getSnapshotBeforeUpdate**(`prevProps`: *Readonly*<any\>, `prevState`: *Readonly*<{}\>): *any*

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<any\> |
`prevState` | *Readonly*<{}\> |

**Returns:** *any*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:673

___

### handleChange

▸ **handleChange**(`e`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`e` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:88](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L88)

___

### handleKeyPress

▸ **handleKeyPress**(`e`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`e` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:92](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L92)

___

### handleOuterKeypress

▸ **handleOuterKeypress**(`e`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`e` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:96](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L96)

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: void

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:109](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L109)

___

### setScrollPosition

▸ **setScrollPosition**(`pos`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`pos` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/terminal/components/Content/index.tsx:75](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/terminal/components/Content/index.tsx#L75)

___

### setState

▸ **setState**<K\>(`state`: {} \| (`prevState`: *Readonly*<{}\>, `props`: *Readonly*<any\>) => {} \| *Pick*<{}, K\> \| *Pick*<{}, K\>, `callback?`: () => *void*): *void*

#### Type parameters:

Name | Type |
:------ | :------ |
`K` | *never* |

#### Parameters:

Name | Type |
:------ | :------ |
`state` | {} \| (`prevState`: *Readonly*<{}\>, `props`: *Readonly*<any\>) => {} \| *Pick*<{}, K\> \| *Pick*<{}, K\> |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:484

___

### shouldComponentUpdate

▸ `Optional`**shouldComponentUpdate**(`nextProps`: *Readonly*<any\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *boolean*

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
`nextState` | *Readonly*<{}\> |
`nextContext` | *any* |

**Returns:** *boolean*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:627
