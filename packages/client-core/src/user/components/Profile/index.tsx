import Fade from '@mui/material/Fade'
import Modal from '@mui/material/Modal'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import { AccountCircle, Settings } from '@mui/icons-material'
import classNames from 'classnames'
import React, { Fragment, useState } from 'react'
import styles from './Profile.module.scss'
import UserProfile from './UserIcon'
import UserSettings from './UserSettings'
import { useTranslation } from 'react-i18next'

interface Props {
  open: boolean
  handleClose: any
  avatarUrl: string
  auth: any
}

const TabPanel = (props: any): any => <Fragment>{props.value === props.index && props.children}</Fragment>

const ProfileModal = (props: Props): any => {
  const [tabIndex, setTabIndex] = useState(0)
  const { t } = useTranslation()

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
  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={styles.modal}
        open={props.open}
        onClose={props.handleClose}
        closeAfterTransition
      >
        <Fade in={props.open}>
          <div
            className={classNames({
              [styles.paper]: true,
              [styles.profile]: true
            })}
          >
            <Tabs
              value={tabIndex}
              onChange={handleChange}
              variant="fullWidth"
              indicatorColor="secondary"
              textColor="secondary"
              aria-label="Login Configure"
            >
              <Tab icon={<AccountCircle style={{ fontSize: 30 }} />} label={t('user:profile.lbl-profile')} />
              <Tab icon={<Settings style={{ fontSize: 30 }} />} label={t('user:profile.lbl-settings')} />
            </Tabs>
            {avatar}
            {settings}
            {/* {account} */}
          </div>
        </Fade>
      </Modal>
    </div>
  )
}

export default ProfileModal
