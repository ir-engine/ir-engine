---
id: "pages__document.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[pages/_document](../modules/pages__document.md).default

## Hierarchy

* *Document*

  ↳ **default**

## Constructors

### constructor

\+ **new default**(`props`: RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  } \| *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\>): [*default*](pages__document.default.md)

#### Parameters:

Name | Type |
:------ | :------ |
`props` | RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  } \| *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\> |

**Returns:** [*default*](pages__document.default.md)

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:469

\+ **new default**(`props`: RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }, `context`: *any*): [*default*](pages__document.default.md)

**`deprecated`** 

**`see`** https://reactjs.org/docs/legacy-context.html

#### Parameters:

Name | Type |
:------ | :------ |
`props` | RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  } |
`context` | *any* |

**Returns:** [*default*](pages__document.default.md)

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

• `Readonly` **props**: *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\> & *Readonly*<{ `children?`: *boolean* \| *ReactElement*<any, string \| JSXElementConstructor<any\>\> \| ReactText \| ReactFragment \| *ReactPortal*  }\>

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

### headTagsMiddleware

▪ `Static` **headTagsMiddleware**: *Promise*<any\> \| () => *never*[]

Inherited from: void

Defined in: packages/client/node_modules/next/dist/pages/_document.d.ts:20

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

▸ `Optional`**UNSAFE_componentWillReceiveProps**(`nextProps`: *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\> |
`nextContext` | *any* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:739

___

### UNSAFE\_componentWillUpdate

▸ `Optional`**UNSAFE_componentWillUpdate**(`nextProps`: *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\> |
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

▸ `Optional`**componentDidUpdate**(`prevProps`: *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\>, `prevState`: *Readonly*<{}\>, `snapshot?`: *any*): *void*

Called immediately after updating occurs. Not called for the initial render.

The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\> |
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

▸ `Optional`**componentWillReceiveProps**(`nextProps`: *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\> |
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

▸ `Optional`**componentWillUpdate**(`nextProps`: *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *void*

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
`nextProps` | *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\> |
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

▸ `Optional`**getSnapshotBeforeUpdate**(`prevProps`: *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\>, `prevState`: *Readonly*<{}\>): *any*

Runs before React applies the result of `render` to the document, and
returns an object to be given to componentDidUpdate. Useful for saving
things such as scroll position before `render` causes changes to it.

Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
lifecycle events from running.

#### Parameters:

Name | Type |
:------ | :------ |
`prevProps` | *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\> |
`prevState` | *Readonly*<{}\> |

**Returns:** *any*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:672

___

### render

▸ **render**(): *Element*

**Returns:** *Element*

Overrides: void

Defined in: [packages/client/pages/_document.tsx:61](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client/pages/_document.tsx#L61)

___

### setState

▸ **setState**<K\>(`state`: {} \| (`prevState`: *Readonly*<{}\>, `props`: *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\>) => {} \| *Pick*<{}, K\> \| *Pick*<{}, K\>, `callback?`: () => *void*): *void*

#### Type parameters:

Name | Type |
:------ | :------ |
`K` | *never* |

#### Parameters:

Name | Type |
:------ | :------ |
`state` | {} \| (`prevState`: *Readonly*<{}\>, `props`: *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\>) => {} \| *Pick*<{}, K\> \| *Pick*<{}, K\> |
`callback?` | () => *void* |

**Returns:** *void*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:481

___

### shouldComponentUpdate

▸ `Optional`**shouldComponentUpdate**(`nextProps`: *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\>, `nextState`: *Readonly*<{}\>, `nextContext`: *any*): *boolean*

Called to determine whether the change in props and state should trigger a re-render.

`Component` always returns true.
`PureComponent` implements a shallow comparison on props and state and returns true if any
props or states have changed.

If false is returned, `Component#render`, `componentWillUpdate`
and `componentDidUpdate` will not be called.

#### Parameters:

Name | Type |
:------ | :------ |
`nextProps` | *Readonly*<RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  }\> |
`nextState` | *Readonly*<{}\> |
`nextContext` | *any* |

**Returns:** *boolean*

Inherited from: void

Defined in: node_modules/@types/react/index.d.ts:626

___

### getInitialProps

▸ `Static`**getInitialProps**(`ctx`: *any*): *Promise*<{ `head?`: *Element*[] ; `html`: *string* ; `styles`: *Element*  }\>

#### Parameters:

Name | Type |
:------ | :------ |
`ctx` | *any* |

**Returns:** *Promise*<{ `head?`: *Element*[] ; `html`: *string* ; `styles`: *Element*  }\>

Overrides: void

Defined in: [packages/client/pages/_document.tsx:12](https://github.com/xr3ngine/xr3ngine/blob/66a84a950/packages/client/pages/_document.tsx#L12)

___

### renderDocument

▸ `Static`**renderDocument**<P\>(`DocumentComponent`: () => *default*<P\>, `props`: RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  } & P): *ReactElement*<any, string \| JSXElementConstructor<any\>\>

#### Type parameters:

Name |
:------ |
`P` |

#### Parameters:

Name | Type |
:------ | :------ |
`DocumentComponent` | () => *default*<P\> |
`props` | RenderPageResult & { `styles?`: ReactFragment \| *ReactElement*<any, string \| JSXElementConstructor<any\>\>[]  } & { `__NEXT_DATA__`: NEXT\_DATA ; `ampPath`: *string* ; `assetPrefix?`: *string* ; `buildManifest`: BuildManifest ; `canonicalBase`: *string* ; `dangerousAsPath`: *string* ; `devOnlyCacheBusterQueryString`: *string* ; `docComponentsRendered`: { `Head?`: *boolean* ; `Html?`: *boolean* ; `Main?`: *boolean* ; `NextScript?`: *boolean*  } ; `dynamicImports`: ManifestItem[] ; `headTags`: *any*[] ; `hybridAmp`: *boolean* ; `inAmpMode`: *boolean* ; `isDevelopment`: *boolean* ; `locale?`: *string* ; `scriptLoader`: { `defer?`: *string*[] ; `eager?`: *any*[]  } ; `unstable_JsPreload?`: *false* ; `unstable_runtimeJS?`: *false*  } & P |

**Returns:** *ReactElement*<any, string \| JSXElementConstructor<any\>\>

Inherited from: void

Defined in: packages/client/node_modules/next/dist/pages/_document.d.ts:26
