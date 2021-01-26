import React, { useEffect, useState } from 'react';
import styles from './PartyParticipantWindow.module.scss';
import { Grid } from '@material-ui/core';
import PartyParticipantWindow from '../PartyParticipantWindow';
import { MediaStreamComponent } from '@xr3ngine/engine/src/networking/components/MediaStreamComponent';
import { observer } from 'mobx-react';
import { autorun } from 'mobx';
import { selectAuthState } from "../../../redux/auth/selector";
import { selectUserState } from "../../../redux/user/selector";
import {connect} from "react-redux";
import {Dispatch} from "redux";
import {PositionalAudioSystem} from "@xr3ngine/engine/src/audio/systems/PositionalAudioSystem";

interface Props {
  authState?: any;
  userState?: any;
}

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    userState: selectUserState(state)
  };
};


const mapDispatchToProps = (dispatch: Dispatch): any => ({});

const PartyVideoWindows = observer((props: Props): JSX.Element => {
  const {
    authState,
    userState
  } = props;

  const selfUser = authState.get('user');
  const layerUsers = userState.get('layerUsers') ?? [];
  const displayedUsers = layerUsers.filter((user) => selfUser.partyId != null ? user.id !== selfUser.id && user.partyId === selfUser.partyId : user.id !== selfUser.id);

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
