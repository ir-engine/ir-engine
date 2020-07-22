import React, { useState, useEffect } from 'react'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
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
} from '../../../redux/chat/service'
import { selectChatState } from '../../../redux/chat/selector'
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
import _ from 'lodash'
import {User} from "../../../../shared/interfaces/User";

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

const Groups = (props: Props): any => {
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
    const [targetObjectId, setTargetObjectId] = useState('')
    const [targetObjectType, setTargetObjectType] = useState('')

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
        userChannels.forEach((userChannel, channelId) => {
          if (userChannel.get('updateNeeded') === true) {
              getChannelMessages(channelId, 'user')
          }
        })
    }, [userChannels]);

    useEffect(() => {
        groupChannels.forEach((groupChannel, channelId) => {
            if (groupChannel.get('updateNeeded') === true) {
                getChannelMessages(channelId, 'group')
            }
        })
    }, [groupChannels]);

    useEffect(() => {
        if (partyChannel.get('updateNeeded') === true) {
            getChannelMessages(partyChannel.channelId)
        }
    }, [partyChannel]);

    const handleComposingMessageChange = (event: any): void => {
        const message = event.target.value
        setComposingMessage(message)
    }

    const packageMessage = (event: any): void => {
        createMessage({
            // targetObjectId: targetObjectId,
            // targetObjectType: targetObjectType
            targetObjectId: '36263b93ba7c6d243306dd8b5d7f36bd',
            targetObjectType: 'user',
            text: composingMessage
        })
        setComposingMessage('')
    }

    return (
        <div className="chat-container">
            <List className="flex-center flex-column">
                { userChannels && Object.keys(userChannels).length > 0 && userChannels.map((userChannel, channelId) => {
                        return <ListItem key={channelId}>
                            <ListItemText primary={channelId}/>
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

export default connect(mapStateToProps, mapDispatchToProps)(Groups)
