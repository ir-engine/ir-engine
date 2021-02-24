import React, { useState, useEffect } from 'react';
// @ts-ignore
import styles from './PartyVideoWindows.module.scss';
import { ChevronRight } from '@material-ui/icons';
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
  const channelLayerUsers = userState.get('channelLayerUsers') ?? [];

  useEffect(() => {
    if (channelLayerUsers?.length > 0) setDisplayedUsers(channelLayerUsers.filter((user) => user.id !== selfUser.id));
    else setDisplayedUsers(layerUsers.filter((user) => selfUser.partyId != null ? user.id !== selfUser.id && user.partyId === selfUser.partyId : user.id !== selfUser.id))
  }, [layerUsers, channelLayerUsers]);

  const [ expanded, setExpanded ] = useState(true);

  useEffect((() => {
    function handleResize() {
      if (window.innerWidth < 768) setExpanded(true);
    }

    window.addEventListener('resize', handleResize);

    return _ => {
      window.removeEventListener('resize', handleResize)
    };
  }) as any);

  useEffect(() => {
    if (selfUser.instanceId != null && userState.get('layerUsersUpdateNeeded') === true) getLayerUsers(true);
    if (selfUser.channelInstanceId != null && userState.get('channelLayerUsersUpdateNeeded') === true) getLayerUsers(false);
  }, [ userState]);

  const toggleExpanded = () => setExpanded(!expanded);

  return (
    <>
      <div className={styles.expandMenu}>
        Nearby
        <button type="button" className={expanded ? styles.expanded : ''} onClick={toggleExpanded}><ChevronRight /></button>
      </div>
      {expanded && displayedUsers.map((user) => (
        <PartyParticipantWindow
            peerId={user.id}
            key={user.id}
        />
      ))}
      </>
  );
});

export default connect(mapStateToProps, mapDispatchToProps)(PartyVideoWindows);
