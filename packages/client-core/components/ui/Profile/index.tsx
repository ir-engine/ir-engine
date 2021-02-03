import {
  Backdrop,
  Fade,
  Modal,
  Tab,
  Tabs
} from '@material-ui/core';
import {
  AccountCircle, Settings
} from '@material-ui/icons';
import classNames from 'classnames';
import React, { Fragment, useState } from 'react';
import styles from './Profile.module.scss';
import UserProfile from './UserIcon';
import UserSettings from './UserSettings';

interface Props {
  open: boolean;
  handleClose: any;
  avatarUrl: string;
  auth: any;
}

const TabPanel = (props: any): any => <Fragment>{props.value === props.index && props.children}</Fragment>;

const ProfileModal = (props: Props): any => {
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (event: any, newValue: number): void => {
    event.preventDefault();
    setTabIndex(newValue);
  };
  const avatar = (
    <TabPanel value={tabIndex} index={0}>
      <UserProfile avatarUrl={props.avatarUrl} auth={props.auth} />
    </TabPanel>
  );
  const settings = (
    <TabPanel value={tabIndex} index={1}>
      <UserSettings />
    </TabPanel>
  );
  return (
    <div>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        className={styles.modal}
        open={props.open}
        onClose={props.handleClose}
        closeAfterTransition
        BackdropComponent={Backdrop}
        BackdropProps={{
          timeout: 500
        }}
      >
        <Fade in={props.open}>
          <div className={classNames({
              [styles.paper]: true,
              [styles.profile]: true
          })}>
            <Tabs
              value={tabIndex}
              onChange={handleChange}
              variant="fullWidth"
              indicatorColor="secondary"
              textColor="secondary"
              aria-label="Login Configure"
            >
              <Tab
                icon={<AccountCircle style={{ fontSize: 30 }} />}
                label="Profile"
              />
              <Tab
                icon={<Settings style={{ fontSize: 30 }} />}
                label="Settings"
              />
            </Tabs>
            {avatar}
            {settings}
            {/* {account} */}
          </div>
        </Fade>
      </Modal>
    </div>
  );
};

export default ProfileModal;
