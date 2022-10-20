import { Paginated } from '@feathersjs/feathers/lib'

import '@feathersjs/transport-commons'

import { decode } from 'jsonwebtoken'

import { IdentityProviderInterface } from '@xrengine/common/src/dbmodels/IdentityProvider'
import { Channel } from '@xrengine/common/src/interfaces/Channel'
import { Instance } from '@xrengine/common/src/interfaces/Instance'
import { UserInterface } from '@xrengine/common/src/interfaces/User'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions, getEngineState } from '@xrengine/engine/src/ecs/classes/EngineState'
import { initializeCoreSystems } from '@xrengine/engine/src/initializeCoreSystems'
import { initializeRealtimeSystems } from '@xrengine/engine/src/initializeRealtimeSystems'
import { initializeSceneSystems } from '@xrengine/engine/src/initializeSceneSystems'
import { NetworkTopics } from '@xrengine/engine/src/networking/classes/Network'
import { matchActionOnce } from '@xrengine/engine/src/networking/functions/matchActionOnce'
import { NetworkPeerFunctions } from '@xrengine/engine/src/networking/functions/NetworkPeerFunctions'
import { updateSceneFromJSON } from '@xrengine/engine/src/scene/systems/SceneLoadingSystem'
import { dispatchAction } from '@xrengine/hyperflux'
import { loadEngineInjection } from '@xrengine/projects/loadEngineInjection'
import { Application } from '@xrengine/server-core/declarations'
import config from '@xrengine/server-core/src/appconfig'
import { getProjectsList } from '@xrengine/server-core/src/projects/project/project.service'
import multiLogger from '@xrengine/server-core/src/ServerLogger'
import getLocalServerIp from '@xrengine/server-core/src/util/get-local-server-ip'

import { authorizeUserToJoinServer } from './NetworkFunctions'
import { SocketWebRTCServerNetwork } from './SocketWebRTCServerNetwork'

const logger = multiLogger.child({ component: 'instanceserver:channels' })

interface SocketIOConnectionType {
  provider: string
  headers: any
  socketQuery?: {
    sceneId: string
    locationId?: string
    instanceId?: string
    channelId?: string
    roomCode?: string
    token: string
    EIO: string
    transport: string
    t: string
  }
  instanceId?: string
  channelId?: string
}

interface InstanceserverStatus {
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

/**
 * Creates a new 'instance' entry based on a locationId or channelId
 * If it is a location instance, creates a 'channel' entry
 * @param app
 * @param newInstance
 */
const createNewInstance = async (app: Application, newInstance: InstanceMetadata) => {
  const { locationId, channelId } = newInstance

  logger.info('Creating new instance: %o %s, %s', newInstance, locationId, channelId)
  const instanceResult = (await app.service('instance').create(newInstance)) as Instance
  if (!channelId) {
    const channelResult = await app.service('channel').create({
      channelType: 'instance',
      instanceId: instanceResult.id
    })
  }
  await app.agonesSDK.allocate()
  app.instance = instanceResult

  if (app.isSubdomainNumber != null) {
    const gsSubProvision = (await app.service('instanceserver-subdomain-provision').find({
      query: {
        is_number: app.isSubdomainNumber
      }
    })) as any

    if (gsSubProvision.total > 0) {
      const provision = gsSubProvision.data[0]
      await app.service('instanceserver-subdomain-provision').patch(provision.id, {
        instanceId: instanceResult.id
      } as any)
    }
  }
}

/**
 * Updates the existing 'instance' table entry
 * @param app
 * @param existingInstance
 * @param channelId
 * @param locationId
 */

const assignExistingInstance = async (
  app: Application,
  existingInstance: Instance,
  channelId: string,
  locationId: string
) => {
  await app.agonesSDK.allocate()
  app.instance = existingInstance
  await app.service('instance').patch(existingInstance.id, {
    currentUsers: existingInstance.currentUsers + 1,
    channelId: channelId,
    locationId: locationId,
    podName: config.kubernetes.enabled ? app.instanceServer?.objectMeta?.name : 'local',
    assigned: false,
    assignedAt: null!
  })

  if (app.isSubdomainNumber != null) {
    const gsSubProvision = (await app.service('instanceserver-subdomain-provision').find({
      query: {
        is_number: app.isSubdomainNumber
      }
    })) as any

    if (gsSubProvision.total > 0) {
      const provision = gsSubProvision.data[0]
      await app.service('instanceserver-subdomain-provision').patch(provision.id, {
        instanceId: existingInstance.id
      } as any)
    }
  }
}

/**
 * Creates a new instance by either creating a new entry in the 'instance' table or updating an existing one
 * - Should only initialize an instance once per the lifecycle of an instance server
 * @param app
 * @param status
 * @param locationId
 * @param channelId
 * @param userId
 * @returns
 */

const initializeInstance = async (
  app: Application,
  status: InstanceserverStatus,
  locationId: string,
  channelId: string,
  userId: UserId
) => {
  logger.info('Initialized new instance')

  app.isChannelInstance = !!channelId

  const localIp = await getLocalServerIp(app.isChannelInstance)
  const selfIpAddress = `${status.address}:${status.portsList[0].port}`
  const ipAddress = config.kubernetes.enabled ? selfIpAddress : `${localIp.ipAddress}:${localIp.port}`
  const existingInstanceQuery = {
    ipAddress: ipAddress,
    ended: false
  } as any
  if (locationId) existingInstanceQuery.locationId = locationId
  else if (channelId) existingInstanceQuery.channelId = channelId

  /**
   * The instance record should be created when the instance is provisioned by the API server,
   * here we check that this is the case, as it may be altered, for example by another service or an admin
   */

  const existingInstanceResult = (await app.service('instance').find({
    query: existingInstanceQuery
  })) as Paginated<Instance>
  logger.info('existingInstanceResult: %o', existingInstanceResult.data)

  if (existingInstanceResult.total === 0) {
    const newInstance = {
      currentUsers: 1,
      locationId: locationId,
      channelId: channelId,
      ipAddress: ipAddress,
      podName: config.kubernetes.enabled ? app.instanceServer?.objectMeta?.name : 'local'
    } as InstanceMetadata
    await createNewInstance(app, newInstance)
  } else {
    const instance = existingInstanceResult.data[0]
    if (locationId) {
      const user = await app.service('user').get(userId)
      const existingChannel = (await app.service('channel').find({
        query: {
          channelType: 'instance',
          instanceId: instance.id
        },
        'identity-provider': user['identity_providers']![0]
      } as any)) as Channel[]
      if (existingChannel.length === 0) {
        await app.service('channel').create({
          channelType: 'instance',
          instanceId: instance.id
        })
      }
    }
    if (!(await authorizeUserToJoinServer(app, instance, userId))) return
    await assignExistingInstance(app, instance, channelId, locationId)
  }
}

/**
 * Creates and initializes the server network and transport, then loads all systems for the engine
 * @param app
 * @param sceneId
 */

const loadEngine = async (app: Application, sceneId: string) => {
  const hostId = app.instance.id as UserId
  Engine.instance.publicPath = config.client.url
  Engine.instance.userId = hostId
  const world = Engine.instance.currentWorld
  const topic = app.isChannelInstance ? NetworkTopics.media : NetworkTopics.world

  const network = new SocketWebRTCServerNetwork(hostId, topic, app)
  app.transport = network
  const initPromise = network.initialize()

  world.networks.set(hostId, network)
  const projects = await getProjectsList()

  if (app.isChannelInstance) {
    world._mediaHostId = hostId as UserId
    await initializeRealtimeSystems(true, false)
    dispatchAction(EngineActions.initializeEngine({ initialised: true }))
    await loadEngineInjection(world, projects)
    dispatchAction(EngineActions.sceneLoaded({}))
  } else {
    world._worldHostId = hostId as UserId

    const [projectName, sceneName] = sceneId.split('/')

    const sceneResultPromise = app.service('scene').get({ projectName, sceneName, metadataOnly: false }, null!)

    await initializeCoreSystems()
    await initializeRealtimeSystems(false, true)
    await initializeSceneSystems()

    await loadEngineInjection(world, projects)

    const sceneUpdatedListener = async () => {
      const sceneData = (await sceneResultPromise).data
      await updateSceneFromJSON(sceneData)
    }
    app.service('scene').on('updated', sceneUpdatedListener)
    await sceneUpdatedListener()

    logger.info('Scene loaded!')
  }
  await initPromise
  network.ready = true

  NetworkPeerFunctions.createPeer(
    network,
    hostId,
    network.userIndexCount++,
    'server-' + hostId,
    Engine.instance.currentWorld
  )
  dispatchAction(EngineActions.joinedWorld({}))
}

/**
 * Update instance attendance with the new user for analytics purposes
 * @param app
 * @param userId
 */

const handleUserAttendance = async (app: Application, userId: UserId) => {
  const instanceIdKey = app.isChannelInstance ? 'channelInstanceId' : 'instanceId'
  logger.info(`Patching user ${userId} ${instanceIdKey} to ${app.instance.id}`)

  const instanceIdPatchResult = await app.service('user').patch(userId, {
    [instanceIdKey]: app.instance.id
  })
  logger.info('Patched new user instanceId to', instanceIdPatchResult)
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

let instanceStarted = false

/**
 * Creates a new 'instance' entry or updates the current one with a connecting user, and handles initializing the instance server
 * @param app
 * @param status
 * @param locationId
 * @param channelId
 * @param sceneId
 * @param userId
 * @returns
 */
const createOrUpdateInstance = async (
  app: Application,
  status: InstanceserverStatus,
  locationId: string,
  channelId: string,
  sceneId: string,
  userId: UserId
) => {
  logger.info('Creating new instance server or updating current one.')
  logger.info(`agones state is ${status.state}`)
  logger.info('app instance is %o, app.instance')
  logger.info(`instanceLocationId: ${app.instance?.locationId}, locationId: ${locationId}`)

  const isReady = status.state === 'Ready'
  const isNeedingNewServer = !config.kubernetes.enabled && !instanceStarted

  if (isReady || isNeedingNewServer) {
    instanceStarted = true
    await initializeInstance(app, status, locationId, channelId, userId)
    await loadEngine(app, sceneId)
  } else {
    try {
      if (!getEngineState().joinedWorld.value) {
        await new Promise((resolve) => matchActionOnce(EngineActions.joinedWorld.matches, resolve))
      }
      const instance = await app.service('instance').get(app.instance.id)
      if (!(await authorizeUserToJoinServer(app, instance, userId))) return
      await app.agonesSDK.allocate()
      await app.service('instance').patch(app.instance.id, {
        currentUsers: (instance.currentUsers as number) + 1,
        assigned: false,
        podName: config.kubernetes.enabled ? app.instanceServer?.objectMeta?.name : 'local',
        assignedAt: null!
      })
    } catch (err) {
      logger.info('Could not update instance, likely because it is a local one that does not exist.')
    }
  }
}

const shutdownServer = async (app: Application, instanceId: string) => {
  logger.info('Deleting instance ' + instanceId)
  try {
    await app.service('instance').patch(instanceId, {
      ended: true
    })
  } catch (err) {
    logger.error(err)
  }
  if (app.isSubdomainNumber != null) {
    const gsSubdomainProvision = (await app.service('instanceserver-subdomain-provision').find({
      query: {
        is_number: app.isSubdomainNumber
      }
    })) as any
    await app.service('instanceserver-subdomain-provision').patch(gsSubdomainProvision.data[0].id, {
      allocated: false
    })
  }
  app.instance.ended = true
  if (config.kubernetes.enabled) {
    // @ts-ignore
    delete app.instance
    const gsName = app.instanceServer.objectMeta.name
    if (gsName !== undefined) {
      logger.info("App's instanceserver name:")
      logger.info(gsName)
    }
    await app.agonesSDK.shutdown()
  } else {
    app.restart()
  }
}

// todo: this could be more elegant
const getActiveUsersCount = (app: Application, userToIgnore: UserInterface) => {
  const activeClients = app.transport.peers
  const activeUsers = [...activeClients].filter(([id]) => id !== Engine.instance.userId && id !== userToIgnore.id)
  return activeUsers.length
}

const handleUserDisconnect = async (
  app: Application,
  connection: SocketIOConnectionType,
  user: UserInterface,
  instanceId: string
) => {
  try {
    const activeUsersCount = getActiveUsersCount(app, user)
    await app.service('instance').patch(instanceId, {
      currentUsers: activeUsersCount
    })
  } catch (err) {
    logger.info('Failed to patch instance user count, likely because it was destroyed.')
  }

  const instanceIdKey = app.isChannelInstance ? 'channelInstanceId' : 'instanceId'

  const userPatch = {
    [instanceIdKey]: null
  }

  if (user?.partyId && app.isChannelInstance) {
    const partyChannel = await app.service('channel').Model.findOne({
      where: {
        partyId: user.partyId
      }
    })
    if (partyChannel?.id === app.instance.channelId) {
      userPatch.partyId = null
      const partyUser = await app.service('party-user').find({
        query: {
          userId: user.id,
          partyId: user.partyId
        }
      })
      if (partyUser.total > 0) {
        try {
          await app.service('party-user').remove(partyUser.data[0].id)
        } catch (err) {}
      }
    }
  }
  // Patch the user's (channel)instanceId to null if they're leaving this instance.
  // But, don't change their (channel)instanceId if it's already something else.
  const userPatchResult = await app
    .service('user')
    .patch(null, userPatch, {
      query: {
        id: user.id,
        [instanceIdKey]: instanceId
      }
    })
    .catch((err) => {
      logger.warn(err, "Failed to patch user, probably because they don't have an ID yet.")
    })
  logger.info('Patched disconnecting user to %o', userPatchResult)
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

  await new Promise((resolve) => setTimeout(resolve, config.instanceserver.shutdownDelayMs))

  // check if there are no peers connected (1 being the server,
  // 0 if the serer was just starting when someone connected and disconnected)
  if (app.transport.peers.size <= 1) {
    logger.info('Shutting down instance server as there are no users present.')
    await shutdownServer(app, instanceId)
  }
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
  let locationId = connection.socketQuery.locationId!
  let channelId = connection.socketQuery.channelId!
  let roomCode = connection.socketQuery.roomCode!

  if (locationId === '') {
    locationId = undefined!
  }
  if (channelId === '') {
    channelId = undefined!
  }
  if (roomCode === '') {
    roomCode = undefined!
  }

  logger.info(
    `user ${userId} joining ${locationId ?? channelId} with sceneId ${
      connection.socketQuery.sceneId
    } and room code ${roomCode}`
  )

  const isResult = await app.agonesSDK.getGameServer()
  const status = isResult.status as InstanceserverStatus

  /**
   * Since local environments do not have the ability to run multiple gameservers,
   * we need to shut down the current one if the user tries to load a new location
   */
  const isLocalServerNeedingNewLocation =
    !config.kubernetes.enabled &&
    app.instance &&
    (app.instance.locationId != locationId ||
      app.instance.channelId != channelId ||
      (roomCode && app.instance.roomCode !== roomCode))

  logger.info(
    `current id: ${app.instance?.locationId ?? app.instance?.channelId} and new id: ${locationId ?? channelId}`
  )
  logger.info(`current id: ${roomCode} and new id: ${app.instance?.roomCode}`)

  if (isLocalServerNeedingNewLocation) {
    app.restart()
    return
  }

  /**
   * If an instance has already been initialized, we want to disallow all connections trying to connect to the wrong location or channel
   */
  if (app.instance) {
    if (locationId && app.instance.locationId !== locationId)
      return logger.warn('got a connection to the wrong location id', app.instance.locationId, locationId)
    if (channelId && app.instance.channelId !== channelId)
      return logger.warn('got a connection to the wrong channel id', app.instance.channelId, channelId)
    if (roomCode && app.instance.roomCode !== roomCode)
      return logger.warn('got a connection to the wrong room code', app.instance.roomCode, roomCode)
  }

  const sceneId = locationId ? (await app.service('location').get(locationId)).sceneId : ''

  /**
   * Now that we have verified the connecting user and that they are connecting to the correct instance, load the instance
   */
  await createOrUpdateInstance(app, status, locationId, channelId, sceneId, userId)

  if (app.instance) {
    connection.instanceId = app.instance.id
    app.channel(`instanceIds/${app.instance.id as string}`).join(connection)
  }

  await handleUserAttendance(app, userId)
}

const onDisconnection = (app: Application) => async (connection: SocketIOConnectionType) => {
  logger.info('Disconnection: %o', connection)
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
    const instanceId = !config.kubernetes.enabled ? connection.instanceId : app.instance?.id
    let instance
    logger.info('On disconnect, instanceId: ' + instanceId)
    logger.info('Disconnecting user instanceId %s channelInstanceId %s: ', user.instanceId, user.channelInstanceId)

    if (!instanceId) {
      logger.info('No instanceId on user disconnect, waiting one second to see if initial user was connecting')
      await new Promise((resolve) =>
        setTimeout(() => {
          resolve(null)
        }, 1000)
      )
    }
    try {
      instance = app.instance && instanceId != null ? await app.service('instance').get(instanceId) : {}
    } catch (err) {
      logger.warn('Could not get instance, likely because it is a local one that no longer exists.')
    }
    logger.info('instanceId %s instance %o', instanceId, instance)
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

  app.service('instanceserver-load').on('patched', async (params) => {
    const { id, ipAddress, podName, locationId, sceneId } = params

    if (app.instance && app.instance.id !== id) {
      return
    }

    const isResult = await app.agonesSDK.getGameServer()
    const gsName = isResult.objectMeta.name
    const status = isResult.status as InstanceserverStatus

    // Validate if pod name match
    if (gsName !== podName) {
      return
    }

    createOrUpdateInstance(app, status, locationId, null!, sceneId, null!)
  })

  app.on('connection', onConnection(app))
  app.on('disconnect', onDisconnection(app))
}
