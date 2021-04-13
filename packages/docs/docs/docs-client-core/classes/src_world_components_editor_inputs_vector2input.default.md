---
id: "src_world_components_editor_inputs_vector2input.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[src/world/components/editor/inputs/Vector2Input](../modules/src_world_components_editor_inputs_vector2input.md).default

**`author`** Robert Long

## Hierarchy

* *Component*

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`props`: *any*): [*default*](src_world_components_editor_inputs_vector2input.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *any* |

**Returns:** [*default*](src_world_components_editor_inputs_vector2input.default.md)

Overrides: void

Defined in: [packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx:59](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx#L59)

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

### id

• **id**: *number*

Defined in: [packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx:78](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx#L78)

___

### newValue

• **newValue**: *any*

Defined in: [packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx:79](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx#L79)

___

### props

• `Readonly` **props**: *Readonly*<{}\> & *Readonly*<{ `children?`: *boolean* \| *ReactElement*<any, string \| JSXElementConstructor<any\>\> \| ReactText \| ReactFragment \| *ReactPortal*  }\>

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

• **state**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`uniformEnabled` | *any* |
`value` | *any* |

Overrides: void

Defined in: [packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx#L74)

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
`onChange` | () => *void* |
`value` | *any* |

Defined in: [packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx:56](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx#L56)

___

### propTypes

▪ `Static` **propTypes**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`onChange` | *Requireable*<(...`args`: *any*[]) => *any*\> |
`uniformScaling` | *Requireable*<boolean\> |
`value` | *Requireable*<object\> |

Defined in: [packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx:50](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx#L50)

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

Defined in: node_modules/@types/react/index.d.ts:739

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

Defined in: node_modules/@types/react/index.d.ts:767

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

▸ `Optional`**componentDidMount**(): *void*

Called immediately after a component is mounted. Setting state here will trigger re-rendering.

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:615

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

Defined in: node_modules/@types/react/index.d.ts:722

___

### componentWillUnmount

▸ `Optional`**componentWillUnmount**(): *void*

Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:631

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

Defined in: node_modules/@types/react/index.d.ts:752

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

Defined in: node_modules/@types/react/index.d.ts:672

___

### onChange

▸ **onChange**(`field`: *any*, `fieldValue`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`field` | *any* |
`fieldValue` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx:85](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx#L85)

___

### onChangeX

▸ **onChangeX**(`x`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`x` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx:101](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx#L101)

___

### onChangeY

▸ **onChangeY**(`y`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`y` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx:103](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx#L103)

___

### onToggleUniform

▸ **onToggleUniform**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx:81](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx#L81)

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: void

Defined in: [packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx:105](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/inputs/Vector2Input.tsx#L105)

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

Defined in: node_modules/@types/react/index.d.ts:481

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

Defined in: node_modules/@types/react/index.d.ts:626
