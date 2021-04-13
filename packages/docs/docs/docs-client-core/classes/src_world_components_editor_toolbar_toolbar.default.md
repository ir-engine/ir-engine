---
id: "src_world_components_editor_toolbar_toolbar.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[src/world/components/editor/toolbar/ToolBar](../modules/src_world_components_editor_toolbar_toolbar.md).default

**`author`** Robert Long

## Hierarchy

* *Component*<ToolBarProps, ToolBarState\>

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`props`: *any*): [*default*](src_world_components_editor_toolbar_toolbar.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *any* |

**Returns:** [*default*](src_world_components_editor_toolbar_toolbar.default.md)

Overrides: Component&lt;ToolBarProps, ToolBarState&gt;.constructor

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:320](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L320)

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

• `Readonly` **props**: *Readonly*<ToolBarProps\> & *Readonly*<{ `children?`: ReactNode  }\>

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

• **state**: *Readonly*<ToolBarState\>

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

### propTypes

▪ `Static` **propTypes**: *object*

#### Type declaration:

Name | Type |
:------ | :------ |
`editor` | *Requireable*<object\> |
`isPublishedScene` | *Requireable*<boolean\> |
`menu` | *Requireable*<any[]\> |
`onOpenScene` | *Requireable*<(...`args`: *any*[]) => *any*\> |
`onPublish` | *Requireable*<(...`args`: *any*[]) => *any*\> |
`queryParams` | *Requireable*<object\> |

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:313](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L313)

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

▸ `Optional`**UNSAFE_componentWillReceiveProps**(`nextProps`: *Readonly*<ToolBarProps\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<ToolBarProps\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: Component.UNSAFE_componentWillReceiveProps

Defined in: node_modules/@types/react/index.d.ts:739

___

### UNSAFE\_componentWillUpdate

▸ `Optional`**UNSAFE_componentWillUpdate**(`nextProps`: *Readonly*<ToolBarProps\>, `nextState`: *Readonly*<ToolBarState\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<ToolBarProps\> |
`nextState` | *Readonly*<ToolBarState\> |
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

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:334](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L334)

___

### componentDidUpdate

▸ `Optional`**componentDidUpdate**(`prevProps`: *Readonly*<ToolBarProps\>, `prevState`: *Readonly*<ToolBarState\>, `snapshot?`: *any*): *void*

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<ToolBarProps\> |
`prevState` | *Readonly*<ToolBarState\> |
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

▸ `Optional`**componentWillReceiveProps**(`nextProps`: *Readonly*<ToolBarProps\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<ToolBarProps\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: Component.componentWillReceiveProps

Defined in: node_modules/@types/react/index.d.ts:722

___

### componentWillUnmount

▸ **componentWillUnmount**(): *void*

**Returns:** *void*

Overrides: Component.componentWillUnmount

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:341](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L341)

___

### componentWillUpdate

▸ `Optional`**componentWillUpdate**(`nextProps`: *Readonly*<ToolBarProps\>, `nextState`: *Readonly*<ToolBarState\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<ToolBarProps\> |
`nextState` | *Readonly*<ToolBarState\> |
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

▸ `Optional`**getSnapshotBeforeUpdate**(`prevProps`: *Readonly*<ToolBarProps\>, `prevState`: *Readonly*<ToolBarState\>): *any*

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<ToolBarProps\> |
`prevState` | *Readonly*<ToolBarState\> |

**Returns:** *any*

Inherited from: Component.getSnapshotBeforeUpdate

Defined in: node_modules/@types/react/index.d.ts:672

___

### handleLocationClose

▸ **handleLocationClose**(`e`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`e` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:361](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L361)

___

### onChangeGridHeight

▸ **onChangeGridHeight**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:461](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L461)

___

### onChangeRotationSnap

▸ **onChangeRotationSnap**(`rotationSnap`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`rotationSnap` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:456](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L456)

___

### onChangeScaleSnap

▸ **onChangeScaleSnap**(`scaleSnap`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`scaleSnap` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:452](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L452)

___

### onChangeTransformPivot

▸ **onChangeTransformPivot**(`transformPivot`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`transformPivot` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:435](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L435)

___

### onChangeTranslationSnap

▸ **onChangeTranslationSnap**(`translationSnap`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`translationSnap` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:447](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L447)

___

### onEditorInitialized

▸ **onEditorInitialized**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:365](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L365)

___

### onForceUpdate

▸ **onForceUpdate**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:376](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L376)

___

### onMenuSelected

▸ **onMenuSelected**(`e`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`e` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:380](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L380)

___

### onSelectRotate

▸ **onSelectRotate**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:423](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L423)

___

### onSelectScale

▸ **onSelectScale**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:427](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L427)

___

### onSelectTranslate

▸ **onSelectTranslate**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:419](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L419)

___

### onToggleGridVisible

▸ **onToggleGridVisible**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:465](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L465)

___

### onTogglePlayMode

▸ **onTogglePlayMode**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:469](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L469)

___

### onToggleSnapMode

▸ **onToggleSnapMode**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:443](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L443)

___

### onToggleTransformPivot

▸ **onToggleTransformPivot**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:439](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L439)

___

### onToggleTransformSpace

▸ **onToggleTransformSpace**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:431](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L431)

___

### onWindowClick

▸ **onWindowClick**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:395](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L395)

___

### openModalCreate

▸ **openModalCreate**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:357](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L357)

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: Component.render

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:477](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L477)

___

### renderMenu

▸ **renderMenu**(`menu`: *any*): *Element*

#### Parameters:

Name | Type |
:------ | :------ |
`menu` | *any* |

**Returns:** *Element*

Defined in: [packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx:400](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/toolbar/ToolBar.tsx#L400)

___

### setState

▸ **setState**<K\>(`state`: ToolBarState \| (`prevState`: *Readonly*<ToolBarState\>, `props`: *Readonly*<ToolBarProps\>) => ToolBarState \| *Pick*<ToolBarState, K\> \| *Pick*<ToolBarState, K\>, `callback?`: () => *void*): *void*

#### Type parameters:

Name | Type |
:------ | :------ |
`K` | keyof ToolBarState |

#### Parameters:

Name | Type |
:------ | :------ |
`state` | ToolBarState \| (`prevState`: *Readonly*<ToolBarState\>, `props`: *Readonly*<ToolBarProps\>) => ToolBarState \| *Pick*<ToolBarState, K\> \| *Pick*<ToolBarState, K\> |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: Component.setState

Defined in: node_modules/@types/react/index.d.ts:481

___

### shouldComponentUpdate

▸ `Optional`**shouldComponentUpdate**(`nextProps`: *Readonly*<ToolBarProps\>, `nextState`: *Readonly*<ToolBarState\>, `nextContext`: *any*): *boolean*

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true.
`PureComponent` implements a shallow comparison on props and state and returns true if any
props or states have changed.

If false is returned, `Component#render`, `componentWillUpdate`
and `componentDidUpdate` will not be called.

#### Parameters:

Name | Type |
:------ | :------ |
`nextProps` | *Readonly*<ToolBarProps\> |
`nextState` | *Readonly*<ToolBarState\> |
`nextContext` | *any* |

**Returns:** *boolean*

Inherited from: Component.shouldComponentUpdate

Defined in: node_modules/@types/react/index.d.ts:626
