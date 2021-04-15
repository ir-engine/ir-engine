---
id: "src_world_components_editor_properties_modelnodeeditor.modelnodeeditor"
title: "Class: ModelNodeEditor"
sidebar_label: "ModelNodeEditor"
custom_edit_url: null
hide_title: true
---

# Class: ModelNodeEditor

[src/world/components/editor/properties/ModelNodeEditor](../modules/src_world_components_editor_properties_modelnodeeditor.md).ModelNodeEditor

ModelNodeEditor used to create editor view for the properties of ModelNode.

**`author`** Robert Long

## Hierarchy

* *Component*<ModelNodeEditorProps, ModelNodeEditorState\>

  ↳ **ModelNodeEditor**

## Constructors

### constructor

\+ **new ModelNodeEditor**(`props`: *any*): [*ModelNodeEditor*](src_world_components_editor_properties_modelnodeeditor.modelnodeeditor.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *any* |

**Returns:** [*ModelNodeEditor*](src_world_components_editor_properties_modelnodeeditor.modelnodeeditor.md)

Overrides: Component&lt;
  ModelNodeEditorProps,
  ModelNodeEditorState
&gt;.constructor

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:65](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L65)

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

• `Readonly` **props**: *Readonly*<ModelNodeEditorProps\> & *Readonly*<{ `children?`: ReactNode  }\>

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

• **state**: *Readonly*<ModelNodeEditorState\>

Inherited from: Component.state

Defined in: node_modules/@types/react/index.d.ts:495

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

___

### description

▪ `Static` **description**: *string*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:87](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L87)

___

### iconComponent

▪ `Static` **iconComponent**: StyledIcon

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:90](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L90)

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

Inherited from: Component.UNSAFE_componentWillReceiveProps

Defined in: node_modules/@types/react/index.d.ts:739

___

### UNSAFE\_componentWillUpdate

▸ `Optional`**UNSAFE_componentWillUpdate**(`nextProps`: *Readonly*<ModelNodeEditorProps\>, `nextState`: *Readonly*<ModelNodeEditorState\>, `nextContext`: *any*): *void*

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
`nextState` | *Readonly*<ModelNodeEditorState\> |
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

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:75](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L75)

___

### componentDidUpdate

▸ `Optional`**componentDidUpdate**(`prevProps`: *Readonly*<ModelNodeEditorProps\>, `prevState`: *Readonly*<ModelNodeEditorState\>, `snapshot?`: *any*): *void*

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<ModelNodeEditorProps\> |
`prevState` | *Readonly*<ModelNodeEditorState\> |
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

Inherited from: Component.componentWillReceiveProps

Defined in: node_modules/@types/react/index.d.ts:722

___

### componentWillUnmount

▸ `Optional`**componentWillUnmount**(): *void*

Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.

**Returns:** *void*

Inherited from: Component.componentWillUnmount

Defined in: node_modules/@types/react/index.d.ts:631

___

### componentWillUpdate

▸ `Optional`**componentWillUpdate**(`nextProps`: *Readonly*<ModelNodeEditorProps\>, `nextState`: *Readonly*<ModelNodeEditorState\>, `nextContext`: *any*): *void*

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
`nextState` | *Readonly*<ModelNodeEditorState\> |
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

▸ `Optional`**getSnapshotBeforeUpdate**(`prevProps`: *Readonly*<ModelNodeEditorProps\>, `prevState`: *Readonly*<ModelNodeEditorState\>): *any*

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<ModelNodeEditorProps\> |
`prevState` | *Readonly*<ModelNodeEditorState\> |

**Returns:** *any*

Inherited from: Component.getSnapshotBeforeUpdate

Defined in: node_modules/@types/react/index.d.ts:672

___

### isAnimationPropertyDisabled

▸ **isAnimationPropertyDisabled**(): *any*

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:182](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L182)

___

### onChangeAnimation

▸ **onChangeAnimation**(`activeClipIndex`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`activeClipIndex` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:100](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L100)

___

### onChangeCastShadow

▸ **onChangeCastShadow**(`castShadow`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`castShadow` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:120](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L120)

___

### onChangeCollidable

▸ **onChangeCollidable**(`collidable`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`collidable` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:105](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L105)

___

### onChangeInteractable

▸ **onChangeInteractable**(`interactable`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`interactable` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:130](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L130)

___

### onChangeInteractionText

▸ **onChangeInteractionText**(`interactionText`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`interactionText` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:140](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L140)

___

### onChangeInteractionType

▸ **onChangeInteractionType**(`interactionType`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`interactionType` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:135](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L135)

___

### onChangePayloadBuyUrl

▸ **onChangePayloadBuyUrl**(`payloadBuyUrl`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`payloadBuyUrl` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:167](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L167)

___

### onChangePayloadHtmlContent

▸ **onChangePayloadHtmlContent**(`payloadHtmlContent`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`payloadHtmlContent` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:177](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L177)

___

### onChangePayloadLearnMoreUrl

▸ **onChangePayloadLearnMoreUrl**(`payloadLearnMoreUrl`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`payloadLearnMoreUrl` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:172](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L172)

___

### onChangePayloadName

▸ **onChangePayloadName**(`payloadName`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`payloadName` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:145](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L145)

___

### onChangePayloadUrl

▸ **onChangePayloadUrl**(`payloadUrl`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`payloadUrl` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:162](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L162)

___

### onChangeReceiveShadow

▸ **onChangeReceiveShadow**(`receiveShadow`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`receiveShadow` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:125](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L125)

___

### onChangeRole

▸ **onChangeRole**(`role`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`role` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:150](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L150)

___

### onChangeSaveColliders

▸ **onChangeSaveColliders**(`saveColliders`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`saveColliders` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:110](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L110)

___

### onChangeSrc

▸ **onChangeSrc**(`src`: *any*, `initialProps`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |
`initialProps` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:93](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L93)

___

### onChangeTarget

▸ **onChangeTarget**(`target`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`target` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:155](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L155)

___

### onChangeWalkable

▸ **onChangeWalkable**(`walkable`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`walkable` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:115](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L115)

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: Component.render

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:333](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L333)

___

### renderInteractableDependantFields

▸ **renderInteractableDependantFields**(`node`: *any*): *Element*

#### Parameters:

Name | Type |
:------ | :------ |
`node` | *any* |

**Returns:** *Element*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:305](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L305)

___

### renderInteractableTypeOptions

▸ **renderInteractableTypeOptions**(`node`: *any*): *Element*

#### Parameters:

Name | Type |
:------ | :------ |
`node` | *any* |

**Returns:** *Element*

Defined in: [packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx:193](https://github.com/xr3ngine/xr3ngine/blob/673ad6a5f/packages/client-core/src/world/components/editor/properties/ModelNodeEditor.tsx#L193)

___

### setState

▸ **setState**<K\>(`state`: ModelNodeEditorState \| (`prevState`: *Readonly*<ModelNodeEditorState\>, `props`: *Readonly*<ModelNodeEditorProps\>) => ModelNodeEditorState \| *Pick*<ModelNodeEditorState, K\> \| *Pick*<ModelNodeEditorState, K\>, `callback?`: () => *void*): *void*

#### Type parameters:

Name | Type |
:------ | :------ |
`K` | *options* |

#### Parameters:

Name | Type |
:------ | :------ |
`state` | ModelNodeEditorState \| (`prevState`: *Readonly*<ModelNodeEditorState\>, `props`: *Readonly*<ModelNodeEditorProps\>) => ModelNodeEditorState \| *Pick*<ModelNodeEditorState, K\> \| *Pick*<ModelNodeEditorState, K\> |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: Component.setState

Defined in: node_modules/@types/react/index.d.ts:481

___

### shouldComponentUpdate

▸ `Optional`**shouldComponentUpdate**(`nextProps`: *Readonly*<ModelNodeEditorProps\>, `nextState`: *Readonly*<ModelNodeEditorState\>, `nextContext`: *any*): *boolean*

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
`nextState` | *Readonly*<ModelNodeEditorState\> |
`nextContext` | *any* |

**Returns:** *boolean*

Inherited from: Component.shouldComponentUpdate

Defined in: node_modules/@types/react/index.d.ts:626
