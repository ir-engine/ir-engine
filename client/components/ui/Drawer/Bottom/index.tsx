import React, { useState, useEffect } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import './style.scss'
import {
    Avatar,
    Button,
    Divider,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    SwipeableDrawer,
    Tab,
    Tabs,
    TextField
} from '@material-ui/core'
import {
    getChannels,
    getChannelMessages,
    createMessage,
    removeMessage,
    updateChatTarget
} from '../../../../redux/chat/service'
import { selectAuthState} from '../../../../redux/auth/selector'
import { selectChatState } from '../../../../redux/chat/selector'
import {
    Add,
    Clear,
    Delete,
    Edit,
    Send
} from '@material-ui/icons'
import moment from 'moment'
import {User} from "../../../../../shared/interfaces/User";
import { Message } from '../../../../../shared/interfaces/Message'
import _ from 'lodash'

const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state),
        chatState: selectChatState(state),
    }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getChannels: bindActionCreators(getChannels, dispatch),
    getChannelMessages: bindActionCreators(getChannelMessages, dispatch),
    createMessage: bindActionCreators(createMessage, dispatch),
    removeMessage: bindActionCreators(removeMessage, dispatch),
    updateChatTarget: bindActionCreators(updateChatTarget, dispatch)
})

interface Props {
    authState?: any,
    bottomDrawerOpen: boolean,
    setBottomDrawerOpen: any,
    setLeftDrawerOpen: any,
    chatState?: any,
    getChannels?: any,
    getChannelMessages?: any,
    createMessage?: any,
    removeMessage?: any,
    updateChatTarget?: any
}

const BottomDrawer = (props: Props): any => {
    const {
        authState,
        chatState,
        getChannels,
        getChannelMessages,
        createMessage,
        removeMessage,
        bottomDrawerOpen,
        setBottomDrawerOpen,
        setLeftDrawerOpen,
        updateChatTarget
    } = props
    const user = authState.get('user') as User
    const channelState = chatState.get('channels')
    const channels = channelState.get('channels')
    const targetObject = chatState.get('targetObject')
    const [messageScrollInit, setMessageScrollInit] = useState(false)
    const [messageScrollUpdate, setMessageScrollUpdate] = useState(false)
    const [messageScrollHeight, setMessageScrollHeight] = useState(0)
    const [topMessage, setTopMessage] = useState({})
    const [messageDeletePending, setMessageDeletePending] = useState('')

    const messageRef = React.useRef();
    const messageEl = messageRef.current

    const [composingMessage, setComposingMessage] = useState('')
    const [activeChatId, setActiveChatId] = useState('')

    useEffect(() => {
        console.log('chatState useEffect')
        console.log(chatState)
        if (messageScrollInit === true && messageEl != null && (messageEl as any).scrollTop != null) {
            (messageEl as any).scrollTop = (messageEl as any).scrollHeight
            setMessageScrollInit(false)
        }
        if (messageScrollUpdate === true) {
            setMessageScrollUpdate(false)
            if (messageEl != null && (messageEl as any).scrollTop != null) {
                console.log(`Setting scrollTop to ${(topMessage as any).offsetTop}`);
                (messageEl as any).scrollTop = (topMessage as any).offsetTop
            }
        }
    }, [chatState])

    useEffect(() =>  {
        if (channelState.get('updateNeeded') === true) {
            getChannels()
        }
    }, [channelState]);

    useEffect(() => {
        console.log('channels useEffect')
        channels.forEach((channel) => {
            if (chatState.get('updateMessageScroll') === true) {
                chatState.set('updateMessageScroll', false)
                if (channel.id === activeChatId && (((messageEl as any).scrollHeight - (messageEl as any).scrollTop - (messageEl as any).firstElementChild?.offsetHeight) <= (messageEl as any).clientHeight + 20)) {
                    (messageEl as any).scrollTop = (messageEl as any).scrollHeight
                }
            }
            if (channel.updateNeeded === true) {
                getChannelMessages(channel.id)
            }
        })
    }, [channels]);


    const openLeftDrawer = (e: any): void => {
        setBottomDrawerOpen(false)
        setLeftDrawerOpen(true)
    }

    const handleComposingMessageChange = (event: any): void => {
        const message = event.target.value
        setComposingMessage(message)
    }

    const packageMessage = (event: any): void => {
        createMessage({
            targetObjectId: targetObject.id,
            targetObjectType: chatState.get('targetObjectType'),
            text: composingMessage
        })
        setComposingMessage('')
    }

    const setActiveChat = (channel): void => {
        setMessageScrollInit(true)
        const channelType = channel.channelType
        const target = channelType === 'user' ? (channel.user1?.id === user.id ? channel.user2 : channel.user2?.id === user.id ? channel.user1 : {}) : channelType === 'group' ? channel.group : channel.party
        setActiveChatId(channel.id)
        updateChatTarget(channelType, target)
        setMessageDeletePending('')
    }

    const onChannelScroll = (e): void => {
        if ((e.target.scrollHeight - e.target.scrollTop) === e.target.clientHeight ) {
            nextChannelPage()
        }
    }

    const onMessageScroll = (e): void => {
        if (e.target.scrollTop === 0 && (e.target.scrollHeight > e.target.clientHeight)) {
            console.log('Saving message scrollHeight')
            console.log(`height: ${(messageEl as any)?.scrollHeight}`)
            setMessageScrollHeight((messageEl as any)?.scrollHeight)
            setMessageScrollUpdate(true)
            console.log('firstChild:')
            console.log((messageEl as any).firstElementChild)
            setTopMessage((messageEl as any).firstElementChild)
            nextMessagePage()
        }
    }

    const nextChannelPage = (): void => {
        if ((channelState.get('skip') + channelState.get('limit')) < channelState.get('total')) {
            getChannels(channelState.get('skip') + channelState.get('limit'))
        }
    }

    const nextMessagePage = (): void => {
        const activeChannel = channels.get(activeChatId)
        if ((activeChannel.skip + activeChannel.limit) < activeChannel.total) {
            getChannelMessages(activeChatId, activeChannel.skip + activeChannel.limit)
        }
    }

    const getMessageUser = (message: Message): User => {
        let user
        const channel = channels.get(message.channelId)
        if (channel.channelType === 'user') {
            user = channel.userId1 === message.senderId ? channel.user1 : channel.user2
        } else if (channel.channelType === 'group') {
            const groupUser = _.find(channel.group.groupUsers, (groupUser) => {
                console.log(groupUser.userId)
                return groupUser.userId === message.senderId
            })
            console.log(groupUser)
            user = groupUser.user
        } else if (channel.channelType === 'party') {
            const partyUser = _.find(channel.party.partyUsers, (partyUser) => {
                return partyUser.userId === message.senderId
            })
            user = partyUser.user
        }

        return user
    }

    const generateMessageSecondary = (message: Message): string => {
        const date = moment(message.createdAt).format('MMM D YYYY, h:mm a')
        if (message.senderId !== user.id) {
            return `${getMessageUser(message).name} on ${date}`
        }
        else {
            return date
        }
    }

    const loadMessageEdit = (message: Message): void => {
        return
    }

    const showMessageDeleteConfirm = (message: Message): void => {
        setMessageDeletePending(message.id)
    }

    const cancelMessageDelete = (): void => {
        setMessageDeletePending('')
    }

    const confirmMessageDelete = (message: Message): void => {
        setMessageDeletePending('')
        removeMessage(message.id)
    }

    return (
        <div>
            <SwipeableDrawer
                className="flex-column"
                anchor="bottom"
                open={props.bottomDrawerOpen === true}
                onClose={() => {setBottomDrawerOpen(false)}}
                onOpen={() => {}}
            >
                <div className="bottom-container">
                    <List onScroll={(e) => onChannelScroll(e)} className="chat-container">
                        { channels && channels.size > 0 && Array.from(channels).sort(([channelId1, channel1], [channelId2, channel2]) => new Date(channel2.updatedAt).getTime() - new Date(channel1.updatedAt).getTime()).map(([channelId, channel], index) => {
                            return <ListItem
                                key={channelId}
                                className="selectable"
                                onClick={() => setActiveChat(channel)}
                                selected={ channelId === activeChatId }
                                divider={ index < channels.size - 1 }
                            >
                                    { channel.channelType === 'user' &&
                                        <ListItemAvatar>
                                            <Avatar src={channel.userId1 === user.id ? channel.user2.avatarUrl: channel.user1.avatarUrl}/>
                                        </ListItemAvatar>
                                    }
                                    <ListItemText primary={channel.channelType === 'user' ? (channel.user1?.id === user.id ? channel.user2.name : channel.user2?.id === user.id ? channel.user1.name : '') : channel.channelType === 'group' ? channel.group.name : 'Current party'}/>
                                </ListItem>
                        })
                        }
                        { channels == null || channels.size === 0 &&
                            <ListItem key="no-chats" disabled>
                                <ListItemText primary="No active chats"/>
                            </ListItem>
                        }
                    </List>
                    <div className="list-container">
                        <List ref={(messageRef as any)} onScroll={(e) => onMessageScroll(e)} className="message-container">
                            { activeChatId.length > 0 && channels.get(activeChatId) != null && channels.get(activeChatId).messages && channels.get(activeChatId).messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((message) => {
                                return <ListItem className={message.senderId === user.id ? "message self" : "message other"} key={message.id}>
                                    {message.senderId === user.id &&
                                        <div className="crud-controls">
                                            <Edit onClick={() => loadMessageEdit(message)}/>
                                            { messageDeletePending !== message.id &&
                                                <Delete onClick={() => showMessageDeleteConfirm(message)}/>
                                            }
                                            { messageDeletePending === message.id &&
                                                <div>
                                                    <Clear onClick={cancelMessageDelete}/>
                                                    <Delete onClick={() => confirmMessageDelete(message)}/>
                                                </div>
                                            }
                                        </div>
                                    }
                                    { message.senderId !== user.id &&
                                        <ListItemAvatar>
                                            <Avatar src={getMessageUser(message).avatarUrl}/>
                                        </ListItemAvatar>
                                    }
                                    <ListItemText
                                        primary={message.text}
                                        secondary={generateMessageSecondary(message)}/>
                                </ListItem>
                            })
                            }
                        </List>
                        {targetObject != null && targetObject.id != null &&
                            <div className="flex-center">
                                <div className="chat-box">
                                    <TextField
                                        variant="outlined"
                                        margin="normal"
                                        multiline
                                        fullWidth
                                        id="newMessage"
                                        label="Message text"
                                        name="name"
                                        autoFocus
                                        value={composingMessage}
                                        inputProps={{
                                            maxLength: 1000
                                        }}
                                        onChange={(e) => handleComposingMessageChange(e)}
                                    />
                                    <Button variant="contained"
                                            color="primary"
                                            startIcon={<Send/>}
                                            onClick={packageMessage}
                                    >
                                        Send
                                    </Button>
                                </div>
                            </div>
                        }
                        { (targetObject == null || targetObject.id == null) &&
                            <div className="no-chat">
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
            </SwipeableDrawer>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(BottomDrawer)
