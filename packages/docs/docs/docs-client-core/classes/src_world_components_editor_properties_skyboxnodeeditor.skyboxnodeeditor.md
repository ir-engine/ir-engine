---
id: "src_world_components_editor_properties_skyboxnodeeditor.skyboxnodeeditor"
title: "Class: SkyboxNodeEditor"
sidebar_label: "SkyboxNodeEditor"
custom_edit_url: null
hide_title: true
---

# Class: SkyboxNodeEditor

[src/world/components/editor/properties/SkyboxNodeEditor](../modules/src_world_components_editor_properties_skyboxnodeeditor.md).SkyboxNodeEditor

SkyboxNodeEditor component class used to render editor view to customize component property.

**`author`** Robert Long

## Hierarchy

* *Component*<SkyboxNodeEditorProps, {}\>

  ↳ **SkyboxNodeEditor**

## Constructors

### constructor

\+ **new SkyboxNodeEditor**(`props`: SkyboxNodeEditorProps \| *Readonly*<SkyboxNodeEditorProps\>): [*SkyboxNodeEditor*](src_world_components_editor_properties_skyboxnodeeditor.skyboxnodeeditor.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | SkyboxNodeEditorProps \| *Readonly*<SkyboxNodeEditorProps\> |

**Returns:** [*SkyboxNodeEditor*](src_world_components_editor_properties_skyboxnodeeditor.skyboxnodeeditor.md)

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:469

\+ **new SkyboxNodeEditor**(`props`: SkyboxNodeEditorProps, `context`: *any*): [*SkyboxNodeEditor*](src_world_components_editor_properties_skyboxnodeeditor.skyboxnodeeditor.md)

**`deprecated`** 

**`see`** https://reactjs.org/docs/legacy-context.html

#### Parameters:

Name | Type |
:------ | :------ |
`props` | SkyboxNodeEditorProps |
`context` | *any* |

**Returns:** [*SkyboxNodeEditor*](src_world_components_editor_properties_skyboxnodeeditor.skyboxnodeeditor.md)

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:471

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

### props

• `Readonly` **props**: *Readonly*<SkyboxNodeEditorProps\> & *Readonly*<{ `children?`: *boolean* \| *ReactElement*<any, string \| JSXElementConstructor<any\>\> \| ReactText \| ReactFragment \| *ReactPortal*  }\>

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

• **state**: *Readonly*<{}\>

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:495

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

### description

▪ `Static` **description**: *string*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:63](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L63)

___

### iconComponent

▪ `Static` **iconComponent**: StyledIcon

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:62](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L62)

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

▸ `Optional`**UNSAFE_componentWillReceiveProps**(`nextProps`: *Readonly*<SkyboxNodeEditorProps\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<SkyboxNodeEditorProps\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:739

___

### UNSAFE\_componentWillUpdate

▸ `Optional`**UNSAFE_componentWillUpdate**(`nextProps`: *Readonly*<SkyboxNodeEditorProps\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<SkyboxNodeEditorProps\> |
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

▸ `Optional`**componentDidUpdate**(`prevProps`: *Readonly*<SkyboxNodeEditorProps\>, `prevState`: *Readonly*<{}\>, `snapshot?`: *any*): *void*

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<SkyboxNodeEditorProps\> |
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

▸ `Optional`**componentWillReceiveProps**(`nextProps`: *Readonly*<SkyboxNodeEditorProps\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<SkyboxNodeEditorProps\> |
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

▸ `Optional`**componentWillUpdate**(`nextProps`: *Readonly*<SkyboxNodeEditorProps\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<SkyboxNodeEditorProps\> |
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

▸ `Optional`**getSnapshotBeforeUpdate**(`prevProps`: *Readonly*<SkyboxNodeEditorProps\>, `prevState`: *Readonly*<{}\>): *any*

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<SkyboxNodeEditorProps\> |
`prevState` | *Readonly*<{}\> |

**Returns:** *any*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:672

___

### onChangeAzimuth

▸ **onChangeAzimuth**(`azimuth`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`azimuth` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:96](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L96)

___

### onChangeDistance

▸ **onChangeDistance**(`distance`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`distance` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:101](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L101)

___

### onChangeInclination

▸ **onChangeInclination**(`inclination`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`inclination` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:91](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L91)

___

### onChangeLuminance

▸ **onChangeLuminance**(`luminance`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`luminance` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:76](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L76)

___

### onChangeMieCoefficient

▸ **onChangeMieCoefficient**(`mieCoefficient`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`mieCoefficient` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:81](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L81)

___

### onChangeMieDirectionalG

▸ **onChangeMieDirectionalG**(`mieDirectionalG`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`mieDirectionalG` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:86](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L86)

___

### onChangeRayleigh

▸ **onChangeRayleigh**(`rayleigh`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`rayleigh` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:71](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L71)

___

### onChangeSkyOption

▸ **onChangeSkyOption**(`skyOptionValue`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`skyOptionValue` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:106](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L106)

___

### onChangeTextureOption

▸ **onChangeTextureOption**(`textureOptionValue`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`textureOptionValue` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:116](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L116)

___

### onChangeTurbidity

▸ **onChangeTurbidity**(`turbidity`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`turbidity` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:66](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L66)

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: void

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:280](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L280)

___

### renderCubemapSettings

▸ **renderCubemapSettings**(`node`: *any*): *Element*

#### Parameters:

Name | Type |
:------ | :------ |
`node` | *any* |

**Returns:** *Element*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:251](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L251)

___

### renderEquirectangularSettings

▸ **renderEquirectangularSettings**(`node`: *any*): *Element*

#### Parameters:

Name | Type |
:------ | :------ |
`node` | *any* |

**Returns:** *Element*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:234](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L234)

___

### renderSkyBoxProps

▸ **renderSkyBoxProps**(`node`: *any*): *Element*

#### Parameters:

Name | Type |
:------ | :------ |
`node` | *any* |

**Returns:** *Element*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:268](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L268)

___

### renderSkyboxSettings

▸ **renderSkyboxSettings**(`node`: *any*): *Element*

#### Parameters:

Name | Type |
:------ | :------ |
`node` | *any* |

**Returns:** *Element*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:139](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L139)

___

### setDefaultTextureOptionValue

▸ **setDefaultTextureOptionValue**(`skyOptionValue`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`skyOptionValue` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx:124](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/SkyboxNodeEditor.tsx#L124)

___

### setState

▸ **setState**<K\>(`state`: {} \| (`prevState`: *Readonly*<{}\>, `props`: *Readonly*<SkyboxNodeEditorProps\>) => {} \| *Pick*<{}, K\> \| *Pick*<{}, K\>, `callback?`: () => *void*): *void*

#### Type parameters:

Name | Type |
:------ | :------ |
`K` | *never* |

#### Parameters:

Name | Type |
:------ | :------ |
`state` | {} \| (`prevState`: *Readonly*<{}\>, `props`: *Readonly*<SkyboxNodeEditorProps\>) => {} \| *Pick*<{}, K\> \| *Pick*<{}, K\> |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:481

___

### shouldComponentUpdate

▸ `Optional`**shouldComponentUpdate**(`nextProps`: *Readonly*<SkyboxNodeEditorProps\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *boolean*

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true.
`PureComponent` implements a shallow comparison on props and state and returns true if any
props or states have changed.

If false is returned, `Component#render`, `componentWillUpdate`
and `componentDidUpdate` will not be called.

#### Parameters:

Name | Type |
:------ | :------ |
`nextProps` | *Readonly*<SkyboxNodeEditorProps\> |
`nextState` | *Readonly*<{}\> |
`nextContext` | *any* |

**Returns:** *boolean*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:626
