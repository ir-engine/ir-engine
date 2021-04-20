---
id: "src_world_components_editor_properties_transformpropertygroup.transformpropertygroup"
title: "Class: TransformPropertyGroup"
sidebar_label: "TransformPropertyGroup"
custom_edit_url: null
hide_title: true
---

# Class: TransformPropertyGroup

[src/world/components/editor/properties/TransformPropertyGroup](../modules/src_world_components_editor_properties_transformpropertygroup.md).TransformPropertyGroup

TransformPropertyGroup component is used to render editor view to customize properties.

**`author`** Robert Long

## Hierarchy

* *Component*<TransformPropertyGroupProps, {}\>

  ↳ **TransformPropertyGroup**

## Constructors

### constructor

\+ **new TransformPropertyGroup**(`props`: *any*): [*TransformPropertyGroup*](src_world_components_editor_properties_transformpropertygroup.transformpropertygroup.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *any* |

**Returns:** [*TransformPropertyGroup*](src_world_components_editor_properties_transformpropertygroup.transformpropertygroup.md)

Overrides: Component&lt;
  TransformPropertyGroupProps,
  {}
&gt;.constructor

Defined in: [packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx:31](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx#L31)

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

Inherited from: Component.context

Defined in: node_modules/@types/react/index.d.ts:469

___

### props

• `Readonly` **props**: *Readonly*<TransformPropertyGroupProps\> & *Readonly*<{ `children?`: ReactNode  }\>

Inherited from: Component.props

Defined in: node_modules/@types/react/index.d.ts:494

___

### refs

• **refs**: *object*

**`deprecated`** 
https://reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs

#### Type declaration:

Inherited from: Component.refs

Defined in: node_modules/@types/react/index.d.ts:500

___

### state

• **state**: *Readonly*<{}\>

Inherited from: Component.state

Defined in: node_modules/@types/react/index.d.ts:495

___

### translation

• **translation**: *any*

Defined in: [packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx:55](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx#L55)

___

### contextType

▪ `Static` `Optional` **contextType**: *Context*<any\>

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

Inherited from: Component.contextType

Defined in: node_modules/@types/react/index.d.ts:451

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

Inherited from: Component.UNSAFE_componentWillMount

Defined in: node_modules/@types/react/index.d.ts:707

___

### UNSAFE\_componentWillReceiveProps

▸ `Optional`**UNSAFE_componentWillReceiveProps**(`nextProps`: *Readonly*<TransformPropertyGroupProps\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<TransformPropertyGroupProps\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: Component.UNSAFE_componentWillReceiveProps

Defined in: node_modules/@types/react/index.d.ts:739

___

### UNSAFE\_componentWillUpdate

▸ `Optional`**UNSAFE_componentWillUpdate**(`nextProps`: *Readonly*<TransformPropertyGroupProps\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<TransformPropertyGroupProps\> |
`nextState` | *Readonly*<{}\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: Component.UNSAFE_componentWillUpdate

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

Inherited from: Component.componentDidCatch

Defined in: node_modules/@types/react/index.d.ts:636

___

### componentDidMount

▸ **componentDidMount**(): *void*

**Returns:** *void*

Overrides: Component.componentDidMount

Defined in: [packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx:40](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx#L40)

___

### componentDidUpdate

▸ `Optional`**componentDidUpdate**(`prevProps`: *Readonly*<TransformPropertyGroupProps\>, `prevState`: *Readonly*<{}\>, `snapshot?`: *any*): *void*

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<TransformPropertyGroupProps\> |
`prevState` | *Readonly*<{}\> |
`snapshot?` | *any* |

**Returns:** *void*

Inherited from: Component.componentDidUpdate

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

Inherited from: Component.componentWillMount

Defined in: node_modules/@types/react/index.d.ts:693

___

### componentWillReceiveProps

▸ `Optional`**componentWillReceiveProps**(`nextProps`: *Readonly*<TransformPropertyGroupProps\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<TransformPropertyGroupProps\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: Component.componentWillReceiveProps

Defined in: node_modules/@types/react/index.d.ts:722

___

### componentWillUnmount

▸ **componentWillUnmount**(): *void*

**Returns:** *void*

Overrides: Component.componentWillUnmount

Defined in: [packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx:50](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx#L50)

___

### componentWillUpdate

▸ `Optional`**componentWillUpdate**(`nextProps`: *Readonly*<TransformPropertyGroupProps\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<TransformPropertyGroupProps\> |
`nextState` | *Readonly*<{}\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: Component.componentWillUpdate

Defined in: node_modules/@types/react/index.d.ts:752

___

### forceUpdate

▸ **forceUpdate**(`callback?`: () => *void*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: Component.forceUpdate

Defined in: node_modules/@types/react/index.d.ts:486

___

### getSnapshotBeforeUpdate

▸ `Optional`**getSnapshotBeforeUpdate**(`prevProps`: *Readonly*<TransformPropertyGroupProps\>, `prevState`: *Readonly*<{}\>): *any*

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<TransformPropertyGroupProps\> |
`prevState` | *Readonly*<{}\> |

**Returns:** *any*

Inherited from: Component.getSnapshotBeforeUpdate

Defined in: node_modules/@types/react/index.d.ts:672

___

### onChangePosition

▸ **onChangePosition**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx:75](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx#L75)

___

### onChangeRotation

▸ **onChangeRotation**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx:81](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx#L81)

___

### onChangeScale

▸ **onChangeScale**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx:86](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx#L86)

___

### onObjectsChanged

▸ **onObjectsChanged**(`objects`: *any*, `property`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`objects` | *any* |
`property` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx:58](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx#L58)

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: Component.render

Defined in: [packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx:91](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx#L91)

___

### setState

▸ **setState**<K\>(`state`: {} \| (`prevState`: *Readonly*<{}\>, `props`: *Readonly*<TransformPropertyGroupProps\>) => {} \| *Pick*<{}, K\> \| *Pick*<{}, K\>, `callback?`: () => *void*): *void*

#### Type parameters:

Name | Type |
:------ | :------ |
`K` | *never* |

#### Parameters:

Name | Type |
:------ | :------ |
`state` | {} \| (`prevState`: *Readonly*<{}\>, `props`: *Readonly*<TransformPropertyGroupProps\>) => {} \| *Pick*<{}, K\> \| *Pick*<{}, K\> |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: Component.setState

Defined in: node_modules/@types/react/index.d.ts:481

___

### shouldComponentUpdate

▸ **shouldComponentUpdate**(`nextProps`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`nextProps` | *any* |

**Returns:** *boolean*

Overrides: Component.shouldComponentUpdate

Defined in: [packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx:45](https://github.com/xr3ngine/xr3ngine/blob/65dfcf39a/packages/client-core/src/world/components/editor/properties/TransformPropertyGroup.tsx#L45)
