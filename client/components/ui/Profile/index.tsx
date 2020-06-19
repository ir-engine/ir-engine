import React, { Fragment, useState } from 'react'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import { Tabs, Tab } from '@material-ui/core'
import SettingsIcon from '@material-ui/icons/Settings'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
// import AccountBoxIcon from '@material-ui/icons/AccountBox'
import SupervisedUserCircleIcon from '@material-ui/icons/SupervisedUserCircle'
import UserProfile from './UserIcon'
import UserSettings from './UserSettings'
import Subscription from './Subscription'
import './style.scss'

interface Props {
  open: boolean
  handleClose: any
  avatarUrl: string
  auth: any
}

const TabPanel = (props: any): any => <Fragment>{props.value === props.index && props.children}</Fragment>

const ProfileModal = (props: Props): any => {
  const [tabIndex, setTabIndex] = useState(0)

  const handleChange = (event: any, newValue: number): void => {
    event.preventDefault()
    setTabIndex(newValue)
  }
  const avatar = (
    <TabPanel value={tabIndex} index={0}>
      <UserProfile avatarUrl={props.avatarUrl} auth={props.auth} />
    </TabPanel>
  )
  const settings = (
    <TabPanel value={tabIndex} index={1}>
      <UserSettings />
    </TabPanel>
  )
  // const account = (
  //   <TabPanel value={tabIndex} index={2}>
  //     Accounts
  //   </TabPanel>
  // )
  const subscription = (
    <TabPanel value={tabIndex} className="subscription-profile" index={2}>
      <Subscription auth={props.auth}/>
    </TabPanel>
  )
  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className="modal"
        open={props.open}
        onClose={props.handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={props.open}>
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
                icon={<AccountCircleIcon style={{ fontSize: 30 }} />}
                label="Profile"
              />
              <Tab
                icon={<SettingsIcon style={{ fontSize: 30 }} />}
                label="Settings"
              />
              {/* <Tab */}
              {/* icon={<AccountBoxIcon style={{ fontSize: 30 }} />} */}
              {/* label="Accounts" */}
              {/* /> */}
              <Tab
                icon={<SupervisedUserCircleIcon style={{ fontSize: 30 }} />}
                label="Subscription"
              />
            </Tabs>
            {avatar}
            {settings}
            {/* {account} */}
            {subscription}
          </div>
        </Fade>
      </Modal>
    </div>
  )
}

export default ProfileModal
