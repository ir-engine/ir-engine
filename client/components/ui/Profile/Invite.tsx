import React, {useEffect, useState} from 'react'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import Button from '@material-ui/core/Button'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import './style.scss'
import TextField from '@material-ui/core/TextField'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemAvatar from '@material-ui/core/ListItemAvatar'
import ListItemText from '@material-ui/core/ListItemText'
import MailIcon from '@material-ui/icons/Mail'
import PhoneIcon from '@material-ui/icons/PhoneIphone'
import Avatar from '@material-ui/core/Avatar'
import { getFriends } from '../../../redux/friend/service'
import { selectFriendState } from '../../../redux/friend/selector'
import {Tab, Tabs} from "@material-ui/core";
import SettingsIcon from "./index";
import { sendInvite } from '../../../redux/invite/service'

const mapStateToProps = (state: any): any => {
    return {
        friendState: selectFriendState(state)
    }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getFriends: bindActionCreators(getFriends, dispatch),
    sendInvite: bindActionCreators(sendInvite, dispatch)
})

interface Props {
    auth: any
    friendState?: any
    sendInvite?: typeof sendInvite,
    getFriends?: any
}

const identityProviderTabMap = new Map()
identityProviderTabMap.set(0, 'email')
identityProviderTabMap.set(1, 'sms')

const Invites = (props: Props): any => {
    const { friendState, sendInvite, getFriends } = props
    const friends = friendState.get('friends')
    const [tabIndex, setTabIndex] = useState(0)
    const [userToken, setUserToken] = useState('')

    const handleChange = (event: any, newValue: number): void => {
        event.preventDefault()
        setTabIndex(newValue)
        setUserToken('')
        console.log(userToken)
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

    useEffect(() => {
        if (friendState.get('updateNeeded') === true) {
            getFriends('')
        }
    }, [friendState]);

    return (
        <div className="friend-container">
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
                        icon={<MailIcon />}
                        label="Email"
                    />
                    <Tab
                        icon={<PhoneIcon />}
                        label="Phone Number"
                    />
                    <Tab
                        icon={<AccountCircleIcon />}
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
