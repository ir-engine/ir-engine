import { User } from '@xr3ngine/common/interfaces/User';
import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { selectAuthState } from '../../../redux/auth/selector';
import { logoutUser } from '../../../redux/auth/service';
import { showDialog } from '../../../redux/dialog/service';
import SignIn from '../Auth/Login';
import Dropdown from '../Profile/ProfileDropdown';
import styles from './NavUserWidget.module.scss';
import {Button} from '@material-ui/core';

const mapStateToProps = (state: any): any => {
  return { auth: selectAuthState(state) };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  logoutUser: bindActionCreators(logoutUser, dispatch),
  showDialog: bindActionCreators(showDialog, dispatch),
});

interface Props {
  login?: boolean;
  auth?: any;
  logoutUser?: typeof logoutUser;
  showDialog?: typeof showDialog;
}


const NavUserBadge = (props: Props): any => {
  const { login, auth, logoutUser, showDialog } = props;
  useEffect(() => {
    handleLogin();
  }, []);

  const handleLogout = () => {
    logoutUser();
  };

  const handleLogin = () => {
    const params = new URLSearchParams(document.location.search);
    const showLoginDialog = params.get('login');
    if (showLoginDialog === String(true)) {
      showDialog({ children: <SignIn /> });
    }
  };

  const isLoggedIn = auth.get('isLoggedIn');
  const user = auth.get('user') as User;
  // const userName = user && user.name

  return (
    <div className={styles.userWidget}>
      {isLoggedIn && (
        <div className={styles.flex}>
          <Dropdown
            avatarUrl={user && user.avatarUrl}
            auth={auth}
            logoutUser={logoutUser}
          />
        </div>
      )}
      {!isLoggedIn && login === true && (
        <Button variant="contained" color="primary"
          className={styles.loginButton}
          onClick={() =>
            showDialog({
              children: <SignIn />,
            })
          }
        >
          Log In
        </Button>
      )}
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(NavUserBadge);
