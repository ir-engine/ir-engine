import React, { useEffect, useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { selectAuthState } from '../../../redux/auth/selector';
import {
  requestFriend,
  acceptFriend,
  declineFriend,
  blockUser,
  cancelBlock
} from '../../../redux/user/service';
import { Button } from '@material-ui/core';
import { User } from '@xr3ngine/common/interfaces/User';
import './style.module.scss';

interface Props {
  auth?: any;
  classes?: any;
  data?: User;
  acceptFriend?: typeof acceptFriend;
  blockUser?: typeof blockUser;
  cancelBlock?: typeof cancelBlock;
  declineFriend?: typeof declineFriend;
  requestFriend?: typeof requestFriend;
}

const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  requestFriend: bindActionCreators(requestFriend, dispatch),
  blockUser: bindActionCreators(blockUser, dispatch),
  acceptFriend: bindActionCreators(acceptFriend, dispatch),
  declineFriend: bindActionCreators(declineFriend, dispatch),
  cancelBlock: bindActionCreators(cancelBlock, dispatch)
});

const UserItem = (props: Props): any => {
  const { auth, classes, data, acceptFriend, blockUser, cancelBlock, declineFriend, requestFriend } = props;
  const initialState = { userId: '', relatedUserId: '' };
  const [state, setState] = useState(initialState);

  useEffect(() => {
    const user = auth.get('user') as User;
    setState({ ...state, userId: user?.id, relatedUserId: data.id });
  }, []);

  const cancel = (): any => declineFriend(state.userId, state.relatedUserId);
  const request = (): any => requestFriend(state.userId, state.relatedUserId);
  const accept = (): any => acceptFriend(state.userId, state.relatedUserId);
  const decline = (): any => declineFriend(state.userId, state.relatedUserId);
  const block = (): any => blockUser(state.userId, state.relatedUserId);
  const unblock = (): any => cancelBlock(state.userId, state.relatedUserId);

  return (
    <div className={classes.root}>
      <Box display="flex" p={1}>
        <Box p={1} display="flex">
          <Avatar variant="rounded" src="" alt="avatar"/>
        </Box>
        <Box p={1} flexGrow={1}>
          <Typography variant="h6">
            {data.name}
          </Typography>
        </Box>
        <Box p={1} display="flex">
          {data.relationType === 'friend' && data.inverseRelationType === 'friend' &&
              <Grid container direction="row">
                <Button variant="contained" color="secondary" onClick={cancel}>Cancel Friend</Button>
              </Grid>
          }
          {data.relationType === 'requested' && data.inverseRelationType === 'friend' &&
              <Grid container direction="row">
                <Button variant="contained" color="primary" onClick={accept}>Accept</Button>
                <Button variant="contained" color="secondary" onClick={decline}>Decline</Button>
              </Grid>
          }
          {data.relationType === 'friend' && data.inverseRelationType === 'requested' &&
              <Grid container direction="row">
                <Typography variant="h6">
                  Pending
                </Typography>
              </Grid>
          }
          {data.relationType === 'blocking' &&
              <Grid container direction="row">
                <Grid xs item>
                  <Button variant="contained" color="primary" onClick={unblock}>Cancel Block</Button>
                </Grid>
              </Grid>
          }
          {data.relationType === 'blocked' &&
              <Grid container direction="row">
                <Typography variant="h6">
                  Blocked
                </Typography>
              </Grid>
          }
          {(!data.relationType) &&
              <Grid container direction="row">
                <Button variant="contained" color="primary" onClick={request}>Request a friend</Button>
                <Button variant="contained" color="secondary" onClick={block}>Block</Button>
              </Grid>
          }
          {data.relationType === 'requested' &&
            data.inverseRelationType !== 'friend' && (
            <Grid container direction="row">
              <Typography variant="h6">Pending Block</Typography>
            </Grid>
          )}
          {!data.relationType && (
            <Grid container direction="row">
              <Button variant="contained" color="primary" onClick={request}>
                Request a friend
              </Button>
              <Button variant="contained" color="secondary" onClick={block}>
                Block
              </Button>
            </Grid>
          )}
        </Box>
      </Box>
    </div>
  );
};

const UserItemWrapper = (props: Props): any => <UserItem {...props} />;

export default connect(mapStateToProps, mapDispatchToProps)(UserItemWrapper);
