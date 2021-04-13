---
id: "src_world_components_editor_api.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[src/world/components/editor/Api](../modules/src_world_components_editor_api.md).default

Api class contains functions to perform common operations.

**`author`** Robert Long

## Hierarchy

* *EventEmitter*

  ↳ **default**

## Constructors

### constructor

\+ **new default**(): [*default*](src_world_components_editor_api.default.md)

[constructor ]

**Returns:** [*default*](src_world_components_editor_api.default.md)

Overrides: EventEmitter.constructor

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:103](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L103)

## Properties

### apiURL

• **apiURL**: *string*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:100](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L100)

___

### lastUploadAssetRequest

• **lastUploadAssetRequest**: *number*= 0

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1113](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L1113)

___

### maxUploadSize

• **maxUploadSize**: *number*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:102](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L102)

___

### projectDirectoryPath

• **projectDirectoryPath**: *string*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:101](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L101)

___

### props

• **props**: *any*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:103](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L103)

___

### serverURL

• **serverURL**: *string*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:99](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L99)

___

### prefixed

▪ `Static` **prefixed**: *string* \| *boolean*

Inherited from: EventEmitter.prefixed

Defined in: node_modules/eventemitter3/index.d.ts:9

## Methods

### \_uploadAsset

▸ **_uploadAsset**(`endpoint`: *any*, `editor`: *any*, `file`: *any*, `onProgress`: *any*, `signal`: *any*): *Promise*<any\>

_uploadAsset used as api handler for the uploadAsset.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`endpoint` | *any* |
`editor` | *any* |
`file` | *any* |
`onProgress` | *any* |
`signal` | *any* |

**Returns:** *Promise*<any\>

[uploaded asset file data]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1125](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L1125)

___

### \_uploadAssets

▸ **_uploadAssets**(`endpoint`: *any*, `editor`: *any*, `files`: *any*, `onProgress`: *any*, `signal`: *any*): *Promise*<any\>

_uploadAssets used as api handler for uploadAsset.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`endpoint` | *any* |
`editor` | *any* |
`files` | *any* |
`onProgress` | *any* |
`signal` | *any* |

**Returns:** *Promise*<any\>

[assets file data]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1049](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L1049)

___

### addListener

▸ **addListener**<T\>(`event`: T, `fn`: (...`args`: *any*[]) => *void*, `context?`: *any*): [*default*](src_world_components_editor_api.default.md)

#### Type parameters:

Name | Type |
:------ | :------ |
`T` | *string* \| *symbol* |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | T |
`fn` | (...`args`: *any*[]) => *void* |
`context?` | *any* |

**Returns:** [*default*](src_world_components_editor_api.default.md)

Inherited from: EventEmitter.addListener

Defined in: node_modules/eventemitter3/index.d.ts:45

___

### createProject

▸ **createProject**(`scene`: *any*, `parentSceneId`: *any*, `thumbnailBlob`: *any*, `signal`: *any*, `showDialog`: *any*, `hideDialog`: *any*): *Promise*<any\>

createProject used to create project.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`scene` | *any* |
`parentSceneId` | *any* |
`thumbnailBlob` | *any* |
`signal` | *any* |
`showDialog` | *any* |
`hideDialog` | *any* |

**Returns:** *Promise*<any\>

[response as json]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:461](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L461)

___

### deleteAsset

▸ **deleteAsset**(`assetId`: *any*): *Promise*<any\>

deleteAsset used to delete existing asset using assetId.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`assetId` | *any* |

**Returns:** *Promise*<any\>

[true if deleted successfully else throw error]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1194](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L1194)

___

### deleteProject

▸ **deleteProject**(`projectId`: *any*): *Promise*<any\>

deleteProject used to delete project using projectId.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`projectId` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:537](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L537)

___

### deleteProjectAsset

▸ **deleteProjectAsset**(`projectId`: *any*, `assetId`: *any*): *Promise*<any\>

deleteProjectAsset used to delete asset for specific project.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`projectId` | *any* |
`assetId` | *any* |

**Returns:** *Promise*<any\>

[true if deleted successfully else throw error]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1226](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L1226)

___

### emit

▸ **emit**<T\>(`event`: T, ...`args`: *any*[]): *boolean*

Calls each of the listeners registered for a given event.

#### Type parameters:

Name | Type |
:------ | :------ |
`T` | *string* \| *symbol* |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | T |
`...args` | *any*[] |

**Returns:** *boolean*

Inherited from: EventEmitter.emit

Defined in: node_modules/eventemitter3/index.d.ts:32

___

### eventNames

▸ **eventNames**(): (*string* \| *symbol*)[]

Return an array listing the events for which the emitter has registered
listeners.

**Returns:** (*string* \| *symbol*)[]

Inherited from: EventEmitter.eventNames

Defined in: node_modules/eventemitter3/index.d.ts:15

___

### fetchContentType

▸ **fetchContentType**(`url`: *any*): *Promise*<any\>

fetchContentType is used to get the header content type of response using url.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *any* |

**Returns:** *Promise*<any\>

[wait for the response and return response]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:261](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L261)

___

### fetchUrl

▸ **fetchUrl**(`url`: *any*, `options?`: *any*): *Promise*<any\>

fetchUrl used as common api handler.

**`author`** Robert Long

#### Parameters:

Name | Type | Default value |
:------ | :------ | :------ |
`url` | *any* | - |
`options` | *any* | {} |

**Returns:** *Promise*<any\>

[response from api]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1262](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L1262)

___

### getAccountId

▸ **getAccountId**(): *string*

getAccountId used to get accountId using token.

**Returns:** *string*

[returns accountId]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:158](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L158)

___

### getContentType

▸ **getContentType**(`contentUrl`: *any*): *Promise*<any\>

 getContentType is used to get content type url.
 we firstly call resolve url and get response.
 if result Contains meta property and if meta contains expected_content_type  then returns true.
 we get url url from response call guessContentType to check contentType.
 and if in both ways we unable to find contentType type then call a request for headers using fetchContentType.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`contentUrl` | *any* |

**Returns:** *Promise*<any\>

[returns the contentType]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:280](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L280)

___

### getProject

▸ **getProject**(`projectId`: *any*): *Promise*<JSON\>

Function to get project data.

#### Parameters:

Name | Type |
:------ | :------ |
`projectId` | *any* |

**Returns:** *Promise*<JSON\>

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:196](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L196)

___

### getProjectFile

▸ **getProjectFile**(`sceneId`: *any*): *Promise*<any\>

getProjectFile is used to open the scene using Id.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`sceneId` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:657](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L657)

___

### getProjects

▸ **getProjects**(): *Promise*<any\>

getProjects used to get list projects created by user.

**Returns:** *Promise*<any\>

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:168](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L168)

___

### getScene

▸ **getScene**(`sceneId`: *any*): *Promise*<JSON\>

getScene used to Calling api to get scene data using id.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`sceneId` | *any* |

**Returns:** *Promise*<JSON\>

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:669](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L669)

___

### getSceneUrl

▸ **getSceneUrl**(`sceneId`: *any*): *string*

getSceneUrl used to create url for the scene.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`sceneId` | *any* |

**Returns:** *string*

[url]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:692](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L692)

___

### getToken

▸ **getToken**(): *string*

getToken used to get the token of logined user.

**`author`** Robert Long

**Returns:** *string*

[returns token string]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:144](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L144)

___

### handleAuthorization

▸ **handleAuthorization**(): *void*

handleAuthorization used to save credentials in local storage.

**`author`** Robert Long

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1298](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L1298)

___

### isAuthenticated

▸ **isAuthenticated**(): *boolean*

function component to check user is valid or not.

**`author`** Robert Long

**Returns:** *boolean*

[return true if user is valid else return false]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:132](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L132)

___

### listenerCount

▸ **listenerCount**(`event`: *string* \| *symbol*): *number*

Return the number of listeners listening to a given event.

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |

**Returns:** *number*

Inherited from: EventEmitter.listenerCount

Defined in: node_modules/eventemitter3/index.d.ts:27

___

### listeners

▸ **listeners**<T\>(`event`: T): (...`args`: *any*[]) => *void*[]

Return the listeners registered for a given event.

#### Type parameters:

Name | Type |
:------ | :------ |
`T` | *string* \| *symbol* |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | T |

**Returns:** (...`args`: *any*[]) => *void*[]

Inherited from: EventEmitter.listeners

Defined in: node_modules/eventemitter3/index.d.ts:20

___

### off

▸ **off**<T\>(`event`: T, `fn?`: (...`args`: *any*[]) => *void*, `context?`: *any*, `once?`: *boolean*): [*default*](src_world_components_editor_api.default.md)

#### Type parameters:

Name | Type |
:------ | :------ |
`T` | *string* \| *symbol* |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | T |
`fn?` | (...`args`: *any*[]) => *void* |
`context?` | *any* |
`once?` | *boolean* |

**Returns:** [*default*](src_world_components_editor_api.default.md)

Inherited from: EventEmitter.off

Defined in: node_modules/eventemitter3/index.d.ts:69

___

### on

▸ **on**<T\>(`event`: T, `fn`: (...`args`: *any*[]) => *void*, `context?`: *any*): [*default*](src_world_components_editor_api.default.md)

Add a listener for a given event.

#### Type parameters:

Name | Type |
:------ | :------ |
`T` | *string* \| *symbol* |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | T |
`fn` | (...`args`: *any*[]) => *void* |
`context?` | *any* |

**Returns:** [*default*](src_world_components_editor_api.default.md)

Inherited from: EventEmitter.on

Defined in: node_modules/eventemitter3/index.d.ts:40

___

### once

▸ **once**<T\>(`event`: T, `fn`: (...`args`: *any*[]) => *void*, `context?`: *any*): [*default*](src_world_components_editor_api.default.md)

Add a one-time listener for a given event.

#### Type parameters:

Name | Type |
:------ | :------ |
`T` | *string* \| *symbol* |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | T |
`fn` | (...`args`: *any*[]) => *void* |
`context?` | *any* |

**Returns:** [*default*](src_world_components_editor_api.default.md)

Inherited from: EventEmitter.once

Defined in: node_modules/eventemitter3/index.d.ts:54

___

### publishProject

▸ **publishProject**(`project`: *any*, `editor`: *any*, `showDialog`: *any*, `hideDialog?`: *any*): *Promise*<any\>

publishProject is used to publish project, firstly we save the project the publish.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`project` | *any* |
`editor` | *any* |
`showDialog` | *any* |
`hideDialog?` | *any* |

**Returns:** *Promise*<any\>

[returns published project data]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:706](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L706)

___

### removeAllListeners

▸ **removeAllListeners**(`event?`: *string* \| *symbol*): [*default*](src_world_components_editor_api.default.md)

Remove all listeners, or those of the specified event.

#### Parameters:

Name | Type |
:------ | :------ |
`event?` | *string* \| *symbol* |

**Returns:** [*default*](src_world_components_editor_api.default.md)

Inherited from: EventEmitter.removeAllListeners

Defined in: node_modules/eventemitter3/index.d.ts:79

___

### removeListener

▸ **removeListener**<T\>(`event`: T, `fn?`: (...`args`: *any*[]) => *void*, `context?`: *any*, `once?`: *boolean*): [*default*](src_world_components_editor_api.default.md)

Remove the listeners of a given event.

#### Type parameters:

Name | Type |
:------ | :------ |
`T` | *string* \| *symbol* |

#### Parameters:

Name | Type |
:------ | :------ |
`event` | T |
`fn?` | (...`args`: *any*[]) => *void* |
`context?` | *any* |
`once?` | *boolean* |

**Returns:** [*default*](src_world_components_editor_api.default.md)

Inherited from: EventEmitter.removeListener

Defined in: node_modules/eventemitter3/index.d.ts:63

___

### resolveMedia

▸ **resolveMedia**(`url`: *any*, `index`: *any*): *Promise*<any\>

resolveMedia provides url absoluteUrl and contentType.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *any* |
`index` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:300](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L300)

___

### resolveUrl

▸ **resolveUrl**(`url`: *any*, `index?`: *any*): *Promise*<any\>

resolveUrl used to request data from specific url.
If there exist cacheKey cooresponding to request url then return cache key to access data.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *any* |
`index?` | *any* |

**Returns:** *Promise*<any\>

[returns response data ]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:222](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L222)

___

### saveCredentials

▸ **saveCredentials**(`email`: *any*, `token`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`email` | *any* |
`token` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1250](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L1250)

___

### saveProject

▸ **saveProject**(`projectId`: *any*, `editor`: *any*, `signal`: *any*, `showDialog`: *any*, `hideDialog`: *any*): *Promise*<any\>

saveProject used to save changes in existing project.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`projectId` | *any* |
`editor` | *any* |
`signal` | *any* |
`showDialog` | *any* |
`hideDialog` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:572](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L572)

___

### searchMedia

▸ **searchMedia**(`source`: *any*, `params`: *any*, `cursor`: *any*, `signal`: *any*): *Promise*<any\>

searchMedia function to search media on the basis of provided params.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`source` | *any* |
`params` | *any* |
`cursor` | *any* |
`signal` | *any* |

**Returns:** *Promise*<any\>

[result , nextCursor, suggestions]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:376](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L376)

___

### searchTermFilteringBlacklist

▸ **searchTermFilteringBlacklist**(`query`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`query` | *any* |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:445](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L445)

___

### unproxyUrl

▸ **unproxyUrl**(`baseUrl`: *any*, `url`: *any*): *any*

unproxyUrl provides us absoluteUrl by removing corsProxyPrefix.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`baseUrl` | *any* |
`url` | *any* |

**Returns:** *any*

[absoluteUrl]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:346](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L346)

___

### upload

▸ **upload**(`blob`: *any*, `onUploadProgress`: *any*, `signal?`: *any*, `projectId?`: *any*): *Promise*<void\>

upload used to upload image as blob data.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`blob` | *any* |
`onUploadProgress` | *any* |
`signal?` | *any* |
`projectId?` | *any* |

**Returns:** *Promise*<void\>

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:966](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L966)

___

### uploadAsset

▸ **uploadAsset**(`editor`: *any*, `file`: *any*, `onProgress`: *any*, `signal`: *any*): *any*

uploadAsset used to upload single file as asset.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`file` | *any* |
`onProgress` | *any* |
`signal` | *any* |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1089](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L1089)

___

### uploadAssets

▸ **uploadAssets**(`editor`: *any*, `files`: *any*, `onProgress`: *any*, `signal`: *any*): *any*

uploadAssets used to upload asset files.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`files` | *any* |
`onProgress` | *any* |
`signal` | *any* |

**Returns:** *any*

[uploaded file assets]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1034](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L1034)

___

### uploadProjectAsset

▸ **uploadProjectAsset**(`editor`: *any*, `projectId`: *any*, `file`: *any*, `onProgress`: *any*, `signal`: *any*): *any*

uploadProjectAsset used to call _uploadAsset directly.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`projectId` | *any* |
`file` | *any* |
`onProgress` | *any* |
`signal` | *any* |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1103](https://github.com/xr3ngine/xr3ngine/blob/a16a45d7e/packages/client-core/src/world/components/editor/Api.tsx#L1103)
