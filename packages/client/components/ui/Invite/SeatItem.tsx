
import React, { useState } from 'react';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Box from '@material-ui/core/Box';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { selectAuthState } from '../../../redux/auth/selector';
import './style.module.scss';
import {
  cancelInvitation,
  removeSeat
} from '../../../redux/seats/service';
import { Button } from '@material-ui/core';
import { User } from '@xr3ngine/common/interfaces/User';
import { Seat } from '@xr3ngine/common/interfaces/Seat';

interface Props {
  auth?: any;
  seat?: Seat;
  cancelInvitation?: typeof cancelInvitation;
  removeSeat?: typeof removeSeat;
}

const mapStateToProps = (state: any): any => {
  return {
    auth: selectAuthState(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  cancelInvitation: bindActionCreators(cancelInvitation, dispatch),
  removeSeat: bindActionCreators(removeSeat, dispatch)
});

const SeatItem = (props: Props): any => {
  const { seat, auth } = props;
  const user = auth.get('user') as User;
  const initialState = {
    userId: user.id,
    seat: props.seat
  };

  const [state] = useState(initialState);

  // close a friend
  const cancelInvitation = () => {
    props.cancelInvitation(state.seat);
  };

  const revokeSeat = () => {
    props.removeSeat(props.seat);
  };

  return (
    <div className={'root'}>
      <Box display="flex" className={'container'} p={1}>
        <Box p={1} display="flex">
          <Avatar variant="rounded" src="" alt="avatar"/>
        </Box>
        <Box p={1} flexGrow={1}>
          <Typography variant="h6">
            {seat.user.name}
          </Typography>
          <Typography variant="h6">
            {seat.user.email}
          </Typography>
        </Box>
        <Box p={1} display="flex">
          {seat.seatStatus === 'pending' &&
          <Grid container direction="row">
            <Button variant="contained" color="secondary" onClick={cancelInvitation}>Cancel Invitation</Button>
          </Grid>
          }
          {seat.seatStatus === 'filled' && seat.userId !== state.userId &&
          <Grid container direction="row">
            <Button variant="contained" color="primary" onClick={revokeSeat}>Revoke this user&apos;s seat</Button>
          </Grid>
          }
          {seat.seatStatus === 'filled' && seat.userId === state.userId &&
          <Grid container direction="row">
            <Typography variant="h6">
              This is you. You cannot revoke your own seat.
            </Typography>
          </Grid>
          }
        </Box>
      </Box>
    </div>
  );
};

const UserItemWrapper = (props: Props): any => <SeatItem {...props} />;

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UserItemWrapper);
