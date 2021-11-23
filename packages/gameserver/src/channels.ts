import '@feathersjs/transport-commons'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { WorldScene } from '@xrengine/engine/src/scene/functions/SceneLoading'
import config from '@xrengine/server-core/src/appconfig'
import { Application } from '@xrengine/server-core/declarations'
import getLocalServerIp from '@xrengine/server-core/src/util/get-local-server-ip'
import logger from '@xrengine/server-core/src/logger'
import { decode } from 'jsonwebtoken'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { unloadScene } from '@xrengine/engine/src/ecs/functions/EngineFunctions'
// import { getPortalByEntityId } from '@xrengine/server-core/src/entities/component/portal.controller'
// import { setRemoteLocationDetail } from '@xrengine/engine/src/scene/functions/createPortal'
import { getAllComponentsOfType } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { PortalComponent } from '@xrengine/engine/src/scene/components/PortalComponent'
import { getSystemsFromSceneData } from '@xrengine/projects/loader'
import { initializeServerEngine } from './initializeServerEngine'

const loadScene = async (app: Application, scene: string) => {
  const [projectName, sceneName] = scene.split('/')
  // const sceneRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/
  const sceneResult = await app.service('scene').get({ projectName, sceneName, metadataOnly: false })
  const sceneData = sceneResult.data.scene as any // SceneData
  const systems = await getSystemsFromSceneData(projectName, sceneData, false)

  if (!Engine.isInitialized) await initializeServerEngine(systems, app.isChannelInstance)
  console.log('Initialized new gameserver instance')

  let entitiesLeft = -1
  let lastEntitiesLeft = -1
  const loadingInterval = setInterval(() => {
    if (entitiesLeft >= 0 && lastEntitiesLeft !== entitiesLeft) {
      lastEntitiesLeft = entitiesLeft
      console.log(entitiesLeft + ' entites left...')
    }
  }, 1000)

  console.log('Loading scene...')

  await WorldScene.load(sceneData, (left) => {
    entitiesLeft = left
  })

  console.log('Scene loaded!')
  clearInterval(loadingInterval)
  EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.JOINED_WORLD })

  const portals = getAllComponentsOfType(PortalComponent)
  // await Promise.all(
  //   portals.map(async (portal: ReturnType<typeof PortalComponent.get>): Promise<void> => {
  //     return getPortalByEntityId(app, portal.linkedPortalId).then((res) => {
  //       if (res) setRemoteLocationDetail(portal, res.data.spawnPosition, res.data.spawnRotation)
  //     })
  //   })
  // )
}

const createNewInstance = async (app: Application, newInstance, locationId, channelId, agonesSDK) => {
  console.log('newInstance:', newInstance)

  if (channelId != null) {
    console.log('channelId: ' + channelId)
    newInstance.channelId = channelId
    //While there's no scene, this will still signal that the engine is ready
    //to handle events, particularly for NetworkFunctions:handleConnectToWorld
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.SCENE_LOADED })
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

const assignExistingInstance = async (app: Application, existingInstance, agonesSDK) => {
  console.log('assignExistingInstance', existingInstance)
  await agonesSDK.allocate()
  app.instance = existingInstance

  await app.service('instance').patch(existingInstance.id, {
    currentUsers: existingInstance.currentUsers + 1
  })

  if (app.gsSubdomainNumber != null) {
    const gsSubProvision = await app.service('gameserver-subdomain-provision').find({
      query: {
        gs_number: app.gsSubdomainNumber
      }
    })

    if (gsSubProvision.total > 0) {
      const provision = gsSubProvision.data[0]
      await app.service('gameserver-subdomain-provision').patch(provision.id, {
        instanceId: existingInstance.id
      })
    }
  }
}

export default (app: Application): void => {
  if (typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
    return
  }

  let shutdownTimeout

  app.on('connection', async (connection) => {
    if (
      (config.kubernetes.enabled && config.gameserver.mode === 'realtime') ||
      process.env.APP_ENV === 'development' ||
      config.gameserver.mode === 'local'
    ) {
      try {
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
              config.kubernetes.enabled === false &&
              (status.state === 'Shutdown' ||
                app.instance == null ||
                app.instance.locationId !== locationId ||
                app.instance.channelId !== channelId)

            /**
             * When using local dev, to properly test multiple worlds for portals we
             * need to programatically shut down and restart the gameserver process.
             */
            console.log(app.instance?.locationId, locationId)
            if (config.kubernetes.enabled === false && app.instance && app.instance.locationId !== locationId) {
              app.restart()
              return
            }

            if (isReady || isNeedingNewServer) {
              console.info('Starting new instance')
              console.log('Initialized new gameserver instance')

              const localIp = await getLocalServerIp(app.isChannelInstance)

              const selfIpAddress = `${status.address as string}:${status.portsList[0].port as string}`
              const ipAddress =
                config.gameserver.mode === 'local' ? `${localIp.ipAddress}:${localIp.port}` : selfIpAddress
              const existingInstanceQuery = {
                ipAddress: ipAddress,
                ended: false
              }
              if (locationId) existingInstanceQuery.locationId = locationId
              else if (channelId) existingInstanceQuery.channelId = channelId
              const existingInstanceResult = await app.service('instance').find({
                query: existingInstanceQuery
              })
              if (existingInstanceResult.total === 0) {
                const newInstance = {
                  currentUsers: 1,
                  locationId: locationId,
                  channelId: channelId,
                  ipAddress: ipAddress
                } as any
                await createNewInstance(app, newInstance, locationId, channelId, agonesSDK)
              } else {
                const instance = existingInstanceResult.data[0]
                const authorizedUsers = await app.service('instance-authorized-user').find({
                  query: {
                    instanceId: instance.id,
                    $limit: 0
                  }
                })
                if (authorizedUsers.total > 0) {
                  const thisUserAuthorized = await app.service('instance-authorized-user').find({
                    query: {
                      instanceId: instance.id,
                      userId: identityProvider.userId,
                      $limit: 0
                    }
                  })
                  if (thisUserAuthorized.total === 0) {
                    return console.log('User', identityProvider.userId, 'not authorized to be on this server')
                  }
                }
                await assignExistingInstance(app, instance, agonesSDK)
              }
              if (sceneId != null && !Engine.sceneLoaded && !WorldScene.isLoading) {
                console.log('loading scene')
                await loadScene(app, sceneId)
              }
            } else {
              try {
                const instance = await app.service('instance').get(app.instance.id)
                const authorizedUsers = await app.service('instance-authorized-user').find({
                  query: {
                    instanceId: instance.id,
                    $limit: 0
                  }
                })
                if (authorizedUsers.total > 0) {
                  const thisUserAuthorized = await app.service('instance-authorized-user').find({
                    query: {
                      instanceId: instance.id,
                      userId: identityProvider.userId,
                      $limit: 0
                    }
                  })
                  if (thisUserAuthorized.total === 0) {
                    return console.log('User', identityProvider.userId, 'not authorized to be on this server')
                  }
                }
                await agonesSDK.allocate()
                await app.service('instance').patch(app.instance.id, {
                  currentUsers: (instance.currentUsers as number) + 1
                })
              } catch (err) {
                console.log('Could not update instance, likely because it is a local one that does not exist')
              }
            }
            // console.log(`Patching user ${user.id} instanceId to ${app.instance.id}`);
            const instanceIdKey = app.isChannelInstance === true ? 'channelInstanceId' : 'instanceId'
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
            if (app.isChannelInstance !== true)
              await app.service('message').create(
                {
                  targetObjectId: app.instance.id,
                  targetObjectType: 'instance',
                  text: `[jl_system]${user.name} joined the layer`,
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
              const party = await app.service('party').get(user.partyId)
              const partyUsers = (partyUserResult as any).data
              const partyOwner = partyUsers.find((partyUser) => partyUser.isOwner === 1)
              if (partyOwner?.userId === userId && party.instanceId !== app.instance.id) {
                await app.service('party').patch(user.partyId, {
                  instanceId: app.instance.id
                })
                const nonOwners = partyUsers.filter(
                  (partyUser) => partyUser.isOwner !== 1 && partyUser.isOwner !== true
                )
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
      } catch (err) {
        logger.error(err)
      }
    }
  })

  app.on('disconnect', async (connection) => {
    if (
      (config.kubernetes.enabled && config.gameserver.mode === 'realtime') ||
      process.env.APP_ENV === 'development' ||
      config.gameserver.mode === 'local'
    ) {
      try {
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
            if (app.isChannelInstance !== true)
              await app.service('message').create(
                {
                  targetObjectId: app.instance.id,
                  targetObjectType: 'instance',
                  text: `[jl_system]${user.name} left the layer`,
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
              const activeUsers = Engine.defaultWorld.clients
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
              if (
                (Engine.defaultWorld.clients.has(userId) && config.kubernetes.enabled) ||
                process.env.APP_ENV === 'development'
              )
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
                      },
                      [instanceIdKey]: instanceId
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
                  }
                  const gsName = app.gsName
                  if (gsName !== undefined) {
                    logger.info("App's gameserver name:")
                    logger.info(gsName)
                  }
                  await app.agonesSDK.shutdown()
                }, config.gameserver.shutdownDelayMs)
              }
            }
          }
        }
      } catch (err) {
        logger.info(err)
      }
    }
  })
}
