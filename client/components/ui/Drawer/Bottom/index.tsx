import React, { useState, useEffect } from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import './style.scss'
import {
    Avatar,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Tab,
    Tabs,
    TextField
} from '@material-ui/core'
import {
    getUserChannels,
    getGroupChannels,
    getPartyChannel,
    getChannelMessages,
    createMessage,
    removeMessage
} from '../../../../redux/chat/service'
import { selectChatState } from '../../../../redux/chat/selector'
import {
    AccountCircle,
    ChevronLeft,
    ChevronRight,
    Delete,
    Edit,
    Mail,
    PeopleOutlined,
    PhoneIphone
} from '@material-ui/icons'
import moment from 'moment'
import {User} from "../../../../../shared/interfaces/User";
import { client } from '../../../../redux/feathers'

const mapStateToProps = (state: any): any => {
    return {
        chatState: selectChatState(state),
    }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getUserChannels: bindActionCreators(getUserChannels, dispatch),
    getGroupChannels: bindActionCreators(getGroupChannels, dispatch),
    getPartyChannel: bindActionCreators(getPartyChannel, dispatch),
    getChannelMessages: bindActionCreators(getChannelMessages, dispatch),
    createMessage: bindActionCreators(createMessage, dispatch),
    removeMessage: bindActionCreators(removeMessage, dispatch)
})

interface Props {
    auth: any,
    chatState?: any,
    getUserChannels?: any,
    getGroupChannels?: any,
    getPartyChannel?: any,
    getChannelMessages?: any,
    createMessage?: any,
    removeMessage?: any
}

const BottomDrawer = (props: Props): any => {
    const {
        auth,
        chatState,
        getUserChannels,
        getGroupChannels,
        getPartyChannel,
        getChannelMessages,
        createMessage,
        removeMessage
    } = props
    const user = auth.get('user') as User
    console.log('chatState:')
    console.log(chatState)
    const channels = chatState.get('channels')
    console.log('channels:')
    console.log(channels)
    const userChannelState = channels.get('user')
    console.log('userChannelState')
    console.log(userChannelState)
    const groupChannelState = channels.get('group')
    const partyChannelState = channels.get('party')
    const userChannels = userChannelState.get('channels')
    const groupChannels = groupChannelState.get('channels')
    const partyChannel = partyChannelState.get('channel')

    const [composingMessage, setComposingMessage] = useState('')
    const [activeChatId, setActiveChatId] = useState('')
    const [activeChatType, setActiveChatType] = useState('')
    const [activeChatTargetId, setActiveChatTargetId] = useState('')

    useEffect(() => {
        console.log('UserChannelState useeffect')
        console.log(userChannelState)
        console.log(userChannelState.get('updateNeeded'))
        if (userChannelState.get('updateNeeded') === true) {
            console.log('Re-fetching user channels')
            getUserChannels()
        }
    }, [userChannelState]);

    useEffect(() => {
        if (groupChannelState.get('updateNeeded') === true) {
            getGroupChannels()
        }
    }, [groupChannelState]);

    useEffect(() => {
        if (partyChannelState.get('updateNeeded') === true) {
            getPartyChannel()
        }
    }, [partyChannelState]);

    useEffect(() => {
        console.log('userChannels useeffect')
        console.log(userChannels)
        userChannels.forEach((userChannel) => {
            if (userChannel.updateNeeded === true) {
                getChannelMessages(userChannel.id, 'user')
            }
        })
    }, [userChannels]);

    useEffect(() => {
        groupChannels.forEach((groupChannel) => {
            if (groupChannel.updateNeeded === true) {
                getChannelMessages(groupChannel.id, 'group')
            }
        })
    }, [groupChannels]);

    useEffect(() => {
        if (partyChannel.updateNeeded === true) {
            getChannelMessages(partyChannel.id)
        }
    }, [partyChannel]);

    const handleComposingMessageChange = (event: any): void => {
        const message = event.target.value
        setComposingMessage(message)
    }

    const packageMessage = (event: any): void => {
        createMessage({
            targetObjectId: activeChatTargetId,
            targetObjectType: activeChatType,
            text: composingMessage
        })
        setComposingMessage('')
    }

    const setActiveChat = (channelType, channelId, userChannel): void => {
        const userId = user.id
        const targetId = channelType === 'user' ? (userChannel.userId1 === userId ? userChannel.userId2 : userChannel.userId1) : channelType === 'group' ? userChannel.groupId : userChannel.partyId
        setActiveChatId(channelId)
        setActiveChatType(channelType)
        setActiveChatTargetId(targetId)
    }

    return (
        <div className="bottom-drawer">
            <List className="flex-center flex-column">
                { userChannels && userChannels.size > 0 && Array.from(userChannels).map(([channelId, userChannel]) => {
                    return <ListItem key={channelId} onClick={() => setActiveChat('user', channelId, userChannel)}>
                        <ListItemText primary={channelId}/>
                    </ListItem>
                })
                }
            </List>
            <List className="flex-center flex-column">
                { activeChatId.length > 0 && activeChatType === 'user' && userChannels.get(activeChatId).messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((message) => {
                    return <ListItem key={message.id}>
                        <ListItemText primary={message.text}/>
                        <ListItemText primary={moment(message.createdAt).format('MMM D YYYY [at] h:mm a')}/>
                    </ListItem>
                })
                }
            </List>
            <div className="flex-center">
                <div className="paper">
                    <div className="username">
                        <TextField
                            variant="outlined"
                            margin="normal"
                            fullWidth
                            id="newMessage"
                            label="Message text"
                            name="name"
                            autoFocus
                            value={composingMessage}
                            onChange={(e) => handleComposingMessageChange(e)}
                        />
                        <Button variant="contained"
                                color="primary"
                                onClick={packageMessage}
                        >
                            Send Message
                        </Button>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default connect(mapStateToProps, mapDispatchToProps)(BottomDrawer)
