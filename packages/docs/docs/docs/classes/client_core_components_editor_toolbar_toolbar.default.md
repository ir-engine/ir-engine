---
id: "client_core_components_editor_toolbar_toolbar.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[client-core/components/editor/toolbar/ToolBar](../modules/client_core_components_editor_toolbar_toolbar.md).default

## Hierarchy

* *Component*<ToolBarProps, ToolBarState\>

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`props`: *any*): [*default*](client_core_components_editor_toolbar_toolbar.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *any* |

**Returns:** [*default*](client_core_components_editor_toolbar_toolbar.default.md)

Overrides: void

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:239](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L239)

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

• `Readonly` **props**: *Readonly*<ToolBarProps\> & *Readonly*<{ `children?`: *boolean* \| *ReactElement*<any, string \| JSXElementConstructor<any\>\> \| ReactText \| ReactFragment \| *ReactPortal*  }\>

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

• **state**: *Readonly*<ToolBarState\>

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

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:232](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L232)

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

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:740

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

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:261](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L261)

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

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:723

___

### componentWillUnmount

▸ **componentWillUnmount**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:268](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L268)

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

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:673

___

### handleLocationClose

▸ **handleLocationClose**(`e`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`e` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:257](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L257)

___

### onChangeGridHeight

▸ **onChangeGridHeight**(`value`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`value` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:381](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L381)

___

### onChangeRotationSnap

▸ **onChangeRotationSnap**(`rotationSnap`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`rotationSnap` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:376](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L376)

___

### onChangeScaleSnap

▸ **onChangeScaleSnap**(`scaleSnap`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`scaleSnap` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:372](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L372)

___

### onChangeTransformPivot

▸ **onChangeTransformPivot**(`transformPivot`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`transformPivot` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:355](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L355)

___

### onChangeTranslationSnap

▸ **onChangeTranslationSnap**(`translationSnap`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`translationSnap` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:367](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L367)

___

### onEditorInitialized

▸ **onEditorInitialized**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:285](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L285)

___

### onForceUpdate

▸ **onForceUpdate**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:296](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L296)

___

### onMenuSelected

▸ **onMenuSelected**(`e`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`e` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:300](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L300)

___

### onSelectRotate

▸ **onSelectRotate**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:343](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L343)

___

### onSelectScale

▸ **onSelectScale**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:347](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L347)

___

### onSelectTranslate

▸ **onSelectTranslate**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:339](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L339)

___

### onToggleGridVisible

▸ **onToggleGridVisible**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:385](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L385)

___

### onTogglePlayMode

▸ **onTogglePlayMode**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:389](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L389)

___

### onToggleSnapMode

▸ **onToggleSnapMode**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:363](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L363)

___

### onToggleTransformPivot

▸ **onToggleTransformPivot**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:359](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L359)

___

### onToggleTransformSpace

▸ **onToggleTransformSpace**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:351](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L351)

___

### onWindowClick

▸ **onWindowClick**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:315](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L315)

___

### openModalCreate

▸ **openModalCreate**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:253](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L253)

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: void

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:397](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L397)

___

### renderMenu

▸ **renderMenu**(`menu`: *any*): *Element*

#### Parameters:

Name | Type |
:------ | :------ |
`menu` | *any* |

**Returns:** *Element*

Defined in: [packages/client-core/components/editor/toolbar/ToolBar.tsx:320](https://github.com/xr3ngine/xr3ngine/blob/5a0f83ed8/packages/client-core/components/editor/toolbar/ToolBar.tsx#L320)

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

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:484

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

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:627
