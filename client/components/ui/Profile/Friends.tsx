import React, { useState, useEffect } from 'react'
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
import { getFriends, unfriend } from '../../../redux/friend/service'
import { selectFriendState } from '../../../redux/friend/selector'
import {ChevronLeft, ChevronRight} from '@material-ui/icons'

const mapStateToProps = (state: any): any => {
    return {
        friendState: selectFriendState(state)
    }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getFriends: bindActionCreators(getFriends, dispatch),
    unfriend: bindActionCreators(unfriend, dispatch)
})

interface Props {
    auth: any
    friendState?: any
    getFriends?: any
    unfriend?: any
}

const Friends = (props: Props): any => {
    const { friendState, getFriends, unfriend } = props
    const friendSubState = friendState.get('friends')
    const friends = friendSubState.get('friends')
    const [ deletePending, setDeletePending ] = useState('')

    useEffect(() => {
        if (friendState.get('updateNeeded') === true) {
            getFriends()
        }
    }, [friendState]);

    const showDeleteConfirm = (friendId) => {
        setDeletePending(friendId)
    }

    const cancelDelete = () => {
        setDeletePending('')
    }

    const confirmDelete = (friendId) => {
        setDeletePending('')
        unfriend(friendId)
    }

    const previousFriendsPage = (): void => {
        getFriends(null, friendSubState.get('skip') - friendSubState.get('limit'))
    }

    const nextFriendsPage = (): void => {
        getFriends(null, friendSubState.get('skip') + friendSubState.get('limit'))
    }

    return (
        <div className="friend-container">
            <List>
                { friends && friends.length > 0 && friends.sort((a, b) => a.name - b.name).map((friend) => {
                        return <ListItem key={friend.id}>
                            <ListItemAvatar>
                                <Avatar src={friend.avatarUrl}/>
                            </ListItemAvatar>
                            <ListItemText primary={friend.name}/>
                                {deletePending !== friend.id && <Button onClick={() => showDeleteConfirm(friend.id)}>Unfriend</Button> }
                                {deletePending === friend.id &&
                                    <div>
                                        <Button variant="contained"
                                                color="primary"
                                                onClick={() => confirmDelete(friend.id)}
                                        >
                                            Unfriend
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
                    )
                }
            </List>
            <div>
                <Button
                    disabled={friendSubState.get('skip') === 0}
                    onClick={previousFriendsPage}
                >
                    <ChevronLeft/>
                </Button>
                <Button
                    disabled={(friendSubState.get('skip') + friendSubState.get('limit')) > friendSubState.get('total')}
                    onClick={nextFriendsPage}
                >
                    <ChevronRight/>
                </Button>
            </div>
        </div>
    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Friends)
