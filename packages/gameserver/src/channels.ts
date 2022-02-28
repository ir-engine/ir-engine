import '@feathersjs/transport-commons'
import { decode } from 'jsonwebtoken'

import { IdentityProviderInterface } from '@xrengine/common/src/dbmodels/IdentityProvider'
import { HostUserId, UserId } from '@xrengine/common/src/interfaces/UserId'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { accessEngineState, EngineActions, EngineActionType } from '@xrengine/engine/src/ecs/classes/EngineService'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import {
  createEngine,
  initializeCoreSystems,
  initializeMediaServerSystems,
  initializeNode,
  initializeProjectSystems,
  initializeRealtimeSystems,
  initializeSceneSystems
} from '@xrengine/engine/src/initializeEngine'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { loadSceneFromJSON } from '@xrengine/engine/src/scene/functions/SceneLoading'
// import { getPortalByEntityId } from '@xrengine/server-core/src/entities/component/portal.controller'
// import { setRemoteLocationDetail } from '@xrengine/engine/src/scene/functions/createPortal'
import { getSystemsFromSceneData } from '@xrengine/projects/loadSystemInjection'
import { Application } from '@xrengine/server-core/declarations'
import config from '@xrengine/server-core/src/appconfig'
import logger from '@xrengine/server-core/src/logger'
import getLocalServerIp from '@xrengine/server-core/src/util/get-local-server-ip'

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
  const sceneResult = await app.service('scene').get({ projectName, sceneName, metadataOnly: false }, null!)
  const sceneData = sceneResult.data.scene as any // SceneData

  if (!Engine.isInitialized) {
    const systems = await getSystemsFromSceneData(projectName, sceneData, false)
    const projects = (await app.service('project').find(null!)).data.map((project) => project.name)
    Engine.publicPath = config.client.url
    createEngine()
    initializeNode()
    await initializeCoreSystems()
    await initializeRealtimeSystems()
    await initializeSceneSystems()
    await initializeProjectSystems(projects, systems)

    const world = useWorld()
    const userId = 'server' as UserId
    Engine.userId = userId
    const hostIndex = world.userIndexCount++
    world.clients.set(userId, { userId, name: 'server', userIndex: hostIndex })
    world.userIdToUserIndex.set(userId, hostIndex)
    world.userIndexToUserId.set(hostIndex, userId)
  }

  let entitiesLeft = -1
  let lastEntitiesLeft = -1
  const loadingInterval = setInterval(() => {
    if (entitiesLeft >= 0 && lastEntitiesLeft !== entitiesLeft) {
      lastEntitiesLeft = entitiesLeft
      console.log(entitiesLeft + ' entites left...')
    }
  }, 1000)

  const receptor = (action: EngineActionType) => {
    switch (action.type) {
      case EngineEvents.EVENTS.SCENE_ENTITY_LOADED:
        entitiesLeft = action.entitiesLeft
        break
    }
  }
  Engine.currentWorld.receptors.push(receptor)
  await loadSceneFromJSON(sceneData)

  ///remove receptor
  const receptorIndex = Engine.currentWorld.receptors.indexOf(receptor)
  Engine.currentWorld.receptors.splice(receptorIndex, 1)

  console.log('Scene loaded!')
  clearInterval(loadingInterval)
  dispatchLocal(EngineActions.joinedWorld())

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
    console.log('channelId: ', channelId)
    newInstance.channelId = channelId
  } else {
    console.log('locationId: ' + locationId)
    newInstance.locationId = locationId
  }

  console.log('Creating new instance:', newInstance)
  const instanceResult = await app.service('instance').create(newInstance)
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
      })
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
    assigned: false,
    assignedAt: null
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
      })
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
  console.log('Initialized new gameserver instance')

  const localIp = await getLocalServerIp(app.isChannelInstance)
  const selfIpAddress = `${status.address}:${status.portsList[0].port}`
  const ipAddress = config.gameserver.mode === 'local' ? `${localIp.ipAddress}:${localIp.port}` : selfIpAddress
  const existingInstanceQuery = {
    ipAddress: ipAddress,
    ended: false
  } as any
  if (locationId) existingInstanceQuery.locationId = locationId
  else if (channelId) existingInstanceQuery.channelId = channelId
  const existingInstanceResult = await app.service('instance').find({
    query: existingInstanceQuery
  })
  // console.log('existingInstanceResult', existingInstanceResult.data)
  if (existingInstanceResult.total === 0) {
    const newInstance = {
      currentUsers: 1,
      locationId: locationId,
      channelId: channelId,
      ipAddress: ipAddress
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
    Network.instance.transportHandler.mediaTransports.set('media' as UserId, app.transport)
    Engine.publicPath = config.client.url
    const userId = 'media' as HostUserId
    Engine.userId = userId
    createEngine()
    const world = useWorld()
    world.hostId = userId
    initializeNode()
    await initializeMediaServerSystems()
    const projects = (await app.service('project').find(null!)).data.map((project) => project.name)
    await initializeProjectSystems(projects, [])

    const hostIndex = world.userIndexCount++
    world.clients.set(userId, { userId, name: 'media', userIndex: hostIndex })
    world.userIdToUserIndex.set(userId, hostIndex)
    world.userIndexToUserId.set(hostIndex, userId)

    Engine.sceneLoaded = true
    dispatchLocal(EngineActions.sceneLoaded())
    dispatchLocal(EngineActions.joinedWorld())
  } else {
    Network.instance.transportHandler.worldTransports.set('server' as UserId, app.transport)
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
      console.log('User', userId, 'not authorized to be on this server')
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
  console.log(`Patching user ${userId} ${instanceIdKey} to ${app.instance.id}`)

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

  console.log('Creating new GS or updating current one')
  console.log('agones state is', status.state)
  console.log('app instance is', app.instance)

  console.log(app.instance?.locationId, locationId)

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
    !engineStarted &&
    !config.kubernetes.enabled &&
    (status.state === 'Shutdown' ||
      app.instance == null ||
      app.instance.locationId !== locationId ||
      app.instance.channelId !== channelId)

  if (isReady || isNeedingNewServer) {
    engineStarted = true
    await handleInstance(app, status, locationId, channelId, userId)
    if (sceneId != null) await loadEngine(app, sceneId)
  } else {
    try {
      const instance = await app.service('instance').get(app.instance.id)
      if (!(await authorizeUserToJoinServer(app, instance, userId))) return
      await app.agonesSDK.allocate()
      await app.service('instance').patch(app.instance.id, {
        currentUsers: (instance.currentUsers as number) + 1,
        assigned: false,
        assignedAt: null
      })
      return true
    } catch (err) {
      console.log('Could not update instance, likely because it is a local one that does not exist')
    }
  }
}

const shutdownGameserver = async (app: Application, instanceId: string) => {
  console.log('Deleting instance ' + instanceId)
  try {
    await app.service('instance').patch(instanceId, {
      ended: true
    })
  } catch (err) {
    console.log(err)
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
  const activeClients = Engine.currentWorld.clients
  const activeUsers = [...activeClients].filter(([, v]) => v.userId !== Engine.userId && v.userId !== userToIgnore.id)
  return activeUsers.length
}

const handleUserDisconnect = async (app: Application, connection, user, instanceId) => {
  try {
    const activeUsersCount = getActiveUsersCount(user)
    await app.service('instance').patch(instanceId, {
      currentUsers: activeUsersCount
    })
  } catch (err) {
    console.log('Failed to patch instance user count, likely because it was destroyed')
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
      console.warn("Failed to patch user, probably because they don't have an ID yet")
      console.log(err)
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
  if (activeUsersCount < 1) {
    await shutdownGameserver(app, instanceId)
  }
}

const onConnection = (app: Application) => async (connection: SocketIOConnectionType) => {
  console.log('connection', connection)

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

  if (sceneId === '') return console.warn("Scene ID is empty, can't init")

  if (locationId === '') locationId = undefined!
  if (channelId === '') channelId = undefined!
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
      console.log('Could not get instance, likely because it is a local one that no longer exists')
    }
    console.log('instanceId: ' + instanceId)
    console.log('user instanceId: ' + user.instanceId)

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

  const shouldLoadGameserver =
    (config.kubernetes.enabled && config.gameserver.mode === 'realtime') ||
    process.env.APP_ENV === 'development' ||
    config.gameserver.mode === 'local'

  if (!shouldLoadGameserver) return

  app.on('connection', onConnection(app))
  app.on('disconnect', onDisconnection(app))
}
