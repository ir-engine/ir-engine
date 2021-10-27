import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import {
  Add,
  Call,
  CallEnd,
  Clear,
  Close,
  Delete,
  Edit,
  ExpandMore,
  Grain,
  Group,
  GroupAdd,
  GroupWork,
  Mic,
  PeopleOutline,
  Person,
  Public,
  Save,
  Send,
  Settings,
  ThreeDRotation,
  Videocam
} from '@mui/icons-material'
import { useChatState } from '@xrengine/client-core/src/social/state/ChatState'
import { ChatService } from '@xrengine/client-core/src/social/state/ChatService'
import { ChatAction } from '@xrengine/client-core/src/social/state/ChatActions'
import { useFriendState } from '@xrengine/client-core/src/social/state/FriendState'
import { FriendService } from '@xrengine/client-core/src/social/state/FriendService'
import { useGroupState } from '@xrengine/client-core/src/social/state/GroupState'
import { GroupService } from '@xrengine/client-core/src/social/state/GroupService'
import { InviteService } from '@xrengine/client-core/src/social/state/InviteService'
import { useLocationState } from '@xrengine/client-core/src/social/state/LocationState'
import { usePartyState } from '@xrengine/client-core/src/social/state/PartyState'
import ProfileMenu from '@xrengine/client-core/src/user/components/UserMenu/menus/ProfileMenu'
import { useAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import { useUserState } from '@xrengine/client-core/src/user/state/UserState'
import { UserService } from '@xrengine/client-core/src/user/state/UserService'
import PartyParticipantWindow from '../../components/PartyParticipantWindow'
import { Group as GroupType } from '@xrengine/common/src/interfaces/Group'
import { Message } from '@xrengine/common/src/interfaces/Message'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { initializeEngine, shutdownEngine } from '@xrengine/engine/src/initializeEngine'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { NetworkSchema } from '@xrengine/engine/src/networking/interfaces/NetworkSchema'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import classNames from 'classnames'
import moment from 'moment'
import React, { useEffect, useRef, useState } from 'react'
import {
  configureMediaTransports,
  createCamAudioProducer,
  createCamVideoProducer,
  endVideoChat,
  leave,
  pauseProducer,
  resumeProducer
} from '@xrengine/client-core/src/transports/SocketWebRTCClientFunctions'
import { SocketWebRTCClientTransport } from '@xrengine/client-core/src/transports/SocketWebRTCClientTransport'
import styles from './style.module.scss'
import WarningRefreshModal from '../AlertModals/WarningRetryModal'
import { InitializeOptions } from '@xrengine/engine/src/initializationOptions'
import { store } from '@xrengine/client-core/src/store'
import { ChannelConnectionService } from '@xrengine/client-core/src/common/state/ChannelConnectionService'
import { MediaStreamService } from '@xrengine/client-core/src/media/state/MediaStreamService'
import { useMediaStreamState } from '@xrengine/client-core/src/media/state/MediaStreamState'
import { TransportService } from '@xrengine/client-core/src/common/state/TransportService'
import { useTransportStreamState } from '@xrengine/client-core/src/common/state/TransportState'
import { useChannelConnectionState } from '@xrengine/client-core/src/common/state/ChannelConnectionState'

const engineRendererCanvasId = 'engine-renderer-canvas'

interface Props {
  setLeftDrawerOpen: any
  setRightDrawerOpen: any
  setDetailsType?: any
  setGroupFormMode?: any
  setGroupFormOpen?: any
  setGroupForm?: any
  setSelectedUser?: any
  setSelectedGroup?: any
  setHarmonyOpen?: any
  isHarmonyPage?: boolean
  harmonyHidden?: boolean
}

const initialRefreshModalValues = {
  open: false,
  title: '',
  body: '',
  action: async () => {},
  parameters: [],
  timeout: 10000,
  closeAction: async () => {}
}

const Harmony = (props: Props): any => {
  const {
    setLeftDrawerOpen,
    setRightDrawerOpen,
    setDetailsType,
    setGroupFormOpen,
    setGroupFormMode,
    setGroupForm,
    setSelectedUser,
    setSelectedGroup,
    setHarmonyOpen,
    isHarmonyPage,
    harmonyHidden
  } = props

  const dispatch = store.dispatch
  const userState = useUserState()

  const messageRef = React.useRef()
  const messageEl = messageRef.current
  const selfUser = useAuthState().user
  const chatState = useChatState()
  const channelState = chatState.channels
  const channels = channelState.channels.value
  const channelConnectionState = useChannelConnectionState()
  const channelEntries = Object.values(channels).filter((channel) => !!channel)!
  const instanceChannel = channelEntries.find((entry) => entry.instanceId != null)!
  const targetObject = chatState.targetObject
  const targetObjectType = chatState.targetObjectType
  const targetChannelId = chatState.targetChannelId.value
  const messageScrollInit = chatState.messageScrollInit
  const [messageScrollUpdate, setMessageScrollUpdate] = useState(false)
  const [topMessage, setTopMessage] = useState({})
  const [messageCrudSelected, setMessageCrudSelected] = useState('')
  const [messageDeletePending, setMessageDeletePending] = useState('')
  const [messageUpdatePending, setMessageUpdatePending] = useState('')
  const [editingMessage, setEditingMessage] = useState('')
  const [composingMessage, setComposingMessage] = useState('')
  const activeChannel = channels.find((c) => c.id === targetChannelId)!
  const [producerStarting, _setProducerStarting] = useState('')
  const [activeAVChannelId, _setActiveAVChannelId] = useState('')
  const [channelAwaitingProvision, _setChannelAwaitingProvision] = useState({
    id: '',
    audio: false,
    video: false
  })
  const [selectedAccordion, setSelectedAccordion] = useState('friends')
  const [tabIndex, setTabIndex] = useState(0)
  const [videoPaused, setVideoPaused] = useState(false)
  const [audioPaused, setAudioPaused] = useState(false)
  const [selectorsOpen, setSelectorsOpen] = useState(false)
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth
  })
  const [engineInitialized, setEngineInitialized] = useState(false)
  const [lastConnectToWorldId, _setLastConnectToWorldId] = useState('')
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [warningRefreshModalValues, setWarningRefreshModalValues] = useState(initialRefreshModalValues)
  const [noGameserverProvision, setNoGameserverProvision] = useState(false)
  const [channelDisconnected, setChannelDisconnected] = useState(false)
  const [hasAudioDevice, setHasAudioDevice] = useState(false)
  const [hasVideoDevice, setHasVideoDevice] = useState(false)
  const [callStartedFromButton, _setCallStartedFromButton] = useState(false)

  const instanceLayerUsers = userState.layerUsers.value
  const channelLayerUsers = userState.channelLayerUsers.value
  const layerUsers =
    instanceChannel && instanceChannel.id === activeAVChannelId ? instanceLayerUsers : channelLayerUsers
  const friendState = useFriendState()
  const friendSubState = friendState.friends
  const friends = friendSubState.friends.value
  const groupState = useGroupState()
  const groupSubState = groupState.groups
  const groups = groupSubState.groups.value
  const party = usePartyState().party.value
  const currentLocation = useLocationState().currentLocation.location
  const setProducerStarting = (value) => {
    producerStartingRef.current = value
    _setProducerStarting(value)
  }

  const setCallStartedFromButton = (value) => {
    callStartedFromButtonRef.current = value
    _setCallStartedFromButton(value)
  }

  const setActiveAVChannelId = (value) => {
    activeAVChannelIdRef.current = value
    _setActiveAVChannelId(value)
  }

  const setChannelAwaitingProvision = (value) => {
    channelAwaitingProvisionRef.current = value
    _setChannelAwaitingProvision(value)
  }

  const setLastConnectToWorldId = (value) => {
    lastConnectToWorldIdRef.current = value
    _setLastConnectToWorldId(value)
  }

  const transportState = useTransportStreamState()
  const producerStartingRef = useRef(producerStarting)
  const activeAVChannelIdRef = useRef(activeAVChannelId)
  const instanceChannelRef = useRef(null)
  const channelRef = useRef(channels)
  const harmonyHiddenRef = useRef(harmonyHidden)
  const callStartedFromButtonRef = useRef(callStartedFromButton)
  const channelAwaitingProvisionRef = useRef(channelAwaitingProvision)
  const lastConnectToWorldIdRef = useRef(lastConnectToWorldId)
  const chatStateRef = useRef(chatState)

  const mediastream = useMediaStreamState()

  const videoEnabled =
    isHarmonyPage === true
      ? true
      : currentLocation?.location_settings?.value
      ? currentLocation?.location_settings?.videoEnabled?.value
      : false
  const isCamVideoEnabled = mediastream.isCamVideoEnabled
  const isCamAudioEnabled = mediastream.isCamAudioEnabled

  useEffect(() => {
    navigator.mediaDevices
      .enumerateDevices()
      .then((devices) => {
        devices.forEach((device) => {
          if (device.kind === 'audioinput') setHasAudioDevice(true)
          if (device.kind === 'videoinput') setHasVideoDevice(true)
        })
      })
      .catch((err) => console.log('could not get media devices', err))
  }, [])

  useEffect(() => {
    harmonyHiddenRef.current = harmonyHidden
  }, [harmonyHidden])

  useEffect(() => {
    if (EngineEvents.instance != null) {
      setEngineInitialized(true)
      createEngineListeners()
    }
    window.addEventListener('resize', handleWindowResize)

    EngineEvents.instance.addEventListener(
      SocketWebRTCClientTransport.EVENTS.PROVISION_CHANNEL_NO_GAMESERVERS_AVAILABLE,
      () => setNoGameserverProvision(true)
    )

    EngineEvents.instance.addEventListener(SocketWebRTCClientTransport.EVENTS.CHANNEL_DISCONNECTED, () => {
      if (activeAVChannelIdRef.current.length > 0) setChannelDisconnected(true)
    })
    EngineEvents.instance.addEventListener(SocketWebRTCClientTransport.EVENTS.CHANNEL_RECONNECTED, async () => {
      setChannelAwaitingProvision({
        id: activeAVChannelIdRef.current,
        audio: !audioPaused,
        video: !videoPaused
      })
      await shutdownEngine()
      setWarningRefreshModalValues(initialRefreshModalValues)
      await init()
      ChannelConnectionService.resetChannelServer()
    })

    return () => {
      if (EngineEvents.instance != null) {
        setEngineInitialized(false)
        EngineEvents.instance?.removeEventListener(EngineEvents.EVENTS.CONNECT_TO_WORLD, connectToWorldHandler)

        EngineEvents.instance?.removeEventListener(EngineEvents.EVENTS.CONNECT_TO_WORLD_TIMEOUT, (e: any) => {
          if (e.instance === true) ChannelConnectionService.resetChannelServer()
        })

        EngineEvents.instance?.removeEventListener(EngineEvents.EVENTS.LEAVE_WORLD, () => {
          ChannelConnectionService.resetChannelServer()
          if (channelAwaitingProvisionRef.current.id.length === 0) _setActiveAVChannelId('')
        })
      }

      window.removeEventListener('resize', handleWindowResize)
    }
  }, [])

  useEffect(() => {
    if (selfUser?.instanceId != null && MediaStreams.instance.channelType === 'instance') {
      MediaStreams.instance.channelId = instanceChannel.id
      TransportService.updateChannelTypeState()
    }
    if (selfUser?.instanceId.value != null && userState.layerUsersUpdateNeeded.value === true)
      UserService.getLayerUsers(true)
    if (selfUser?.channelInstanceId.value != null && userState.channelLayerUsersUpdateNeeded.value === true)
      UserService.getLayerUsers(false)
  }, [selfUser, userState.layerUsersUpdateNeeded.value, userState.channelLayerUsersUpdateNeeded.value])

  useEffect(() => {
    setActiveAVChannelId(transportState.channelId.value)

    if (targetChannelId == null || targetChannelId === '') {
      // TODO: fix this - it causes crashes for some reason
      // const matchingChannel = channelEntries.find((entry) => entry?.id === activeAVChannelIdRef.current)
      // if (matchingChannel)
      //   setActiveChat(matchingChannel.channelType, {
      //     id: matchingChannel.instanceId
      //   })
    }
  }, [transportState])

  useEffect(() => {
    if (channelConnectionState.connected.value === false && channelAwaitingProvision?.id?.length > 0) {
      ChannelConnectionService.provisionChannelServer(null, channelAwaitingProvision.id)
      if (channelAwaitingProvision?.audio === true) setProducerStarting('audio')
      if (channelAwaitingProvision?.video === true) setProducerStarting('video')
      setChannelAwaitingProvision({
        id: '',
        audio: false,
        video: false
      })
    }
  }, [channelConnectionState.connected.value])

  useEffect(() => {
    chatStateRef.current = chatState
    if (messageScrollInit.value === true && messageEl != null && (messageEl as any).scrollTop != null) {
      ;(messageEl as any).scrollTop = (messageEl as any).scrollHeight
      ChatService.updateMessageScrollInit(false)
      setMessageScrollUpdate(false)
    }
    if (messageScrollUpdate === true) {
      setMessageScrollUpdate(false)
      if (messageEl != null && (messageEl as any).scrollTop != null) {
        ;(messageEl as any).scrollTop = (topMessage as any).offsetTop
      }
    }
  }, [chatState])

  useEffect(() => {
    if (channelState.updateNeeded.value === true) {
      ChatService.getChannels()
    }
  }, [channelState.updateNeeded.value])

  useEffect(() => {
    channelRef.current = channels
    channelEntries.forEach((channel) => {
      if (chatState.updateMessageScroll.value === true) {
        dispatch(ChatAction.setUpdateMessageScroll(false))
        if (
          channel?.id === targetChannelId &&
          messageEl != null &&
          (messageEl as any).scrollHeight -
            (messageEl as any).scrollTop -
            (messageEl as any).firstElementChild?.offsetHeight <=
            (messageEl as any).clientHeight + 20
        ) {
          ;(messageEl as any).scrollTop = (messageEl as any).scrollHeight
        }
      }
      if (channel?.updateNeeded != null && channel?.updateNeeded === true) {
        ChatService.getChannelMessages(channel.id)
      }
    })
  }, [channels])

  useEffect(() => {
    instanceChannelRef.current = instanceChannel ? instanceChannel.id : null
  }, [instanceChannel])

  useEffect(() => {
    setVideoPaused(!isCamVideoEnabled)
  }, [isCamVideoEnabled.value])

  useEffect(() => {
    setAudioPaused(!isCamAudioEnabled)
  }, [isCamAudioEnabled.value])

  useEffect(() => {
    if (noGameserverProvision === true) {
      const newValues = {
        ...warningRefreshModalValues,
        open: true,
        title: 'No Available Servers',
        body: "There aren't any servers available to handle this request. Attempting to re-connect in",
        action: async () => {
          ChannelConnectionService.provisionChannelServer()
        },
        parameters: [null, targetChannelId],
        timeout: 10000,
        closeAction: endCall
      }
      setWarningRefreshModalValues(newValues)
      setNoGameserverProvision(false)
    }
  }, [noGameserverProvision])

  // If user if on Firefox in Private Browsing mode, throw error, since they can't use db storage currently
  useEffect(() => {
    var db = indexedDB.open('test')
    db.onerror = function () {
      const newValues = {
        ...warningRefreshModalValues,
        open: true,
        title: 'Browser Error',
        body: 'Your browser does not support storage in private browsing mode. Either try another browser, or exit private browsing mode. ',
        noCountdown: true
      }
      setWarningRefreshModalValues(newValues)
    }
  }, [])

  useEffect(() => {
    if (channelDisconnected === true) {
      const newValues = {
        ...warningRefreshModalValues,
        open: true,
        title: 'Call disconnected',
        body: "You've lost your connection to this call. We'll try to reconnect before the following time runs out, otherwise you'll hang up",
        action: async () => endCall(),
        parameters: [],
        timeout: 30000,
        closeAction: endCall
      }
      setWarningRefreshModalValues(newValues)
      setChannelDisconnected(false)
    }
  }, [channelDisconnected])

  const handleWindowResize = () => {
    setDimensions({
      height: window.innerHeight,
      width: window.innerWidth
    })
  }

  const handleComposingMessageChange = (event: any): void => {
    const message = event.target.value
    setComposingMessage(message)
  }

  const handleEditingMessageChange = (event: any): void => {
    const message = event.target.value
    setEditingMessage(message)
  }

  const packageMessage = (): void => {
    if (composingMessage.length > 0) {
      ChatService.createMessage({
        targetObjectId: targetObject.id.value,
        targetObjectType: targetObjectType.value,
        text: composingMessage
      })
      setComposingMessage('')
    }
  }

  const setActiveChat = (channelType, target): void => {
    ChatService.updateMessageScrollInit(true)
    ChatService.updateChatTarget(channelType, target)
    setMessageDeletePending('')
    setMessageUpdatePending('')
    setEditingMessage('')
    setComposingMessage('')
  }

  const connectToWorldHandler = async ({ instance }: { instance: boolean }): Promise<void> => {
    const isInstanceChannel = instanceChannelRef.current && instanceChannelRef.current === activeAVChannelIdRef.current
    if (isInstanceChannel) MediaStreams.instance.channelId = instanceChannelRef.current
    if (instance !== true && activeAVChannelIdRef.current?.length > 0) {
      setLastConnectToWorldId(activeAVChannelIdRef.current)
      if (!harmonyHiddenRef.current && callStartedFromButtonRef.current) {
        await toggleAudio(isInstanceChannel ? 'instance' : 'channel', activeAVChannelIdRef.current)
        await toggleVideo(isInstanceChannel ? 'instance' : 'channel', activeAVChannelIdRef.current)
      }
      TransportService.updateChannelTypeState()
      MediaStreamService.updateCamVideoState()
      MediaStreamService.updateCamAudioState()
      EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.SCENE_LOADED })
    }
  }

  const createEngineListeners = (): void => {
    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.CONNECT_TO_WORLD, connectToWorldHandler)

    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.CONNECT_TO_WORLD_TIMEOUT, (e: any) => {
      if (e.instance === true) ChannelConnectionService.resetChannelServer()
    })

    EngineEvents.instance.addEventListener(EngineEvents.EVENTS.LEAVE_WORLD, () => {
      ChannelConnectionService.resetChannelServer()
      setLastConnectToWorldId('')
      MediaStreams.instance.channelId = null!
      MediaStreams.instance.channelType = null!
      if (channelAwaitingProvisionRef.current.id.length === 0) _setActiveAVChannelId('')
      TransportService.updateChannelTypeState()
      MediaStreamService.updateCamVideoState()
      MediaStreamService.updateCamAudioState()
    })
  }

  const onMessageScroll = (e): void => {
    if (
      e.target.scrollTop === 0 &&
      e.target.scrollHeight > e.target.clientHeight &&
      messageScrollInit.value !== true &&
      activeChannel.skip + activeChannel.limit < activeChannel.total
    ) {
      setMessageScrollUpdate(true)
      setTopMessage((messageEl as any).firstElementChild)
      nextMessagePage()
    }
  }

  const nextChannelPage = (): void => {
    if (channelState.skip.value + channelState.limit.value < channelState.total.value) {
      ChatService.getChannels(channelState.skip.value + channelState.limit.value)
    }
  }

  const nextMessagePage = (): void => {
    if (activeChannel.skip + activeChannel.limit < activeChannel.total) {
      ChatService.getChannelMessages(targetChannelId, activeChannel.skip + activeChannel.limit)
    } else {
      setMessageScrollUpdate(false)
    }
  }

  const generateMessageSecondary = (message: Message): string => {
    const date = moment(message.createdAt).format('MMM D YYYY, h:mm a')
    if (message.senderId !== selfUser.id.value) {
      return `${message?.sender?.name ? message.sender.name : 'A former user'} on ${date}`
    } else {
      return date
    }
  }

  const loadMessageEdit = (e: any, message: Message) => {
    e.preventDefault()
    setMessageUpdatePending(message.id)
    setEditingMessage(message.text)
    setMessageDeletePending('')
  }

  const showMessageDeleteConfirm = (e: any, message: Message) => {
    e.preventDefault()
    setMessageDeletePending(message.id)
    setMessageUpdatePending('')
  }

  const cancelMessageDelete = (e: any) => {
    e.preventDefault()
    setMessageDeletePending('')
  }

  const confirmMessageDelete = (e: any, message: Message) => {
    e.preventDefault()
    setMessageDeletePending('')
    ChatService.removeMessage(message.id) //, message.channelId))
  }

  const cancelMessageUpdate = (e: any) => {
    e.preventDefault()
    setMessageUpdatePending('')
    setEditingMessage('')
  }

  const confirmMessageUpdate = (e: any, message: Message) => {
    e.preventDefault()
    ChatService.patchMessage(message.id, editingMessage)
    setMessageUpdatePending('')
    setEditingMessage('')
  }

  const toggleMessageCrudSelect = (e: any, message: Message) => {
    e.preventDefault()
    if (message.senderId === selfUser.id.value) {
      if (messageCrudSelected === message.id && messageUpdatePending !== message.id) {
        setMessageCrudSelected('')
      } else {
        setMessageCrudSelected(message.id)
      }
    }
  }

  const checkMediaStream = async (streamType: string, channelType: string, channelId?: string): Promise<boolean> => {
    if (streamType === 'video' && !MediaStreams.instance?.videoStream) {
      console.log('Configuring video transport', channelType, channelId)
      return configureMediaTransports(['video'], channelType, channelId)
    }
    if (streamType === 'audio' && !MediaStreams.instance?.audioStream) {
      console.log('Configuring audio transport', channelType, channelId)
      return configureMediaTransports(['audio'], channelType, channelId)
    }

    return Promise.resolve(false)
  }

  const handleMicClick = async (e: any) => {
    e.stopPropagation()
    const channel = channels[activeAVChannelIdRef.current]
    const channelType = channel.instanceId == null ? 'channel' : 'instance'
    await checkMediaStream('audio', channelType, activeAVChannelIdRef.current)
    if (MediaStreams.instance?.camAudioProducer == null) {
      await createCamAudioProducer(channelType, activeAVChannelIdRef.current)
      setAudioPaused(false)
      await resumeProducer(MediaStreams.instance?.camAudioProducer)
    } else {
      const msAudioPaused = MediaStreams.instance?.toggleAudioPaused()
      setAudioPaused(
        MediaStreams.instance?.audioStream === null ||
          MediaStreams.instance?.camAudioProducer == null ||
          MediaStreams.instance?.audioPaused === true
      )
      if (msAudioPaused === true) await pauseProducer(MediaStreams.instance?.camAudioProducer)
      else await resumeProducer(MediaStreams.instance?.camAudioProducer)
    }
    MediaStreamService.updateCamAudioState()
  }

  const handleCamClick = async (e: any) => {
    e.stopPropagation()
    const channel = channels[activeAVChannelIdRef.current]
    const channelType = channel.instanceId == null ? 'channel' : 'instance'
    await checkMediaStream('video', channelType, activeAVChannelIdRef.current)
    if (MediaStreams.instance?.camVideoProducer == null) {
      await createCamVideoProducer(channelType, activeAVChannelIdRef.current)
      setVideoPaused(false)
      await resumeProducer(MediaStreams.instance?.camVideoProducer)
    } else {
      const msVideoPaused = MediaStreams.instance?.toggleVideoPaused()
      setVideoPaused(
        MediaStreams.instance?.videoStream === null ||
          MediaStreams.instance?.camVideoProducer == null ||
          MediaStreams.instance?.videoPaused === true
      )
      if (msVideoPaused === true) await pauseProducer(MediaStreams.instance?.camVideoProducer)
      else await resumeProducer(MediaStreams.instance?.camVideoProducer)
    }
    MediaStreamService.updateCamVideoState()
  }

  const handleStartCall = async (e?: any) => {
    if (e?.stopPropagation) e.stopPropagation()
    setCallStartedFromButton(true)
    const channel = channels[targetChannelId]
    const channelType = channel.instanceId != null ? 'instance' : 'channel'
    TransportService.updateChannelTypeState()
    await endVideoChat({})
    await leave(false)
    setActiveAVChannelId(targetChannelId)
    ChannelConnectionService.provisionChannelServer(null, targetChannelId)
  }

  const endCall = async () => {
    TransportService.updateChannelTypeState()
    setCallStartedFromButton(false)
    await endVideoChat({})
    await leave(false)
    setActiveAVChannelId('')
    MediaStreams.instance.channelType = null!
    MediaStreams.instance.channelId = null!
    MediaStreamService.updateCamVideoState()
    MediaStreamService.updateCamAudioState()
  }

  const handleEndCall = async (e: any) => {
    e.stopPropagation()
    await endCall()
  }

  const toggleAudio = async (channelType, channelId) => {
    await checkMediaStream('audio', channelType, channelId)
    if (MediaStreams.instance?.camAudioProducer == null) await createCamAudioProducer(channelType, channelId)
    else {
      const audioPaused = MediaStreams.instance?.toggleAudioPaused()
      setAudioPaused(
        MediaStreams.instance?.audioStream === null ||
          MediaStreams.instance?.camAudioProducer == null ||
          MediaStreams.instance?.audioPaused === true
      )
      if (audioPaused === true) await pauseProducer(MediaStreams.instance?.camAudioProducer)
      else await resumeProducer(MediaStreams.instance?.camAudioProducer)
    }
  }

  const toggleVideo = async (channelType, channelId) => {
    await checkMediaStream('video', channelType, channelId)
    if (MediaStreams.instance?.camVideoProducer == null) await createCamVideoProducer(channelType, channelId)
    else {
      const videoPaused = MediaStreams.instance?.toggleVideoPaused()
      setVideoPaused(
        MediaStreams.instance?.videoStream === null ||
          MediaStreams.instance?.camVideoProducer == null ||
          MediaStreams.instance?.videoPaused === true
      )
      if (videoPaused === true) await pauseProducer(MediaStreams.instance?.camVideoProducer)
      else await resumeProducer(MediaStreams.instance?.camVideoProducer)
    }
  }

  const handleAccordionSelect = (accordionType: string) => () => {
    if (accordionType === selectedAccordion) {
      setSelectedAccordion('')
    } else {
      setSelectedAccordion(accordionType)
    }
  }

  const openInvite = (targetObjectType?: string, targetObjectId?: string): void => {
    InviteService.updateInviteTarget(targetObjectType, targetObjectId)
    setLeftDrawerOpen(false)
    setRightDrawerOpen(true)
  }

  const openDetails = (e, type, object) => {
    e.stopPropagation()
    setLeftDrawerOpen(true)
    setDetailsType(type)
    if (type === 'user') {
      setSelectedUser(object)
    } else if (type === 'group') {
      setSelectedGroup(object)
    }
  }

  const openGroupForm = (mode: string, group?: GroupType) => {
    setLeftDrawerOpen(true)
    setGroupFormOpen(true)
    setGroupFormMode(mode)
    if (group != null) {
      setGroupForm({
        id: group.id,
        name: group.name,
        groupUsers: group.groupUsers,
        description: group.description
      })
    }
  }

  async function init(): Promise<any> {
    if (Network.instance?.isInitialized !== true) {
      const initializationOptions: InitializeOptions = {
        networking: {
          schema: {
            transport: SocketWebRTCClientTransport
          } as NetworkSchema
        },
        scene: {
          disabled: true
        }
      }

      await initializeEngine(initializationOptions)
      if (engineInitialized === false) createEngineListeners()
    }
  }

  function getChannelName(): string {
    const channel = channels[targetChannelId]
    if (channel && channel.channelType !== 'instance') {
      if (channel.channelType === 'group') return channel[channel.channelType].name
      if (channel.channelType === 'party') return 'Current party'
      if (channel.channelType === 'user')
        return channel.user1.id === selfUser.id.value ? channel.user2.name : channel.user1.name
    } else return 'Current Layer'
  }

  function getAVChannelName(): string {
    const channel = channels[activeAVChannelId]
    if (channel && channel.channelType !== 'instance') {
      if (channel.channelType === 'group') return channel[channel.channelType].name
      if (channel.channelType === 'party') return 'Current party'
      if (channel.channelType === 'user')
        return channel.user1.id === selfUser.id.value ? channel.user2.name : channel.user1.name
    } else return 'Current Layer'
  }

  const nextFriendsPage = (): void => {
    if (friendSubState.skip.value + friendSubState.limit.value < friendSubState.total.value) {
      FriendService.getFriends('', friendSubState.skip.value + friendSubState.limit.value)
    }
  }

  const nextGroupsPage = (): void => {
    if (groupSubState.skip.value + groupSubState.limit.value < groupSubState.total.value) {
      GroupService.getGroups(groupSubState.skip.value + groupSubState.limit.value)
    }
  }

  const onListScroll = (e): void => {
    if (e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight) {
      if (tabIndex === 0) {
        nextFriendsPage()
      } else if (tabIndex === 1) {
        nextGroupsPage()
      }
    }
  }

  const isActiveChat = (channelType: string, targetObjectId: string): boolean => {
    const channelMatch =
      channelType === 'instance'
        ? channelEntries.find((entry) => entry.instanceId === targetObjectId)
        : channelType === 'group'
        ? channelEntries.find((entry) => entry.groupId === targetObjectId)
        : channelType === 'friend'
        ? channelEntries.find((entry) => entry.userId1 === targetObjectId || entry.userId2 === targetObjectId)
        : channelEntries.find((entry) => entry.partyId === targetObjectId)
    return channelMatch != null && channelMatch.id === targetChannelId
  }

  const isActiveAVCall = (channelType: string, targetObjectId: string): boolean => {
    const channelMatch =
      channelType === 'instance'
        ? channelEntries.find((entry) => entry.instanceId === targetObjectId)
        : channelType === 'group'
        ? channelEntries.find((entry) => entry.groupId === targetObjectId)
        : channelType === 'friend'
        ? channelEntries.find((entry) => entry.userId1 === targetObjectId || entry.userId2 === targetObjectId)
        : channelEntries.find((entry) => entry.partyId === targetObjectId)
    return channelMatch != null && channelMatch.id === activeAVChannelIdRef.current
  }

  const closeHarmony = (): void => {
    const canvas = document.getElementById(engineRendererCanvasId) as HTMLCanvasElement
    if (canvas?.style != null) canvas.style.width = '100%'
    setHarmonyOpen(false)
    if (MediaStreams.instance.channelType === '' || MediaStreams.instance.channelType == null) {
      if (instanceChannel != null) {
        MediaStreams.instance.channelType = 'instance'
        MediaStreams.instance.channelId = instanceChannel.id
        setActiveAVChannelId(instanceChannel.id)
      }
      if (
        channelConnectionState.instanceProvisioned.value === false &&
        channelConnectionState.instanceServerConnecting.value === false &&
        channelConnectionState.connected.value === false
      ) {
        ChannelConnectionService.provisionChannelServer(null, instanceChannel.id)
      }
    }
    EngineEvents.instance.dispatchEvent({ type: EngineEvents.EVENTS.START_SUSPENDED_CONTEXTS })
  }

  const openProfileMenu = (): void => {
    setProfileMenuOpen(true)
  }

  useEffect(() => {
    if (
      channelConnectionState.instanceProvisioned.value === true &&
      channelConnectionState.updateNeeded.value === true &&
      channelConnectionState.instanceServerConnecting.value === false &&
      channelConnectionState.connected.value === false
    ) {
      ChannelConnectionService.connectToChannelServer(channelConnectionState.channelId.value, isHarmonyPage)
      MediaStreamService.updateCamVideoState()
      MediaStreamService.updateCamAudioState()
    }
  }, [
    channelConnectionState.instanceProvisioned,
    channelConnectionState.updateNeeded,
    channelConnectionState.instanceServerConnecting,
    channelConnectionState.connected
  ])

  const chatSelectors = (
    <div
      className={classNames({
        [styles['list-container']]: true,
        [styles['chat-selectors']]: true
      })}
    >
      <div className={styles.partyInstanceButtons}>
        <div
          className={classNames({
            [styles.partyButton]: true,
            [styles.activeChat]: party != null && isActiveChat('party', party.id)
          })}
          onClick={(e) => {
            if (party != null) {
              setActiveChat('party', party)
              if (dimensions.width <= 768) setSelectorsOpen(false)
            } else openDetails(e, 'party', party)
          }}
        >
          <PeopleOutline className={styles['icon-margin-right']} />
          <span>Party</span>
          <div
            className={classNames({
              [styles.activeAVCall]: party != null && isActiveAVCall('party', party.id)
            })}
          />
          {party != null && party.id != null && party.id !== '' && (
            <ListItemIcon className={styles.groupEdit} onClick={(e) => openDetails(e, 'party', party)}>
              <Settings />
            </ListItemIcon>
          )}
        </div>
        {selfUser?.instanceId.value != null && (
          <div
            className={classNames({
              [styles.instanceButton]: true,
              [styles.activeChat]: isActiveChat('instance', selfUser.instanceId.value)
            })}
            onClick={() => {
              setActiveChat('instance', {
                id: selfUser.instanceId.value
              })
              if (dimensions.width <= 768) setSelectorsOpen(false)
            }}
          >
            <Grain className={styles['icon-margin-right']} />
            <span>Here</span>
            <div
              className={classNames({
                [styles.activeAVCall]: isActiveAVCall('instance', selfUser.instanceId.value)
              })}
            />
          </div>
        )}
      </div>
      {selfUser?.userRole.value !== 'guest' && (
        <Accordion
          expanded={selectedAccordion === 'user'}
          onChange={handleAccordionSelect('user')}
          className={styles['MuiAccordion-root']}
        >
          <AccordionSummary id="friends-header" expandIcon={<ExpandMore />} aria-controls="friends-content">
            <Group className={styles['icon-margin-right']} />
            <Typography>Friends</Typography>
          </AccordionSummary>
          <AccordionDetails className={styles['list-container']}>
            <div className={styles['flex-center']}>
              <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => openInvite('user')}>
                Invite Friend
              </Button>
            </div>
            <List onScroll={(e) => onListScroll(e)}>
              {friends &&
                friends.length > 0 &&
                [...friends]
                  .sort((a, b) => a.name - b.name)
                  .map((friend, index) => {
                    return (
                      <div key={friend.id}>
                        <ListItem
                          className={classNames({
                            [styles.selectable]: true,
                            [styles.activeChat]: isActiveChat('user', friend.id)
                          })}
                          onClick={() => {
                            setActiveChat('user', friend)
                            if (dimensions.width <= 768) setSelectorsOpen(false)
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar src={friend.avatarUrl} />
                          </ListItemAvatar>
                          <ListItemText primary={friend.name} />
                          <div
                            className={classNames({
                              [styles.activeAVCall]: isActiveAVCall('user', friend.id)
                            })}
                          />
                          <ListItemIcon className={styles.groupEdit} onClick={(e) => openDetails(e, 'user', friend)}>
                            <Settings />
                          </ListItemIcon>
                        </ListItem>
                        {index < friends.length - 1 && <Divider />}
                      </div>
                    )
                  })}
            </List>
          </AccordionDetails>
        </Accordion>
      )}
      {selfUser?.userRole.value !== 'guest' && (
        <Accordion
          expanded={selectedAccordion === 'group'}
          onChange={handleAccordionSelect('group')}
          className={styles['MuiAccordion-root']}
        >
          <AccordionSummary id="groups-header" expandIcon={<ExpandMore />} aria-controls="groups-content">
            <GroupWork className={styles['icon-margin-right']} />
            <Typography>Groups</Typography>
          </AccordionSummary>
          <AccordionDetails className={styles['list-container']}>
            <div className={styles['flex-center']}>
              <Button variant="contained" color="primary" startIcon={<Add />} onClick={() => openGroupForm('create')}>
                Create Group
              </Button>
            </div>
            <List onScroll={(e) => onListScroll(e)}>
              {groups &&
                groups.length > 0 &&
                [...groups]
                  .sort((a, b) => a.name - b.name)
                  .map((group, index) => {
                    return (
                      <div key={group.id}>
                        <ListItem
                          className={classNames({
                            [styles.selectable]: true,
                            [styles.activeChat]: isActiveChat('group', group.id)
                          })}
                          onClick={() => {
                            setActiveChat('group', group)
                            if (dimensions.width <= 768) setSelectorsOpen(false)
                          }}
                        >
                          <ListItemText primary={group.name} />
                          <div
                            className={classNames({
                              [styles.activeAVCall]: isActiveAVCall('group', group.id)
                            })}
                          />
                          <ListItemIcon className={styles.groupEdit} onClick={(e) => openDetails(e, 'group', group)}>
                            <Settings />
                          </ListItemIcon>
                        </ListItem>
                        {index < groups.length - 1 && <Divider />}
                      </div>
                    )
                  })}
            </List>
          </AccordionDetails>
        </Accordion>
      )}
      {selfUser && selfUser.instanceId.value && (
        <Accordion expanded={selectedAccordion === 'layerUsers'} onChange={handleAccordionSelect('layerUsers')}>
          <AccordionSummary id="layer-user-header" expandIcon={<ExpandMore />} aria-controls="layer-user-content">
            <Public className={styles['icon-margin-right']} />
            <Typography>Layer Users</Typography>
          </AccordionSummary>
          <AccordionDetails
            className={classNames({
              [styles.flexbox]: true,
              [styles['flex-column']]: true,
              [styles['flex-center']]: true
            })}
          >
            <div className={styles['list-container']}>
              <div className={styles.title}>Users on this Layer</div>
              <List
                className={classNames({
                  [styles['flex-center']]: true,
                  [styles['flex-column']]: true
                })}
                onScroll={(e) => onListScroll(e)}
              >
                {instanceLayerUsers &&
                  instanceLayerUsers.length > 0 &&
                  instanceLayerUsers
                    .slice()
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((layerUser) => {
                      return (
                        <ListItem key={layerUser.id}>
                          <ListItemAvatar>
                            <Avatar src={layerUser.avatarUrl} />
                          </ListItemAvatar>
                          {selfUser.id.value === layerUser.id && <ListItemText primary={layerUser.name + ' (you)'} />}
                          {selfUser.id.value !== layerUser.id && <ListItemText primary={layerUser.name} />}
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
                        </ListItem>
                      )
                    })}
              </List>
            </div>
          </AccordionDetails>
        </Accordion>
      )}
    </div>
  )

  return (
    <div
      className={classNames({
        [styles['harmony-component']]: true,
        [styles['display-none']]: harmonyHidden === true
      })}
    >
      <style>
        {' '}
        {`
                .Mui-selected {
                    background-color: rgba(0, 0, 0, 0.4) !important;
                }
                .MuiOutlinedInput-notchedOutline {
                    border-color: rgba(127, 127, 127, 0.7);
                }
            `}
      </style>
      {dimensions.width <= 768 && (
        <SwipeableDrawer
          className={classNames({
            [styles['flex-column']]: true,
            [styles['list-container']]: true
          })}
          BackdropProps={{ invisible: true }}
          anchor="left"
          open={selectorsOpen === true}
          onClose={() => {
            setSelectorsOpen(false)
          }}
          onOpen={() => {
            setSelectedAccordion('friends')
          }}
        >
          <div className={styles['close-button']} onClick={() => setSelectorsOpen(false)}>
            <Close />
          </div>
          {chatSelectors}
        </SwipeableDrawer>
      )}
      {dimensions.width > 768 && chatSelectors}
      <div className={styles['chat-window']}>
        <div className={styles['harmony-header']}>
          {dimensions.width <= 768 && (
            <div
              className={classNames({
                [styles['chat-toggle']]: true,
                [styles.iconContainer]: true
              })}
              onClick={() => setSelectorsOpen(true)}
            >
              <Group />
            </div>
          )}
          {targetChannelId?.length > 0 && (
            <header className={styles.mediaControls}>
              {activeAVChannelId === '' && (
                <div
                  className={classNames({
                    [styles.iconContainer]: true,
                    [styles.startCall]: true
                  })}
                  onClick={(e) => handleStartCall(e)}
                >
                  <Call />
                </div>
              )}
              {activeAVChannelId !== '' && (
                <div className={styles.activeCallControls}>
                  <div
                    className={classNames({
                      [styles.iconContainer]: true,
                      [styles.endCall]: true
                    })}
                    onClick={(e) => handleEndCall(e)}
                  >
                    <CallEnd />
                  </div>
                  {hasAudioDevice && (
                    <div className={styles.iconContainer + ' ' + (audioPaused ? styles.off : styles.on)}>
                      <Mic id="micOff" className={styles.offIcon} onClick={(e) => handleMicClick(e)} />
                      <Mic id="micOn" className={styles.onIcon} onClick={(e) => handleMicClick(e)} />
                    </div>
                  )}
                  {videoEnabled && hasVideoDevice && (
                    <div className={styles.iconContainer + ' ' + (videoPaused ? styles.off : styles.on)}>
                      <Videocam id="videoOff" className={styles.offIcon} onClick={(e) => handleCamClick(e)} />
                      <Videocam id="videoOn" className={styles.onIcon} onClick={(e) => handleCamClick(e)} />
                    </div>
                  )}
                </div>
              )}
            </header>
          )}
          {targetChannelId?.length === 0 && <div />}

          <div className={styles.controls}>
            <div
              className={classNames({
                [styles['profile-toggle']]: true,
                [styles.iconContainer]: true
              })}
              onClick={() => openProfileMenu()}
            >
              <Person />
            </div>
            {selfUser?.userRole.value !== 'guest' && (
              <div
                className={classNames({
                  [styles['invite-toggle']]: true,
                  [styles.iconContainer]: true
                })}
                onClick={() => openInvite()}
              >
                <GroupAdd />
              </div>
            )}
            {isHarmonyPage !== true && (
              <div
                className={classNames({
                  [styles['harmony-toggle']]: true,
                  [styles.iconContainer]: true
                })}
                onClick={() => closeHarmony()}
              >
                <ThreeDRotation />
              </div>
            )}
          </div>
        </div>
        {activeAVChannelId !== '' && harmonyHidden !== true && (
          <div className={styles['video-container']}>
            <div className={styles['active-chat-plate']}>{getAVChannelName()}</div>
            <Grid className={styles['party-user-container']} container direction="row">
              <Grid
                item
                className={classNames({
                  [styles['grid-item']]: true,
                  [styles.single]: layerUsers.length == null || layerUsers.length <= 1,
                  [styles.two]: layerUsers.length === 2,
                  [styles.four]: layerUsers.length === 3 || layerUsers.length === 4,
                  [styles.six]: layerUsers.length === 5 || layerUsers.length === 6,
                  [styles.nine]: layerUsers.length >= 7 && layerUsers.length <= 9,
                  [styles.many]: layerUsers.length > 9
                })}
              >
                <PartyParticipantWindow harmony={true} peerId={'me_cam'} />
              </Grid>
              {layerUsers
                .filter((user) => user.id !== selfUser.id.value)
                .map((user) => (
                  <Grid
                    item
                    key={user.id}
                    className={classNames({
                      [styles['grid-item']]: true,
                      [styles.single]: layerUsers.length == null || layerUsers.length <= 1,
                      [styles.two]: layerUsers.length === 2,
                      [styles.four]: layerUsers.length === 3 || layerUsers.length === 4,
                      [styles.six]: layerUsers.length === 5 || layerUsers.length === 6,
                      [styles.nine]: layerUsers.length >= 7 && layerUsers.length <= 9,
                      [styles.many]: layerUsers.length > 9
                    })}
                  >
                    <PartyParticipantWindow harmony={true} peerId={user.id} key={user.id} />
                  </Grid>
                ))}
            </Grid>
          </div>
        )}
        <div className={styles['list-container']}>
          {targetChannelId != null && targetChannelId !== '' && (
            <div className={styles['active-chat-plate']}>{getChannelName()}</div>
          )}
          <List ref={messageRef as any} onScroll={(e) => onMessageScroll(e)} className={styles['message-container']}>
            {activeChannel != null &&
              activeChannel.Messages &&
              [...activeChannel.Messages]
                .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((message) => {
                  return (
                    <ListItem
                      className={classNames({
                        [styles.message]: true,
                        [styles.self]: message.senderId === selfUser.id.value,
                        [styles.other]: message.senderId !== selfUser.id.value
                      })}
                      key={message.id}
                      onMouseEnter={(e) => toggleMessageCrudSelect(e, message)}
                      onMouseLeave={(e) => toggleMessageCrudSelect(e, message)}
                      onTouchEnd={(e) => toggleMessageCrudSelect(e, message)}
                    >
                      <div>
                        {message.senderId !== selfUser.id.value && (
                          <ListItemAvatar>
                            <Avatar src={message.sender?.avatarUrl} />
                          </ListItemAvatar>
                        )}
                        {messageUpdatePending !== message.id && (
                          <ListItemText primary={message.text} secondary={generateMessageSecondary(message)} />
                        )}
                        {message.senderId === selfUser.id.value && messageUpdatePending !== message.id && (
                          <div className="message-crud">
                            {messageDeletePending !== message.id && messageCrudSelected === message.id && (
                              <div className={styles['crud-controls']}>
                                {messageDeletePending !== message.id && (
                                  <Edit
                                    className={styles.edit}
                                    onClick={(e) => loadMessageEdit(e, message)}
                                    onTouchEnd={(e) => loadMessageEdit(e, message)}
                                  />
                                )}
                                {messageDeletePending !== message.id && (
                                  <Delete
                                    className={styles.delete}
                                    onClick={(e) => showMessageDeleteConfirm(e, message)}
                                    onTouchEnd={(e) => showMessageDeleteConfirm(e, message)}
                                  />
                                )}
                              </div>
                            )}
                            {messageDeletePending === message.id && (
                              <div className={styles['crud-controls']}>
                                {messageDeletePending === message.id && (
                                  <Delete
                                    className={styles.delete}
                                    onClick={(e) => confirmMessageDelete(e, message)}
                                    onTouchEnd={(e) => confirmMessageDelete(e, message)}
                                  />
                                )}
                                {messageDeletePending === message.id && (
                                  <Clear
                                    className={styles.cancel}
                                    onClick={(e) => cancelMessageDelete(e)}
                                    onTouchEnd={(e) => cancelMessageDelete(e)}
                                  />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {messageUpdatePending === message.id && (
                          <div className={styles['message-edit']}>
                            <TextField
                              variant="outlined"
                              margin="normal"
                              multiline
                              fullWidth
                              id="editingMessage"
                              placeholder="Abc"
                              name="editingMessage"
                              autoFocus
                              value={editingMessage}
                              inputProps={{
                                maxLength: 1000
                              }}
                              onChange={handleEditingMessageChange}
                            />
                            <div className={styles['editing-controls']}>
                              <Clear
                                className={styles.cancel}
                                onClick={(e) => cancelMessageUpdate(e)}
                                onTouchEnd={(e) => cancelMessageUpdate(e)}
                              />
                              <Save
                                className={styles.save}
                                onClick={(e) => confirmMessageUpdate(e, message)}
                                onTouchEnd={(e) => confirmMessageUpdate(e, message)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </ListItem>
                  )
                })}
            {targetChannelId != null && targetChannelId.length === 0 && targetObject.id != null && (
              <div className={styles['first-message-placeholder']}>
                <div>{targetChannelId}</div>
                Start a chat with{' '}
                {targetObjectType.value === 'user' || targetObjectType.value === 'group'
                  ? targetObject.name
                  : targetObjectType.value === 'instance'
                  ? 'your current layer'
                  : 'your current party'}
              </div>
            )}
          </List>
          {targetObject != null && targetObject.id != null && (
            <div className={styles['flex-center']}>
              <div className={styles['chat-box']}>
                <TextField
                  variant="outlined"
                  margin="normal"
                  multiline
                  fullWidth
                  id="newMessage"
                  placeholder="Abc"
                  name="newMessage"
                  autoFocus
                  value={composingMessage}
                  inputProps={{
                    maxLength: 1000
                  }}
                  onKeyPress={(e) => {
                    if (e.shiftKey === false && e.charCode === 13) {
                      e.preventDefault()
                      packageMessage()
                    }
                  }}
                  onChange={handleComposingMessageChange}
                />
                <Button
                  variant="contained"
                  color="primary"
                  className={styles['send-button']}
                  startIcon={<Send />}
                  onClick={packageMessage}
                >
                  Send
                </Button>
              </div>
            </div>
          )}
          {(targetObject == null || targetObject.id == null) && (
            <div className={styles['no-chat']}>
              <div>Start a chat with a friend or group from the side panel</div>
            </div>
          )}
        </div>
      </div>
      {profileMenuOpen && (
        <ClickAwayListener onClickAway={() => setProfileMenuOpen(false)}>
          <div className={styles.profileMenu}>
            <ProfileMenu setProfileMenuOpen={setProfileMenuOpen} />
          </div>
        </ClickAwayListener>
      )}
      <WarningRefreshModal
        open={warningRefreshModalValues.open}
        handleClose={() => {
          setWarningRefreshModalValues(initialRefreshModalValues)
        }}
        title={warningRefreshModalValues.title}
        body={warningRefreshModalValues.body}
        action={warningRefreshModalValues.action}
        parameters={warningRefreshModalValues.parameters}
        timeout={warningRefreshModalValues.timeout}
        closeEffect={warningRefreshModalValues.closeAction}
      />
    </div>
  )
}

export default Harmony
