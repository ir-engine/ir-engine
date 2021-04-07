---
id: "components_editor_properties_triggervolumenodeeditor.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[components/editor/properties/TriggerVolumeNodeEditor](../modules/components_editor_properties_triggervolumenodeeditor.md).default

[TriggerVolumeNodeEditor provides the editor view to customize properties]

## Hierarchy

* *Component*<TriggerVolumeNodeEditorProps, TriggerVolumeNodeEditorState\>

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`props`: *any*): [*default*](components_editor_properties_triggervolumenodeeditor.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *any* |

**Returns:** [*default*](components_editor_properties_triggervolumenodeeditor.default.md)

Overrides: void

Defined in: [packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx:61](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx#L61)

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

• `Readonly` **props**: *Readonly*<TriggerVolumeNodeEditorProps\> & *Readonly*<{ `children?`: *boolean* \| *ReactElement*<any, string \| JSXElementConstructor<any\>\> \| ReactText \| ReactFragment \| *ReactPortal*  }\>

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

• **state**: *Readonly*<TriggerVolumeNodeEditorState\>

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:498

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

### description

▪ `Static` **description**: *string*= "Sets a property on the target object on enter and leave."

Defined in: [packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx:87](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx#L87)

___

### iconComponent

▪ `Static` **iconComponent**: StyledIcon

Defined in: [packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx:84](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx#L84)

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

▸ `Optional`**UNSAFE_componentWillReceiveProps**(`nextProps`: *Readonly*<TriggerVolumeNodeEditorProps\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<TriggerVolumeNodeEditorProps\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:740

___

### UNSAFE\_componentWillUpdate

▸ `Optional`**UNSAFE_componentWillUpdate**(`nextProps`: *Readonly*<TriggerVolumeNodeEditorProps\>, `nextState`: *Readonly*<TriggerVolumeNodeEditorState\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<TriggerVolumeNodeEditorProps\> |
`nextState` | *Readonly*<TriggerVolumeNodeEditorState\> |
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

Defined in: [packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx:72](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx#L72)

___

### componentDidUpdate

▸ `Optional`**componentDidUpdate**(`prevProps`: *Readonly*<TriggerVolumeNodeEditorProps\>, `prevState`: *Readonly*<TriggerVolumeNodeEditorState\>, `snapshot?`: *any*): *void*

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<TriggerVolumeNodeEditorProps\> |
`prevState` | *Readonly*<TriggerVolumeNodeEditorState\> |
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

▸ `Optional`**componentWillReceiveProps**(`nextProps`: *Readonly*<TriggerVolumeNodeEditorProps\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<TriggerVolumeNodeEditorProps\> |
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

▸ `Optional`**componentWillUpdate**(`nextProps`: *Readonly*<TriggerVolumeNodeEditorProps\>, `nextState`: *Readonly*<TriggerVolumeNodeEditorState\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<TriggerVolumeNodeEditorProps\> |
`nextState` | *Readonly*<TriggerVolumeNodeEditorState\> |
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

▸ `Optional`**getSnapshotBeforeUpdate**(`prevProps`: *Readonly*<TriggerVolumeNodeEditorProps\>, `prevState`: *Readonly*<TriggerVolumeNodeEditorState\>): *any*

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<TriggerVolumeNodeEditorProps\> |
`prevState` | *Readonly*<TriggerVolumeNodeEditorState\> |

**Returns:** *any*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:673

___

### onChangeEnterComponent

▸ **onChangeEnterComponent**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx:103](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx#L103)

___

### onChangeEnterProperty

▸ **onChangeEnterProperty**(`value`: *any*, `option`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |
`option` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx:112](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx#L112)

___

### onChangeEnterValue

▸ **onChangeEnterValue**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx:120](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx#L120)

___

### onChangeLeaveComponent

▸ **onChangeLeaveComponent**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx:125](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx#L125)

___

### onChangeLeaveProperty

▸ **onChangeLeaveProperty**(`value`: *any*, `option`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |
`option` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx:135](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx#L135)

___

### onChangeLeaveValue

▸ **onChangeLeaveValue**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx:143](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx#L143)

___

### onChangeTarget

▸ **onChangeTarget**(`target`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`target` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx:90](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx#L90)

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: void

Defined in: [packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx:149](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/TriggerVolumeNodeEditor.tsx#L149)

___

### setState

▸ **setState**<K\>(`state`: TriggerVolumeNodeEditorState \| (`prevState`: *Readonly*<TriggerVolumeNodeEditorState\>, `props`: *Readonly*<TriggerVolumeNodeEditorProps\>) => TriggerVolumeNodeEditorState \| *Pick*<TriggerVolumeNodeEditorState, K\> \| *Pick*<TriggerVolumeNodeEditorState, K\>, `callback?`: () => *void*): *void*

#### Type parameters:

Name | Type |
:------ | :------ |
`K` | *options* |

#### Parameters:

Name | Type |
:------ | :------ |
`state` | TriggerVolumeNodeEditorState \| (`prevState`: *Readonly*<TriggerVolumeNodeEditorState\>, `props`: *Readonly*<TriggerVolumeNodeEditorProps\>) => TriggerVolumeNodeEditorState \| *Pick*<TriggerVolumeNodeEditorState, K\> \| *Pick*<TriggerVolumeNodeEditorState, K\> |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:484

___

### shouldComponentUpdate

▸ `Optional`**shouldComponentUpdate**(`nextProps`: *Readonly*<TriggerVolumeNodeEditorProps\>, `nextState`: *Readonly*<TriggerVolumeNodeEditorState\>, `nextContext`: *any*): *boolean*

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true.
`PureComponent` implements a shallow comparison on props and state and returns true if any
props or states have changed.

If false is returned, `Component#render`, `componentWillUpdate`
and `componentDidUpdate` will not be called.

#### Parameters:

Name | Type |
:------ | :------ |
`nextProps` | *Readonly*<TriggerVolumeNodeEditorProps\> |
`nextState` | *Readonly*<TriggerVolumeNodeEditorState\> |
`nextContext` | *any* |

**Returns:** *boolean*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:627
