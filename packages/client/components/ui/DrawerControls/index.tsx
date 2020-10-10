import './style.scss';
import {
  Forum,
  People,
  PersonAdd
} from '@material-ui/icons';
import { AppBar} from '@material-ui/core';
import Fab from '@material-ui/core/Fab';
import { selectChatState } from '../../../redux/chat/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import { selectPartyState } from '../../../redux/party/selector';
import { selectLocationState } from '../../../redux/location/selector';
import { bindActionCreators, Dispatch } from 'redux';
import {
  updateMessageScrollInit
} from '../../../redux/chat/service';
import { connect } from 'react-redux';
import VideoChat from "../VideoChat";
import NoSSR from "react-no-ssr";

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state),
    chatState: selectChatState(state),
    locationState: selectLocationState(state),
    partyState: selectPartyState(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  updateMessageScrollInit: bindActionCreators(updateMessageScrollInit, dispatch)
});

interface Props {
  setLeftDrawerOpen: any;
  setTopDrawerOpen: any;
  setRightDrawerOpen: any;
  setBottomDrawerOpen: any;
  updateMessageScrollInit?: any;
  authState?: any;
  locationState?: any;
  partyState?: any;
}

export const DrawerControls = (props: Props): JSX.Element => {
  const {
    authState,
    locationState,
    partyState,
    setLeftDrawerOpen,
    setBottomDrawerOpen,
    setRightDrawerOpen,
    setTopDrawerOpen,
    updateMessageScrollInit
  } = props;
  const party = partyState.get('party');
  const showroomLocation = locationState.get('showroomLocation').get('location');
  const showroomEnabled = locationState.get('showroomEnabled');
  const selfUser = authState.get('user');
  const openChat = (): void => {
    setLeftDrawerOpen(false);
    setTopDrawerOpen(false);
    setRightDrawerOpen(false);
    setBottomDrawerOpen(true);
    setTimeout(() => updateMessageScrollInit(true), 100);
  };
  const openPeople = (): void => {
    setLeftDrawerOpen(true);
    setTopDrawerOpen(false);
    setRightDrawerOpen(false);
    setBottomDrawerOpen(false);
  };
  const openInvite = (): void => {
    setLeftDrawerOpen(false);
    setTopDrawerOpen(false);
    setRightDrawerOpen(true);
    setBottomDrawerOpen(false);
  };
  return (
    <AppBar className="bottom-appbar">
      { (selfUser && selfUser.instanceId != null && selfUser.partyId != null && party?.id != null) && <NoSSR><VideoChat/></NoSSR> }
      { showroomEnabled !== true &&
        <Fab color="primary" aria-label="PersonAdd" onClick={openInvite}>
          <PersonAdd/>
        </Fab>
      }
      { showroomEnabled !== true &&
        <Fab color="primary" aria-label="Forum" onClick={openChat}>
          <Forum/>
        </Fab>
      }
      { ((showroomEnabled !== true) || (selfUser.userRole === 'location-admin' && selfUser.locationAdmins?.find(locationAdmin => showroomLocation.id === locationAdmin.locationId) != null)) &&
        <Fab color="primary" aria-label="People" onClick={openPeople}>
          <People/>
        </Fab>
      }
    </AppBar>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DrawerControls);
