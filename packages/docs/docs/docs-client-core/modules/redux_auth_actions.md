---
id: "redux_auth_actions"
title: "Module: redux/auth/actions"
sidebar_label: "redux/auth/actions"
custom_edit_url: null
hide_title: true
---

# Module: redux/auth/actions

## Table of contents

### Interfaces

- [AddConnectionProcessingAction](../interfaces/redux_auth_actions.addconnectionprocessingaction.md)
- [AddConnectionResultAction](../interfaces/redux_auth_actions.addconnectionresultaction.md)
- [AuthProcessingAction](../interfaces/redux_auth_actions.authprocessingaction.md)
- [AuthResultAction](../interfaces/redux_auth_actions.authresultaction.md)
- [AvatarListUpdateAction](../interfaces/redux_auth_actions.avatarlistupdateaction.md)
- [AvatarUpdatedAction](../interfaces/redux_auth_actions.avatarupdatedaction.md)
- [EmailLoginForm](../interfaces/redux_auth_actions.emailloginform.md)
- [EmailRegistrationForm](../interfaces/redux_auth_actions.emailregistrationform.md)
- [GithubLoginForm](../interfaces/redux_auth_actions.githubloginform.md)
- [LinkedInLoginForm](../interfaces/redux_auth_actions.linkedinloginform.md)
- [LoadDataResultAction](../interfaces/redux_auth_actions.loaddataresultaction.md)
- [LoginResultAction](../interfaces/redux_auth_actions.loginresultaction.md)
- [RegistrationResultAction](../interfaces/redux_auth_actions.registrationresultaction.md)
- [UserAvatarIdUpdatedAction](../interfaces/redux_auth_actions.useravataridupdatedaction.md)
- [UserSettingsUpdatedAction](../interfaces/redux_auth_actions.usersettingsupdatedaction.md)
- [UserUpdatedAction](../interfaces/redux_auth_actions.userupdatedaction.md)
- [UsernameUpdatedAction](../interfaces/redux_auth_actions.usernameupdatedaction.md)

## Type aliases

### AuthAction

Ƭ **AuthAction**: [*AuthProcessingAction*](../interfaces/redux_auth_actions.authprocessingaction.md) \| [*LoginResultAction*](../interfaces/redux_auth_actions.loginresultaction.md) \| [*RegistrationResultAction*](../interfaces/redux_auth_actions.registrationresultaction.md) \| [*AuthResultAction*](../interfaces/redux_auth_actions.authresultaction.md) \| [*AddConnectionResultAction*](../interfaces/redux_auth_actions.addconnectionresultaction.md) \| [*AddConnectionProcessingAction*](../interfaces/redux_auth_actions.addconnectionprocessingaction.md) \| [*LoadDataResultAction*](../interfaces/redux_auth_actions.loaddataresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:118](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L118)

## Functions

### actionProcessing

▸ **actionProcessing**(`processing`: *boolean*): [*AuthProcessingAction*](../interfaces/redux_auth_actions.authprocessingaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`processing` | *boolean* |

**Returns:** [*AuthProcessingAction*](../interfaces/redux_auth_actions.authprocessingaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:127](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L127)

___

### avatarUpdated

▸ **avatarUpdated**(`result`: *any*): [*AvatarUpdatedAction*](../interfaces/redux_auth_actions.avatarupdatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`result` | *any* |

**Returns:** [*AvatarUpdatedAction*](../interfaces/redux_auth_actions.avatarupdatedaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:248](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L248)

___

### didCreateMagicLink

▸ **didCreateMagicLink**(`result`: *boolean*): [*AuthResultAction*](../interfaces/redux_auth_actions.authresultaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`result` | *boolean* |

**Returns:** [*AuthResultAction*](../interfaces/redux_auth_actions.authresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:227](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L227)

___

### didForgotPassword

▸ **didForgotPassword**(`result`: *boolean*): [*AuthResultAction*](../interfaces/redux_auth_actions.authresultaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`result` | *boolean* |

**Returns:** [*AuthResultAction*](../interfaces/redux_auth_actions.authresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:213](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L213)

___

### didLogout

▸ **didLogout**(): [*LoginResultAction*](../interfaces/redux_auth_actions.loginresultaction.md)

**Returns:** [*LoginResultAction*](../interfaces/redux_auth_actions.loginresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:177](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L177)

___

### didResendVerificationEmail

▸ **didResendVerificationEmail**(`result`: *boolean*): [*AuthResultAction*](../interfaces/redux_auth_actions.authresultaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`result` | *boolean* |

**Returns:** [*AuthResultAction*](../interfaces/redux_auth_actions.authresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:206](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L206)

___

### didResetPassword

▸ **didResetPassword**(`result`: *boolean*): [*AuthResultAction*](../interfaces/redux_auth_actions.authresultaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`result` | *boolean* |

**Returns:** [*AuthResultAction*](../interfaces/redux_auth_actions.authresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:220](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L220)

___

### didVerifyEmail

▸ **didVerifyEmail**(`result`: *boolean*): [*AuthResultAction*](../interfaces/redux_auth_actions.authresultaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`result` | *boolean* |

**Returns:** [*AuthResultAction*](../interfaces/redux_auth_actions.authresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:199](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L199)

___

### loadedUserData

▸ **loadedUserData**(`user`: User): [*LoadDataResultAction*](../interfaces/redux_auth_actions.loaddataresultaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |

**Returns:** [*LoadDataResultAction*](../interfaces/redux_auth_actions.loaddataresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:234](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L234)

___

### loginUserByGithubError

▸ **loginUserByGithubError**(`message`: *string*): [*LoginResultAction*](../interfaces/redux_auth_actions.loginresultaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`message` | *string* |

**Returns:** [*LoginResultAction*](../interfaces/redux_auth_actions.loginresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:156](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L156)

___

### loginUserByGithubSuccess

▸ **loginUserByGithubSuccess**(`message`: *string*): [*LoginResultAction*](../interfaces/redux_auth_actions.loginresultaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`message` | *string* |

**Returns:** [*LoginResultAction*](../interfaces/redux_auth_actions.loginresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:149](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L149)

___

### loginUserByLinkedinError

▸ **loginUserByLinkedinError**(`message`: *string*): [*LoginResultAction*](../interfaces/redux_auth_actions.loginresultaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`message` | *string* |

**Returns:** [*LoginResultAction*](../interfaces/redux_auth_actions.loginresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:170](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L170)

___

### loginUserByLinkedinSuccess

▸ **loginUserByLinkedinSuccess**(`message`: *string*): [*LoginResultAction*](../interfaces/redux_auth_actions.loginresultaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`message` | *string* |

**Returns:** [*LoginResultAction*](../interfaces/redux_auth_actions.loginresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:163](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L163)

___

### loginUserError

▸ **loginUserError**(`err`: *string*): [*LoginResultAction*](../interfaces/redux_auth_actions.loginresultaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`err` | *string* |

**Returns:** [*LoginResultAction*](../interfaces/redux_auth_actions.loginresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:142](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L142)

___

### loginUserSuccess

▸ **loginUserSuccess**(`authUser`: AuthUser): [*LoginResultAction*](../interfaces/redux_auth_actions.loginresultaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`authUser` | AuthUser |

**Returns:** [*LoginResultAction*](../interfaces/redux_auth_actions.loginresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:134](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L134)

___

### registerUserByEmailError

▸ **registerUserByEmailError**(`message`: *string*): [*RegistrationResultAction*](../interfaces/redux_auth_actions.registrationresultaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`message` | *string* |

**Returns:** [*RegistrationResultAction*](../interfaces/redux_auth_actions.registrationresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:192](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L192)

___

### registerUserByEmailSuccess

▸ **registerUserByEmailSuccess**(`identityProvider`: IdentityProvider): [*RegistrationResultAction*](../interfaces/redux_auth_actions.registrationresultaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`identityProvider` | IdentityProvider |

**Returns:** [*RegistrationResultAction*](../interfaces/redux_auth_actions.registrationresultaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:184](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L184)

___

### updateAvatarList

▸ **updateAvatarList**(`avatarList`: []): [*AvatarListUpdateAction*](../interfaces/redux_auth_actions.avatarlistupdateaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`avatarList` | [] |

**Returns:** [*AvatarListUpdateAction*](../interfaces/redux_auth_actions.avatarlistupdateaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:280](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L280)

___

### updatedUserSettingsAction

▸ **updatedUserSettingsAction**(`data`: *any*): [*UserSettingsUpdatedAction*](../interfaces/redux_auth_actions.usersettingsupdatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`data` | *any* |

**Returns:** [*UserSettingsUpdatedAction*](../interfaces/redux_auth_actions.usersettingsupdatedaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:241](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L241)

___

### userAvatarIdUpdated

▸ **userAvatarIdUpdated**(`result`: *any*): [*UserAvatarIdUpdatedAction*](../interfaces/redux_auth_actions.useravataridupdatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`result` | *any* |

**Returns:** [*UserAvatarIdUpdatedAction*](../interfaces/redux_auth_actions.useravataridupdatedaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:264](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L264)

___

### userUpdated

▸ **userUpdated**(`user`: User): [*UserUpdatedAction*](../interfaces/redux_auth_actions.userupdatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`user` | User |

**Returns:** [*UserUpdatedAction*](../interfaces/redux_auth_actions.userupdatedaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:273](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L273)

___

### usernameUpdated

▸ **usernameUpdated**(`result`: *any*): [*UsernameUpdatedAction*](../interfaces/redux_auth_actions.usernameupdatedaction.md)

#### Parameters:

Name | Type |
:------ | :------ |
`result` | *any* |

**Returns:** [*UsernameUpdatedAction*](../interfaces/redux_auth_actions.usernameupdatedaction.md)

Defined in: [packages/client-core/redux/auth/actions.ts:256](https://github.com/xr3ngine/xr3ngine/blob/56376a778/packages/client-core/redux/auth/actions.ts#L256)
