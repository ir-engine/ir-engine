---
id: "components_editor_error.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[components/editor/Error](../modules/components_editor_error.md).default

[Error component used to error message]

## Hierarchy

* *Component*

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`props`: {} \| *Readonly*<{}\>): [*default*](components_editor_error.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | {} \| *Readonly*<{}\> |

**Returns:** [*default*](components_editor_error.default.md)

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:472

\+ **new default**(`props`: {}, `context`: *any*): [*default*](components_editor_error.default.md)

**`deprecated`** 

**`see`** https://reactjs.org/docs/legacy-context.html

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *object* |
`context` | *any* |

**Returns:** [*default*](components_editor_error.default.md)

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:474

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

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:472

___

### props

• `Readonly` **props**: *Readonly*<{}\> & *Readonly*<{ `children?`: *boolean* \| *ReactElement*<any, string \| JSXElementConstructor<any\>\> \| ReactText \| ReactFragment \| *ReactPortal*  }\>

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

• **state**: *Readonly*<{}\>

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:498

___

### contextType

▪ `Static` **contextType**: *Context*<{ `a`: *string* = ""; `amber`: *string* = "#FFC107"; `background`: *string* = "#15171B"; `blue`: *string* = "#006EFF"; `blueHover`: *string* = "#4D93F1"; `bluePressed`: *string* = "#0554BC"; `border`: *string* = "#5D646C"; `borderStyle`: *string* = "1px solid #5D646C"; `brown`: *string* = "#795548"; `cyan`: *string* = "#00BCD4"; `deemphasized`: *string* = "grey"; `deepOrange`: *string* = "#FF5722"; `deepPurple`: *string* = "#673AB7"; `disabled`: *string* = "#222222"; `disabledText`: *string* = "grey"; `dropdown`: *string* = "#000000"; `green`: *string* = "#4CAF50"; `header`: *string* = "#1b1b1b"; `hover`: *string* = "#4B5562"; `hover2`: *string* = "#636F80"; `indigo`: *string* = "#3F51B5"; `inputBackground`: *string* = "#070809"; `lato`: *string* = "'Lato', sans-serif"; `lightBlue`: *string* = "#03A9F4"; `lightGreen`: *string* = "#8BC34A"; `lime`: *string* = "#CDDC39"; `orange`: *string* = "#FF9800"; `panel`: *string* = "#282C31"; `panel2`: *string* = "#3A4048"; `pink`: *string* = "#E91E63"; `purple`: *string* = "#9C27B0"; `red`: *string* = "#F44336"; `selected`: *string* = "#006EFF"; `selectedText`: *string* = "#fff"; `shadow15`: *string* = "0px 4px 4px  rgba(0, 0, 0, 0.15)"; `shadow30`: *string* = "0px 4px 4px  rgba(0, 0, 0, 0.3)"; `teal`: *string* = "#009688"; `text`: *string* = "#FFFFFF"; `text2`: *string* = "#9FA4B5"; `toolbar`: *string* = "#4D535B"; `toolbar2`: *string* = "#43484F"; `white`: *string* = "#fff"; `yellow`: *string* = "#FFEB3B"; `zilla`: *string* = "'Zilla Slab', sans-serif" }\>

Overrides: void

Defined in: [packages/client-core/components/editor/Error.tsx:33](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Error.tsx#L33)

___

### propTypes

▪ `Static` **propTypes**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`message` | *Requireable*<ReactNodeLike\> |

Defined in: [packages/client-core/components/editor/Error.tsx:29](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Error.tsx#L29)

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

▸ `Optional`**UNSAFE_componentWillReceiveProps**(`nextProps`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<{}\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:740

___

### UNSAFE\_componentWillUpdate

▸ `Optional`**UNSAFE_componentWillUpdate**(`nextProps`: *Readonly*<{}\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<{}\> |
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

▸ `Optional`**componentDidMount**(): *void*

Called immediately after a component is mounted. Setting state here will trigger re-rendering.

**Returns:** *void*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:616

___

### componentDidUpdate

▸ `Optional`**componentDidUpdate**(`prevProps`: *Readonly*<{}\>, `prevState`: *Readonly*<{}\>, `snapshot?`: *any*): *void*

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<{}\> |
`prevState` | *Readonly*<{}\> |
`snapshot?` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:679

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

▸ `Optional`**componentWillReceiveProps**(`nextProps`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<{}\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:723

___

### componentWillUnmount

▸ `Optional`**componentWillUnmount**(): *void*

Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.

**Returns:** *void*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:632

___

### componentWillUpdate

▸ `Optional`**componentWillUpdate**(`nextProps`: *Readonly*<{}\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<{}\> |
`nextState` | *Readonly*<{}\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:753

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

▸ `Optional`**getSnapshotBeforeUpdate**(`prevProps`: *Readonly*<{}\>, `prevState`: *Readonly*<{}\>): *any*

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<{}\> |
`prevState` | *Readonly*<{}\> |

**Returns:** *any*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:673

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: void

Defined in: [packages/client-core/components/editor/Error.tsx:36](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Error.tsx#L36)

___

### setState

▸ **setState**<K\>(`state`: {} \| (`prevState`: *Readonly*<{}\>, `props`: *Readonly*<{}\>) => {} \| *Pick*<{}, K\> \| *Pick*<{}, K\>, `callback?`: () => *void*): *void*

#### Type parameters:

Name | Type |
:------ | :------ |
`K` | *never* |

#### Parameters:

Name | Type |
:------ | :------ |
`state` | {} \| (`prevState`: *Readonly*<{}\>, `props`: *Readonly*<{}\>) => {} \| *Pick*<{}, K\> \| *Pick*<{}, K\> |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:484

___

### shouldComponentUpdate

▸ `Optional`**shouldComponentUpdate**(`nextProps`: *Readonly*<{}\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *boolean*

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true.
`PureComponent` implements a shallow comparison on props and state and returns true if any
props or states have changed.

If false is returned, `Component#render`, `componentWillUpdate`
and `componentDidUpdate` will not be called.

#### Parameters:

Name | Type |
:------ | :------ |
`nextProps` | *Readonly*<{}\> |
`nextState` | *Readonly*<{}\> |
`nextContext` | *any* |

**Returns:** *boolean*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:627
