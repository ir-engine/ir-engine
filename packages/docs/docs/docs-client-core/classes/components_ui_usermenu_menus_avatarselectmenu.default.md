---
id: "components_ui_usermenu_menus_avatarselectmenu.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[components/ui/UserMenu/menus/AvatarSelectMenu](../modules/components_ui_usermenu_menus_avatarselectmenu.md).default

## Hierarchy

* *Component*<Props, State\>

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`props`: *any*): [*default*](components_ui_usermenu_menus_avatarselectmenu.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | *any* |

**Returns:** [*default*](components_ui_usermenu_menus_avatarselectmenu.default.md)

Overrides: void

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:26](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L26)

## Properties

### camera

• **camera**: *any*= null

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:81](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L81)

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

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:472

___

### fileSelected

• **fileSelected**: *boolean*= false

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:84](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L84)

___

### maxBB

• **maxBB**: *Vector3*

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:85](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L85)

___

### props

• `Readonly` **props**: *Readonly*<Props\> & *Readonly*<{ `children?`: *boolean* \| *ReactElement*<any, string \| JSXElementConstructor<any\>\> \| ReactText \| ReactFragment \| *ReactPortal*  }\>

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

### renderer

• **renderer**: *any*= null

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:83](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L83)

___

### scene

• **scene**: *any*= null

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:82](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L82)

___

### state

• **state**: *Readonly*<State\>

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

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:740

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

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:38](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L38)

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

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:723

___

### componentWillUnmount

▸ **componentWillUnmount**(): *void*

**Returns:** *void*

Overrides: void

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:77](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L77)

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

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:673

___

### handleAvatarChange

▸ **handleAvatarChange**(`e`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`e` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:106](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L106)

___

### handleBrowse

▸ **handleBrowse**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:102](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L102)

___

### onWindowResize

▸ **onWindowResize**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:87](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L87)

___

### openAvatarMenu

▸ **openAvatarMenu**(`e`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`e` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:173](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L173)

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: void

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:196](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L196)

___

### renderScene

▸ **renderScene**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:98](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L98)

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

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:484

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

Inherited from: void

Defined in: packages/client-core/node_modules/@types/react/index.d.ts:627

___

### uploadAvatar

▸ **uploadAvatar**(): *void*

**Returns:** *void*

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:178](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L178)

___

### validate

▸ **validate**(`scene`: *any*): *string*

#### Parameters:

Name | Type |
:------ | :------ |
`scene` | *any* |

**Returns:** *string*

Defined in: [packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx:152](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/ui/UserMenu/menus/AvatarSelectMenu.tsx#L152)
