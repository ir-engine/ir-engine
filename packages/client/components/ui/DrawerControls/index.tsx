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
    chatState: selectChatState(state)
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
}

export const DrawerControls = (props: Props): JSX.Element => {
  const {
    authState,
    setLeftDrawerOpen,
    setBottomDrawerOpen,
    setRightDrawerOpen,
    setTopDrawerOpen,
    updateMessageScrollInit
  } = props;
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
      { (selfUser && selfUser.instanceId != null && selfUser.partyId != null) && <NoSSR><VideoChat/></NoSSR> }
      <Fab color="primary" aria-label="PersonAdd" onClick={openInvite}>
        <PersonAdd />
      </Fab>
      <Fab color="primary" aria-label="Forum" onClick={openChat}>
        <Forum />
      </Fab>
      <Fab color="primary" aria-label="People" onClick={openPeople}>
        <People/>
      </Fab>
    </AppBar>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DrawerControls);
