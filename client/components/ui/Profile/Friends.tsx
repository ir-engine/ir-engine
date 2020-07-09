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
import Avatar from '@material-ui/core/Avatar'
import { getFriends } from '../../../redux/friend/service'
import { selectFriendState } from '../../../redux/friend/selector'

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
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Friends)
