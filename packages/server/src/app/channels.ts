import '@feathersjs/transport-commons';
import {Network} from '@xr3ngine/engine/src/networking/classes/Network';
import {loadScene} from "@xr3ngine/engine/src/scene/functions/SceneLoading";
import config from '../config';
import {Application} from '../declarations';
import getLocalServerIp from '../util/get-local-server-ip';
import logger from './logger';


let sceneLoaded = false;

export default (app: Application): void => {
    if (typeof app.channel !== 'function') {
        // If no real-time functionality has been configured just return
        return;
    }

    // function pingClients (): any {
    //   console.log('PingClient')
    //   app.service('instance-provision').emit('created', {
    //     type: 'created',
    //     data: {
    //       cool: 'pants'
    //     }
    //   })
    //   setTimeout(() => pingClients(), 2000)
    // }

    app.on('connection', async (connection) => {
        if ((process.env.KUBERNETES === 'true' && config.server.mode === 'realtime') || (process.env.NODE_ENV === 'development') || config.server.mode === 'local') {
            try {
                const token = (connection as any).socketQuery?.token;
                if (token != null) {
                    const authResult = await app.service('authentication').strategies.jwt.authenticate({accessToken: token}, {});
                    const identityProvider = authResult['identity-provider'];
                    if (identityProvider != null) {
                        logger.info(`user ${identityProvider.userId} joining ${(connection as any).socketQuery.locationId} with sceneId ${(connection as any).socketQuery.sceneId}`);
                        const userId = identityProvider.userId;
                        const user = await app.service('user').get(userId);
                        const locationId = (connection as any).socketQuery.locationId;
                        const channelId = (connection as any).socketQuery.channelId;
                        const sceneId = (connection as any).socketQuery.sceneId;

                        if (sceneId === "") return console.warn("Scene ID is empty, can't init");

                        const agonesSDK = (app as any).agonesSDK;
                        const gsResult = await agonesSDK.getGameServer();
                        const {status} = gsResult;
                        if (status.state === 'Ready' || ((process.env.NODE_ENV === 'development' && status.state === 'Shutdown') || (app as any).instance == null)) {
                            logger.info('Starting new instance');
                            const localIp = await getLocalServerIp();
                            const selfIpAddress = `${(status.address as string)}:${(status.portsList[0].port as string)}`;
                            const newInstance = {
                                currentUsers: 1,
                                sceneId: sceneId,
                                ipAddress: config.server.mode === 'local' ? `${localIp.ipAddress}:3030` : selfIpAddress
                            } as any;
                            console.log('channelId: ' + channelId);
                            console.log('locationId: ' + locationId);
                            if (channelId != null) {
                                newInstance.channelId = channelId;
                                (app as any).isChannelInstance = true;
                            }
                            else if (locationId != null) newInstance.locationId = locationId;
                            console.log('Creating new instance:');
                            console.log(newInstance);
                            const instanceResult = await app.service('instance').create(newInstance);
                            await agonesSDK.allocate();
                            (app as any).instance = instanceResult;

                            if ((app as any).gsSubdomainNumber != null) {
                                const gsSubProvision = await app.service('gameserver-subdomain-provision').find({
                                    query: {
                                        gs_number: (app as any).gsSubdomainNumber
                                    }
                                });

                                if (gsSubProvision.total > 0) {
                                    const provision = gsSubProvision.data[0];
                                    await app.service('gameserver-subdomain-provision').patch(provision.id, {
                                        instanceId: instanceResult.id
                                    });
                                }
                            }

                            if (sceneId != null) {
                              let service, serviceId;
                              const projectRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/;
                              const projectResult = await app.service('project').get(sceneId);
                              // console.log("Project result is: ", projectResult);
                              const projectUrl = projectResult.project_url;
                              const regexResult = projectUrl.match(projectRegex);
                              if (regexResult) {
                                service = regexResult[1];
                                serviceId = regexResult[2];
                              }
                              const result = await app.service(service).get(serviceId);

                              if (!sceneLoaded) {
                                loadScene(result);
                                sceneLoaded = true;
                              }
                            }
                        } else {
                            const instance = await app.service('instance').get((app as any).instance.id);
                            await app.service('instance').patch((app as any).instance.id, {
                                currentUsers: (instance.currentUsers as number) + 1
                            });
                        }
                        // console.log(`Patching user ${user.id} instanceId to ${(app as any).instance.id}`);
                        const instanceIdKey = (app as any).isChannelInstance === true ? 'channelInstanceId' : 'instanceId';
                        await app.service('user').patch(userId, {
                            [instanceIdKey]: (app as any).instance.id
                        });
                        (connection as any).instanceId = (app as any).instance.id;
                        // console.log('Patched user instanceId');
                        app.channel(`instanceIds/${(app as any).instance.id as string}`).join(connection);
                        if (user.partyId != null) {
                            const partyUserResult = await app.service('party-user').find({
                                query: {
                                    partyId: user.partyId
                                }
                            });
                            const party = await app.service('party').get(user.partyId);
                            const partyUsers = (partyUserResult as any).data;
                            const partyOwner = partyUsers.find((partyUser) => partyUser.isOwner === 1);
                            if (partyOwner?.userId === userId && party.instanceId !== (app as any).instance.id) {
                                await app.service('party').patch(user.partyId, {
                                    instanceId: (app as any).instance.id
                                });
                                const nonOwners = partyUsers.filter((partyUser) => partyUser.isOwner !== 1 && partyUser.isOwner !== true);
                                const emittedIp = (process.env.KUBERNETES !== 'true') ? await getLocalServerIp() : {
                                    ipAddress: status.address,
                                    port: status.portsList[0].port
                                };
                                await Promise.all(nonOwners.map(async partyUser => {
                                    await app.service('instance-provision').emit('created', {
                                        userId: partyUser.userId,
                                        ipAddress: emittedIp.ipAddress,
                                        port: emittedIp.port,
                                        locationId: locationId,
                                        channelId: channelId,
                                        sceneId: sceneId
                                    });
                                }));
                            }
                        }
                    }
                }
            } catch (err) {
                logger.error(err);
                throw err;
            }
        }
    });

    app.on('disconnect', async (connection) => {
        if ((process.env.KUBERNETES === 'true' && config.server.mode === 'realtime') || process.env.NODE_ENV === 'development' || config.server.mode === 'local') {
            try {
                const token = (connection as any).socketQuery?.token;
                if (token != null) {
                    const authResult = await app.service('authentication').strategies.jwt.authenticate({accessToken: token}, {});
                    const identityProvider = authResult['identity-provider'];
                    if (identityProvider != null) {
                        const userId = identityProvider.userId;
                        const user = await app.service('user').get(userId);
                        logger.info('Socket disconnect from ' + userId);
                        const instanceId = process.env.KUBERNETES !== 'true' ? (connection as any).instanceId : (app as any).instance?.id;
                        const instance = ((app as any).instance && instanceId != null) ? await app.service('instance').get(instanceId) : {};
                        console.log('instanceId: ' + instanceId);
                        console.log('user instanceId: ' + user.instanceId);

                        if (instanceId != null) {
                            await app.service('instance').patch(instanceId, {
                                currentUsers: --instance.currentUsers
                            }).catch((err) => {
                                console.warn("Failed to remove user, probably because instance was destroyed");
                            });

                            const user = await app.service('user').get(userId);
                            const instanceIdKey = (app as any).isChannelInstance === true ? 'channelInstanceId' : 'instanceId';
                            if ((Network.instance.clients[userId] == null && process.env.KUBERNETES === 'true') || (process.env.NODE_ENV === 'development')) await app.service('user').patch(null, {
                                [instanceIdKey]: null
                            }, {
                                query: {
                                    id: user.id,
                                    [instanceIdKey]: instanceId
                                },
                                [instanceIdKey]: instanceId
                            }).catch((err) => {
                                console.warn("Failed to patch user, probably because they don't have an ID yet");
                                console.log(err);
                            });

                            app.channel(`instanceIds/${instanceId as string}`).leave(connection);

                            if (instance.currentUsers < 1) {
                                console.log('Deleting instance ' + instanceId);
                                await app.service('instance').remove(instanceId);
                                if ((app as any).gsSubdomainNumber != null) {
                                    const gsSubdomainProvision = await app.service('gameserver-subdomain-provision').find({
                                        query: {
                                            gs_number: (app as any).gsSubdomainNumber
                                        }
                                    });
                                    await app.service('gameserver-subdomain-provision').patch(gsSubdomainProvision.data[0].id, {
                                        allocated: false
                                    });
                                }
                                if (process.env.KUBERNETES === 'true') {
                                    delete (app as any).instance;
                                }
                                const gsName = (app as any).gsName;
                                if (gsName !== undefined) {
                                    logger.info('App\'s gameserver name:');
                                    logger.info(gsName);
                                }
                                await (app as any).agonesSDK.shutdown();
                            }
                        }
                    }
                }
            } catch (err) {
                logger.info(err);
                throw err;
            }
        }
    });

    app.on('login', (authResult: any, {connection}: any) => {
        if (connection) {
            app.channel(`userIds/${connection['identity-provider'].userId as string}`).join(connection);
        }
    });

    app.on('logout', (authResult: any, {connection}: any) => {
        if (connection) {
            app.channel(`userIds/${connection['identity-provider'].userId as string}`).leave(connection);
        }
    });

    //
    // app.publish((data: any, hook: HookContext) => {
    //   // Here you can add event publishers to channels set up in `channels.js`
    //   // To publish only for a specific event use `app.publish(eventname, () => {})`
    //
    //   // console.log(data)
    //
    //   // console.log(hook)
    //
    //   // console.log('Publishing all events to all authenticated user. See `channels.js` and https://docs.feathersjs.com/api/channels.html for more information.') // eslint-disable-line
    //
    //   // e.g. to publish all service events to all authenticated user use
    //   return app.channel('authenticated')
    // })

    // Here you can also add service specific event publishers
    // e.g. the publish the `user` service `created` event to the `admins` channel
    // app.service('user').publish('created', () => app.channel('admins'))

    // With the userid and email group from above you can easily select involved user
    // app.service('message').publish(() => {
    //   return [
    //     app.channel(`userIds/${data.createdBy}`),
    //     app.channel(`emails/${data.recipientEmail}`)
    //   ]
    // })
};
