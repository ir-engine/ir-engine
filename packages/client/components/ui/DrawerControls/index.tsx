import './style.scss';
import {
  Forum,
  People,
  PersonAdd
} from '@material-ui/icons';
import {
  AppBar,
  Button
} from '@material-ui/core';
import { selectChatState } from '../../../redux/chat/selector';
import { selectAuthState } from '../../../redux/auth/selector';
import { bindActionCreators, Dispatch } from 'redux';
import {
  updateMessageScrollInit
} from '../../../redux/chat/service';
import { connect } from 'react-redux';
import VideoChat from "../VideoChat";

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
//   const homeNav = (): void => {
//     Router.push('/')
//   }
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
      { (selfUser && selfUser.instanceId != null && selfUser.partyId != null) && <VideoChat/> }
      <Button onClick={openInvite}>
        <PersonAdd />
      </Button>
      <Button onClick={openChat}>
        <Forum />
      </Button>
      <Button onClick={openPeople}>
        <People/>
      </Button>
    </AppBar>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(DrawerControls);
