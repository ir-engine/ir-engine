---
id: "components_editor_properties_modelnodeeditor.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[components/editor/properties/ModelNodeEditor](../modules/components_editor_properties_modelnodeeditor.md).default

[ModelNodeEditor used to create editor view for the properties of ModelNode]

## Hierarchy

* *Component*<ModelNodeEditorProps, {}\>

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`props`: ModelNodeEditorProps \| *Readonly*<ModelNodeEditorProps\>): [*default*](components_editor_properties_modelnodeeditor.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | ModelNodeEditorProps \| *Readonly*<ModelNodeEditorProps\> |

**Returns:** [*default*](components_editor_properties_modelnodeeditor.default.md)

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:472

\+ **new default**(`props`: ModelNodeEditorProps, `context`: *any*): [*default*](components_editor_properties_modelnodeeditor.default.md)

**`deprecated`** 

**`see`** https://reactjs.org/docs/legacy-context.html

#### Parameters:

Name | Type |
:------ | :------ |
`props` | ModelNodeEditorProps |
`context` | *any* |

**Returns:** [*default*](components_editor_properties_modelnodeeditor.default.md)

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

• `Readonly` **props**: *Readonly*<ModelNodeEditorProps\> & *Readonly*<{ `children?`: *boolean* \| *ReactElement*<any, string \| JSXElementConstructor<any\>\> \| ReactText \| ReactFragment \| *ReactPortal*  }\>

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

▪ `Static` **description**: *string*= "A 3D model in your scene, loaded from a GLTF URL or file."

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:53](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L53)

___

### iconComponent

▪ `Static` **iconComponent**: StyledIcon

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:50](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L50)

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

▸ `Optional`**UNSAFE_componentWillReceiveProps**(`nextProps`: *Readonly*<ModelNodeEditorProps\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<ModelNodeEditorProps\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:740

___

### UNSAFE\_componentWillUpdate

▸ `Optional`**UNSAFE_componentWillUpdate**(`nextProps`: *Readonly*<ModelNodeEditorProps\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<ModelNodeEditorProps\> |
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

▸ `Optional`**componentDidUpdate**(`prevProps`: *Readonly*<ModelNodeEditorProps\>, `prevState`: *Readonly*<{}\>, `snapshot?`: *any*): *void*

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<ModelNodeEditorProps\> |
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

▸ `Optional`**componentWillReceiveProps**(`nextProps`: *Readonly*<ModelNodeEditorProps\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<ModelNodeEditorProps\> |
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

▸ `Optional`**componentWillUpdate**(`nextProps`: *Readonly*<ModelNodeEditorProps\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<ModelNodeEditorProps\> |
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

▸ `Optional`**getSnapshotBeforeUpdate**(`prevProps`: *Readonly*<ModelNodeEditorProps\>, `prevState`: *Readonly*<{}\>): *any*

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<ModelNodeEditorProps\> |
`prevState` | *Readonly*<{}\> |

**Returns:** *any*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:673

___

### isAnimationPropertyDisabled

▸ **isAnimationPropertyDisabled**(): *any*

**Returns:** *any*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:131](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L131)

___

### onChangeAnimation

▸ **onChangeAnimation**(`activeClipIndex`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`activeClipIndex` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:61](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L61)

___

### onChangeCastShadow

▸ **onChangeCastShadow**(`castShadow`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`castShadow` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:81](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L81)

___

### onChangeCollidable

▸ **onChangeCollidable**(`collidable`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`collidable` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:66](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L66)

___

### onChangeInteractable

▸ **onChangeInteractable**(`interactable`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`interactable` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:91](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L91)

___

### onChangeInteractionText

▸ **onChangeInteractionText**(`interactionText`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`interactionText` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:101](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L101)

___

### onChangeInteractionType

▸ **onChangeInteractionType**(`interactionType`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`interactionType` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:96](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L96)

___

### onChangePayloadBuyUrl

▸ **onChangePayloadBuyUrl**(`payloadBuyUrl`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`payloadBuyUrl` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:116](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L116)

___

### onChangePayloadHtmlContent

▸ **onChangePayloadHtmlContent**(`payloadHtmlContent`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`payloadHtmlContent` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:126](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L126)

___

### onChangePayloadLearnMoreUrl

▸ **onChangePayloadLearnMoreUrl**(`payloadLearnMoreUrl`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`payloadLearnMoreUrl` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:121](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L121)

___

### onChangePayloadName

▸ **onChangePayloadName**(`payloadName`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`payloadName` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:106](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L106)

___

### onChangePayloadUrl

▸ **onChangePayloadUrl**(`payloadUrl`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`payloadUrl` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:111](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L111)

___

### onChangeReceiveShadow

▸ **onChangeReceiveShadow**(`receiveShadow`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`receiveShadow` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:86](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L86)

___

### onChangeSaveColliders

▸ **onChangeSaveColliders**(`saveColliders`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`saveColliders` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:71](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L71)

___

### onChangeSrc

▸ **onChangeSrc**(`src`: *any*, `initialProps`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |
`initialProps` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:56](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L56)

___

### onChangeWalkable

▸ **onChangeWalkable**(`walkable`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`walkable` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:76](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L76)

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: void

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:219](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L219)

___

### renderInteractableDependantFields

▸ **renderInteractableDependantFields**(`node`: *any*): *Element*

#### Parameters:

Name | Type |
:------ | :------ |
`node` | *any* |

**Returns:** *Element*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:191](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L191)

___

### renderInteractableTypeOptions

▸ **renderInteractableTypeOptions**(`node`: *any*): *Element*

#### Parameters:

Name | Type |
:------ | :------ |
`node` | *any* |

**Returns:** *Element*

Defined in: [packages/client-core/components/editor/properties/ModelNodeEditor.tsx:142](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/properties/ModelNodeEditor.tsx#L142)

___

### setState

▸ **setState**<K\>(`state`: {} \| (`prevState`: *Readonly*<{}\>, `props`: *Readonly*<ModelNodeEditorProps\>) => {} \| *Pick*<{}, K\> \| *Pick*<{}, K\>, `callback?`: () => *void*): *void*

#### Type parameters:

Name | Type |
:------ | :------ |
`K` | *never* |

#### Parameters:

Name | Type |
:------ | :------ |
`state` | {} \| (`prevState`: *Readonly*<{}\>, `props`: *Readonly*<ModelNodeEditorProps\>) => {} \| *Pick*<{}, K\> \| *Pick*<{}, K\> |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:484

___

### shouldComponentUpdate

▸ `Optional`**shouldComponentUpdate**(`nextProps`: *Readonly*<ModelNodeEditorProps\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *boolean*

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true.
`PureComponent` implements a shallow comparison on props and state and returns true if any
props or states have changed.

If false is returned, `Component#render`, `componentWillUpdate`
and `componentDidUpdate` will not be called.

#### Parameters:

Name | Type |
:------ | :------ |
`nextProps` | *Readonly*<ModelNodeEditorProps\> |
`nextState` | *Readonly*<{}\> |
`nextContext` | *any* |

**Returns:** *boolean*

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:627
