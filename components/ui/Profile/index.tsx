import React, { Fragment } from 'react'
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles'
import Modal from '@material-ui/core/Modal'
import Backdrop from '@material-ui/core/Backdrop'
import Fade from '@material-ui/core/Fade'
import { Tabs, Tab } from '@material-ui/core'
import SettingsIcon from '@material-ui/icons/Settings'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import AccountBoxIcon from '@material-ui/icons/AccountBox'
import UserProfile from './UserIcon'
import UserSettings from './userSettings'
interface MProps {
  open: boolean
  handleClose: any
  avatar: any
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    modal: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    paper: {
      backgroundColor: theme.palette.background.paper,
      border: '2px solid #000',
      boxShadow: theme.shadows[5],
      padding: theme.spacing(2, 4, 3)
    }
  })
)

const TabPanel = (props: any) => {
  const { children, value, index } = props

  return <Fragment>{value === index && children}</Fragment>
}

const ProfileModal: React.FC<MProps> = (props: MProps) => {
  const classes = useStyles()
  const [tabIndex, setTabIndex] = React.useState(0)

  const handleChange = (event: any, newValue: number) => {
    event.preventDefault()
    setTabIndex(newValue)
  }
  const avatar = (
    <TabPanel value={tabIndex} index={0}>
      <UserProfile avatar={props.avatar} />
    </TabPanel>
  )
  const settings = (
    <TabPanel value={tabIndex} index={1}>
      <UserSettings />
    </TabPanel>
  )
  const account = (
    <TabPanel value={tabIndex} index={2}>
      Accounts
    </TabPanel>
  )
  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={classes.modal}
        open={props.open}
        onClose={props.handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={props.open}>
          <div className={classes.paper}>
            <Tabs
              value={tabIndex}
              onChange={handleChange}
              variant="fullWidth"
              indicatorColor="secondary"
              textColor="secondary"
              aria-label="Login Configure"
            >
              <Tab
                icon={<AccountCircleIcon style={{ fontSize: 15 }} />}
                label="User Avatar"
              />
              <Tab
                icon={<SettingsIcon style={{ fontSize: 15 }} />}
                label="Settings"
              />
              <Tab
                icon={<AccountBoxIcon style={{ fontSize: 15 }} />}
                label="Accounts"
              />
            </Tabs>
            {avatar}
            {settings}
            {account}
          </div>
        </Fade>
      </Modal>
    </div>
  )
}

export default ProfileModal
