import React, { useState, useEffect } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import './style.scss';
import {
    Avatar,
    Button,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    TextField
} from '@material-ui/core';
import {
    getPartyChannel,
    createMessage,
    updateChatTarget,
    updateMessageScrollInit
} from '../../../redux/chat/service';
import { selectAuthState} from '../../../redux/auth/selector';
import { selectChatState } from '../../../redux/chat/selector';
import {
    Message as MessageIcon,
    Send
} from '@material-ui/icons';
import moment from 'moment';
import {User} from "@xr3ngine/common/interfaces/User";
import { Message } from '@xr3ngine/common/interfaces/Message';
import _ from 'lodash';


const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state),
        chatState: selectChatState(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getPartyChannel: bindActionCreators(getPartyChannel, dispatch),
    createMessage: bindActionCreators(createMessage, dispatch),
    updateChatTarget: bindActionCreators(updateChatTarget, dispatch),
    updateMessageScrollInit: bindActionCreators(updateMessageScrollInit, dispatch)
});

interface Props {
    authState?: any;
    setBottomDrawerOpen: any;
    chatState?: any;
    getPartyChannel?: any;
    createMessage?: any;
    updateChatTarget?: any;
    updateMessageScrollInit?: any;
}

const BottomDrawer = (props: Props): any => {
    const {
        authState,
        chatState,
        getPartyChannel,
        createMessage,
        setBottomDrawerOpen,
        updateChatTarget,
        updateMessageScrollInit
    } = props;

    let activeChannel;
    const messageRef = React.useRef();
    const user = authState.get('user') as User;
    const channelState = chatState.get('channels');
    const channels = channelState.get('channels');
    const [composingMessage, setComposingMessage] = useState('');
    const activeChannelMatch = [...channels].find(([, channel]) => channel.channelType === 'party');
    if (activeChannelMatch && activeChannelMatch.length > 0) {
        activeChannel = activeChannelMatch[1];
    }

    console.log('ActiveChannel:');
    console.log(activeChannel);

    useEffect(() =>  {
        if (channelState.get('partyChannelFetched') !== true && channelState.get('fetchingPartyChannel') !== true) {
            getPartyChannel();
        }
    }, []);

    const openBottomDrawer = (e: any): void => {
        setBottomDrawerOpen(true);
    };

    const handleComposingMessageChange = (event: any): void => {
        const message = event.target.value;
        setComposingMessage(message);
    };

    const packageMessage = (event: any): void => {
        if (composingMessage.length > 0) {
            createMessage({
                targetObjectId: user.partyId,
                targetObjectType: 'party',
                text: composingMessage
            });
            setComposingMessage('');
        }
    };

    const setActiveChat = (channel): void => {
        console.log('setActiveChat:');
        updateMessageScrollInit(true);
        const channelType = channel.channelType;
        const target = channelType === 'user' ? (channel.user1?.id === user.id ? channel.user2 : channel.user2?.id === user.id ? channel.user1 : {}) : channelType === 'group' ? channel.group : channel.party;
        updateChatTarget(channelType, target, channel.id);
        setComposingMessage('');
    };

    const getMessageUser = (message: Message): User => {
        let user;
        const channel = channels.get(message.channelId);
        if (channel.channelType === 'user') {
            user = channel.userId1 === message.senderId ? channel.user1 : channel.user2;
        } else if (channel.channelType === 'group') {
            const groupUser = _.find(channel.group.groupUsers, (groupUser) => {
                return groupUser.userId === message.senderId;
            });
            user = groupUser != null ? groupUser.user : {};
        } else if (channel.channelType === 'party') {
            const partyUser = _.find(channel.party.partyUsers, (partyUser) => {
                return partyUser.userId === message.senderId;
            });
            user = partyUser != null ? partyUser.user : {};
        }

        return user;
    };

    const generateMessageSecondary = (message: Message): string => {
        const date = moment(message.createdAt).format('MMM D YYYY, h:mm a');
        if (message.senderId !== user.id) {
            return `${getMessageUser(message).name? getMessageUser(message).name : 'A former user'} on ${date}`;
        }
        else {
            return date;
        }
    };

    const openDrawer = (e): void => {
        setActiveChat(activeChannel);
        openBottomDrawer(e);
    };

    return (
        <div className="instance-chat-container">
            <div className="list-container">
                <List ref={(messageRef as any)} className="message-container">
                    { activeChannel != null && activeChannel.messages && activeChannel.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).slice(activeChannel.messages?.length - 3, activeChannel.mesages?.length).map((message) => {
                        return <ListItem
                            className={message.senderId === user.id ? "message self" : "message other"}
                            key={message.id}
                        >
                            <div>
                                { message.senderId !== user.id &&
                                <ListItemAvatar>
                                    <Avatar src={getMessageUser(message).avatarUrl}/>
                                </ListItemAvatar>
                                }
                                <ListItemText
                                    primary={message.text}
                                    secondary={generateMessageSecondary(message)}
                                />
                            </div>
                        </ListItem>;
                    })
                    }
                    {(activeChannel == null || activeChannel.messages?.length === 0) &&
                    <div className="first-message-placeholder">
                        No messages to this party yet
                    </div>
                    }
                </List>
                <div className="flex-center">
                    <div className="chat-box">
                        <Button variant="contained"
                                color="primary"
                                startIcon={<MessageIcon/>}
                                onClick={openDrawer}
                        />
                        <TextField
                            variant="outlined"
                            margin="normal"
                            multiline
                            fullWidth
                            id="newMessage"
                            label="Chat with users at this location"
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
                                startIcon={<Send/>}
                                onClick={packageMessage}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(BottomDrawer);
