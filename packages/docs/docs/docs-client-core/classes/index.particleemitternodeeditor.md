---
id: "index.particleemitternodeeditor"
title: "Class: ParticleEmitterNodeEditor"
sidebar_label: "ParticleEmitterNodeEditor"
custom_edit_url: null
hide_title: true
---

# Class: ParticleEmitterNodeEditor

[index](../modules/index.md).ParticleEmitterNodeEditor

ParticleEmitterNodeEditor provides the editor to customize properties.

**`author`** Robert Long

## Hierarchy

* *Component*<ParticleEmitterNodeEditorProps\>

  ↳ **ParticleEmitterNodeEditor**

## Constructors

### constructor

\+ **new ParticleEmitterNodeEditor**(`props`: ParticleEmitterNodeEditorProps \| *Readonly*<ParticleEmitterNodeEditorProps\>): [*ParticleEmitterNodeEditor*](src_world_components_editor_properties_particleemitternodeeditor.particleemitternodeeditor.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | ParticleEmitterNodeEditorProps \| *Readonly*<ParticleEmitterNodeEditorProps\> |

**Returns:** [*ParticleEmitterNodeEditor*](src_world_components_editor_properties_particleemitternodeeditor.particleemitternodeeditor.md)

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:469

\+ **new ParticleEmitterNodeEditor**(`props`: ParticleEmitterNodeEditorProps, `context`: *any*): [*ParticleEmitterNodeEditor*](src_world_components_editor_properties_particleemitternodeeditor.particleemitternodeeditor.md)

**`deprecated`** 

**`see`** https://reactjs.org/docs/legacy-context.html

#### Parameters:

Name | Type |
:------ | :------ |
`props` | ParticleEmitterNodeEditorProps |
`context` | *any* |

**Returns:** [*ParticleEmitterNodeEditor*](src_world_components_editor_properties_particleemitternodeeditor.particleemitternodeeditor.md)

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

• `Readonly` **props**: *Readonly*<ParticleEmitterNodeEditorProps\> & *Readonly*<{ `children?`: *boolean* \| *ReactElement*<any, string \| JSXElementConstructor<any\>\> \| ReactText \| ReactFragment \| *ReactPortal*  }\>

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

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:48](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L48)

___

### iconComponent

▪ `Static` **iconComponent**: StyledIcon

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:45](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L45)

___

### propTypes

▪ `Static` **propTypes**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`editor` | *Requireable*<object\> |
`node` | *Requireable*<object\> |

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:39](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L39)

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

▸ `Optional`**UNSAFE_componentWillReceiveProps**(`nextProps`: *Readonly*<ParticleEmitterNodeEditorProps\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<ParticleEmitterNodeEditorProps\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:739

___

### UNSAFE\_componentWillUpdate

▸ `Optional`**UNSAFE_componentWillUpdate**(`nextProps`: *Readonly*<ParticleEmitterNodeEditorProps\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<ParticleEmitterNodeEditorProps\> |
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

▸ `Optional`**componentDidUpdate**(`prevProps`: *Readonly*<ParticleEmitterNodeEditorProps\>, `prevState`: *Readonly*<{}\>, `snapshot?`: *any*): *void*

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<ParticleEmitterNodeEditorProps\> |
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

▸ `Optional`**componentWillReceiveProps**(`nextProps`: *Readonly*<ParticleEmitterNodeEditorProps\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<ParticleEmitterNodeEditorProps\> |
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

▸ `Optional`**componentWillUpdate**(`nextProps`: *Readonly*<ParticleEmitterNodeEditorProps\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<ParticleEmitterNodeEditorProps\> |
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

▸ `Optional`**getSnapshotBeforeUpdate**(`prevProps`: *Readonly*<ParticleEmitterNodeEditorProps\>, `prevState`: *Readonly*<{}\>): *any*

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<ParticleEmitterNodeEditorProps\> |
`prevState` | *Readonly*<{}\> |

**Returns:** *any*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:672

___

### onChangeAgeRandomness

▸ **onChangeAgeRandomness**(`ageRandomness`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`ageRandomness` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:153](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L153)

___

### onChangeAngularVelocity

▸ **onChangeAngularVelocity**(`angularVelocity`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`angularVelocity` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:136](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L136)

___

### onChangeColorCurve

▸ **onChangeColorCurve**(`colorCurve`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`colorCurve` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:58](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L58)

___

### onChangeEndColor

▸ **onChangeEndColor**(`endColor`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`endColor` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:79](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L79)

___

### onChangeEndOpacity

▸ **onChangeEndOpacity**(`endOpacity`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`endOpacity` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:94](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L94)

___

### onChangeEndSize

▸ **onChangeEndSize**(`endSize`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`endSize` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:115](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L115)

___

### onChangeEndVelocity

▸ **onChangeEndVelocity**(`endVelocity`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`endVelocity` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:131](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L131)

___

### onChangeLifetime

▸ **onChangeLifetime**(`lifetime`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`lifetime` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:147](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L147)

___

### onChangeLifetimeRandomness

▸ **onChangeLifetimeRandomness**(`lifetimeRandomness`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`lifetimeRandomness` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:159](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L159)

___

### onChangeMiddleColor

▸ **onChangeMiddleColor**(`middleColor`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`middleColor` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:74](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L74)

___

### onChangeMiddleOpacity

▸ **onChangeMiddleOpacity**(`middleOpacity`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`middleOpacity` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:89](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L89)

___

### onChangeParticleCount

▸ **onChangeParticleCount**(`particleCount`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`particleCount` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:141](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L141)

___

### onChangeSizeCurve

▸ **onChangeSizeCurve**(`sizeCurve`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`sizeCurve` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:104](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L104)

___

### onChangeSizeRandomness

▸ **onChangeSizeRandomness**(`sizeRandomness`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`sizeRandomness` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:120](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L120)

___

### onChangeSrc

▸ **onChangeSrc**(`src`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`src` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:99](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L99)

___

### onChangeStartColor

▸ **onChangeStartColor**(`startColor`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`startColor` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:68](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L68)

___

### onChangeStartOpacity

▸ **onChangeStartOpacity**(`startOpacity`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`startOpacity` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:84](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L84)

___

### onChangeStartSize

▸ **onChangeStartSize**(`startSize`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`startSize` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:109](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L109)

___

### onChangeStartVelocity

▸ **onChangeStartVelocity**(`startVelocity`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`startVelocity` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:126](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L126)

___

### onChangeVelocityCurve

▸ **onChangeVelocityCurve**(`velocityCurve`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`velocityCurve` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:63](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L63)

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: void

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:165](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L165)

___

### setState

▸ **setState**<K\>(`state`: {} \| (`prevState`: *Readonly*<{}\>, `props`: *Readonly*<ParticleEmitterNodeEditorProps\>) => {} \| *Pick*<{}, K\> \| *Pick*<{}, K\>, `callback?`: () => *void*): *void*

#### Type parameters:

Name | Type |
:------ | :------ |
`K` | *never* |

#### Parameters:

Name | Type |
:------ | :------ |
`state` | {} \| (`prevState`: *Readonly*<{}\>, `props`: *Readonly*<ParticleEmitterNodeEditorProps\>) => {} \| *Pick*<{}, K\> \| *Pick*<{}, K\> |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:481

___

### shouldComponentUpdate

▸ `Optional`**shouldComponentUpdate**(`nextProps`: *Readonly*<ParticleEmitterNodeEditorProps\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *boolean*

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true.
`PureComponent` implements a shallow comparison on props and state and returns true if any
props or states have changed.

If false is returned, `Component#render`, `componentWillUpdate`
and `componentDidUpdate` will not be called.

#### Parameters:

Name | Type |
:------ | :------ |
`nextProps` | *Readonly*<ParticleEmitterNodeEditorProps\> |
`nextState` | *Readonly*<{}\> |
`nextContext` | *any* |

**Returns:** *boolean*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:626

___

### updateParticles

▸ **updateParticles**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx:51](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/properties/ParticleEmitterNodeEditor.tsx#L51)
