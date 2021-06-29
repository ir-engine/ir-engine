import React, { useState, useEffect } from 'react';
// @ts-ignore
import styles from './PartyVideoWindows.module.scss';
import { ChevronRight } from '@material-ui/icons';
import PartyParticipantWindow from '../PartyParticipantWindow';
import { selectAuthState } from "@xrengine/client-core/src/user/reducers/auth/selector";
import { selectMediastreamState } from "../../reducers/mediastream/selector";
import { selectUserState } from "@xrengine/client-core/src/user/reducers/user/selector";
import {connect} from "react-redux";
import {Network} from "@xrengine/engine/src/networking/classes/Network";
import {bindActionCreators, Dispatch} from "redux";
import {
  getLayerUsers
} from "@xrengine/client-core/src/user/reducers/user/service";

interface Props {
  authState?: any;
  mediaStreamState?: any;
  userState?: any;
  getLayerUsers?: any;
}

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    mediaStreamState: selectMediastreamState(state),
    userState: selectUserState(state)
  };
};


const mapDispatchToProps = (dispatch: Dispatch): any => ({
  getLayerUsers: bindActionCreators(getLayerUsers, dispatch)
});

const PartyVideoWindows = (props: Props): JSX.Element => {
  const {
    authState,
    mediaStreamState,
    userState,
    getLayerUsers
  } = props;

  const [displayedUsers, setDisplayedUsers] = useState([]);
  const selfUser = authState.get('user');
  const nearbyLayerUsers = mediaStreamState.get('nearbyLayerUsers') ?? [];
  const layerUsers = userState.get('layerUsers') ?? [];
  const channelLayerUsers = userState.get('channelLayerUsers') ?? [];

  useEffect(() => {
    if ((Network.instance?.transport as any)?.channelType === 'channel') setDisplayedUsers(channelLayerUsers.filter((user) => user.id !== selfUser.id));
    else setDisplayedUsers(layerUsers.filter((user) => nearbyLayerUsers.includes(user.id)));
  }, [channelLayerUsers, nearbyLayerUsers]);

  const [ expanded, setExpanded ] = useState(true);

  useEffect((() => {
    function handleResize() {
      if (window.innerWidth < 768) setExpanded(true);
    }

    window.addEventListener('resize', handleResize);

    return _ => {
      window.removeEventListener('resize', handleResize);
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
};

export default connect(mapStateToProps, mapDispatchToProps)(PartyVideoWindows);
