import { dispatchAlertError, dispatchAlertSuccess } from '../../../common/reducers/alert/service'
import { resolveAuthUser } from '@xrengine/common/src/interfaces/AuthUser'
import { IdentityProvider } from '@xrengine/common/src/interfaces/IdentityProvider'
import { resolveUser, resolveWalletUser } from '@xrengine/common/src/interfaces/User'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MessageTypes } from '@xrengine/engine/src/networking/enums/MessageTypes'
// TODO: Decouple this
// import { endVideoChat, leave } from '@xrengine/engine/src/networking/functions/SocketWebRTCClientFunctions';
import axios from 'axios'
import { Config } from '../../../helper'
import querystring from 'querystring'
import { Dispatch } from 'redux'
import { v1 } from 'uuid'
import { client } from '../../../feathers'
import { validateEmail, validatePhoneNumber } from '../../../helper'
import { getStoredAuthState } from '../../../persisted.store'
import Store from '../../../store'
import { UserAction } from '../../store/UserAction'
import {
  actionProcessing,
  avatarUpdated,
  didCreateMagicLink,
  didForgotPassword,
  didLogout,
  didResendVerificationEmail,
  didResetPassword,
  didVerifyEmail,
  EmailLoginForm,
  EmailRegistrationForm,
  loadedUserData,
  loginUserError,
  loginUserSuccess,
  registerUserByEmailError,
  registerUserByEmailSuccess,
  updateAvatarList,
  updatedUserSettingsAction,
  userAvatarIdUpdated,
  usernameUpdated,
  userUpdated
} from './actions'
import { setAvatar } from '@xrengine/engine/src/avatar/functions/avatarFunctions'

const store = Store.store

export function doLoginAuto(allowGuest?: boolean, forceClientAuthReset?: boolean) {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      const authData = getStoredAuthState()
      let accessToken =
        forceClientAuthReset !== true && authData && authData.authUser ? authData.authUser.accessToken : undefined

      if (allowGuest !== true && accessToken == null) {
        return
      }

      if (forceClientAuthReset === true) await (client as any).authentication.reset()
      if (allowGuest === true && (accessToken == null || accessToken.length === 0)) {
        const newProvider = await client.service('identity-provider').create({
          type: 'guest',
          token: v1()
        })
        accessToken = newProvider.accessToken
      }

      await (client as any).authentication.setAccessToken(accessToken as string)
      let res
      try {
        res = await (client as any).reAuthenticate()
      } catch (err) {
        if (err.className === 'not-found' || (err.className === 'not-authenticated' && err.message === 'jwt expired')) {
          await dispatch(didLogout())
          await (client as any).authentication.reset()
          const newProvider = await client.service('identity-provider').create({
            type: 'guest',
            token: v1()
          })
          accessToken = newProvider.accessToken
          await (client as any).authentication.setAccessToken(accessToken as string)
          res = await (client as any).reAuthenticate()
        } else {
          throw err
        }
      }
      if (res) {
        if (res['identity-provider']?.id == null) {
          await dispatch(didLogout())
          await (client as any).authentication.reset()
          const newProvider = await client.service('identity-provider').create({
            type: 'guest',
            token: v1()
          })
          accessToken = newProvider.accessToken
          await (client as any).authentication.setAccessToken(accessToken as string)
          res = await (client as any).reAuthenticate()
        }
        const authUser = resolveAuthUser(res)
        dispatch(loginUserSuccess(authUser))
        loadUserData(dispatch, authUser.identityProvider.userId)
      } else {
        console.log('****************')
      }
    } catch (err) {
      console.error(err)
      dispatch(didLogout())

      // if (window.location.pathname !== '/') {
      //   window.location.href = '/';
      // }
    }
  }
}

export function loadUserData(dispatch: Dispatch, userId: string): any {
  client
    .service('user')
    .get(userId)
    .then((res: any) => {
      if (res.user_setting == null) {
        return client
          .service('user-settings')
          .find({
            query: {
              userId: userId
            }
          })
          .then((settingsRes) => {
            if (settingsRes.total === 0) {
              return client
                .service('user-settings')
                .create({
                  userId: userId
                })
                .then((newSettings) => {
                  res.user_setting = newSettings

                  return Promise.resolve(res)
                })
            }
            res.user_setting = settingsRes.data[0]
            return Promise.resolve(res)
          })
      }
      return Promise.resolve(res)
    })
    .then((res: any) => {
      const user = resolveUser(res)
      dispatch(loadedUserData(user))
    })
    .catch((err: any) => {
      console.log(err)
      dispatchAlertError(dispatch, 'Failed to load user data')
    })
}

export function loginUserByPassword(form: EmailLoginForm) {
  return (dispatch: Dispatch): any => {
    // check email validation.
    if (!validateEmail(form.email)) {
      dispatchAlertError(dispatch, 'Please input valid email address')

      return
    }

    dispatch(actionProcessing(true))
    ;(client as any)
      .authenticate({
        strategy: 'local',
        email: form.email,
        password: form.password
      })
      .then((res: any) => {
        const authUser = resolveAuthUser(res)

        if (!authUser.identityProvider.isVerified) {
          ;(client as any).logout()

          dispatch(registerUserByEmailSuccess(authUser.identityProvider))
          window.location.href = '/auth/confirm'
          return
        }

        dispatch(loginUserSuccess(authUser))
        loadUserData(dispatch, authUser.identityProvider.userId)
        window.location.href = '/'
      })
      .catch((err: any) => {
        console.log(err)

        dispatch(loginUserError('Failed to login'))
        dispatchAlertError(dispatch, err.message)
      })
      .finally(() => dispatch(actionProcessing(false)))
  }
}

const parseUserWalletCredentials = (wallet) => {
  return {
    user: {
      id: 'did:web:example.com',
      displayName: 'alice',
      icon: 'https://material-ui.com/static/images/avatar/1.jpg'
      // session // this will contain the access token and helper methods
    }
  }
}

export function loginUserByXRWallet(wallet: any) {
  return (dispatch: Dispatch, getState: any): any => {
    try {
      dispatch(actionProcessing(true))

      const credentials: any = parseUserWalletCredentials(wallet)
      console.log(credentials)

      const walletUser = resolveWalletUser(credentials)

      //TODO: This is temp until we move completely to XR wallet
      const oldId = getState().get('auth').get('user').id
      walletUser.id = oldId

      loadXRAvatarForUpdatedUser(walletUser)
      dispatch(loadedUserData(walletUser))
    } catch (err) {
      console.log(err)
      dispatch(loginUserError('Failed to login'))
      dispatchAlertError(dispatch, err.message)
    } finally {
      dispatch(actionProcessing(false))
    }
  }
}

export function loginUserByOAuth(service: string) {
  return (dispatch: Dispatch, getState: any): any => {
    dispatch(actionProcessing(true))
    const token = getState().get('auth').get('authUser').accessToken
    const path = window.location.pathname
    const queryString = querystring.parse(window.location.search.slice(1))
    const redirectObject = {
      path: path
    } as any
    if (queryString.instanceId && queryString.instanceId.length > 0) redirectObject.instanceId = queryString.instanceId
    let redirectUrl = `${
      Config.publicRuntimeConfig.apiServer
    }/oauth/${service}?feathers_token=${token}&redirect=${JSON.stringify(redirectObject)}`

    window.location.href = redirectUrl
  }
}

export function loginUserByJwt(accessToken: string, redirectSuccess: string, redirectError: string): any {
  return async (dispatch: Dispatch): Promise<any> => {
    try {
      dispatch(actionProcessing(true))
      await (client as any).authentication.setAccessToken(accessToken as string)
      const res = await (client as any).authenticate({
        strategy: 'jwt',
        accessToken
      })

      const authUser = resolveAuthUser(res)

      dispatch(loginUserSuccess(authUser))
      loadUserData(dispatch, authUser.identityProvider.userId)
      dispatch(actionProcessing(false))
      window.location.href = redirectSuccess
    } catch (err) {
      console.log(err)
      dispatch(loginUserError('Failed to login'))
      dispatchAlertError(dispatch, err.message)
      window.location.href = `${redirectError}?error=${err.message}`
      dispatch(actionProcessing(false))
    }
  }
}

export function logoutUser() {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true))
    ;(client as any)
      .logout()
      .then(() => dispatch(didLogout()))
      .catch(() => dispatch(didLogout()))
      .finally(() => {
        dispatch(actionProcessing(false))
        doLoginAuto(true, true)(dispatch)
      })
  }
}

export function registerUserByEmail(form: EmailRegistrationForm) {
  console.log('1 registerUserByEmail')
  return (dispatch: Dispatch): any => {
    console.log('2 dispatch', dispatch)
    dispatch(actionProcessing(true))
    client
      .service('identity-provider')
      .create({
        token: form.email,
        password: form.password,
        type: 'password'
      })
      .then((identityProvider: any) => {
        console.log('3 ', identityProvider)
        dispatch(registerUserByEmailSuccess(identityProvider))
        window.location.href = '/auth/confirm'
      })
      .catch((err: any) => {
        console.log('error', err)
        dispatch(registerUserByEmailError(err.message))
        dispatchAlertError(dispatch, err.message)
      })
      .finally(() => {
        console.log('4 finally', dispatch)
        dispatch(actionProcessing(false))
      })
  }
}

export function verifyEmail(token: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true))

    client
      .service('authManagement')
      .create({
        action: 'verifySignupLong',
        value: token
      })
      .then((res: any) => {
        dispatch(didVerifyEmail(true))
        loginUserByJwt(res.accessToken, '/', '/')(dispatch)
      })
      .catch((err: any) => {
        console.log(err)
        dispatch(didVerifyEmail(false))
        dispatchAlertError(dispatch, err.message)
      })
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function resendVerificationEmail(email: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true))

    client
      .service('authManagement')
      .create({
        action: 'resendVerifySignup',
        value: {
          token: email,
          type: 'password'
        }
      })
      .then(() => dispatch(didResendVerificationEmail(true)))
      .catch(() => dispatch(didResendVerificationEmail(false)))
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function forgotPassword(email: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true))
    console.log('forgotPassword', email)
    client
      .service('authManagement')
      .create({
        action: 'sendResetPwd',
        value: {
          token: email,
          type: 'password'
        }
      })
      .then(() => dispatch(didForgotPassword(true)))
      .catch(() => dispatch(didForgotPassword(false)))
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function resetPassword(token: string, password: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true))

    client
      .service('authManagement')
      .create({
        action: 'resetPwdLong',
        value: { token, password }
      })
      .then((res: any) => {
        console.log(res)
        dispatch(didResetPassword(true))
        window.location.href = '/'
      })
      .catch((err: any) => {
        console.log(err)
        dispatch(didResetPassword(false))
        window.location.href = '/'
      })
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function createMagicLink(emailPhone: string, linkType?: 'email' | 'sms') {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true))

    let type = 'email'
    let paramName = 'email'
    const enableEmailMagicLink =
      (Config.publicRuntimeConfig.auth && Config.publicRuntimeConfig.auth.enableEmailMagicLink) ?? true
    const enableSmsMagicLink =
      (Config.publicRuntimeConfig.auth && Config.publicRuntimeConfig.auth.enableSmsMagicLink) ?? false

    if (linkType === 'email') {
      type = 'email'
      paramName = 'email'
    } else if (linkType === 'sms') {
      type = 'sms'
      paramName = 'mobile'
    } else {
      const stripped = emailPhone.replace(/-/g, '')
      if (validatePhoneNumber(stripped)) {
        if (!enableSmsMagicLink) {
          dispatchAlertError(dispatch, 'Please input valid email address')

          return
        }
        type = 'sms'
        paramName = 'mobile'
        emailPhone = '+1' + stripped
      } else if (validateEmail(emailPhone)) {
        if (!enableEmailMagicLink) {
          dispatchAlertError(dispatch, 'Please input valid phone number')

          return
        }
        type = 'email'
      } else {
        dispatchAlertError(dispatch, 'Please input valid email or phone number')

        return
      }
    }

    client
      .service('magic-link')
      .create({
        type,
        [paramName]: emailPhone
      })
      .then((res: any) => {
        console.log(res)
        dispatch(didCreateMagicLink(true))
        dispatchAlertSuccess(dispatch, 'Login Magic Link was sent. Please check your Email or SMS.')
      })
      .catch((err: any) => {
        console.log(err)
        dispatch(didCreateMagicLink(false))
        dispatchAlertError(dispatch, err.message)
      })
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function addConnectionByPassword(form: EmailLoginForm, userId: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true))

    client
      .service('identity-provider')
      .create({
        token: form.email,
        password: form.password,
        type: 'password',
        userId
      })
      .then((res: any) => {
        const identityProvider = res as IdentityProvider
        loadUserData(dispatch, identityProvider.userId)
      })
      .catch((err: any) => {
        console.log(err)
        dispatchAlertError(dispatch, err.message)
      })
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function addConnectionByEmail(email: string, userId: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true))

    client
      .service('magic-link')
      .create({
        email,
        type: 'email',
        userId
      })
      .then((res: any) => {
        const identityProvider = res as IdentityProvider
        if (identityProvider.userId != null) loadUserData(dispatch, identityProvider.userId)
      })
      .catch((err: any) => {
        console.log(err)
        dispatchAlertError(dispatch, err.message)
      })
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function addConnectionBySms(phone: string, userId: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true))

    let sendPhone = phone.replace(/-/g, '')
    if (sendPhone.length === 10) {
      sendPhone = '1' + sendPhone
    }

    client
      .service('magic-link')
      .create({
        mobile: sendPhone,
        type: 'sms',
        userId
      })
      .then((res: any) => {
        const identityProvider = res as IdentityProvider
        if (identityProvider.userId != null) loadUserData(dispatch, identityProvider.userId)
      })
      .catch((err: any) => {
        console.log(err)
        dispatchAlertError(dispatch, err.message)
      })
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function addConnectionByOauth(oauth: 'facebook' | 'google' | 'github' | 'linkedin' | 'twitter', userId: string) {
  return (/* dispatch: Dispatch */) => {
    window.open(`${Config.publicRuntimeConfig.apiServer}/auth/oauth/${oauth}?userId=${userId}`, '_blank')
  }
}

export function removeConnection(identityProviderId: number, userId: string) {
  return (dispatch: Dispatch): any => {
    dispatch(actionProcessing(true))

    client
      .service('identity-provider')
      .remove(identityProviderId)
      .then(() => {
        loadUserData(dispatch, userId)
      })
      .catch((err: any) => {
        console.log(err)
        dispatchAlertError(dispatch, err.message)
      })
      .finally(() => dispatch(actionProcessing(false)))
  }
}

export function refreshConnections(userId: string) {
  ;(dispatch: Dispatch): any => loadUserData(dispatch, userId)
}

export const updateUserSettings = (id: any, data: any) => async (dispatch: any) => {
  const res = await client.service('user-settings').patch(id, data)
  dispatch(updatedUserSettingsAction(res))
}

// TODO: remove
export function uploadAvatar(data: any) {
  return async (dispatch: Dispatch, getState: any) => {
    const token = getState().get('auth').get('authUser').accessToken
    const selfUser = getState().get('auth').get('user')
    const res = await axios.post(`${Config.publicRuntimeConfig.apiServer}/upload`, data, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: 'Bearer ' + token
      }
    })
    await client.service('user').patch(selfUser.id, {
      name: selfUser.name
    })
    const result = res.data
    dispatchAlertSuccess(dispatch, 'Avatar updated')
    dispatch(avatarUpdated(result))
  }
}

export function uploadAvatarModel(model: any, thumbnail: any, avatarName?: string, isPublicAvatar?: boolean) {
  return async (dispatch: Dispatch, getState: any) => {
    const name = avatarName ? avatarName : model.name.substring(0, model.name.lastIndexOf('.'))
    const [modelURL, thumbnailURL] = await Promise.all([
      client.service('upload-presigned').get('', {
        query: { type: 'avatar', fileName: name + '.glb', fileSize: model.size, isPublicAvatar: isPublicAvatar }
      }),
      client.service('upload-presigned').get('', {
        query: {
          type: 'user-thumbnail',
          fileName: name + '.png',
          fileSize: thumbnail.size,
          mimeType: thumbnail.type,
          isPublicAvatar: isPublicAvatar
        }
      })
    ])

    const modelData = new FormData()
    Object.keys(modelURL.fields).forEach((key) => modelData.append(key, modelURL.fields[key]))
    modelData.append('acl', 'public-read')
    modelData.append('file', model)

    // Upload Model file to S3
    return axios
      .post(modelURL.url, modelData)
      .then(async (res) => {
        const thumbnailData = new FormData()
        Object.keys(thumbnailURL.fields).forEach((key) => thumbnailData.append(key, thumbnailURL.fields[key]))
        thumbnailData.append('acl', 'public-read')
        thumbnailData.append('file', thumbnail)

        const modelCloudfrontURL = `https://${modelURL.cloudfrontDomain}/${modelURL.fields.Key}`
        const thumbnailCloudfrontURL = `https://${thumbnailURL.cloudfrontDomain}/${thumbnailURL.fields.Key}`
        const selfUser = (store.getState() as any).get('auth').get('user')
        const existingModel = await client.service('static-resource').find({
          query: {
            name: name,
            staticResourceType: 'avatar',
            userId: isPublicAvatar ? null : selfUser.id
          }
        })
        const existingThumbnail = await client.service('static-resource').find({
          query: {
            name: name,
            staticResourceType: 'user-thumbnail',
            userId: isPublicAvatar ? null : selfUser.id
          }
        })
        // Upload Thumbnail file to S3
        axios
          .post(thumbnailURL.url, thumbnailData)
          .then((res) => {
            // Save URLs to backend
            Promise.all([
              existingModel.total > 0
                ? client.service('static-resource').patch(existingModel.data[0].id, {
                    url: modelCloudfrontURL,
                    key: modelURL.fields.Key
                  })
                : client.service('static-resource').create({
                    name,
                    staticResourceType: 'avatar',
                    url: modelCloudfrontURL,
                    key: modelURL.fields.Key,
                    userId: isPublicAvatar ? null : selfUser.id
                  }),
              existingThumbnail.total > 0
                ? client.service('static-resource').patch(existingThumbnail.data[0].id, {
                    url: thumbnailCloudfrontURL,
                    key: thumbnailURL.fields.Key
                  })
                : client.service('static-resource').create({
                    name,
                    staticResourceType: 'user-thumbnail',
                    url: thumbnailCloudfrontURL,
                    mimeType: 'image/png',
                    key: thumbnailURL.fields.Key,
                    userId: isPublicAvatar ? null : selfUser.id
                  })
            ])
              .then((_) => {
                if (isPublicAvatar !== true) {
                  dispatch(userAvatarIdUpdated(res))
                  client
                    .service('user')
                    .patch(selfUser.id, { avatarId: name })
                    .then((_) => {
                      dispatchAlertSuccess(dispatch, 'Avatar Uploaded Successfully.')
                      if (Network?.instance?.transport)
                        (Network.instance.transport as any).sendNetworkStatUpdateMessage({
                          type: MessageTypes.AvatarUpdated,
                          userId: selfUser.id,
                          avatarId: name,
                          avatarURL: modelCloudfrontURL,
                          thumbnailURL: thumbnailCloudfrontURL
                        })
                    })
                }
              })
              .catch((err) => {
                console.error('Error occurred while saving Avatar.', err)

                // IF error occurs then removed Model and thumbnail from S3
                client
                  .service('upload-presigned')
                  .remove('', { query: { keys: [modelURL.fields.Key, thumbnailURL.fields.Key] } })
              })
          })
          .catch((err) => {
            console.error('Error occurred while uploading thumbnail.', err)

            // IF error occurs then removed Model and thumbnail from S3
            client.service('upload-presigned').remove('', { query: { keys: [modelURL.fields.Key] } })
          })
      })
      .catch((err) => {
        console.error('Error occurred while uploading model.', err)
      })
  }
}

export function removeAvatar(keys: [string]) {
  return async (dispatch: Dispatch, getState: any) => {
    await client
      .service('upload-presigned')
      .remove('', {
        query: { keys }
      })
      .then((_) => {
        dispatchAlertSuccess(dispatch, 'Avatar Removed Successfully.')
        fetchAvatarList()(dispatch)
      })
  }
}

export function fetchAvatarList() {
  const selfUser = (store.getState() as any).get('auth').get('user')
  return async (dispatch: Dispatch) => {
    const result = await client.service('static-resource').find({
      query: {
        $select: ['id', 'key', 'name', 'url', 'staticResourceType', 'userId'],
        staticResourceType: {
          $in: ['avatar', 'user-thumbnail']
        },
        $or: [{ userId: selfUser.id }, { userId: null }],
        $limit: 1000
      }
    })
    dispatch(updateAvatarList(result.data))
  }
}

export function updateUsername(userId: string, name: string) {
  return (dispatch: Dispatch): any => {
    client
      .service('user')
      .patch(userId, {
        name: name
      })
      .then((res: any) => {
        dispatchAlertSuccess(dispatch, 'Username updated')
        dispatch(usernameUpdated(res))
      })
  }
}

export function updateUserAvatarId(userId: string, avatarId: string, avatarURL: string, thumbnailURL: string) {
  return (dispatch: Dispatch): any => {
    client
      .service('user')
      .patch(userId, {
        avatarId: avatarId
      })
      .then((res: any) => {
        // dispatchAlertSuccess(dispatch, 'User Avatar updated');
        dispatch(userAvatarIdUpdated(res))
        if (Network?.instance?.transport)
          (Network.instance.transport as any).sendNetworkStatUpdateMessage({
            type: MessageTypes.AvatarUpdated,
            userId,
            avatarId,
            avatarURL,
            thumbnailURL
          })
      })
  }
}

export function removeUser(userId: string) {
  return async (dispatch: Dispatch): Promise<any> => {
    await client.service('user').remove(userId)
    await client.service('identity-provider').remove(null, {
      where: {
        userId: userId
      }
    })
    logoutUser()(dispatch)
  }
}

const getAvatarResources = (user) => {
  return client.service('static-resource').find({
    query: {
      name: user.avatarId,
      staticResourceType: { $in: ['user-thumbnail', 'avatar'] },
      $or: [{ userId: null }, { userId: user.id }],
      $sort: {
        userId: -1
      },
      $limit: 2
    }
  })
}

const loadAvatarForUpdatedUser = async (user) => {
  if (user.instanceId == null && user.channelInstanceId == null) return Promise.resolve(true)

  return new Promise(async (resolve) => {
    const networkUser = Network.instance?.clients[user.id]

    // If network is not initialized then wait to be initialized.
    if (!networkUser) {
      setTimeout(async () => {
        await loadAvatarForUpdatedUser(user)
        resolve(true)
      }, 200)
      return
    }

    if (networkUser.avatarDetail.avatarId === user.avatarId) {
      resolve(true)
      return
    }

    // Fetch Avatar Resources for updated user.
    const avatars = await getAvatarResources(user)
    if (avatars?.data && avatars.data.length === 2) {
      const avatarURL = avatars?.data[0].staticResourceType === 'avatar' ? avatars?.data[0].url : avatars?.data[1].url
      const thumbnailURL =
        avatars?.data[0].staticResourceType === 'user-thumbnail' ? avatars?.data[0].url : avatars?.data[1].url

      networkUser.avatarDetail = { avatarURL, thumbnailURL, avatarId: user.avatarId }

      //Find entityId from network objects of updated user and dispatch avatar load event.
      for (let key of Object.keys(Network.instance.networkObjects)) {
        const obj = Network.instance.networkObjects[key]
        if (obj?.ownerId === user.id) {
          setAvatar(obj.entity.id, user.avatarId, avatarURL)
          break
        }
      }
    }
    resolve(true)
  })
}

const loadXRAvatarForUpdatedUser = async (user) => {
  if (!user || !user.id) Promise.resolve(true)

  return new Promise(async (resolve) => {
    const networkUser = Network.instance?.clients[user.id]

    // If network is not initialized then wait to be initialized.
    if (!networkUser) {
      setTimeout(async () => {
        await loadAvatarForUpdatedUser(user)
        resolve(true)
      }, 200)
      return
    }

    const avatarURL = user.avatarUrl
    const thumbnailURL = user.avatarUrl

    networkUser.avatarDetail = { avatarURL, thumbnailURL, avatarId: user.avatarId }

    //Find entityId from network objects of updated user and dispatch avatar load event.
    for (let key of Object.keys(Network.instance.networkObjects)) {
      const obj = Network.instance.networkObjects[key]
      if (obj?.ownerId === user.id) {
        setAvatar(obj.entity.id, user.avatarId, avatarURL)
        break
      }
    }
    resolve(true)
  })
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('user').on('patched', async (params) => {
    const selfUser = (store.getState() as any).get('auth').get('user')
    const user = resolveUser(params.userRelationship)

    console.log('User patched', user)
    if (Network.instance != null) await loadAvatarForUpdatedUser(user)

    if (selfUser.id === user.id) {
      if (selfUser.instanceId !== user.instanceId) store.dispatch(UserAction.clearLayerUsers())
      if (selfUser.channelInstanceId !== user.channelInstanceId) store.dispatch(UserAction.clearChannelLayerUsers())
      store.dispatch(userUpdated(user))
      if (user.partyId) {
        // setRelationship('party', user.partyId);
      }
      if (user.instanceId !== selfUser.instanceId) {
        const parsed = new URL(window.location.href)
        let query = parsed.searchParams
        query.set('instanceId', user.instanceId)
        parsed.search = query.toString()
        if (history.pushState) {
          window.history.replaceState({}, '', parsed.toString())
        }
      }
    } else {
      if (user.channelInstanceId != null && user.channelInstanceId === selfUser.channelInstanceId)
        store.dispatch(UserAction.addedChannelLayerUser(user))
      if (user.instanceId != null && user.instanceId === selfUser.instanceId) {
        store.dispatch(UserAction.addedLayerUser(user))
        store.dispatch(UserAction.displayUserToast(user, { userAdded: true }))
      }
      if (user.instanceId !== selfUser.instanceId) {
        store.dispatch(UserAction.removedLayerUser(user))
        store.dispatch(UserAction.displayUserToast(user, { userRemoved: true }))
      }
      if (user.channelInstanceId !== selfUser.channelInstanceId)
        store.dispatch(UserAction.removedChannelLayerUser(user))
    }
  })
  client.service('location-ban').on('created', async (params) => {
    const state = store.getState() as any
    const selfUser = state.get('auth').get('user')
    const party = state.get('party')
    const selfPartyUser =
      party && party.partyUsers ? party.partyUsers.find((partyUser) => partyUser.userId === selfUser.id) : {}
    const currentLocation = state.get('locations').get('currentLocation').get('location')
    const locationBan = params.locationBan
    if (selfUser.id === locationBan.userId && currentLocation.id === locationBan.locationId) {
      // TODO: Decouple and reenable me!
      // endVideoChat({ leftParty: true });
      // leave(true);
      if (selfPartyUser.id != null) {
        await client.service('party-user').remove(selfPartyUser.id)
      }
      const user = resolveUser(await client.service('user').get(selfUser.id))
      store.dispatch(userUpdated(user))
    }
  })
}
