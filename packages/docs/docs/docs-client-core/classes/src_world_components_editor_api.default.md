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

Overrides: void

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:140](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L140)

## Properties

### apiURL

• **apiURL**: *string*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:137](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L137)

___

### lastUploadAssetRequest

• **lastUploadAssetRequest**: *number*= 0

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1199](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L1199)

___

### maxUploadSize

• **maxUploadSize**: *number*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:139](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L139)

___

### projectDirectoryPath

• **projectDirectoryPath**: *string*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:138](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L138)

___

### props

• **props**: *any*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:140](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L140)

___

### serverURL

• **serverURL**: *string*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:136](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L136)

___

### prefixed

▪ `Static` **prefixed**: *string* \| *boolean*

Inherited from: void

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1211](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L1211)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1135](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L1135)

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

Inherited from: void

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:518](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L518)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1281](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L1281)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:594](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L594)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1313](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L1313)

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

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:32

___

### eventNames

▸ **eventNames**(): (*string* \| *symbol*)[]

Return an array listing the events for which the emitter has registered
listeners.

**Returns:** (*string* \| *symbol*)[]

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:15

___

### fetchContentType

▸ **fetchContentType**(`accessibleUrl`: *any*): *Promise*<any\>

fetchContentType is used to get the header content type of response using accessibleUrl.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`accessibleUrl` | *any* |

**Returns:** *Promise*<any\>

[wait for the response and return response]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:301](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L301)

___

### fetchUrl

▸ **fetchUrl**(`url`: *any*, `options?`: *any*): *Promise*<any\>

fetchUrl used as common api handler.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *any* |
`options` | *any* |

**Returns:** *Promise*<any\>

[response from api]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1369](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L1369)

___

### getAccountId

▸ **getAccountId**(): *string*

getAccountId used to get accountId using token.

**`author`** Robert Long

**Returns:** *string*

[returns accountId]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:196](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L196)

___

### getContentType

▸ **getContentType**(`url`: *any*): *Promise*<any\>

 getContentType is used to get content type url.
 we firstly call resolve url and get response.
 if result Contains meta property and if meta contains expected_content_type  then returns true.
 we get canonicalUrl url from response call guessContentType to check contentType.
 and if in both ways we unable to find contentType type then call a request for headers using fetchContentType.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *any* |

**Returns:** *Promise*<any\>

[returns the contentType]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:320](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L320)

___

### getProject

▸ **getProject**(`projectId`: *any*): *Promise*<JSON\>

Function to get project data.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`projectId` | *any* |

**Returns:** *Promise*<JSON\>

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:236](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L236)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:714](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L714)

___

### getProjects

▸ **getProjects**(): *Promise*<any\>

getProjects used to get list projects created by user.

**`author`** Robert Long

**Returns:** *Promise*<any\>

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:207](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L207)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:726](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L726)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:749](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L749)

___

### getToken

▸ **getToken**(): *string*

getToken used to get the token of logined user.

**`author`** Robert Long

**Returns:** *string*

[returns token string]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:181](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L181)

___

### getUserInfo

▸ **getUserInfo**(): JSON

getUserInfo used to provide logined user info from localStorage.

**`author`** Robert Long

**Returns:** JSON

[User data]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1353](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L1353)

___

### handleAuthorization

▸ **handleAuthorization**(): *void*

handleAuthorization used to save credentials in local storage.

**`author`** Robert Long

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1405](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L1405)

___

### isAuthenticated

▸ **isAuthenticated**(): *boolean*

function component to check user is valid or not.

**`author`** Robert Long

**Returns:** *boolean*

[return true if user is valid else return false]

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:169](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L169)

___

### listenerCount

▸ **listenerCount**(`event`: *string* \| *symbol*): *number*

Return the number of listeners listening to a given event.

#### Parameters:

Name | Type |
:------ | :------ |
`event` | *string* \| *symbol* |

**Returns:** *number*

Inherited from: void

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

Inherited from: void

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

Inherited from: void

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

Inherited from: void

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

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:54

___

### proxyUrl

▸ **proxyUrl**(`url`: *any*): *any*

proxyUrl used to create an accessibleUrl.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *any* |

**Returns:** *any*

url

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:387](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L387)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:763](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L763)

___

### removeAllListeners

▸ **removeAllListeners**(`event?`: *string* \| *symbol*): [*default*](src_world_components_editor_api.default.md)

Remove all listeners, or those of the specified event.

#### Parameters:

Name | Type |
:------ | :------ |
`event?` | *string* \| *symbol* |

**Returns:** [*default*](src_world_components_editor_api.default.md)

Inherited from: void

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

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:63

___

### resolveMedia

▸ **resolveMedia**(`url`: *any*, `index`: *any*): *Promise*<any\>

resolveMedia provides canonicalUrl absoluteUrl and contentType.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *any* |
`index` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:341](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L341)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:262](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L262)

___

### saveCredentials

▸ **saveCredentials**(`email`: *any*, `token`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`email` | *any* |
`token` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1357](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L1357)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:629](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L629)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:429](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L429)

___

### searchTermFilteringBlacklist

▸ **searchTermFilteringBlacklist**(`query`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`query` | *any* |

**Returns:** *any*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:502](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L502)

___

### setUserInfo

▸ **setUserInfo**(`userInfo`: *any*): *void*

setUserInfo used to save userInfo as localStorage.

**`author`** Robert Long

#### Parameters:

Name | Type |
:------ | :------ |
`userInfo` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1343](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L1343)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:399](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L399)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1052](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L1052)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1175](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L1175)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1120](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L1120)

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

Defined in: [packages/client-core/src/world/components/editor/Api.tsx:1189](https://github.com/xr3ngine/xr3ngine/blob/716a06460/packages/client-core/src/world/components/editor/Api.tsx#L1189)
