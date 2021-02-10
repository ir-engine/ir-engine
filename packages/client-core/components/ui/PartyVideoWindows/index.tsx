import React, { useState, useEffect } from 'react';
import styles from './PartyVideoWindows.module.scss';
import { Grid } from '@material-ui/core';
import PartyParticipantWindow from '../PartyParticipantWindow';
import { observer } from 'mobx-react';
import { selectAuthState } from "../../../redux/auth/selector";
import { selectUserState } from "../../../redux/user/selector";
import {connect} from "react-redux";
import {bindActionCreators, Dispatch} from "redux";
import {
  getLayerUsers
} from "../../../redux/user/service";

interface Props {
  authState?: any;
  userState?: any;
  getLayerUsers?: any;
}

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    userState: selectUserState(state)
  };
};


const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getLayerUsers: bindActionCreators(getLayerUsers, dispatch)
});

const PartyVideoWindows = observer((props: Props): JSX.Element => {
  const {
    authState,
    userState,
    getLayerUsers
  } = props;

  const [displayedUsers, setDisplayedUsers] = useState([]);
  const selfUser = authState.get('user');
  const layerUsers = userState.get('layerUsers') ?? [];

  useEffect(() => {
    setDisplayedUsers(layerUsers.filter((user) => selfUser.partyId != null ? user.id !== selfUser.id && user.partyId === selfUser.partyId : user.id !== selfUser.id))
  }, [layerUsers]);

  useEffect(() => {
    if (selfUser.instanceId != null && userState.get('layerUsersUpdateNeeded') === true) {
      getLayerUsers();
    }
  }, [ userState]);

  return (
    <Grid className={ styles['party-user-container']} container direction="row" wrap="nowrap">
      { displayedUsers.map((user) => (
        <PartyParticipantWindow
            peerId={user.id}
            key={user.id}
        />
      ))}
    </Grid>
  );
});

export default connect(mapStateToProps, mapDispatchToProps)(PartyVideoWindows);
