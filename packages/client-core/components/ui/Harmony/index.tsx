import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Button,
    Divider,
    Grid,
    List,
    ListItem,
    ListItemAvatar,
    ListItemIcon,
    ListItemText,
    TextField,
    Tooltip,
    Typography
} from '@material-ui/core';
import {
    Add,
    Block,
    Call,
    CallEnd,
    Clear,
    Delete,
    Edit,
    ExpandMore,
    Forum,
    Grain,
    Group,
    GroupWork,
    Mic,
    MicOff,
    PersonAdd,
    Public,
    Save,
    Send,
    Settings,
    SupervisedUserCircle,
    Videocam,
    VideocamOff
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
import {getFriends, unfriend} from "../../../redux/friend/service";
import {createGroup, getGroups, patchGroup, removeGroup, removeGroupUser} from "../../../redux/group/service";
import {createParty, getParty, removeParty, removePartyUser, transferPartyOwner} from "../../../redux/party/service";
import {updateInviteTarget} from "../../../redux/invite/service";
import {getLayerUsers} from "../../../redux/user/service";
import {banUserFromLocation} from "../../../redux/location/service";
import {selectFriendState} from "../../../redux/friend/selector";
import {selectGroupState} from "../../../redux/group/selector";
import {selectLocationState} from "../../../redux/location/selector";
import {selectPartyState} from "../../../redux/party/selector";
import {Group as GroupType} from "../../../../common/interfaces/Group";

const initialSelectedUserState = {
    id: '',
    name: '',
    userRole: '',
    identityProviders: [],
    relationType: {},
    inverseRelationType: {},
    avatarUrl: ''
};

const initialGroupForm = {
    id: '',
    name: '',
    groupUsers: [],
    description: ''
};


const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state),
        chatState: selectChatState(state),
        channelConnectionState: selectChannelConnectionState(state),
        instanceConnectionState: selectInstanceConnectionState(state),
        userState: selectUserState(state),
        friendState: selectFriendState(state),
        groupState: selectGroupState(state),
        locationState: selectLocationState(state),
        partyState: selectPartyState(state),
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
    updateMessageScrollInit: bindActionCreators(updateMessageScrollInit, dispatch),
    getFriends: bindActionCreators(getFriends, dispatch),
    unfriend: bindActionCreators(unfriend, dispatch),
    getGroups: bindActionCreators(getGroups, dispatch),
    createGroup: bindActionCreators(createGroup, dispatch),
    patchGroup: bindActionCreators(patchGroup, dispatch),
    removeGroup: bindActionCreators(removeGroup, dispatch),
    removeGroupUser: bindActionCreators(removeGroupUser, dispatch),
    getParty: bindActionCreators(getParty, dispatch),
    createParty: bindActionCreators(createParty, dispatch),
    removeParty: bindActionCreators(removeParty, dispatch),
    removePartyUser: bindActionCreators(removePartyUser, dispatch),
    transferPartyOwner: bindActionCreators(transferPartyOwner, dispatch),
    updateInviteTarget: bindActionCreators(updateInviteTarget, dispatch),
    getLayerUsers: bindActionCreators(getLayerUsers, dispatch),
    banUserFromLocation: bindActionCreators(banUserFromLocation, dispatch)
});

interface Props {
    authState?: any;
    doLoginAuto?: typeof doLoginAuto;
    setBottomDrawerOpen: any;
    setLeftDrawerOpen: any;
    setRightDrawerOpen: any;
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
    friendState?: any;
    getFriends?: any;
    unfriend?: any;
    groupState?: any;
    getGroups?: any;
    createGroup?: any;
    patchGroup?: any;
    removeGroup?: any;
    removeGroupUser?: any;
    partyState?: any;
    getParty?: any;
    createParty?: any;
    removeParty?: any;
    removePartyUser?: any;
    transferPartyOwner?: any;
    detailsType?: any;
    setDetailsType?: any;
    groupFormMode?: string;
    setGroupFormMode?: any;
    groupFormOpen?: boolean;
    setGroupFormOpen?: any;
    groupForm?: any;
    setGroupForm?: any;
    selectedUser?: any;
    setSelectedUser?: any;
    selectedGroup?: any;
    setSelectedGroup?: any;
    locationState?: any;
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
        setRightDrawerOpen,
        updateChatTarget,
        patchMessage,
        updateMessageScrollInit,
        userState,
        provisionChannelServer,
        connectToChannelServer,
        resetChannelServer,
        friendState,
        getFriends,
        unfriend,
        groupState,
        getGroups,
        createGroup,
        patchGroup,
        removeGroup,
        removeGroupUser,
        partyState,
        getParty,
        createParty,
        detailsType,
        setDetailsType,
        groupFormOpen,
        setGroupFormOpen,
        groupFormMode,
        setGroupFormMode,
        groupForm,
        setGroupForm,
        selectedUser,
        setSelectedUser,
        selectedGroup,
        setSelectedGroup,
        locationState
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
    const [selectedAccordion, setSelectedAccordion] = useState('');
    const [tabIndex, setTabIndex] = useState(0);

    const instanceLayerUsers = userState.get('layerUsers') ?? [];
    const channelLayerUsers = userState.get('channelLayerUsers') ?? [];
    const layerUsers = channels.get(activeAVChannelId)?.channelType === 'instance' ? instanceLayerUsers : channelLayerUsers;
    const friendSubState = friendState.get('friends');
    const friends = friendSubState.get('friends');
    const groupSubState = groupState.get('groups');
    const groups = groupSubState.get('groups');
    const party = partyState.get('party');
    const currentLocation = locationState.get('currentLocation').get('location');
    const selfGroupUser = selectedGroup.id && selectedGroup.id.length > 0 ? selectedGroup.groupUsers.find((groupUser) => groupUser.userId === selfUser.id) : {};
    const partyUsers = party && party.partyUsers ? party.partyUsers : [];
    const selfPartyUser = party && party.partyUsers ? party.partyUsers.find((partyUser) => partyUser.userId === selfUser.id) : {};

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
    const videoEnabled = currentLocation.locationSettings ? currentLocation.locationSettings.videoEnabled : false;

    useEffect(() => {
        EngineEvents.instance.addEventListener(EngineEvents.EVENTS.CONNECT_TO_WORLD, () => {
            toggleAudio(activeAVChannelIdRef.current);
            toggleVideo(activeAVChannelIdRef.current);
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
                if (instanceChannel != null && (MediaStreamSystem.instance.camAudioProducer != null || MediaStreamSystem.instance.camVideoProducer != null)) setActiveAVChannelId(instanceChannel[0]);
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

    const setActiveChat = (channelType, target): void => {
        updateMessageScrollInit(true);
        updateChatTarget(channelType, target);
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
    const handleMicClick = async (e: any) => {
        console.log('handleMicClick');
        e.stopPropagation();
        const audioPaused = MediaStreamSystem.instance?.toggleAudioPaused();
        if (audioPaused === true) await pauseProducer(MediaStreamSystem.instance?.camAudioProducer);
        else await resumeProducer(MediaStreamSystem.instance?.camAudioProducer);
    };

    const handleCamClick = async (e: any) => {
        console.log('handleCamClick');
        e.stopPropagation();
        const videoPaused = MediaStreamSystem.instance?.toggleVideoPaused();
        if (videoPaused === true) await pauseProducer(MediaStreamSystem.instance?.camVideoProducer);
        else await resumeProducer(MediaStreamSystem.instance?.camVideoProducer);
    };

    const handleStartCall = async(e: any) => {
        console.log('handleStartCall');
        const channel = channels.get(targetChannelId);
        const channelType = channel.instanceId != null ? 'instance' : 'channel';
        await endVideoChat({});
        await leave(false);
        setActiveAVChannelId(targetChannelId);
        if (channel.instanceId == null) provisionChannelServer(null, targetChannelId);
        else {
            await checkMediaStream('instance');
            await createCamVideoProducer('instance');
            await createCamAudioProducer('instance');
        }
    }

    const handleEndCall = async(e: any) => {
        e.stopPropagation();
        await endVideoChat({});
        await leave(false);
        setActiveAVChannelId('');
    }

    const toggleAudio = async(channelId) => {
        console.log('toggleAudio');
        await checkMediaStream('channel', channelId);

        if (MediaStreamSystem.instance?.camAudioProducer == null) await createCamAudioProducer('channel', channelId);
        else {
            const audioPaused = MediaStreamSystem.instance?.toggleAudioPaused();
            if (audioPaused === true) await pauseProducer(MediaStreamSystem.instance?.camAudioProducer);
            else await resumeProducer(MediaStreamSystem.instance?.camAudioProducer);
        }
    };

    const toggleVideo = async(channelId) => {
        console.log('toggleVideo');
        await checkMediaStream('channel', channelId);
        if (MediaStreamSystem.instance?.camVideoProducer == null) await createCamVideoProducer('channel', channelId);
        else {
            const videoPaused = MediaStreamSystem.instance?.toggleVideoPaused();
            if (videoPaused === true) await pauseProducer(MediaStreamSystem.instance?.camVideoProducer);
            else await resumeProducer(MediaStreamSystem.instance?.camVideoProducer);
        }
    };

    const audioPaused = MediaStreamSystem.instance?.mediaStream === null || MediaStreamSystem.instance?.camAudioProducer == null || MediaStreamSystem.instance?.audioPaused === true;
    const videoPaused = MediaStreamSystem.instance?.mediaStream === null || MediaStreamSystem.instance?.camVideoProducer == null || MediaStreamSystem.instance?.videoPaused === true;

    const openChat = (targetObjectType: string, targetObject: any): void => {
        setTimeout(() => {
            updateChatTarget(targetObjectType, targetObject);
            updateMessageScrollInit(true);
        }, 100);
    };

    const handleAccordionSelect = (accordionType: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
        if (accordionType === selectedAccordion) {
            setSelectedAccordion('');
        } else {
            setSelectedAccordion(accordionType);
        }
    };

    const openInvite = (targetObjectType?: string, targetObjectId?: string): void => {
        updateInviteTarget(targetObjectType, targetObjectId);
        setLeftDrawerOpen(false);
        setRightDrawerOpen(true);
    };

    const openDetails = (e, type, object) => {
        e.stopPropagation();
        setLeftDrawerOpen(true);
        setDetailsType(type);
        if (type === 'user') {
            setSelectedUser(object);
        } else if (type === 'group') {
            setSelectedGroup(object);
        }
    };

    const openGroupForm = (mode: string, group?: GroupType) => {
        setLeftDrawerOpen(true);
        setGroupFormOpen(true);
        setGroupFormMode(mode);
        if (group != null) {
            setGroupForm({
                id: group.id,
                name: group.name,
                groupUsers: group.groupUsers,
                description: group.description
            });
        }
    };

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
        if (channel && channel.channelType !== 'instance') {
            if (channel.channelType === 'group') return channel[channel.channelType].name;
            if (channel.channelType === 'party') return 'Current party';
            if (channel.channelType === 'user') return channel.user1.id === selfUser.id ? channel.user2.name : channel.user1.name;
        } else return 'Current Layer';
    }

    function calcWidth(): 12 | 6 | 4 | 3 {
        return layerUsers.length === 1 ? 12 : layerUsers.length <= 4 ? 6 : layerUsers.length <= 9 ? 4 : 3;
    }


    const nextFriendsPage = (): void => {
        if ((friendSubState.get('skip') + friendSubState.get('limit')) < friendSubState.get('total')) {
            getFriends(friendSubState.get('skip') + friendSubState.get('limit'));
        }
    };

    const nextGroupsPage = (): void => {
        if ((groupSubState.get('skip') + groupSubState.get('limit')) < groupSubState.get('total')) {
            getGroups(groupSubState.get('skip') + groupSubState.get('limit'));
        }
    };

    const onListScroll = (e): void => {
        if ((e.target.scrollHeight - e.target.scrollTop) === e.target.clientHeight) {
            if (tabIndex === 0) {
                nextFriendsPage();
            } else if (tabIndex === 1) {
                nextGroupsPage();
            }
        }
    };

    const isActiveChat = (channelType: string, targetObjectId: string): boolean => {
        const channelEntries = [...channels.entries()];
        const channelMatch = channelType === 'instance' ? channelEntries.find((entry) => entry[1].instanceId === targetObjectId) :
                             channelType === 'group' ? channelEntries.find((entry) => entry[1].groupId === targetObjectId) :
                             channelType === 'friend' ? channelEntries.find((entry) => (entry[1].userId1 === targetObjectId || entry[1].userId2 === targetObjectId)) :
                             channelEntries.find((entry) => entry[1].partyId === targetObjectId);
        return channelMatch != null && channelMatch[0] === targetChannelId;
    }

    const isActiveAVCall = (channelType: string, targetObjectId: string): boolean => {
        const channelEntries = [...channels.entries()];
        const channelMatch = channelType === 'instance' ? channelEntries.find((entry) => entry[1].instanceId === targetObjectId) :
            channelType === 'group' ? channelEntries.find((entry) => entry[1].groupId === targetObjectId) :
                channelType === 'friend' ? channelEntries.find((entry) => (entry[1].userId1 === targetObjectId || entry[1].userId2 === targetObjectId)) :
                    channelEntries.find((entry) => entry[1].partyId === targetObjectId);
        return channelMatch != null && channelMatch[0] === activeAVChannelId;
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
            <div className={styles['list-container']}>
                <div className={styles.partyInstanceButtons}>
                    <div className={classNames({
                            [styles.partyButton]: true,
                            [styles.activeChat]: party != null && isActiveChat('party', party.id)
                        })}
                         onClick={(e) => party != null ? setActiveChat('party', party) : openDetails(e, 'party', party)}
                    >
                        <GroupWork/>
                        <span>Party</span>
                        <div className={classNames({
                            [styles.activeAVCall]: party != null && isActiveAVCall('party', party.id)
                        })} />
                        { party != null && <ListItemIcon className={styles.groupEdit} onClick={(e) => openDetails(e,'party', party)}><Settings/></ListItemIcon>}
                    </div>
                    { selfUser.instanceId != null && <div className={classNames({
                        [styles.instanceButton]: true,
                        [styles.activeChat]: isActiveChat('instance', selfUser.instanceId)
                    })}
                         onClick={() => setActiveChat('instance', {
                             id: selfUser.instanceId
                         })}
                    >
                        <Grain/>
                        <span>Here</span>
                        <div className={classNames({
                            [styles.activeAVCall]: isActiveAVCall('instance', selfUser.instanceId)
                        })} />
                    </div> }
                </div>
                {selfUser.userRole !== 'guest' &&
                <Accordion expanded={selectedAccordion === 'user'} onChange={handleAccordionSelect('user') } className={styles['MuiAccordion-root']}>
                    <AccordionSummary
                        id="friends-header"
                        expandIcon={<ExpandMore/>}
                        aria-controls="friends-content"
                    >
                        <SupervisedUserCircle/>
                        <Typography>Friends</Typography>
                    </AccordionSummary>
                    <AccordionDetails className={styles['list-container']}>
                        <div className={styles['flex-center']}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Add/>}
                                onClick={() => openInvite('user')}>
                                Invite Friend
                            </Button>
                        </div>
                        <List
                            onScroll={(e) => onListScroll(e)}
                        >
                            {friends && friends.length > 0 && friends.sort((a, b) => a.name - b.name).map((friend, index) => {
                                return <div key={friend.id}>
                                    <ListItem className={classNames({
                                        [styles.selectable]: true,
                                        [styles.activeChat]: isActiveChat('user', friend.id)
                                    })}
                                        onClick={() => {
                                            setActiveChat('user', friend)
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar src={friend.avatarUrl}/>
                                        </ListItemAvatar>
                                        <ListItemText primary={friend.name}/>
                                        <div className={classNames({
                                            [styles.activeAVCall]: isActiveAVCall('user', friend.id)
                                        })} />
                                    </ListItem>
                                    {index < friends.length - 1 && <Divider/>}
                                </div>;
                            })
                            }
                        </List>
                    </AccordionDetails>
                </Accordion>
                }
                {selfUser.userRole !== 'guest' &&
                <Accordion expanded={selectedAccordion === 'group'} onChange={handleAccordionSelect('group')} className={styles['MuiAccordion-root']}>
                    <AccordionSummary
                        id="groups-header"
                        expandIcon={<ExpandMore/>}
                        aria-controls="groups-content"
                    >
                        <Group/>
                        <Typography>Groups</Typography>
                    </AccordionSummary>
                    <AccordionDetails className={styles['list-container']}>
                        <div className={styles['flex-center']}>
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Add/>}
                                onClick={() => openGroupForm('create')}>
                                Create Group
                            </Button>
                        </div>
                        <List
                            onScroll={(e) => onListScroll(e)}
                        >
                            {groups && groups.length > 0 && groups.sort((a, b) => a.name - b.name).map((group, index) => {
                                return <div key={group.id}>
                                    <ListItem
                                        className={classNames({
                                            [styles.selectable]: true,
                                            [styles.activeChat]: isActiveChat('group', group.id)
                                        })}
                                        onClick={() => {
                                            setActiveChat('group', group)
                                        }}
                                    >
                                        <ListItemText primary={group.name}/>
                                        <div className={classNames({
                                            [styles.activeAVCall]: isActiveAVCall('group', group.id)
                                        })} />
                                        <ListItemIcon className={styles.groupEdit} onClick={(e) => openDetails(e,'group', group)}><Settings/></ListItemIcon>
                                    </ListItem>
                                    {index < groups.length - 1 && <Divider/>}
                                </div>;
                            })
                            }
                        </List>
                    </AccordionDetails>
                </Accordion>
                }
                {
                    selfUser && selfUser.instanceId &&
                    <Accordion expanded={selectedAccordion === 'layerUsers'}
                               onChange={handleAccordionSelect('layerUsers')}>
                        <AccordionSummary
                            id="layer-user-header"
                            expandIcon={<ExpandMore/>}
                            aria-controls="layer-user-content"
                        >
                            <Public/>
                            <Typography>Layer Users</Typography>
                        </AccordionSummary>
                        <AccordionDetails className={classNames({
                            [styles.flexbox]: true,
                            [styles['flex-column']]: true,
                            [styles['flex-center']]: true
                        })}>
                            <div className={styles['list-container']}>
                                <div className={styles.title}>Users on this Layer</div>
                                <List
                                    className={classNames({
                                        [styles['flex-center']]: true,
                                        [styles['flex-column']]: true
                                    })}
                                    onScroll={(e) => onListScroll(e)}
                                >
                                    {layerUsers && layerUsers.length > 0 && layerUsers.sort((a, b) => a.name - b.name).map((layerUser) => {
                                            return <ListItem key={layerUser.id}>
                                                <ListItemAvatar>
                                                    <Avatar src={layerUser.avatarUrl}/>
                                                </ListItemAvatar>
                                                {selfUser.id === layerUser.id &&
                                                <ListItemText primary={layerUser.name + ' (you)'}/>}
                                                {selfUser.id !== layerUser.id &&
                                                <ListItemText primary={layerUser.name}/>}
                                                {/*{*/}
                                                {/*    locationBanPending !== layerUser.id &&*/}
                                                {/*    isLocationAdmin === true &&*/}
                                                {/*    selfUser.id !== layerUser.id &&*/}
                                                {/*    layerUser.locationAdmins?.find(locationAdmin => locationAdmin.locationId === currentLocation.id) == null &&*/}
                                                {/*    <Tooltip title="Ban user">*/}
                                                {/*        <Button onClick={(e) => showLocationBanConfirm(e, layerUser.id)}>*/}
                                                {/*            <Block/>*/}
                                                {/*        </Button>*/}
                                                {/*    </Tooltip>*/}
                                                {/*}*/}
                                                {/*{locationBanPending === layerUser.id &&*/}
                                                {/*<div>*/}
                                                {/*    <Button variant="contained"*/}
                                                {/*            color="primary"*/}
                                                {/*            onClick={(e) => confirmLocationBan(e, layerUser.id)}*/}
                                                {/*    >*/}
                                                {/*        Ban User*/}
                                                {/*    </Button>*/}
                                                {/*    <Button variant="contained"*/}
                                                {/*            color="secondary"*/}
                                                {/*            onClick={(e) => cancelLocationBan(e)}*/}
                                                {/*    >*/}
                                                {/*        Cancel*/}
                                                {/*    </Button>*/}
                                                {/*</div>*/}
                                                {/*}*/}
                                            </ListItem>;
                                        }
                                    )
                                    }
                                </List>
                            </div>
                        </AccordionDetails>
                    </Accordion>
                }
            </div>
            <div className={styles['chat-window']}>
                { (targetChannelId?.length > 0 || MediaStreamSystem.instance.camVideoProducer != null || MediaStreamSystem.instance.camAudioProducer != null) && <header className={styles.mediaControls}>
                    { MediaStreamSystem.instance.camVideoProducer == null && MediaStreamSystem.instance.camAudioProducer == null &&
                        <div className={classNames({
                            [styles.iconContainer]: true,
                            [styles.startCall]: true
                        })}>
                            <Call onClick={(e) => handleStartCall(e)} />
                        </div>
                    }
                    { (MediaStreamSystem.instance.camVideoProducer != null || MediaStreamSystem.instance.camAudioProducer != null) &&
                        <div className={styles.activeCallControls}>
                            <div className={classNames({
                                [styles.iconContainer]: true,
                                [styles.endCall]: true
                            })}>
                                <CallEnd onClick={(e) => handleEndCall(e)} />
                            </div>
                            <div className={styles.iconContainer + ' ' + (audioPaused ? styles.off : styles.on)}>
                                <Mic id='micOff' className={styles.offIcon} onClick={(e) => handleMicClick(e)} />
                                <Mic id='micOn' className={styles.onIcon} onClick={(e) => handleMicClick(e)} />
                            </div>
                            {videoEnabled && <div className={styles.iconContainer + ' ' + (videoPaused ? styles.off : styles.on)}>
                                <Videocam id='videoOff' className={styles.offIcon} onClick={(e) => handleCamClick(e)} />
                                <Videocam id='videoOn' className={styles.onIcon} onClick={(e) => handleCamClick(e)} />
                            </div>}
                        </div>
                    }
                </header> }
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
                            <Grid item
                                  key={user.id}
                                  className={
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
                            Start a chat with a friend or group from the side panel
                        </div>
                    </div>
                    }
                </div>
            </div>
        </div>
    );
});

export default connect(mapStateToProps, mapDispatchToProps)(Harmony);
