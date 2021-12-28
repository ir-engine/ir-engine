import '@feathersjs/transport-commons'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { loadSceneFromJSON } from '@xrengine/engine/src/scene/functions/SceneLoading'
import config from '@xrengine/server-core/src/appconfig'
import { Application } from '@xrengine/server-core/declarations'
import getLocalServerIp from '@xrengine/server-core/src/util/get-local-server-ip'
import logger from '@xrengine/server-core/src/logger'
import { decode } from 'jsonwebtoken'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
// import { getPortalByEntityId } from '@xrengine/server-core/src/entities/component/portal.controller'
// import { setRemoteLocationDetail } from '@xrengine/engine/src/scene/functions/createPortal'
import { getSystemsFromSceneData } from '@xrengine/projects/loader'
import { dispatchLocal } from '@xrengine/engine/src/networking/functions/dispatchFrom'
import { EngineActions, EngineActionType } from '@xrengine/engine/src/ecs/classes/EngineService'
import { EngineSystemPresets, InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { initializeEngine } from '@xrengine/engine/src/initializeEngine'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

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
  const systems = await getSystemsFromSceneData(projectName, sceneData, false)

  if (!Engine.isInitialized) {
    const options: InitializeOptions = {
      type: EngineSystemPresets.SERVER,
      publicPath: config.client.url,
      systems
    }
    await initializeEngine(options)
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
  dispatchLocal(EngineActions.joinedWorld(true) as any)

  // const portals = getAllComponentsOfType(PortalComponent)
  // await Promise.all(
  //   portals.map(async (portal: ReturnType<typeof PortalComponent.get>): Promise<void> => {
  //     return getPortalByEntityId(app, portal.linkedPortalId).then((res) => {
  //       if (res) setRemoteLocationDetail(portal, res.data.spawnPosition, res.data.spawnRotation)
  //     })
  //   })
  // )
}

const createNewInstance = async (app: Application, newInstance: InstanceMetadata, agonesSDK) => {
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
  await agonesSDK.allocate()
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

const assignExistingInstance = async (
  app: Application,
  existingInstance,
  channelId: string,
  locationId: string,
  agonesSDK
) => {
  await agonesSDK.allocate()
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

const handleInstance = async (app: Application, status, locationId, channelId, agonesSDK, identityProvider) => {
  console.log('Initialized new gameserver instance')

  const localIp = await getLocalServerIp(app.isChannelInstance)
  const selfIpAddress = `${status.address as string}:${status.portsList[0].port as string}`
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
  console.log('existingInstanceResult', existingInstanceResult.data)
  if (existingInstanceResult.total === 0) {
    const newInstance = {
      currentUsers: 1,
      locationId: locationId,
      channelId: channelId,
      ipAddress: ipAddress
    } as InstanceMetadata
    await createNewInstance(app, newInstance, agonesSDK)
  } else {
    const instance = existingInstanceResult.data[0]
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
          userId: identityProvider.userId,
          $limit: 0
        }
      })) as any
      if (thisUserAuthorized.total === 0) {
        return console.log('User', identityProvider.userId, 'not authorized to be on this server')
      }
    }
    await assignExistingInstance(app, existingInstanceResult.data[0], channelId, locationId, agonesSDK)
  }
}

const loadEngine = async (app: Application, sceneId: string) => {
  if (app.isChannelInstance) {
    Network.instance.transportHandler.mediaTransports.set('media' as UserId, app.transport)
    await initializeEngine({
      type: EngineSystemPresets.MEDIA,
      publicPath: config.client.url
    })
    Engine.sceneLoaded = true
    dispatchLocal(EngineActions.sceneLoaded(true) as any)
    dispatchLocal(EngineActions.joinedWorld(true) as any)
  } else {
    Network.instance.transportHandler.worldTransports.set('server' as UserId, app.transport)
    Engine.isLoading = true
    await loadScene(app, sceneId)
    Engine.isLoading = false
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

  let shutdownTimeout
  app.on('connection', async (connection) => {
    clearTimeout(shutdownTimeout)
    const token = (connection as any).socketQuery?.token
    if (token != null) {
      const authResult = await (app.service('authentication') as any).strategies.jwt.authenticate(
        { accessToken: token },
        {}
      )
      const identityProvider = authResult['identity-provider']
      if (identityProvider != null && identityProvider.id != null) {
        logger.info(
          `user ${identityProvider.userId} joining ${(connection as any).socketQuery.locationId} with sceneId ${
            (connection as any).socketQuery.sceneId
          }`
        )
        const userId = identityProvider.userId
        const user = await app.service('user').get(userId)
        let locationId = (connection as any).socketQuery.locationId
        let channelId = (connection as any).socketQuery.channelId
        const sceneId: string = (connection as any).socketQuery.sceneId

        if (sceneId === '') return console.warn("Scene ID is empty, can't init")

        if (locationId === '') locationId = undefined
        if (channelId === '') channelId = undefined
        const agonesSDK = app.agonesSDK
        const gsResult = await agonesSDK.getGameServer()
        const { status } = gsResult

        app.isChannelInstance = channelId != null

        console.log('Creating new GS or updating current one')
        console.log('agones state is', status.state)
        console.log('app instance is', app.instance)

        const isReady = status.state === 'Ready'
        const isNeedingNewServer =
          !config.kubernetes.enabled &&
          (status.state === 'Shutdown' ||
            app.instance == null ||
            app.instance.locationId !== locationId ||
            app.instance.channelId !== channelId)

        /**
         * When using local dev, to properly test multiple worlds for portals we
         * need to programatically shut down and restart the gameserver process.
         */
        console.log(app.instance?.locationId, locationId)
        if (!config.kubernetes.enabled && app.instance && app.instance.locationId != locationId) {
          app.restart()
          return
        }

        if (isReady || isNeedingNewServer) {
          await handleInstance(app, status, locationId, channelId, agonesSDK, identityProvider)
          if (sceneId != null && !Engine.sceneLoaded && !Engine.isLoading) await loadEngine(app, sceneId)
        } else {
          try {
            const instance = await app.service('instance').get(app.instance.id)
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
                  userId: identityProvider.userId,
                  $limit: 0
                }
              })) as any
              if (thisUserAuthorized.total === 0) {
                return console.log('User', identityProvider.userId, 'not authorized to be on this server')
              }
            }
            await agonesSDK.allocate()
            await app.service('instance').patch(app.instance.id, {
              currentUsers: (instance.currentUsers as number) + 1,
              assigned: false,
              assignedAt: null
            })
          } catch (err) {
            console.log('Could not update instance, likely because it is a local one that does not exist')
          }
        }
        const instanceIdKey = app.isChannelInstance ? 'channelInstanceId' : 'instanceId'
        // console.log(`Patching user ${user.id} ${instanceIdKey} to ${app.instance.id}`);
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
          const location = await app.service('location').get(locationId)
          ;(newInstanceAttendance as any).sceneId = location.sceneId
        }
        await app.service('instance-attendance').create(newInstanceAttendance)
        ;(connection as any).instanceId = app.instance.id
        app.channel(`instanceIds/${app.instance.id as string}`).join(connection)
        if (!app.isChannelInstance) {
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
      }
    }
  })

  app.on('disconnect', async (connection) => {
    const token = (connection as any).socketQuery?.token
    if (token != null) {
      let authResult
      try {
        authResult = await (app.service('authentication') as any).strategies.jwt.authenticate(
          { accessToken: token },
          {}
        )
      } catch (err) {
        if (err.code === 401 && err.data.name === 'TokenExpiredError') {
          const jwtDecoded = decode(token)!
          const idProvider = await app.service('identityProvider').get(jwtDecoded.sub as string)
          authResult = {
            'identity-provider': idProvider
          }
        } else throw err
      }
      const identityProvider = authResult['identity-provider']
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
        const instanceId = !config.kubernetes.enabled ? (connection as any).instanceId : app.instance?.id
        let instance
        try {
          instance = app.instance && instanceId != null ? await app.service('instance').get(instanceId) : {}
        } catch (err) {
          console.log('Could not get instance, likely because it is a local one that no longer exists')
        }
        console.log('instanceId: ' + instanceId)
        console.log('user instanceId: ' + user.instanceId)

        if (instanceId != null && instance != null) {
          const activeUsers = Engine.currentWorld.clients
          const activeUsersCount = activeUsers.size
          try {
            await app.service('instance').patch(instanceId, {
              currentUsers: activeUsersCount
            })
          } catch (err) {
            console.log('Failed to patch instance user count, likely because it was destroyed')
          }

          const user = await app.service('user').get(userId)
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

          if (activeUsersCount < 1) {
            shutdownTimeout = setTimeout(async () => {
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
            }, config.gameserver.shutdownDelayMs)
          }
        }
      }
    }
  })
}
