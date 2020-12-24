import React, { useState, useEffect } from 'react';
import { bindActionCreators, Dispatch } from 'redux';
import { connect } from 'react-redux';
import styles from './InstanceChat.module.scss';
import {
    Avatar,
    Badge,
    Card,
    CardContent,
    Fab,
    ListItem,
    ListItemAvatar,
    ListItemText,
    TextField
} from '@material-ui/core';
import {
    getInstanceChannel,
    createMessage,
    updateChatTarget,
    updateMessageScrollInit
} from '../../../redux/chat/service';
import { selectAuthState} from '../../../redux/auth/selector';
import { selectChatState } from '../../../redux/chat/selector';
import { selectInstanceConnectionState } from '../../../redux/instanceConnection/selector';
import {
    Message as MessageIcon,
    Send
} from '@material-ui/icons';
import moment from 'moment';
import {User} from "@xr3ngine/common/interfaces/User";
import { Message } from '@xr3ngine/common/interfaces/Message';
import _ from 'lodash';
import classNames from 'classnames';


const mapStateToProps = (state: any): any => {
    return {
        authState: selectAuthState(state),
        chatState: selectChatState(state),
        instanceConnectionState: selectInstanceConnectionState(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getInstanceChannel: bindActionCreators(getInstanceChannel, dispatch),
    createMessage: bindActionCreators(createMessage, dispatch),
    updateChatTarget: bindActionCreators(updateChatTarget, dispatch),
    updateMessageScrollInit: bindActionCreators(updateMessageScrollInit, dispatch)
});

interface Props {
    authState?: any;
    setBottomDrawerOpen: any;
    chatState?: any;
    instanceConnectionState?: any;
    getInstanceChannel?: any;
    createMessage?: any;
    updateChatTarget?: any;
    updateMessageScrollInit?: any;
}

const InstanceChat = (props: Props): any => {
    const {
        authState,
        chatState,
        instanceConnectionState,
        getInstanceChannel,
        createMessage,
        setBottomDrawerOpen,
        updateChatTarget,
        updateMessageScrollInit
    } = props;

    let activeChannel;
    const messageRef = React.useRef<HTMLInputElement>();
    const user = authState.get('user') as User;
    const channelState = chatState.get('channels');
    const channels = channelState.get('channels');
    const [composingMessage, setComposingMessage] = useState('');
    const activeChannelMatch = [...channels].find(([, channel]) => channel.channelType === 'instance');
    if (activeChannelMatch && activeChannelMatch.length > 0) {
        activeChannel = activeChannelMatch[1];
    }

    useEffect(() =>  {
        console.log('InstanceChat instanceConnectionState useEffect');
        console.log(instanceConnectionState.get('connected'));
        if (instanceConnectionState.get('connected') === true && channelState.get('fetchingInstanceChannel') !== true) {
            getInstanceChannel();
        }
    }, [instanceConnectionState]);

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
                targetObjectId: user.instanceId,
                targetObjectType: 'instance',
                text: composingMessage
            });
            setComposingMessage('');
        }
    };

    const setActiveChat = (channel): void => {
        updateMessageScrollInit(true);
        const channelType = channel.channelType;
        const target = channelType === 'user' ? (channel.user1?.id === user.id ? channel.user2 : channel.user2?.id === user.id ? channel.user1 : {}) : channelType === 'group' ? channel.group : channelType === 'instance' ? channel.instance : channel.party;
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
        } else if (channel.channelType === 'instance') {
            const instanceUser = _.find(channel.instance.instanceUsers, (instanceUser) => {
                return instanceUser.id === message.senderId;
            });
            user = instanceUser != null ? instanceUser : {};
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

    const [openMessageContainer, setOpenMessageContainer] = React.useState(false);
    const hideShowMessagesContainer = () => setOpenMessageContainer(!openMessageContainer);


    console.log('activeChannel.messages', activeChannel?.messages)

    return (
        <>
        <div className={styles['instance-chat-container'] + ' '+ (!openMessageContainer && styles['messageContainerClosed'])}>
            <div className={styles['list-container']}>
                <Card square={true} elevation={0} className={styles['message-wrapper']}>
                    <CardContent className={styles['message-container']}>
                    { activeChannel != null && activeChannel.messages && activeChannel.messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).slice(activeChannel.messages.length >= 3 ? activeChannel.messages?.length - 3 : 0, activeChannel.mesages?.length).map((message) => {
                        return <ListItem
                            className={classNames({
                                [styles.message]: true,
                                [styles.self]: message.senderId === user.id,
                                [styles.other]: message.senderId !== user.id
                            })}
                            disableGutters={true}
                            key={message.id}
                        >
                            <div>
                                <ListItemAvatar>
                                    <Avatar src={getMessageUser(message).avatarUrl}/>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={<p><span className={styles.userName}>{getMessageUser(message).name+': '}</span>{message.text}</p>}
                                />
                            </div>
                        </ListItem>;
                    })
                    }
                    </CardContent>
                </Card>
                <Card className={styles['flex-center']}>
                    <CardContent className={styles['chat-box']}>
                        <div className={styles.iconContainer} >
                            <MessageIcon onClick={()=>hideShowMessagesContainer()} />
                        </div>
                        <TextField
                            className={styles.messageFieldContainer}
                            margin="normal"
                            multiline
                            fullWidth
                            id="newMessage"
                            label="Chat with users at this location"
                            name="newMessage"
                            autoFocus
                            value={composingMessage}
                            inputProps={{
                                maxLength: 1000,
                            }}
                            onChange={handleComposingMessageChange}
                            inputRef={messageRef}
                            onClick={()=> (messageRef as any)?.current?.focus()}
                        />
                        <div className={styles.iconContainerSend} onClick={packageMessage}>
                            <Send/>                            
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
       {!openMessageContainer && (<div className={styles.iconCallChat} >
        <Badge color="secondary" variant="dot" invisible={false} 
        anchorOrigin={{vertical: 'top', horizontal: 'left',}}>
            <Fab color="primary">
                <MessageIcon onClick={()=>hideShowMessagesContainer()} />Chat
            </Fab>
        </Badge>
        </div>)}
    </>);
};

export default connect(mapStateToProps, mapDispatchToProps)(InstanceChat);
