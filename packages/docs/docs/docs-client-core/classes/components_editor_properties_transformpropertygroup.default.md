---
id: "components_editor_properties_transformpropertygroup.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[components/editor/properties/TransformPropertyGroup](../modules/components_editor_properties_transformpropertygroup.md).default

[TransformPropertyGroup component is used to render editor view to customize properties]

## Hierarchy

* *Component*<TransformPropertyGroupProps, {}\>

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`props`: *any*): [*default*](components_editor_properties_transformpropertygroup.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *any* |

**Returns:** [*default*](components_editor_properties_transformpropertygroup.default.md)

Overrides: void

Defined in: [packages/client-core/components/editor/properties/TransformPropertyGroup.tsx:24](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TransformPropertyGroup.tsx#L24)

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

• `Readonly` **props**: *Readonly*<TransformPropertyGroupProps\> & *Readonly*<{ `children?`: *boolean* \| *ReactElement*<any, string \| JSXElementConstructor<any\>\> \| ReactText \| ReactFragment \| *ReactPortal*  }\>

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

### translation

• **translation**: *Vector3*

Defined in: [packages/client-core/components/editor/properties/TransformPropertyGroup.tsx:48](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TransformPropertyGroup.tsx#L48)

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

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:740

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

Defined in: [packages/client-core/components/editor/properties/TransformPropertyGroup.tsx:33](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TransformPropertyGroup.tsx#L33)

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

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:723

___

### componentWillUnmount

▸ **componentWillUnmount**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/client-core/components/editor/properties/TransformPropertyGroup.tsx:43](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TransformPropertyGroup.tsx#L43)

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

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:673

___

### onChangePosition

▸ **onChangePosition**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/TransformPropertyGroup.tsx:68](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TransformPropertyGroup.tsx#L68)

___

### onChangeRotation

▸ **onChangeRotation**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/TransformPropertyGroup.tsx:74](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TransformPropertyGroup.tsx#L74)

___

### onChangeScale

▸ **onChangeScale**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/TransformPropertyGroup.tsx:79](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TransformPropertyGroup.tsx#L79)

___

### onObjectsChanged

▸ **onObjectsChanged**(`objects`: *any*, `property`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`objects` | *any* |
`property` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/TransformPropertyGroup.tsx:51](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TransformPropertyGroup.tsx#L51)

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: void

Defined in: [packages/client-core/components/editor/properties/TransformPropertyGroup.tsx:84](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TransformPropertyGroup.tsx#L84)

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

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:484

___

### shouldComponentUpdate

▸ **shouldComponentUpdate**(`nextProps`: *any*): *boolean*

#### Parameters:

Name | Type |
:------ | :------ |
`nextProps` | *any* |

**Returns:** *boolean*

Overrides: void

Defined in: [packages/client-core/components/editor/properties/TransformPropertyGroup.tsx:38](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TransformPropertyGroup.tsx#L38)
