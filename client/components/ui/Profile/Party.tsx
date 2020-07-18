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
    getParty,
    createParty,
    removeParty,
    getPartyUsers,
    getSelfPartyUser,
    removePartyUser,
    forcePartyUserRefresh
} from '../../../redux/party/service'
import {
    sendInvite
} from '../../../redux/invite/service'
import { selectPartyState } from '../../../redux/party/selector'
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
import {selectInviteState} from '../../../redux/invite/selector'
import {User} from "../../../../shared/interfaces/User";

const mapStateToProps = (state: any): any => {
    return {
        partyState: selectPartyState(state),
        inviteState: selectInviteState(state)
    }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
    getParty: bindActionCreators(getParty, dispatch),
    getPartyUsers: bindActionCreators(getPartyUsers, dispatch),
    getSelfPartyUser: bindActionCreators(getSelfPartyUser, dispatch),
    createParty: bindActionCreators(createParty, dispatch),
    removeParty: bindActionCreators(removeParty, dispatch),
    removePartyUser: bindActionCreators(removePartyUser, dispatch),
    sendInvite: bindActionCreators(sendInvite, dispatch),
})

interface Props {
    auth: any,
    partyState?: any,
    inviteState?: any,
    getParty?: any,
    createParty?: any,
    removeParty?: any,
    getPartyUsers?: any,
    getSelfPartyUser?: any,
    removePartyUser?: any,
    sendInvite?: any,
}

const identityProviderTabMap = new Map()
identityProviderTabMap.set(0, 'email')
identityProviderTabMap.set(1, 'sms')

const Party = (props: Props): any => {
    const {
        auth,
        partyState,
        sendInvite,
        inviteState,
        getParty,
        createParty,
        removeParty,
        getPartyUsers,
        getSelfPartyUser,
        removePartyUser,
    } = props
    const user = auth.get('user') as User
    const party = partyState.get('party')
    const partyUserSubState = partyState.get('partyUsers')
    const partyUsers = partyUserSubState.get('partyUsers')
    const selfPartyUser = partyState.get('selfPartyUser')
    const [ partyDeletePending, setPartyDeletePending ] = useState('')
    const [ partyUserDeletePending, setPartyUserDeletePending] = useState('')
    const [tabIndex, setTabIndex] = useState(0)
    const [userToken, setUserToken] = useState('')
    const [inviteTabIndex, setInviteTabIndex] = useState(0)
    const [targetPartyId, setTargetPartyId] = useState('')
    const [inviteFormOpen, setInviteFormOpen] = useState(false)
    const [partyUserListOpen, setPartyUserListOpen] = useState(false)

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
            type: 'party',
            token: mappedIDProvider ? userToken : null,
            identityProviderType: mappedIDProvider ? mappedIDProvider : null,
            targetObjectId: targetPartyId,
            invitee: tabIndex === 2 ? userToken : null
        })
        setInviteFormOpen(false)
    }

    useEffect(() => {
        if (partyState.get('updateNeeded') === true) {
            console.log('PARTY USE EFFECT CALL TO GETPARTY')
            getParty()
        }
    }, [partyState]);

    useEffect(() => {
        console.log('PARTY USER USE EFFECT')
        console.log(party)
        console.log(partyState.get('partyUsersUpdateNeeded'))
        console.log(partyState.get('updateNeeded'))
        if (party != null && partyState.get('partyUsersUpdateNeeded') === true && partyState.get('updateNeeded') === false) {
            console.log('UPDATING PARTY USERS FROM USE EFFECT')
            getSelfPartyUser(party.id)
            getPartyUsers(party.id)
        }
    }, [partyState]);

    const showPartyDeleteConfirm = (partyId) => {
        setPartyDeletePending(partyId)
    }

    const cancelPartyDelete = () => {
        setPartyDeletePending('')
    }

    const openInviteForm = (partyId: string) => {
        setInviteFormOpen(true)
        setTargetPartyId(partyId)
        setUserToken('')
    }

    const closeInviteForm = () => {
        setInviteFormOpen(false)
        setTargetPartyId('')
        setUserToken('')
    }

    const confirmPartyDelete = (partyId) => {
        setPartyDeletePending('')
        removeParty(partyId)
        setPartyUserListOpen(false)
    }

    const showPartyUserDeleteConfirm = (partyUserId: string) => {
        setPartyUserDeletePending(partyUserId)
    }

    const cancelPartyUserDelete = () => {
        setPartyUserDeletePending('')
    }

    const confirmPartyUserDelete = (partyId) => {
        setPartyUserDeletePending('')
        removePartyUser(partyId)
    }

    const previousPartyUsersPage = (): void => {
        getPartyUsers(party.id, partyUserSubState.get('skip') - partyUserSubState.get('limit'))
    }

    const nextPartyUsersPage = (): void => {
        getPartyUsers(party.id, partyUserSubState.get('skip') + partyUserSubState.get('limit'))
    }

    const createNewParty = (): void => {
        createParty()
        setPartyUserListOpen(true)
    }

    return (
        <div className="party-container">
            <List className="flex-center flex-column">
                { party && <ListItem key={party.id}>
					<ListItemText primary="Current Party"/>
                    {partyDeletePending !== party.id &&
					<div>
                        {
                            (selfPartyUser?.isOwner === true || selfPartyUser?.isOwner === 1) &&
							<Button onClick={() => openInviteForm(party.id)}>
								<Mail/>
							</Button>
                        }
                        {
                            (selfPartyUser?.isOwner === true || selfPartyUser?.isOwner === 1) &&
							<Button onClick={() => showPartyDeleteConfirm(party.id)}>
								<Delete/>
							</Button>
                        }
					</div>
                    }
                    {partyDeletePending === party.id &&
					<div>
						<Button variant="contained"
						        color="primary"
						        onClick={() => confirmPartyDelete(party.id)}
						>
							Delete Party
						</Button>
						<Button variant="contained"
						        color="secondary"
						        onClick={() => cancelPartyDelete()}
						>
							Cancel
						</Button>
					</div>
                    }
				</ListItem>
                }
                { party == null &&
				<div>You are not currently in a party</div>
                }
            </List>
            <div className="flex-center">
                { party == null && <Button onClick={() => createNewParty()}>Create Party</Button> }
            </div>
            <div className="flex-center">
                {inviteFormOpen === true &&
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
							icon={<Mail/>}
							label="Email"
						/>
						<Tab
							icon={<PhoneIphone/>}
							label="Phone Number"
						/>
						<Tab
							icon={<AccountCircle/>}
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
						<Button variant="contained"
						        color="primary"
						        onClick={packageInvite}
						>
							Send Invite
						</Button>
						<Button variant="contained"
						        color="secondary"
						        onClick={closeInviteForm}
						>
							Cancel
						</Button>
					</div>
				</div>
                }
            </div>
            <div className="flex-center flex-column">
                {party != null &&
				<div className="flex-center flex-column">
					<List className="flex-center flex-column">
                        { partyUsers && partyUsers.length > 0 && partyUsers.sort((a, b) => a.name - b.name).map((partyUser) => {
                                return <ListItem key={partyUser.id}>
                                    <ListItemAvatar>
                                        <Avatar src={partyUser.user.avatarUrl}/>
                                    </ListItemAvatar>
                                    {user.id === partyUser.userId && <ListItemText primary={partyUser.user.name + ' (you)'}/> }
                                    {user.id !== partyUser.userId && <ListItemText primary={partyUser.user.name}/> }
                                    {
                                        partyUserDeletePending !== partyUser.id &&
                                        selfPartyUser != null &&
                                        (selfPartyUser?.isOwner === true || selfPartyUser?.isOwner === 1) &&
                                        user.id !== partyUser.userId &&
										<div>
											<Button onClick={() => showPartyUserDeleteConfirm(partyUser.id)}>
												<Delete/>
											</Button>
										</div>
                                    }
                                    { partyUserDeletePending !== partyUser.id && user.id === partyUser.userId &&
									<div>
										<Button onClick={() => showPartyUserDeleteConfirm(partyUser.id)}>
											<Delete/>
										</Button>
									</div>
                                    }
                                    {partyUserDeletePending === partyUser.id &&
									<div>
                                        {
                                            user.id !== partyUser.userId &&
											<Button variant="contained"
											        color="primary"
											        onClick={() => confirmPartyUserDelete(partyUser.id)}
											>
												Remove User
											</Button>
                                        }
                                        {
                                            user.id === partyUser.userId &&
											<Button variant="contained"
											        color="primary"
											        onClick={() => confirmPartyUserDelete(partyUser.id)}
											>
												Leave party
											</Button>
                                        }
										<Button variant="contained"
										        color="secondary"
										        onClick={() => cancelPartyUserDelete()}
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
					<div className="flex-center">
						<Button
							disabled={partyUserSubState.get('skip') === 0}
							onClick={previousPartyUsersPage}
						>
							<ChevronLeft/>
						</Button>
						<Button
							disabled={(partyUserSubState.get('skip') + partyUserSubState.get('limit')) > partyUserSubState.get('total')}
							onClick={nextPartyUsersPage}
						>
							<ChevronRight/>
						</Button>
					</div>
				</div>
                }
            </div>
        </div>

    )
}

export default connect(mapStateToProps, mapDispatchToProps)(Party)
