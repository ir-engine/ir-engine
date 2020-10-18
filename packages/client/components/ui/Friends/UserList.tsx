import React, { useState, useEffect } from 'react';
import Grid from '@material-ui/core/Grid';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';
import { connect } from 'react-redux';
import { Dispatch, bindActionCreators } from 'redux';
import { selectUserState } from '../../../redux/user/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import { User } from '@xr3ngine/common/interfaces/User';
import UserItem from './UserItem';
import { getUsers } from '../../../redux/user/service';
import { TextField, InputAdornment } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import { debounce } from 'lodash';
import './style.module.scss';

interface Props {
  userState: any;
  authState: any;
  classes: any;
  getUsers: typeof getUsers;
}

const mapStateToProps = (state: any): any => {
  return {
    userState: selectUserState(state),
    authState: selectAuthState(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getUsers: bindActionCreators(getUsers, dispatch)
});

const UserList = (props: Props): any => {
  const { userState, authState, classes, getUsers } = props;
  const initialState = {
    userId: undefined,
    search: ''
  };
  const [state, setState] = useState(initialState);

  let users = userState.get('users');

  const onSearch = (e: any): void => {
    setState({ ...state, search: e.target.value });
    debouncedSearch();
  };

  const debouncedSearch = debounce(() => {
    getUsers(state.userId, state.search);
  }, 500);

  const loadUsers = (userId: string, forceUpdate: boolean) => {
    if (
      userId &&
      (forceUpdate || (userId !== state.userId && userId && userId !== ''))
    ) {
      getUsers(userId, '');

      setState({ ...state, userId });
    }
  };

  useEffect(() => {
    const user = authState.get('user') as User;
    loadUsers(user.id, false);
  }, []);

  useEffect(() => {
    const user = authState.get('user') as User;
    const updateNeeded = userState.get('updateNeeded');
    users = userState.get('users');
    loadUsers(user.id, updateNeeded);
  }, [authState, userState]);

  return (
    <div className={classes.root}>
      <div className={classes.section1}>
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="h4">Users</Typography>
          </Grid>
        </Grid>
      </div>

      <Divider variant="middle" />
      <TextField
        label="Search"
        type="search"
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          )
        }}
        onChange={onSearch}
      />

      {users &&
        users.length > 0 &&
        users.map((user: User) => {
          return <UserItem key={'user_' + user.id} data={user} />;
        })}

      {(!users || users.length === 0) && (
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="body2">
              No users matched your search.
            </Typography>
          </Grid>
        </Grid>
      )}

      <Divider variant="middle" />

      {users &&
        users.length > 0 &&
        users.map((user: User) => {
          return <UserItem key={'user_' + user.id} data={user} />;
        })}

      {(!users || users.length === 0) && (
        <Grid container alignItems="center">
          <Grid item xs>
            <Typography variant="body2">There is search users.</Typography>
          </Grid>
        </Grid>
      )}
    </div>
  );
};

const UserListWrapper = (props: any): any => (
  <UserList {...props} className="userListWrapper" />
);

export default connect(mapStateToProps, mapDispatchToProps)(UserListWrapper);
