---
id: "src_user_components_usermenu_menus_avatarselectmenu.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[src/user/components/UserMenu/menus/AvatarSelectMenu](../modules/src_user_components_usermenu_menus_avatarselectmenu.md).default

## Hierarchy

* *Component*<Props, State\>

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`props`: *any*): [*default*](src_user_components_usermenu_menus_avatarselectmenu.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *any* |

**Returns:** [*default*](src_user_components_usermenu_menus_avatarselectmenu.default.md)

Overrides: React.Component&lt;Props, State&gt;.constructor

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:27](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L27)

## Properties

### camera

• **camera**: *any*= null

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:82](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L82)

___

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

Inherited from: React.Component.context

Defined in: node_modules/@types/react/index.d.ts:469

___

### fileSelected

• **fileSelected**: *boolean*= false

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:85](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L85)

___

### maxBB

• **maxBB**: *any*

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:86](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L86)

___

### props

• `Readonly` **props**: *Readonly*<Props\> & *Readonly*<{ `children?`: ReactNode  }\>

Inherited from: React.Component.props

Defined in: node_modules/@types/react/index.d.ts:494

___

### refs

• **refs**: *object*

**`deprecated`** 
https://reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs

#### Type declaration:

Inherited from: React.Component.refs

Defined in: node_modules/@types/react/index.d.ts:500

___

### renderer

• **renderer**: *any*= null

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:84](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L84)

___

### scene

• **scene**: *any*= null

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:83](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L83)

___

### state

• **state**: *Readonly*<State\>

Inherited from: React.Component.state

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

Inherited from: React.Component.contextType

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

Inherited from: React.Component.UNSAFE_componentWillMount

Defined in: node_modules/@types/react/index.d.ts:707

___

### UNSAFE\_componentWillReceiveProps

▸ `Optional`**UNSAFE_componentWillReceiveProps**(`nextProps`: *Readonly*<Props\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<Props\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: React.Component.UNSAFE_componentWillReceiveProps

Defined in: node_modules/@types/react/index.d.ts:739

___

### UNSAFE\_componentWillUpdate

▸ `Optional`**UNSAFE_componentWillUpdate**(`nextProps`: *Readonly*<Props\>, `nextState`: *Readonly*<State\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<Props\> |
`nextState` | *Readonly*<State\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: React.Component.UNSAFE_componentWillUpdate

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

Inherited from: React.Component.componentDidCatch

Defined in: node_modules/@types/react/index.d.ts:636

___

### componentDidMount

▸ **componentDidMount**(): *void*

**Returns:** *void*

Overrides: React.Component.componentDidMount

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:39](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L39)

___

### componentDidUpdate

▸ `Optional`**componentDidUpdate**(`prevProps`: *Readonly*<Props\>, `prevState`: *Readonly*<State\>, `snapshot?`: *any*): *void*

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<Props\> |
`prevState` | *Readonly*<State\> |
`snapshot?` | *any* |

**Returns:** *void*

Inherited from: React.Component.componentDidUpdate

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

Inherited from: React.Component.componentWillMount

Defined in: node_modules/@types/react/index.d.ts:693

___

### componentWillReceiveProps

▸ `Optional`**componentWillReceiveProps**(`nextProps`: *Readonly*<Props\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<Props\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: React.Component.componentWillReceiveProps

Defined in: node_modules/@types/react/index.d.ts:722

___

### componentWillUnmount

▸ **componentWillUnmount**(): *void*

**Returns:** *void*

Overrides: React.Component.componentWillUnmount

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:78](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L78)

___

### componentWillUpdate

▸ `Optional`**componentWillUpdate**(`nextProps`: *Readonly*<Props\>, `nextState`: *Readonly*<State\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<Props\> |
`nextState` | *Readonly*<State\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: React.Component.componentWillUpdate

Defined in: node_modules/@types/react/index.d.ts:752

___

### forceUpdate

▸ **forceUpdate**(`callback?`: () => *void*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: React.Component.forceUpdate

Defined in: node_modules/@types/react/index.d.ts:486

___

### getSnapshotBeforeUpdate

▸ `Optional`**getSnapshotBeforeUpdate**(`prevProps`: *Readonly*<Props\>, `prevState`: *Readonly*<State\>): *any*

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<Props\> |
`prevState` | *Readonly*<State\> |

**Returns:** *any*

Inherited from: React.Component.getSnapshotBeforeUpdate

Defined in: node_modules/@types/react/index.d.ts:672

___

### handleAvatarChange

▸ **handleAvatarChange**(`e`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`e` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:107](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L107)

___

### handleBrowse

▸ **handleBrowse**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:103](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L103)

___

### onWindowResize

▸ **onWindowResize**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:88](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L88)

___

### openAvatarMenu

▸ **openAvatarMenu**(`e`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`e` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:174](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L174)

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: React.Component.render

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:197](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L197)

___

### renderScene

▸ **renderScene**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:99](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L99)

___

### setState

▸ **setState**<K\>(`state`: State \| (`prevState`: *Readonly*<State\>, `props`: *Readonly*<Props\>) => State \| *Pick*<State, K\> \| *Pick*<State, K\>, `callback?`: () => *void*): *void*

#### Type parameters:

Name | Type |
:------ | :------ |
`K` | keyof State |

#### Parameters:

Name | Type |
:------ | :------ |
`state` | State \| (`prevState`: *Readonly*<State\>, `props`: *Readonly*<Props\>) => State \| *Pick*<State, K\> \| *Pick*<State, K\> |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: React.Component.setState

Defined in: node_modules/@types/react/index.d.ts:481

___

### shouldComponentUpdate

▸ `Optional`**shouldComponentUpdate**(`nextProps`: *Readonly*<Props\>, `nextState`: *Readonly*<State\>, `nextContext`: *any*): *boolean*

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true.
`PureComponent` implements a shallow comparison on props and state and returns true if any
props or states have changed.

If false is returned, `Component#render`, `componentWillUpdate`
and `componentDidUpdate` will not be called.

#### Parameters:

Name | Type |
:------ | :------ |
`nextProps` | *Readonly*<Props\> |
`nextState` | *Readonly*<State\> |
`nextContext` | *any* |

**Returns:** *boolean*

Inherited from: React.Component.shouldComponentUpdate

Defined in: node_modules/@types/react/index.d.ts:626

___

### uploadAvatar

▸ **uploadAvatar**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:179](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L179)

___

### validate

▸ **validate**(`scene`: *any*): *string*

#### Parameters:

Name | Type |
:------ | :------ |
`scene` | *any* |

**Returns:** *string*

Defined in: [packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx:153](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/user/components/UserMenu/menus/AvatarSelectMenu.tsx#L153)
