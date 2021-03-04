import {
    Avatar,
    Button,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    TextField
} from '@material-ui/core';
import {
    Clear,
    Delete,
    Edit, Mic, MicOff,
    Save,
    Send, Videocam, VideocamOff
} from '@material-ui/icons';
import PartyParticipantWindow from '@xr3ngine/client-core/components/ui/PartyParticipantWindow';
import { selectAuthState } from '@xr3ngine/client-core/redux/auth/selector';
import { doLoginAuto } from '@xr3ngine/client-core/redux/auth/service';
import { selectChatState } from '@xr3ngine/client-core/redux/chat/selector';
import {
    createMessage,
    getChannelMessages,
    getChannels,
    patchMessage,
    removeMessage,
    updateChatTarget,
    updateMessageScrollInit
} from '@xr3ngine/client-core/redux/chat/service';
import { selectChannelConnectionState } from '@xr3ngine/client-core/redux/channelConnection/selector';
import { selectInstanceConnectionState } from '../../../redux/instanceConnection/selector';
import {
    connectToChannelServer,
    provisionChannelServer,
    resetChannelServer
} from '@xr3ngine/client-core/redux/channelConnection/service';
import { selectUserState } from '@xr3ngine/client-core/redux/user/selector';
import { Message } from '@xr3ngine/common/interfaces/Message';
import { User } from '@xr3ngine/common/interfaces/User';
import { DefaultInitializationOptions, initializeEngine } from '@xr3ngine/engine/src/initialize';
import { SocketWebRTCClientTransport } from '@xr3ngine/engine/src/networking/classes/SocketWebRTCClientTransport';
import {
    configureMediaTransports,
    createCamAudioProducer,
    createCamVideoProducer,
    endVideoChat,
    pauseProducer,
    resumeProducer,
    leave,
    setRelationship
} from '@xr3ngine/engine/src/networking/functions/SocketWebRTCClientFunctions';
import {NetworkSchema} from '@xr3ngine/engine/src/networking/interfaces/NetworkSchema';
import { MediaStreamSystem } from '@xr3ngine/engine/src/networking/systems/MediaStreamSystem';
import {DefaultNetworkSchema} from '@xr3ngine/engine/src/templates/networking/DefaultNetworkSchema';
import classNames from 'classnames';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { observer } from 'mobx-react';
//@ts-ignore
import styles from './Harmony.module.scss';
import { Network } from '@xr3ngine/engine/src/networking/classes/Network';
import {autorun} from "mobx";
import { EngineEvents } from '@xr3ngine/engine/src/ecs/classes/EngineEvents';


const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state),
        chatState: selectChatState(state),
        channelConnectionState: selectChannelConnectionState(state),
        instanceConnectionState: selectInstanceConnectionState(state),
        userState: selectUserState(state)
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    doLoginAuto: bindActionCreators(doLoginAuto, dispatch),
    getChannels: bindActionCreators(getChannels, dispatch),
    getChannelMessages: bindActionCreators(getChannelMessages, dispatch),
    createMessage: bindActionCreators(createMessage, dispatch),
    removeMessage: bindActionCreators(removeMessage, dispatch),
    updateChatTarget: bindActionCreators(updateChatTarget, dispatch),
    provisionChannelServer: bindActionCreators(provisionChannelServer, dispatch),
    connectToChannelServer: bindActionCreators(connectToChannelServer, dispatch),
    resetChannelServer: bindActionCreators(resetChannelServer, dispatch),
    patchMessage: bindActionCreators(patchMessage, dispatch),
    updateMessageScrollInit: bindActionCreators(updateMessageScrollInit, dispatch)
});

interface Props {
    authState?: any;
    doLoginAuto?: typeof doLoginAuto;
    setBottomDrawerOpen: any;
    setLeftDrawerOpen: any;
    chatState?: any;
    channelConnectionState?: any;
    instanceConnectionState?: any;
    getChannels?: any;
    getChannelMessages?: any;
    createMessage?: any;
    removeMessage?: any;
    updateChatTarget?: any;
    patchMessage?: any;
    updateMessageScrollInit?: any;
    userState?: any;
    provisionChannelServer?: typeof provisionChannelServer;
    connectToChannelServer?: typeof connectToChannelServer;
    resetChannelServer?: typeof resetChannelServer;
}

const Harmony = observer((props: Props): any => {
    const {
        authState,
        chatState,
        channelConnectionState,
        instanceConnectionState,
        getChannels,
        getChannelMessages,
        createMessage,
        removeMessage,
        setBottomDrawerOpen,
        setLeftDrawerOpen,
        updateChatTarget,
        patchMessage,
        updateMessageScrollInit,
        userState,
        provisionChannelServer,
        connectToChannelServer,
        resetChannelServer
    } = props;

    const messageRef = React.useRef();
    const messageEl = messageRef.current;
    const selfUser = authState.get('user') as User;
    const channelState = chatState.get('channels');
    const channels = channelState.get('channels');
    const targetObject = chatState.get('targetObject');
    const targetObjectType = chatState.get('targetObjectType');
    const targetChannelId = chatState.get('targetChannelId');
    const messageScrollInit = chatState.get('messageScrollInit');
    const [messageScrollUpdate, setMessageScrollUpdate] = useState(false);
    const [topMessage, setTopMessage] = useState({});
    const [messageCrudSelected, setMessageCrudSelected] = useState('');
    const [messageDeletePending, setMessageDeletePending] = useState('');
    const [messageUpdatePending, setMessageUpdatePending] = useState('');
    const [editingMessage, setEditingMessage] = useState('');
    const [composingMessage, setComposingMessage] = useState('');
    const activeChannel = channels.get(targetChannelId);
    const [producerStarting, _setProducerStarting] = useState('');
    const [activeAVChannelId, _setActiveAVChannelId] = useState('');
    const [channelAwaitingProvision, _setChannelAwaitingProvision] = useState({
        id: '',
        audio: false,
        video: false
    });

    const instanceLayerUsers = userState.get('layerUsers') ?? [];
    const channelLayerUsers = userState.get('channelLayerUsers') ?? [];
    const layerUsers = activeAVChannelId?.length > 0 ? channelLayerUsers : instanceLayerUsers;

    const setProducerStarting = value => {
        producerStartingRef.current = value;
        _setProducerStarting(value);
    };

    const setActiveAVChannelId = value => {
        activeAVChannelIdRef.current = value;
        _setActiveAVChannelId(value);
    };

    const setChannelAwaitingProvision = value => {
        channelAwaitingProvisionRef.current = value;
        _setChannelAwaitingProvision(value);
    }

    const producerStartingRef = useRef(producerStarting);
    const activeAVChannelIdRef = useRef(activeAVChannelId);
    const channelAwaitingProvisionRef = useRef(channelAwaitingProvision);

    useEffect(() => {
        EngineEvents.instance.addEventListener(EngineEvents.EVENTS.CONNECT_TO_WORLD, () => {
            if (producerStartingRef.current === 'audio') toggleAudio(activeAVChannelIdRef.current);
            else if (producerStartingRef.current === 'video') toggleVideo(activeAVChannelIdRef.current);
            setProducerStarting('');
        });

        EngineEvents.instance.addEventListener(EngineEvents.EVENTS.CONNECT_TO_WORLD_TIMEOUT, (e: any) => {
            if (e.instance === true) resetChannelServer();
        })

        EngineEvents.instance.addEventListener(EngineEvents.EVENTS.LEAVE_WORLD, () => {
            resetChannelServer();
            if (channelAwaitingProvisionRef.current.id.length === 0) _setActiveAVChannelId('');
        });

        autorun(() => {
            if ((Network.instance.transport as any).channelType === 'instance') {
                const channelEntries = [...channels.entries()];
                const instanceChannel = channelEntries.find((entry) => entry[1].instanceId != null);
                if (instanceChannel != null && channelAwaitingProvision?.id?.length === 0) {
                    setActiveAVChannelId(instanceChannel[0]);
                }
            } else {
                setActiveAVChannelId((Network.instance.transport as any).channelId);
            }
        });
    }, []);

    useEffect(() => {
        if (channelConnectionState.get('connected') === false && channelAwaitingProvision?.id?.length > 0) {
            provisionChannelServer(null, channelAwaitingProvision.id);
            if (channelAwaitingProvision?.audio === true) setProducerStarting('audio');
            if (channelAwaitingProvision?.video === true) setProducerStarting('video');
            setChannelAwaitingProvision({
                id: '',
                audio: false,
                video: false
            });
        }
    }, [channelConnectionState]);


    useEffect(() => {
        if (messageScrollInit === true && messageEl != null && (messageEl as any).scrollTop != null) {
            (messageEl as any).scrollTop = (messageEl as any).scrollHeight;
            updateMessageScrollInit(false);
            setMessageScrollUpdate(false);
        }
        if (messageScrollUpdate === true) {
            setMessageScrollUpdate(false);
            if (messageEl != null && (messageEl as any).scrollTop != null) {
                (messageEl as any).scrollTop = (topMessage as any).offsetTop;
            }
        }
    }, [chatState]);

    useEffect(() =>  {
        if (channelState.get('updateNeeded') === true) {
            getChannels();
        }
    }, [channelState]);

    useEffect(() => {
        channels.forEach((channel) => {
            if (chatState.get('updateMessageScroll') === true) {
                chatState.set('updateMessageScroll', false);
                if (channel.id === targetChannelId && messageEl != null && (((messageEl as any).scrollHeight - (messageEl as any).scrollTop - (messageEl as any).firstElementChild?.offsetHeight) <= (messageEl as any).clientHeight + 20)) {
                    (messageEl as any).scrollTop = (messageEl as any).scrollHeight;
                }
            }
            if (channel.updateNeeded === true) {
                getChannelMessages(channel.id);
            }
        });
    }, [channels]);


    const openLeftDrawer = (e: any): void => {
        setBottomDrawerOpen(false);
        setLeftDrawerOpen(true);
    };

    const handleComposingMessageChange = (event: any): void => {
        const message = event.target.value;
        setComposingMessage(message);
    };

    const handleEditingMessageChange = (event: any): void => {
        const message = event.target.value;
        setEditingMessage(message);
    };

    const packageMessage = (event: any): void => {
        if (composingMessage.length > 0) {
            createMessage({
                targetObjectId: targetObject.id,
                targetObjectType: targetObjectType,
                text: composingMessage
            });
            setComposingMessage('');
        }
    };

    const setActiveChat = (channel): void => {
        updateMessageScrollInit(true);
        const channelType = channel.channelType;
        const target = channelType === 'user' ? (channel.user1?.id === selfUser.id ? channel.user2 : channel.user2?.id === selfUser.id ? channel.user1 : {}) : channelType === 'group' ? channel.group : channelType === 'instance' ? channel.instance : channel.party;
        updateChatTarget(channelType, target, channel.id);
        setMessageDeletePending('');
        setMessageUpdatePending('');
        setEditingMessage('');
        setComposingMessage('');
    };

    const onChannelScroll = (e): void => {
        if ((e.target.scrollHeight - e.target.scrollTop) === e.target.clientHeight ) {
            nextChannelPage();
        }
    };

    const onMessageScroll = (e): void => {
        if (e.target.scrollTop === 0 && (e.target.scrollHeight > e.target.clientHeight) && messageScrollInit !== true && (activeChannel.skip + activeChannel.limit) < activeChannel.total) {
            setMessageScrollUpdate(true);
            setTopMessage((messageEl as any).firstElementChild);
            nextMessagePage();
        }
    };

    const nextChannelPage = (): void => {
        if ((channelState.get('skip') + channelState.get('limit')) < channelState.get('total')) {
            getChannels(channelState.get('skip') + channelState.get('limit'));
        }
    };

    const nextMessagePage = (): void => {
        if ((activeChannel.skip + activeChannel.limit) < activeChannel.total) {
            getChannelMessages(targetChannelId, activeChannel.skip + activeChannel.limit);
        }
        else {
            setMessageScrollUpdate(false);
        }
    };

    const generateMessageSecondary = (message: Message): string => {
        const date = moment(message.createdAt).format('MMM D YYYY, h:mm a');
        if (message.senderId !== selfUser.id) {
            return `${message?.sender?.name ? message.sender.name : 'A former user'} on ${date}`;
        }
        else {
            return date;
        }
    };

    const loadMessageEdit = (e: any, message: Message) => {
        e.preventDefault();
        setMessageUpdatePending(message.id);
        setEditingMessage(message.text);
        setMessageDeletePending('');
    };

    const showMessageDeleteConfirm = (e: any, message: Message) => {
        e.preventDefault();
        setMessageDeletePending(message.id);
        setMessageUpdatePending('');
    };

    const cancelMessageDelete = (e: any) => {
        e.preventDefault();
        setMessageDeletePending('');
    };

    const confirmMessageDelete = (e: any, message: Message) => {
        e.preventDefault();
        setMessageDeletePending('');
        removeMessage(message.id, message.channelId);
    };

    const cancelMessageUpdate = (e: any) => {
        e.preventDefault();
        setMessageUpdatePending('');
        setEditingMessage('');
    };

    const confirmMessageUpdate = (e: any, message: Message) => {
        e.preventDefault();
        patchMessage(message.id, editingMessage);
        setMessageUpdatePending('');
        setEditingMessage('');
    };

    const toggleMessageCrudSelect = (e: any, message: Message) => {
        e.preventDefault();
        if (message.senderId === selfUser.id) {
            if (messageCrudSelected === message.id && messageUpdatePending !== message.id) {
                setMessageCrudSelected('');
            } else {
                setMessageCrudSelected(message.id);
            }
        }
    };

    const checkMediaStream = async (channelType: string, channelId?: string) => {
        if (!MediaStreamSystem.instance?.mediaStream) {
            console.log('Configuring media transports', channelType, channelId);
            await configureMediaTransports(channelType, channelId);
        }
    };

    const checkEndVideoChat = async () =>{
        if((MediaStreamSystem.instance?.audioPaused || MediaStreamSystem.instance?.camAudioProducer == null) && (MediaStreamSystem.instance?.videoPaused || MediaStreamSystem.instance?.camVideoProducer == null)) {
            await endVideoChat({});
            console.log('Leaving channel after video chat ended');
            await leave(false);
        }
    };
    const handleMicClick = async (e: any, instance: boolean, channelId: string) => {
        e.stopPropagation();
        if (instance === true && instanceConnectionState.get('instanceProvisioning') === false && channelConnectionState.get('instanceProvisioning') === false) {
            setActiveAVChannelId(channelId);
            setChannelAwaitingProvision({
                id: '',
                audio: false,
                video: false
            });
            if (MediaStreamSystem.instance?.camAudioProducer == null || channelId !== activeAVChannelId) {
                await endVideoChat({});
                await leave(false);
                await checkMediaStream('instance');
                await createCamAudioProducer('instance');
            }
            else {
                await checkMediaStream('instance');
                const audioPaused = MediaStreamSystem.instance.toggleAudioPaused();
                if (audioPaused === true) await pauseProducer(MediaStreamSystem.instance?.camAudioProducer);
                else await resumeProducer(MediaStreamSystem.instance?.camAudioProducer);
                checkEndVideoChat();
                setRelationship('instance', null);
            }
        }
        else {
            if (channelId !== activeAVChannelId) {
                setChannelAwaitingProvision({
                    id: channelAwaitingProvision?.id ? channelAwaitingProvision.id : channelId,
                    video: channelAwaitingProvision?.video || false,
                    audio: true
                });
                setActiveAVChannelId(channelId);
                await endVideoChat({});
                await leave(false);
                if (channelConnectionState.get('connected') === false &&
                    channelConnectionState.get('instanceProvisioned') === false &&
                    channelConnectionState.get('instanceProvisioning') === false) {
                    setChannelAwaitingProvision({
                        id: '',
                        audio: false,
                        video: false
                    });
                    provisionChannelServer(null, channelId);
                    setProducerStarting('audio');
                }  else if (channelConnectionState.get('instanceProvisioning') === true) {
                    setTimeout(() => {
                        if (channelConnectionState.get('instanceProvisioning') === true) {
                            provisionChannelServer(null, channelId);
                            setProducerStarting('audio');
                        }
                    }, 3000);
                }
            }
            else {
                if (channelConnectionState.get('instanceProvisioned') === true && channelConnectionState.get('connected') === true) {
                    toggleAudio(channelId);
                }
            }
        }
    };

    const handleCamClick = async (e: any, instance: boolean, channelId: string) => {
        e.stopPropagation();
        if (instance === true && instanceConnectionState.get('instanceProvisioning') === false && channelConnectionState.get('instanceProvisioning') === false) {
            setActiveAVChannelId(channelId);
            setChannelAwaitingProvision({
                id: '',
                audio: false,
                video: false
            });
            if (MediaStreamSystem.instance?.camVideoProducer == null || channelId !== activeAVChannelId) {
                await endVideoChat({});
                await leave(false);
                await checkMediaStream('instance');
                await createCamVideoProducer('instance');
            }
            else {
                await checkMediaStream('instance');
                const videoPaused = MediaStreamSystem.instance.toggleVideoPaused();
                if (videoPaused === true) await pauseProducer(MediaStreamSystem.instance?.camVideoProducer);
                else await resumeProducer(MediaStreamSystem.instance?.camVideoProducer);
                checkEndVideoChat();
                setRelationship('instance', null);
            }
        }
        else {
            if (channelId !== activeAVChannelId) {
                setChannelAwaitingProvision({
                    id: channelAwaitingProvision?.id ? channelAwaitingProvision.id : channelId,
                    audio: channelAwaitingProvision?.audio || false,
                    video: true
                });
                setActiveAVChannelId(channelId);
                await endVideoChat({});
                await leave(false);
                if (channelConnectionState.get('connected') === false &&
                    channelConnectionState.get('instanceProvisioned') === false &&
                    channelConnectionState.get('instanceProvisioning') === false) {
                    setChannelAwaitingProvision({
                        id: '',
                        audio: false,
                        video: false
                    });
                    provisionChannelServer(null, channelId);
                    setProducerStarting('video');
                }  else if (channelConnectionState.get('instanceProvisioning') === true) {
                    setTimeout(() => {
                        if (channelConnectionState.get('instanceProvisioning') === true) {
                            provisionChannelServer(null, channelId);
                            setProducerStarting('video');
                        }
                    }, 3000);
                }
            }
            else {
                if (channelConnectionState.get('instanceProvisioned') === true && channelConnectionState.get('connected') === true) {
                    toggleVideo(channelId);
                }
            }
        }
    };

    const toggleAudio = async(channelId) => {
        await checkMediaStream('channel', channelId);

        if (MediaStreamSystem.instance?.camAudioProducer == null) await createCamAudioProducer('channel', channelId);
        else {
            const audioPaused = MediaStreamSystem.instance?.toggleAudioPaused();
            if (audioPaused === true) await pauseProducer(MediaStreamSystem.instance?.camAudioProducer);
            else await resumeProducer(MediaStreamSystem.instance?.camAudioProducer);
            checkEndVideoChat();
        }
    };

    const toggleVideo = async(channelId) => {
        await checkMediaStream('channel', channelId);
        if (MediaStreamSystem.instance?.camVideoProducer == null) await createCamVideoProducer('channel', channelId);
        else {
            const videoPaused = MediaStreamSystem.instance?.toggleVideoPaused();
            if (videoPaused === true) await pauseProducer(MediaStreamSystem.instance?.camVideoProducer);
            else await resumeProducer(MediaStreamSystem.instance?.camVideoProducer);
            checkEndVideoChat();
        }
    };

    const audioPaused = MediaStreamSystem.instance?.mediaStream === null || MediaStreamSystem.instance?.camAudioProducer == null || MediaStreamSystem.instance?.audioPaused === true;
    const videoPaused = MediaStreamSystem.instance?.mediaStream === null || MediaStreamSystem.instance?.camVideoProducer == null || MediaStreamSystem.instance?.videoPaused === true;
    async function init(): Promise<any> {
        if (Network.instance.isInitialized !== true) {
            const networkSchema: NetworkSchema = {
                ...DefaultNetworkSchema,
                transport: SocketWebRTCClientTransport,
            };

            const InitializationOptions = {
                ...DefaultInitializationOptions,
                networking: {
                    schema: networkSchema,
                }
            };

            initializeEngine(InitializationOptions);
        }
    }

    function getChannelName(): string {
        const channel = channels.get(activeAVChannelId);
        return channel && channel.channelType !== 'instance' ? channel[channel.channelType].name : 'Current Layer';
    }

    function calcWidth(): 12 | 6 | 4 | 3 {
        return layerUsers.length === 1 ? 12 : layerUsers.length <= 4 ? 6 : layerUsers.length <= 9 ? 4 : 3;
    }

    useEffect(() => {
        if (
            channelConnectionState.get('instanceProvisioned') === true &&
            channelConnectionState.get('updateNeeded') === true &&
            channelConnectionState.get('instanceServerConnecting') === false &&
            channelConnectionState.get('connected') === false
        ) {
            init().then(() => {
                connectToChannelServer(channelConnectionState.get('channelId'));
            });
        }
    }, [channelConnectionState]);

    return (
        <div className={styles['harmony-component']}>
            <style> {`
                .Mui-selected {
                    background-color: rgba(0, 0, 0, 0.4) !important;
                }
                .MuiOutlinedInput-notchedOutline {
                    border-color: rgba(127, 127, 127, 0.7);
                }
            `}</style>
            <List onScroll={(e) => onChannelScroll(e)} className={styles['chat-container']}>
                { channels && channels.size > 0 && Array.from(channels).sort(([channelId1, channel1], [channelId2, channel2]) => new Date(channel2.updatedAt).getTime() - new Date(channel1.updatedAt).getTime()).map(([channelId, channel], index) => {
                    return <ListItem
                        key={channelId}
                        className={styles.selectable}
                        onClick={() => setActiveChat(channel)}
                        selected={ channelId === targetChannelId }
                        divider={ index < channels.size - 1 }
                    >
                        { channel.channelType === 'user' &&
                        <ListItemAvatar>
                            <Avatar src={channel.userId1 === selfUser.id ? channel.user2.avatarUrl: channel.user1.avatarUrl}/>
                        </ListItemAvatar>
                        }
                        <ListItemText primary={channel.channelType === 'user' ? (channel.user1?.id === selfUser.id ? channel.user2.name : channel.user2?.id === selfUser.id ? channel.user1.name : '') : channel.channelType === 'group' ? channel.group.name : channel.channelType === 'instance' ? 'Current layer' : 'Current party'}/>
                        <section className={styles.drawerBox}>
                            <div className={styles.iconContainer + ' ' + ((audioPaused === false && activeAVChannelId === channel.id && channelAwaitingProvision?.id?.length === 0 && ((Network.instance.transport as any).channelType === 'instance' || ((Network.instance.transport as any).channelType !== 'instance' && channelConnectionState.get('connected') === true))) ? styles.on : styles.off)}>
                                <MicOff id='micOff' className={styles.offIcon} onClick={(e) => handleMicClick(e, channel.instanceId != null, channel.id)} />
                                <Mic id='micOn' className={styles.onIcon} onClick={(e) => handleMicClick(e, channel.instanceId != null, channel.id)} />
                            </div>
                            <div className={styles.iconContainer + ' ' + ((videoPaused === false && activeAVChannelId === channel.id && channelAwaitingProvision?.id?.length === 0 && ((Network.instance.transport as any).channelType === 'instance' || ((Network.instance.transport as any).channelType !== 'instance' && channelConnectionState.get('connected') === true))) ? styles.on : styles.off)}>
                                <VideocamOff id='videoOff' className={styles.offIcon} onClick={(e) => handleCamClick(e, channel.instanceId != null, channel.id)} />
                                <Videocam id='videoOn' className={styles.onIcon} onClick={(e) => handleCamClick(e, channel.instanceId != null, channel.id)} />
                            </div>
                        </section>
                    </ListItem>;
                })
                }
                { channels.size === 0 &&
                <ListItem key="no-chats" disabled>
                    <ListItemText primary="No active chats"/>
                </ListItem>
                }
            </List>
            <div className={styles['chat-window']}>
                { (MediaStreamSystem?.instance?.camVideoProducer != null || MediaStreamSystem?.instance?.camAudioProducer != null) && <div className={styles['video-container']}>
                    <div className={ styles['active-chat-plate']} >{ getChannelName() }</div>
                    <Grid className={ styles['party-user-container']} container direction="row">
                        <Grid item className={
                            classNames({
                                [styles['grid-item']]: true,
                                [styles.single]: layerUsers.length === 1,
                                [styles.two]: layerUsers.length === 2,
                                [styles.four]: layerUsers.length === 3 && layerUsers.length === 4,
                                [styles.six]: layerUsers.length === 5 && layerUsers.length === 6,
                                [styles.nine]: layerUsers.length >= 7 && layerUsers.length <= 9,
                                [styles.many]: layerUsers.length > 9
                            })
                        }>
                            <PartyParticipantWindow
                                harmony={true}
                                peerId={'me_cam'}
                            />
                        </Grid>
                        { layerUsers.filter(user => user.id !== selfUser.id).map((user) => (
                            <Grid item className={
                                classNames({
                                    [styles['grid-item']]: true,
                                    [styles.single]: layerUsers.length === 1,
                                    [styles.two]: layerUsers.length === 2,
                                    [styles.four]: layerUsers.length === 3 && layerUsers.length === 4,
                                    [styles.six]: layerUsers.length === 5 && layerUsers.length === 6,
                                    [styles.nine]: layerUsers.length >= 7 && layerUsers.length <= 9,
                                    [styles.many]: layerUsers.length > 9
                                })
                            }>
                                <PartyParticipantWindow
                                    harmony={true}
                                    peerId={user.id}
                                    key={user.id}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </div> }
                <div className={styles['list-container']}>
                    <List ref={(messageRef as any)} onScroll={(e) => onMessageScroll(e)} className={styles['message-container']}>
                        { activeChannel != null && activeChannel.messages && activeChannel.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((message) => {
                            return <ListItem
                                className={classNames({
                                    [styles.message]: true,
                                    [styles.self]: message.senderId === selfUser.id,
                                    [styles.other]: message.senderId !== selfUser.id
                                })}
                                key={message.id}
                                onMouseEnter={(e) => toggleMessageCrudSelect(e, message)}
                                onMouseLeave={(e) => toggleMessageCrudSelect(e, message)}
                                onTouchEnd={(e) => toggleMessageCrudSelect(e, message)}
                            >
                                <div>
                                    { message.senderId !== selfUser.id &&
                                    <ListItemAvatar>
                                        <Avatar src={message.sender?.avatarUrl}/>
                                    </ListItemAvatar>
                                    }
                                    {messageUpdatePending !== message.id &&
                                    <ListItemText
                                        primary={message.text}
                                        secondary={generateMessageSecondary(message)}
                                    />
                                    }
                                    {message.senderId === selfUser.id && messageUpdatePending !== message.id &&
                                    <div className='message-crud'>
                                        { messageDeletePending !== message.id && messageCrudSelected === message.id &&
                                        <div className={styles['crud-controls']}>
                                            {messageDeletePending !== message.id &&
                                            <Edit className={styles.edit}
                                                  onClick={(e) => loadMessageEdit(e, message)}
                                                  onTouchEnd={(e) => loadMessageEdit(e, message)}
                                            />
                                            }
                                            {messageDeletePending !== message.id &&
                                            <Delete className={styles.delete}
                                                    onClick={(e) => showMessageDeleteConfirm(e, message)}
                                                    onTouchEnd={(e) => showMessageDeleteConfirm(e, message)}
                                            />
                                            }
                                        </div>
                                        }
                                        {messageDeletePending === message.id &&
                                        <div className={styles['crud-controls']}>
                                            {messageDeletePending === message.id &&
                                            <Delete className={styles.delete}
                                                    onClick={(e) => confirmMessageDelete(e, message)}
                                                    onTouchEnd={(e) => confirmMessageDelete(e, message)}
                                            />
                                            }
                                            {messageDeletePending === message.id &&
                                            <Clear className={styles.cancel}
                                                   onClick={(e) => cancelMessageDelete(e)}
                                                   onTouchEnd={(e) => cancelMessageDelete(e)}
                                            />
                                            }
                                        </div>
                                        }
                                    </div>
                                    }
                                    {messageUpdatePending === message.id &&
                                    <div className={styles['message-edit']}>
                                        <TextField
                                            variant="outlined"
                                            margin="normal"
                                            multiline
                                            fullWidth
                                            id="editingMessage"
                                            label="Message text"
                                            name="editingMessage"
                                            autoFocus
                                            value={editingMessage}
                                            inputProps={{
                                                maxLength: 1000
                                            }}
                                            onChange={handleEditingMessageChange}
                                        />
                                        <div className={styles['editing-controls']}>
                                            <Clear className={styles.cancel} onClick={(e) => cancelMessageUpdate(e)} onTouchEnd={(e) => cancelMessageUpdate(e)}/>
                                            <Save className={styles.save} onClick={(e) => confirmMessageUpdate(e, message)} onTouchEnd={(e) => confirmMessageUpdate(e, message)}/>
                                        </div>
                                    </div>
                                    }
                                </div>
                            </ListItem>;
                        })
                        }
                        { targetChannelId.length === 0 && targetObject.id != null &&
                        <div className={styles['first-message-placeholder']}>
                            <div>{targetChannelId}</div>
                            Start a chat with {(targetObjectType === 'user' || targetObjectType === 'group') ? targetObject.name : targetObjectType === 'instance' ? 'your current layer' : 'your current party'}
                        </div>
                        }
                    </List>
                    {targetObject != null && targetObject.id != null &&
                    <div className={styles['flex-center']}>
                        <div className={styles['chat-box']}>
                            <TextField
                                variant="outlined"
                                margin="normal"
                                multiline
                                fullWidth
                                id="newMessage"
                                label="Message text"
                                name="newMessage"
                                autoFocus
                                value={composingMessage}
                                inputProps={{
                                    maxLength: 1000
                                }}
                                onChange={handleComposingMessageChange}
                            />
                            <Button variant="contained"
                                    color="primary"
                                    className={styles['send-button']}
                                    startIcon={<Send/>}
                                    onClick={packageMessage}
                            >
                                Send
                            </Button>
                        </div>
                    </div>
                    }
                    { (targetObject == null || targetObject.id == null) &&
                    <div className={styles['no-chat']}>
                        <div>
                            Start a chat with a friend or group from the left drawer
                        </div>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={openLeftDrawer}
                        >
                            Open Drawer
                        </Button>
                    </div>
                    }
                </div>
            </div>
        </div>
    );
});

export default connect(mapStateToProps, mapDispatchToProps)(Harmony);
