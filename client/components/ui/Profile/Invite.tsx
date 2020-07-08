import React, { useState } from 'react'
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
import { getFriends } from '../../../redux/friends/service'
import { selectFriendState } from '../../../redux/friends/selector'
import {Tab, Tabs} from "@material-ui/core";
import SettingsIcon from "./index";

const mapStateToProps = (state: any): any => {
    return {
        friendState: selectFriendState(state)
    }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getFriends: bindActionCreators(getFriends, dispatch)
})

interface Props {
    auth: any
    friendState?: any
}

const Friends = (props: Props): any => {
    const { friendState } = props
    const friends = friendState.friends
    const [tabIndex, setTabIndex] = useState(0)
    const [userToken, setUsertoken] = useState()

    const handleChange = (event: any, newValue: number): void => {
        event.preventDefault()
        setTabIndex(newValue)
    }

    const handleUsertokenChange = (event: any): void => {
        const token = event.target.value
        setUsertoken(token)
    }

    const sendInvite = (event: any): void => {
        event.preventDefault()
    }
    return (
        <div className="friend-container">
            <List>
                { friends && friends.length > 0 && friends.map((friend) => {
                        return <ListItem>
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
                    aria-label="Login Configure"
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
                        onChange={(e) => handleUsertokenChange(e)}
                    />
                    <Button variant="contained" color="primary" onClick={sendInvite}>
                        Send Invite
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default connect(null, mapDispatchToProps)(Friends)
