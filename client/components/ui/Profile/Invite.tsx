import React, {useEffect, useState} from 'react'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import './style.scss'
import {
    Avatar,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    TextField,
    Tab,
    Tabs
} from '@material-ui/core'
import {
    AccountCircle,
    ArrowDownward,
    ArrowUpward,
    ChevronLeft,
    ChevronRight,
    Mail,
    PhoneIphone
} from "@material-ui/icons";
import { getFriends } from '../../../redux/friend/service'
import { selectFriendState } from '../../../redux/friend/selector'
import { selectInviteState } from '../../../redux/invite/selector'
import {
    sendInvite,
    retrieveReceivedInvites,
    retrieveSentInvites,
    deleteInvite
} from '../../../redux/invite/service'


const mapStateToProps = (state: any): any => {
    return {
        friendState: selectFriendState(state),
        inviteState: selectInviteState(state)
    }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getFriends: bindActionCreators(getFriends, dispatch),
    retrieveReceivedInvites: bindActionCreators(retrieveReceivedInvites, dispatch),
    retrieveSentInvites: bindActionCreators(retrieveSentInvites, dispatch),
    sendInvite: bindActionCreators(sendInvite, dispatch),
    deleteInvite: bindActionCreators(deleteInvite, dispatch)
})

interface Props {
    auth: any
    friendState?: any
    inviteState?: any
    retrieveReceivedInvites?: typeof retrieveReceivedInvites
    retrieveSentInvites?: typeof retrieveSentInvites
    sendInvite?: typeof sendInvite
    getFriends?: any,
    deleteInvite?: any
}

const identityProviderTabMap = new Map()
identityProviderTabMap.set(0, 'email')
identityProviderTabMap.set(1, 'sms')

const Invites = (props: Props): any => {
    const { friendState, inviteState, sendInvite, retrieveReceivedInvites, retrieveSentInvites, getFriends, deleteInvite } = props
    const friends = friendState.get('friends')
    console.log(inviteState)
    const receivedInviteState = inviteState.get('receivedInvites')
    const receivedInvites = receivedInviteState.get('invites')
    const sentInviteState = inviteState.get('sentInvites')
    const sentInvites = sentInviteState.get('invites')
    const [tabIndex, setTabIndex] = useState(0)
    const [inviteTabIndex, setInviteTabIndex] = useState(0)
    const [userToken, setUserToken] = useState('')
    const [ deletePending, setDeletePending ] = useState('')

    const handleChange = (event: any, newValue: number): void => {
        event.preventDefault()
        setTabIndex(newValue)
        setUserToken('')
    }

    const handleInviteChange = (event: any, newValue: number): void => {
        event.preventDefault()
        setInviteTabIndex(newValue)
    }

    const handleUserTokenChange = (event: any): void => {
        const token = event.target.value
        setUserToken(token)
    }

    const packageInvite = (event: any): void => {
        const mappedIDProvider = identityProviderTabMap.get(tabIndex)
        sendInvite({
            type: 'friend',
            token: mappedIDProvider ? userToken : null,
            identityProviderType: mappedIDProvider ? mappedIDProvider : null,
            invitee: tabIndex === 2 ? userToken : null
        })
    }

    const showDeleteConfirm = (inviteId) => {
        setDeletePending(inviteId)
    }

    const cancelDelete = () => {
        setDeletePending('')
    }

    const confirmDelete = (inviteId) => {
        setDeletePending('')
        deleteInvite(inviteId)
    }

    const previousInvitePage = (): void => {
        if (inviteTabIndex === 0) {
            retrieveReceivedInvites(receivedInviteState.get('skip') - receivedInviteState.get('limit'))
        }
        else {
            retrieveSentInvites(sentInviteState.get('skip') - sentInviteState.get('limit'))
        }
    }

    const nextInvitePage = (): void => {
        if (inviteTabIndex === 0) {
            retrieveReceivedInvites(receivedInviteState.get('skip') + receivedInviteState.get('limit'))
        }
        else {
            retrieveSentInvites(sentInviteState.get('skip') + sentInviteState.get('limit'))
        }
    }

    useEffect(() => {
        if (friendState.get('updateNeeded') === true) {
            getFriends('')
        }
    }, [friendState])

    useEffect(() => {
        if (inviteState.get('sentUpdateNeeded') === true) {
            retrieveSentInvites()
            console.log(inviteState)
        }
    }, [inviteState])

    useEffect(() => {
        if (inviteState.get('receivedUpdateNeeded') === true) {
            retrieveReceivedInvites()
            console.log(inviteState)
        }
    }, [inviteState])

    const capitalize = (word) => word[0].toUpperCase() + word.slice(1)

    return (
        <div className="invite-container">
            <div className="paper">
                <Tabs
                    value={inviteTabIndex}
                    onChange={handleInviteChange}
                    variant="fullWidth"
                    indicatorColor="secondary"
                    textColor="secondary"
                    aria-label="Invites"
                >
                    <Tab
                        icon={<ArrowDownward />}
                        label="Received"
                    />
                    <Tab
                        icon={<ArrowUpward />}
                        label="Sent"
                    />
                </Tabs>
                <List>
                    { inviteTabIndex === 0 && receivedInvites.sort((a, b) => { return a.created - b.created }).map((invite) => {
                            return <ListItem key={invite.id}>
                                <ListItemAvatar>
                                    <Avatar src={invite.user.avatarUrl}/>
                                </ListItemAvatar>
                                <ListItemText>{capitalize(invite.inviteType)} Request from {invite.user.name}</ListItemText>
                            </ListItem>
                        }
                    )}
                    { inviteTabIndex === 1 && sentInvites.sort((a, b) => { return a.created - b.created }).map((invite) => {
                            return <ListItem key={invite.id}>
                                <ListItemAvatar>
                                    <Avatar src={invite.user.avatarUrl}/>
                                </ListItemAvatar>
                                <ListItemText>{capitalize(invite.inviteType)} Request to { invite.invitee ? invite.invitee.name : invite.token }</ListItemText>
                                {deletePending !== invite.id && <Button onClick={() => showDeleteConfirm(invite.id)}>Uninvite</Button> }
                                {deletePending === invite.id &&
	                            <div>
		                            <Button variant="contained"
		                                    color="primary"
		                                    onClick={() => confirmDelete(invite.id)}
		                            >
			                            Uninvite
		                            </Button>
		                            <Button variant="contained"
		                                    color="secondary"
		                                    onClick={() => cancelDelete()}
		                            >
			                            Cancel
		                            </Button>
	                            </div>
                                }
                            </ListItem>
                        }
                    )}
                </List>
                <div>
                    <Button
                        disabled={(inviteTabIndex === 0 && receivedInviteState.get('skip') === 0) || (inviteTabIndex === 1 && sentInviteState.get('skip') === 0)}
                        onClick={previousInvitePage}
                    >
                        <ChevronLeft/>
                    </Button>
                    <Button
                        disabled={(inviteTabIndex === 0 && (receivedInviteState.get('skip') + receivedInviteState.get('limit')) > receivedInviteState.get('total')) || (inviteTabIndex === 1 && (sentInviteState.get('skip') + sentInviteState.get('limit')) > sentInviteState.get('total'))}
                        onClick={nextInvitePage}
                    >
                        <ChevronRight/>
                    </Button>
                </div>
            </div>
            <List>
                { friends && friends.length > 0 && friends.sort((a, b) => a.name - b.name).map((friend) => {
                        return <ListItem key={friend.id}>
                                <ListItemAvatar>
                                    <Avatar src={friend.avatarUrl}/>
                                </ListItemAvatar>
                                <ListItemText primary={friend.name}/>
                            </ListItem>
                        }
                    )
                }
            </List>
            <div className="paper">
                <Tabs
                    value={tabIndex}
                    onChange={handleChange}
                    variant="fullWidth"
                    indicatorColor="secondary"
                    textColor="secondary"
                    aria-label="Invite Address"
                >
                    <Tab
                        icon={<Mail />}
                        label="Email"
                    />
                    <Tab
                        icon={<PhoneIphone />}
                        label="Phone Number"
                    />
                    <Tab
                        icon={<AccountCircle />}
                        label="User ID"
                    />
                </Tabs>

                <div className="username">
                    <TextField
                        variant="outlined"
                        margin="normal"
                        fullWidth
                        id="token"
                        label="User's email, phone number, or ID"
                        name="name"
                        autoFocus
                        value={userToken}
                        onChange={(e) => handleUserTokenChange(e)}
                    />
                    <Button variant="contained" color="primary" onClick={packageInvite}>
                        Send Invite
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Invites)
