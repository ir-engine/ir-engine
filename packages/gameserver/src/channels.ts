import { Paginated } from '@feathersjs/feathers/lib'

import '@feathersjs/transport-commons'

import { decode } from 'jsonwebtoken'

import { IdentityProviderInterface } from '@xrengine/common/src/dbmodels/IdentityProvider'
import { InstanceInterface } from '@xrengine/common/src/dbmodels/Instance'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import {
  createEngine,
  initializeCoreSystems,
  initializeMediaServerSystems,
  initializeNode,
  initializeRealtimeSystems,
  initializeSceneSystems
} from '@xrengine/engine/src/initializeEngine'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { loadSceneFromJSON } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { dispatchAction } from '@xrengine/hyperflux'
import { loadEngineInjection } from '@xrengine/projects/loadEngineInjection'
// import { getPortalByEntityId } from '@xrengine/server-core/src/entities/component/portal.controller'
// import { setRemoteLocationDetail } from '@xrengine/engine/src/scene/functions/createPortal'
import { getSystemsFromSceneData } from '@xrengine/projects/loadSystemInjection'
import { Application } from '@xrengine/server-core/declarations'
import config from '@xrengine/server-core/src/appconfig'
import multiLogger from '@xrengine/server-core/src/logger'
import getLocalServerIp from '@xrengine/server-core/src/util/get-local-server-ip'

const logger = multiLogger.child({ component: 'gameserver:channels' })

interface SocketIOConnectionType {
  provider: string
  headers: any
  socketQuery?: {
    sceneId: string
    locationId?: string
    instanceId?: string
    channelId?: string
    token: string
    EIO: string
    transport: string
    t: string
  }
  instanceId?: string
  channelId?: string
}

interface GameserverStatus {
  state: 'Shutdown' | 'Ready'
  address: string
  portsList: Array<{ name: string; port: number }>
  players: any
}

type InstanceMetadata = {
  currentUsers: number
  locationId: string
  channelId: string
  ipAddress: string
}

const loadScene = async (app: Application, scene: string) => {
  const [projectName, sceneName] = scene.split('/')
  // const sceneRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/

  const isInitialized = getEngineState().isEngineInitialized.value

  const sceneResultPromise = app.service('scene').get({ projectName, sceneName, metadataOnly: false }, null!)

  if (!isInitialized) {
    const projectsPromise = app.service('project').find(null!)

    await initializeCoreSystems()
    await initializeRealtimeSystems(false, true)
    await initializeSceneSystems()

    Engine.instance.publicPath = config.client.url
    const world = Engine.instance.currentWorld
    const projects = (await projectsPromise).data.map((project) => project.name)
    await loadEngineInjection(world, projects)

    const userId = 'world' as UserId
    Engine.instance.userId = userId
    const hostIndex = world.userIndexCount++
    world.clients.set(userId, { userId, name: 'world', index: hostIndex, lastSeenTs: Date.now() })
    world.userIdToUserIndex.set(userId, hostIndex)
    world.userIndexToUserId.set(hostIndex, userId)
  }

  const sceneData = (await sceneResultPromise).data.scene as any // SceneData
  const sceneSystems = getSystemsFromSceneData(projectName, sceneData, false)
  await loadSceneFromJSON(sceneData, sceneSystems)

  logger.info('Scene loaded!')
  dispatchAction(Engine.instance.store, EngineActions.joinedWorld())

  // const portals = getAllComponentsOfType(PortalComponent)
  // await Promise.all(
  //   portals.map(async (portal: ReturnType<typeof PortalComponent.get>): Promise<void> => {
  //     return getPortalByEntityId(app, portal.linkedPortalId).then((res) => {
  //       if (res) setRemoteLocationDetail(portal, res.data.spawnPosition, res.data.spawnRotation)
  //     })
  //   })
  // )
}

const createNewInstance = async (app: Application, newInstance: InstanceMetadata) => {
  const { locationId, channelId } = newInstance

  if (channelId) {
    logger.info('channelId: ' + channelId)
    newInstance.channelId = channelId
  } else {
    logger.info('locationId: ' + locationId)
    newInstance.locationId = locationId
  }

  logger.info('Creating new instance: %o', newInstance)
  const instanceResult = (await app.service('instance').create(newInstance)) as InstanceInterface
  await app.agonesSDK.allocate()
  app.instance = instanceResult

  if (app.gsSubdomainNumber != null) {
    const gsSubProvision = (await app.service('gameserver-subdomain-provision').find({
      query: {
        gs_number: app.gsSubdomainNumber
      }
    })) as any

    if (gsSubProvision.total > 0) {
      const provision = gsSubProvision.data[0]
      await app.service('gameserver-subdomain-provision').patch(provision.id, {
        instanceId: instanceResult.id
      } as any)
    }
  }
}

const assignExistingInstance = async (app: Application, existingInstance, channelId: string, locationId: string) => {
  await app.agonesSDK.allocate()
  app.instance = existingInstance

  await app.service('instance').patch(existingInstance.id, {
    currentUsers: existingInstance.currentUsers + 1,
    channelId: channelId,
    locationId: locationId,
    podName: config.kubernetes.enabled ? app.gameServer?.objectMeta?.name : 'local',
    assigned: false,
    assignedAt: null!
  })

  if (app.gsSubdomainNumber != null) {
    const gsSubProvision = (await app.service('gameserver-subdomain-provision').find({
      query: {
        gs_number: app.gsSubdomainNumber
      }
    })) as any

    if (gsSubProvision.total > 0) {
      const provision = gsSubProvision.data[0]
      await app.service('gameserver-subdomain-provision').patch(provision.id, {
        instanceId: existingInstance.id
      } as any)
    }
  }
}

const handleInstance = async (
  app: Application,
  status: GameserverStatus,
  locationId: string,
  channelId: string,
  userId: UserId
) => {
  logger.info('Initialized new gameserver instance.')

  const localIp = await getLocalServerIp(app.isChannelInstance)
  const selfIpAddress = `${status.address}:${status.portsList[0].port}`
  const ipAddress = config.kubernetes.enabled ? selfIpAddress : `${localIp.ipAddress}:${localIp.port}`
  const existingInstanceQuery = {
    ipAddress: ipAddress,
    ended: false
  } as any
  if (locationId) existingInstanceQuery.locationId = locationId
  else if (channelId) existingInstanceQuery.channelId = channelId
  const existingInstanceResult = (await app.service('instance').find({
    query: existingInstanceQuery
  })) as Paginated<InstanceInterface>
  // logger.info('existingInstanceResult: %o', existingInstanceResult.data)
  if (existingInstanceResult.total === 0) {
    const newInstance = {
      currentUsers: 1,
      locationId: locationId,
      channelId: channelId,
      ipAddress: ipAddress,
      podName: config.kubernetes.enabled ? app.gameServer?.objectMeta?.name : 'local'
    } as InstanceMetadata
    await createNewInstance(app, newInstance)
  } else {
    const instance = existingInstanceResult.data[0]
    if (!authorizeUserToJoinServer(app, instance, userId)) return
    await assignExistingInstance(app, existingInstanceResult.data[0], channelId, locationId)
  }
}

const loadEngine = async (app: Application, sceneId: string) => {
  if (app.isChannelInstance) {
    const userId = 'media' as UserId
    Network.instance.transports.set(userId, app.transport)
    Engine.instance.publicPath = config.client.url
    Engine.instance.userId = userId
    const world = Engine.instance.currentWorld
    world.hostId = userId
    await initializeMediaServerSystems()
    await initializeRealtimeSystems(true, false)
    const projects = (await app.service('project').find(null!)).data.map((project) => project.name)
    await loadEngineInjection(world, projects)

    const hostIndex = world.userIndexCount++
    world.clients.set(userId, { userId, name: userId, index: hostIndex, lastSeenTs: Date.now() })
    world.userIdToUserIndex.set(userId, hostIndex)
    world.userIndexToUserId.set(hostIndex, userId)

    dispatchAction(Engine.instance.store, EngineActions.sceneLoaded())
    dispatchAction(Engine.instance.store, EngineActions.joinedWorld())
  } else {
    Network.instance.transports.set('world' as UserId, app.transport)
    await loadScene(app, sceneId)
  }
}

const authorizeUserToJoinServer = async (app: Application, instance, userId: UserId) => {
  const authorizedUsers = (await app.service('instance-authorized-user').find({
    query: {
      instanceId: instance.id,
      $limit: 0
    }
  })) as any
  if (authorizedUsers.total > 0) {
    const thisUserAuthorized = (await app.service('instance-authorized-user').find({
      query: {
        instanceId: instance.id,
        userId,
        $limit: 0
      }
    })) as any
    if (thisUserAuthorized.total === 0) {
      logger.info(`User "${userId}" not authorized to be on this server.`)
      return false
    }
  }
  return true
}

const notifyWorldAndPartiesUserHasJoined = async (
  app: Application,
  userId: string,
  status: GameserverStatus,
  locationId: string,
  channelId: string,
  sceneId: string
) => {
  const user = await app.service('user').get(userId)
  await app.service('message').create(
    {
      targetObjectId: app.instance.id,
      targetObjectType: 'instance',
      text: `${user.name} joined the layer`,
      isNotification: true
    },
    {
      'identity-provider': {
        userId: userId
      }
    }
  )
  if (user.partyId != null) {
    const partyUserResult = await app.service('party-user').find({
      query: {
        partyId: user.partyId
      }
    })
    const party = await app.service('party').get(user.partyId, null!)
    const partyUsers = (partyUserResult as any).data
    const partyOwner = partyUsers.find((partyUser) => partyUser.isOwner === 1)
    if (partyOwner?.userId === userId && party.instanceId !== app.instance.id) {
      await app.service('party').patch(user.partyId, {
        instanceId: app.instance.id
      })
      const nonOwners = partyUsers.filter((partyUser) => partyUser.isOwner !== 1 && partyUser.isOwner !== true)
      const emittedIp = !config.kubernetes.enabled
        ? await getLocalServerIp(app.isChannelInstance)
        : {
            ipAddress: status.address,
            port: status.portsList[0].port
          }
      await Promise.all(
        nonOwners.map(async (partyUser) => {
          await app.service('instance-provision').emit('created', {
            userId: partyUser.userId,
            ipAddress: emittedIp.ipAddress,
            port: emittedIp.port,
            locationId: locationId,
            channelId: channelId,
            sceneId: sceneId
          })
        })
      )
    }
  }
}

const handleUserAttendance = async (app: Application, userId: UserId) => {
  const instanceIdKey = app.isChannelInstance ? 'channelInstanceId' : 'instanceId'
  logger.info(`Patching user ${userId} ${instanceIdKey} to ${app.instance.id}`)

  await app.service('user').patch(userId, {
    [instanceIdKey]: app.instance.id
  })
  await app.service('instance-attendance').patch(
    null,
    {
      ended: true
    },
    {
      where: {
        isChannel: app.isChannelInstance,
        ended: false,
        userId: userId
      }
    }
  )
  const newInstanceAttendance = {
    instanceId: app.instance.id,
    isChannel: app.isChannelInstance,
    userId: userId
  }
  if (!app.isChannelInstance) {
    const location = await app.service('location').get(app.instance.locationId)
    ;(newInstanceAttendance as any).sceneId = location.sceneId
  }
  await app.service('instance-attendance').create(newInstanceAttendance)
}

let engineStarted = false
const loadGameserver = async (
  app: Application,
  status: GameserverStatus,
  locationId: string,
  channelId: string,
  sceneId: string,
  userId: UserId
) => {
  app.isChannelInstance = channelId != null

  logger.info('Creating new gameserver or updating current one.')
  logger.info('agones state is %o', status.state)
  logger.info('app instance is %o', app.instance)
  logger.info({ instanceLocationId: app.instance?.locationId, locationId })

  /**
   * Since local environments do not have the ability to run multiple gameservers,
   * we need to shut down the current one if the user tries to load a new location
   */
  const isLocalServerNeedingNewLocation =
    !config.kubernetes.enabled && app.instance && app.instance.locationId != locationId

  if (isLocalServerNeedingNewLocation) {
    app.restart()
    return
  }

  const isReady = status.state === 'Ready'
  const isNeedingNewServer =
    !config.kubernetes.enabled &&
    (status.state === 'Shutdown' ||
      app.instance == null ||
      app.instance.locationId !== locationId ||
      app.instance.channelId !== channelId)

  if (isReady || isNeedingNewServer) {
    await handleInstance(app, status, locationId, channelId, userId)
    if (!engineStarted && sceneId != null) {
      engineStarted = true
      await loadEngine(app, sceneId)
    }
  } else {
    try {
      const instance = await app.service('instance').get(app.instance.id)
      if (!(await authorizeUserToJoinServer(app, instance, userId))) return
      await app.agonesSDK.allocate()
      await app.service('instance').patch(app.instance.id, {
        currentUsers: (instance.currentUsers as number) + 1,
        assigned: false,
        podName: config.kubernetes.enabled ? app.gameServer?.objectMeta?.name : 'local',
        assignedAt: null!
      })
      return true
    } catch (err) {
      logger.info('Could not update instance, likely because it is a local one that does not exist.')
    }
  }
}

const shutdownGameserver = async (app: Application, instanceId: string) => {
  logger.info('Deleting instance ' + instanceId)
  try {
    await app.service('instance').patch(instanceId, {
      ended: true
    })
  } catch (err) {
    logger.error(err)
  }
  if (app.gsSubdomainNumber != null) {
    const gsSubdomainProvision = (await app.service('gameserver-subdomain-provision').find({
      query: {
        gs_number: app.gsSubdomainNumber
      }
    })) as any
    await app.service('gameserver-subdomain-provision').patch(gsSubdomainProvision.data[0].id, {
      allocated: false
    })
  }
  app.instance.ended = true
  if (config.kubernetes.enabled) {
    delete app.instance
    const gsName = app.gameServer.objectMeta.name
    if (gsName !== undefined) {
      logger.info("App's gameserver name:")
      logger.info(gsName)
    }
  }
  await app.agonesSDK.shutdown()
}

// todo: this could be more elegant
const getActiveUsersCount = (userToIgnore) => {
  const activeClients = Engine.instance.currentWorld.clients
  const activeUsers = [...activeClients].filter(
    ([, v]) => v.userId !== Engine.instance.userId && v.userId !== userToIgnore.id
  )
  return activeUsers.length
}

const handleUserDisconnect = async (app: Application, connection, user, instanceId) => {
  try {
    const activeUsersCount = getActiveUsersCount(user)
    await app.service('instance').patch(instanceId, {
      currentUsers: activeUsersCount
    })
  } catch (err) {
    logger.info('Failed to patch instance user count, likely because it was destroyed.')
  }

  const instanceIdKey = app.isChannelInstance ? 'channelInstanceId' : 'instanceId'
  // Patch the user's (channel)instanceId to null if they're leaving this instance.
  // But, don't change their (channel)instanceId if it's already something else.
  await app
    .service('user')
    .patch(
      null,
      {
        [instanceIdKey]: null
      },
      {
        query: {
          id: user.id,
          [instanceIdKey]: instanceId
        }
      }
    )
    .catch((err) => {
      logger.warn(err, "Failed to patch user, probably because they don't have an ID yet.")
    })
  await app.service('instance-attendance').patch(
    null,
    {
      ended: true
    },
    {
      query: {
        isChannel: app.isChannelInstance,
        instanceId: instanceId,
        userId: user.id
      }
    }
  )

  app.channel(`instanceIds/${instanceId as string}`).leave(connection)

  await new Promise((resolve) => setTimeout(resolve, config.gameserver.shutdownDelayMs))

  // count again here, as it may have changed
  const activeUsersCount = getActiveUsersCount(user)
  if (activeUsersCount < 1) await shutdownGameserver(app, instanceId)
}

const onConnection = (app: Application) => async (connection: SocketIOConnectionType) => {
  logger.info('Connection: %o', connection)

  if (!connection.socketQuery?.token) return

  const authResult = await app.service('authentication').strategies.jwt.authenticate!(
    { accessToken: connection.socketQuery.token },
    {}
  )
  const identityProvider = authResult['identity-provider'] as IdentityProviderInterface
  if (!identityProvider?.id) return

  const userId = identityProvider.userId
  logger.info(
    `user ${userId} joining ${connection.socketQuery.locationId} with sceneId ${connection.socketQuery.sceneId}`
  )
  let locationId = connection.socketQuery.locationId!
  let channelId = connection.socketQuery.channelId!
  const sceneId: string = connection.socketQuery.sceneId

  if (!sceneId) {
    return logger.warn("Scene ID is empty, can't init.")
  }

  if (locationId === '') {
    locationId = undefined!
  }
  if (channelId === '') {
    channelId = undefined!
  }
  const gsResult = await app.agonesSDK.getGameServer()
  const status = gsResult.status as GameserverStatus

  await loadGameserver(app, status, locationId, channelId, sceneId, userId)

  connection.instanceId = app.instance.id
  app.channel(`instanceIds/${app.instance.id as string}`).join(connection)

  await handleUserAttendance(app, userId)
  if (!app.isChannelInstance) {
    await notifyWorldAndPartiesUserHasJoined(app, userId, status, locationId, channelId, sceneId)
  }
}

const onDisconnection = (app: Application) => async (connection: SocketIOConnectionType) => {
  const token = connection.socketQuery?.token
  if (!token) return

  let authResult
  try {
    authResult = await app.service('authentication').strategies.jwt.authenticate!({ accessToken: token }, {})
  } catch (err) {
    if (err.code === 401 && err.data.name === 'TokenExpiredError') {
      const jwtDecoded = decode(token)!
      const idProvider = await app.service('identity-provider').get(jwtDecoded.sub as string)
      authResult = {
        'identity-provider': idProvider
      }
    } else throw err
  }
  const identityProvider = authResult['identity-provider'] as IdentityProviderInterface
  if (identityProvider != null && identityProvider.id != null) {
    const userId = identityProvider.userId
    const user = await app.service('user').get(userId)
    if (!app.isChannelInstance)
      await app.service('message').create(
        {
          targetObjectId: app.instance.id,
          targetObjectType: 'instance',
          text: `${user.name} left the layer`,
          isNotification: true
        },
        {
          'identity-provider': {
            userId: userId
          }
        }
      )
    const instanceId = !config.kubernetes.enabled ? connection.instanceId : app.instance?.id
    let instance
    try {
      instance = app.instance && instanceId != null ? await app.service('instance').get(instanceId) : {}
    } catch (err) {
      logger.warn('Could not get instance, likely because it is a local one that no longer exists.')
    }
    logger.info('instanceId: ' + instanceId)
    logger.info('user instanceId: ' + user.instanceId)

    if (instanceId != null && instance != null) {
      await handleUserDisconnect(app, connection, user, instanceId)
    }
  }
}

export default (app: Application): void => {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return
  }

  createEngine()
  initializeNode()

  app.service('gameserver-load').on('patched', async (params) => {
    const { id, ipAddress, podName, locationId, sceneId } = params

    if (app.instance && app.instance.id !== id) {
      return
    }

    const gsResult = await app.agonesSDK.getGameServer()
    const gsName = gsResult.objectMeta.name
    const status = gsResult.status as GameserverStatus

    // Validate if pod name match
    if (gsName !== podName) {
      return
    }

    loadGameserver(app, status, locationId, null!, sceneId, null!)
  })

  app.on('connection', onConnection(app))
  app.on('disconnect', onDisconnection(app))
}
