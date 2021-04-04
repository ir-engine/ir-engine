---
id: "components_editor_api.default"
title: "Class: default"
sidebar_label: "default"
custom_edit_url: null
hide_title: true
---

# Class: default

[components/editor/Api](../modules/components_editor_api.md).default

Api class contains functions to perform common functions.

## Hierarchy

* *EventEmitter*

  ↳ **default**

## Constructors

### constructor

\+ **new default**(): [*default*](components_editor_api.default.md)

[constructor ]

**Returns:** [*default*](components_editor_api.default.md)

Overrides: void

Defined in: [packages/client-core/components/editor/Api.tsx:105](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L105)

## Properties

### apiURL

• **apiURL**: *string*

Defined in: [packages/client-core/components/editor/Api.tsx:102](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L102)

___

### lastUploadAssetRequest

• **lastUploadAssetRequest**: *number*= 0

Defined in: [packages/client-core/components/editor/Api.tsx:1119](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L1119)

___

### maxUploadSize

• **maxUploadSize**: *number*

Defined in: [packages/client-core/components/editor/Api.tsx:104](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L104)

___

### projectDirectoryPath

• **projectDirectoryPath**: *string*

Defined in: [packages/client-core/components/editor/Api.tsx:103](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L103)

___

### props

• **props**: *any*

Defined in: [packages/client-core/components/editor/Api.tsx:105](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L105)

___

### serverURL

• **serverURL**: *string*

Defined in: [packages/client-core/components/editor/Api.tsx:101](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L101)

___

### prefixed

▪ `Static` **prefixed**: *string* \| *boolean*

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:9

## Methods

### \_uploadAsset

▸ **_uploadAsset**(`endpoint`: *any*, `editor`: *any*, `file`: *any*, `onProgress`: *any*, `signal`: *any*): *Promise*<any\>

[_uploadAsset used as api handler for the uploadAsset]

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

Defined in: [packages/client-core/components/editor/Api.tsx:1129](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L1129)

___

### \_uploadAssets

▸ **_uploadAssets**(`endpoint`: *any*, `editor`: *any*, `files`: *any*, `onProgress`: *any*, `signal`: *any*): *Promise*<any\>

[_uploadAssets used as api handler for uploadAsset]

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

Defined in: [packages/client-core/components/editor/Api.tsx:1059](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L1059)

___

### addListener

▸ **addListener**<T\>(`event`: T, `fn`: (...`args`: *any*[]) => *void*, `context?`: *any*): [*default*](components_editor_api.default.md)

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

**Returns:** [*default*](components_editor_api.default.md)

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:45

___

### createProject

▸ **createProject**(`scene`: *any*, `parentSceneId`: *any*, `thumbnailBlob`: *any*, `signal`: *any*, `showDialog`: *any*, `hideDialog`: *any*): *Promise*<any\>

[createProject used to create project]

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

Defined in: [packages/client-core/components/editor/Api.tsx:459](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L459)

___

### deleteAsset

▸ **deleteAsset**(`assetId`: *any*): *Promise*<any\>

[deleteAsset used to delete existing asset using assetId]

#### Parameters:

Name | Type |
:------ | :------ |
`assetId` | *any* |

**Returns:** *Promise*<any\>

[true if deleted successfully else throw error]

Defined in: [packages/client-core/components/editor/Api.tsx:1198](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L1198)

___

### deleteProject

▸ **deleteProject**(`projectId`: *any*): *Promise*<any\>

[deleteProject used to delete project using projectId]

#### Parameters:

Name | Type |
:------ | :------ |
`projectId` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/client-core/components/editor/Api.tsx:533](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L533)

___

### deleteProjectAsset

▸ **deleteProjectAsset**(`projectId`: *any*, `assetId`: *any*): *Promise*<any\>

[deleteProjectAsset used to delete asset for specific project]

#### Parameters:

Name | Type |
:------ | :------ |
`projectId` | *any* |
`assetId` | *any* |

**Returns:** *Promise*<any\>

[true if deleted successfully else throw error]

Defined in: [packages/client-core/components/editor/Api.tsx:1229](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L1229)

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

[fetchContentType is used to get the header content type of response using accessibleUrl]

#### Parameters:

Name | Type |
:------ | :------ |
`accessibleUrl` | *any* |

**Returns:** *Promise*<any\>

[wait for the response and return response]

Defined in: [packages/client-core/components/editor/Api.tsx:255](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L255)

___

### fetchUrl

▸ **fetchUrl**(`url`: *any*, `options?`: *any*): *Promise*<any\>

[fetchUrl used as common api handler]

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *any* |
`options` | *any* |

**Returns:** *Promise*<any\>

[response from api]

Defined in: [packages/client-core/components/editor/Api.tsx:1279](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L1279)

___

### getAccountId

▸ **getAccountId**(): *string*

[getAccountId used to get accountId using token]

**Returns:** *string*

[returns accountId]

Defined in: [packages/client-core/components/editor/Api.tsx:156](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L156)

___

### getContentType

▸ **getContentType**(`url`: *any*): *Promise*<any\>

[
 getContentType is used to get content type url.
 we firstly call resolve url and get response.
 if result Contains meta property and if meta contains expected_content_type  then returns true.
 we get canonicalUrl url from response call guessContentType to check contentType.
 and if in both ways we unable to find contentType type then call a request for headers using fetchContentType.
]

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *any* |

**Returns:** *Promise*<any\>

[returns the contentType]

Defined in: [packages/client-core/components/editor/Api.tsx:273](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L273)

___

### getProject

▸ **getProject**(`projectId`: *any*): *Promise*<JSON\>

[Function to get project data]

#### Parameters:

Name | Type |
:------ | :------ |
`projectId` | *any* |

**Returns:** *Promise*<JSON\>

Defined in: [packages/client-core/components/editor/Api.tsx:193](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L193)

___

### getProjectFile

▸ **getProjectFile**(`sceneId`: *any*): *Promise*<any\>

[getProjectFile is used to open the scene using Id]

#### Parameters:

Name | Type |
:------ | :------ |
`sceneId` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/client-core/components/editor/Api.tsx:649](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L649)

___

### getProjects

▸ **getProjects**(): *Promise*<any\>

[getProjects used to get list projects created by user]

**Returns:** *Promise*<any\>

[description]

Defined in: [packages/client-core/components/editor/Api.tsx:167](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L167)

___

### getScene

▸ **getScene**(`sceneId`: *any*): *Promise*<JSON\>

[getScene used to Calling api to get scene data using id]

#### Parameters:

Name | Type |
:------ | :------ |
`sceneId` | *any* |

**Returns:** *Promise*<JSON\>

Defined in: [packages/client-core/components/editor/Api.tsx:659](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L659)

___

### getSceneUrl

▸ **getSceneUrl**(`sceneId`: *any*): *string*

[getSceneUrl used to create url for the scene]

#### Parameters:

Name | Type |
:------ | :------ |
`sceneId` | *any* |

**Returns:** *string*

[url]

Defined in: [packages/client-core/components/editor/Api.tsx:680](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L680)

___

### getToken

▸ **getToken**(): *string*

[getToken used to get the token of logined user]

**Returns:** *string*

[returns token string]

Defined in: [packages/client-core/components/editor/Api.tsx:143](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L143)

___

### getUserInfo

▸ **getUserInfo**(): JSON

[getUserInfo used to provide logined user info from localStorage]

**Returns:** JSON

[User data]

Defined in: [packages/client-core/components/editor/Api.tsx:1265](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L1265)

___

### handleAuthorization

▸ **handleAuthorization**(): *void*

[handleAuthorization used to save credentials in local storage]

**Returns:** *void*

Defined in: [packages/client-core/components/editor/Api.tsx:1310](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L1310)

___

### isAuthenticated

▸ **isAuthenticated**(): *boolean*

function component to check user is valid or not.

**Returns:** *boolean*

[return true if user is valid else return false]

Defined in: [packages/client-core/components/editor/Api.tsx:133](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L133)

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

▸ **off**<T\>(`event`: T, `fn?`: (...`args`: *any*[]) => *void*, `context?`: *any*, `once?`: *boolean*): [*default*](components_editor_api.default.md)

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

**Returns:** [*default*](components_editor_api.default.md)

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:69

___

### on

▸ **on**<T\>(`event`: T, `fn`: (...`args`: *any*[]) => *void*, `context?`: *any*): [*default*](components_editor_api.default.md)

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

**Returns:** [*default*](components_editor_api.default.md)

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:40

___

### once

▸ **once**<T\>(`event`: T, `fn`: (...`args`: *any*[]) => *void*, `context?`: *any*): [*default*](components_editor_api.default.md)

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

**Returns:** [*default*](components_editor_api.default.md)

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:54

___

### proxyUrl

▸ **proxyUrl**(`url`: *any*): *any*

[proxyUrl used to create an accessibleUrl]

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *any* |

**Returns:** *any*

url

Defined in: [packages/client-core/components/editor/Api.tsx:334](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L334)

___

### publishProject

▸ **publishProject**(`project`: *any*, `editor`: *any*, `showDialog`: *any*, `hideDialog?`: *any*): *Promise*<any\>

[publishProject is used to publish project, firstly we save the project the publish]

#### Parameters:

Name | Type |
:------ | :------ |
`project` | *any* |
`editor` | *any* |
`showDialog` | *any* |
`hideDialog?` | *any* |

**Returns:** *Promise*<any\>

[returns published project data]

Defined in: [packages/client-core/components/editor/Api.tsx:692](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L692)

___

### removeAllListeners

▸ **removeAllListeners**(`event?`: *string* \| *symbol*): [*default*](components_editor_api.default.md)

Remove all listeners, or those of the specified event.

#### Parameters:

Name | Type |
:------ | :------ |
`event?` | *string* \| *symbol* |

**Returns:** [*default*](components_editor_api.default.md)

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:79

___

### removeListener

▸ **removeListener**<T\>(`event`: T, `fn?`: (...`args`: *any*[]) => *void*, `context?`: *any*, `once?`: *boolean*): [*default*](components_editor_api.default.md)

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

**Returns:** [*default*](components_editor_api.default.md)

Inherited from: void

Defined in: node_modules/eventemitter3/index.d.ts:63

___

### resolveMedia

▸ **resolveMedia**(`url`: *any*, `index`: *any*): *Promise*<any\>

[resolveMedia provides canonicalUrl absoluteUrl and contentType]

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *any* |
`index` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/client-core/components/editor/Api.tsx:292](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L292)

___

### resolveUrl

▸ **resolveUrl**(`url`: *any*, `index?`: *any*): *Promise*<any\>

[resolveUrl used to request data from specific url
if there exist cacheKey cooresponding to request url then return cache key to access data.
]

#### Parameters:

Name | Type |
:------ | :------ |
`url` | *any* |
`index?` | *any* |

**Returns:** *Promise*<any\>

[returns response data ]

Defined in: [packages/client-core/components/editor/Api.tsx:218](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L218)

___

### saveCredentials

▸ **saveCredentials**(`email`: *any*, `token`: *any*): *void*

#### Parameters:

Name | Type |
:------ | :------ |
`email` | *any* |
`token` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/Api.tsx:1269](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L1269)

___

### saveProject

▸ **saveProject**(`projectId`: *any*, `editor`: *any*, `signal`: *any*, `showDialog`: *any*, `hideDialog`: *any*): *Promise*<any\>

[saveProject used to save changes in existing project]

#### Parameters:

Name | Type |
:------ | :------ |
`projectId` | *any* |
`editor` | *any* |
`signal` | *any* |
`showDialog` | *any* |
`hideDialog` | *any* |

**Returns:** *Promise*<any\>

Defined in: [packages/client-core/components/editor/Api.tsx:566](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L566)

___

### searchMedia

▸ **searchMedia**(`source`: *any*, `params`: *any*, `cursor`: *any*, `signal`: *any*): *Promise*<any\>

[searchMedia function to search media on the basis of provided params.]

#### Parameters:

Name | Type |
:------ | :------ |
`source` | *any* |
`params` | *any* |
`cursor` | *any* |
`signal` | *any* |

**Returns:** *Promise*<any\>

[result , nextCursor, suggestions]

Defined in: [packages/client-core/components/editor/Api.tsx:372](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L372)

___

### searchTermFilteringBlacklist

▸ **searchTermFilteringBlacklist**(`query`: *any*): *any*

#### Parameters:

Name | Type |
:------ | :------ |
`query` | *any* |

**Returns:** *any*

Defined in: [packages/client-core/components/editor/Api.tsx:445](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L445)

___

### setUserInfo

▸ **setUserInfo**(`userInfo`: *any*): *void*

[setUserInfo used to save userInfo as localStorage]

#### Parameters:

Name | Type |
:------ | :------ |
`userInfo` | *any* |

**Returns:** *void*

Defined in: [packages/client-core/components/editor/Api.tsx:1257](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L1257)

___

### unproxyUrl

▸ **unproxyUrl**(`baseUrl`: *any*, `url`: *any*): *any*

[unproxyUrl provides us absoluteUrl by removing corsProxyPrefix]

#### Parameters:

Name | Type |
:------ | :------ |
`baseUrl` | *any* |
`url` | *any* |

**Returns:** *any*

[absoluteUrl]

Defined in: [packages/client-core/components/editor/Api.tsx:344](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L344)

___

### upload

▸ **upload**(`blob`: *any*, `onUploadProgress`: *any*, `signal?`: *any*, `projectId?`: *any*): *Promise*<void\>

[upload used to upload image as blob data]

#### Parameters:

Name | Type |
:------ | :------ |
`blob` | *any* |
`onUploadProgress` | *any* |
`signal?` | *any* |
`projectId?` | *any* |

**Returns:** *Promise*<void\>

Defined in: [packages/client-core/components/editor/Api.tsx:980](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L980)

___

### uploadAsset

▸ **uploadAsset**(`editor`: *any*, `file`: *any*, `onProgress`: *any*, `signal`: *any*): *any*

[uploadAsset used to upload single file as asset]

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`file` | *any* |
`onProgress` | *any* |
`signal` | *any* |

**Returns:** *any*

Defined in: [packages/client-core/components/editor/Api.tsx:1097](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L1097)

___

### uploadAssets

▸ **uploadAssets**(`editor`: *any*, `files`: *any*, `onProgress`: *any*, `signal`: *any*): *any*

[uploadAssets used to upload asset files ]

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`files` | *any* |
`onProgress` | *any* |
`signal` | *any* |

**Returns:** *any*

[uploaded file assets]

Defined in: [packages/client-core/components/editor/Api.tsx:1046](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L1046)

___

### uploadProjectAsset

▸ **uploadProjectAsset**(`editor`: *any*, `projectId`: *any*, `file`: *any*, `onProgress`: *any*, `signal`: *any*): *any*

[uploadProjectAsset used to call _uploadAsset directly]

#### Parameters:

Name | Type |
:------ | :------ |
`editor` | *any* |
`projectId` | *any* |
`file` | *any* |
`onProgress` | *any* |
`signal` | *any* |

**Returns:** *any*

Defined in: [packages/client-core/components/editor/Api.tsx:1109](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/components/editor/Api.tsx#L1109)
