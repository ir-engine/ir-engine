import {VideoCall, CallEnd, PersonAdd} from '@material-ui/icons';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { MediaStreamComponent } from '@xr3ngine/engine/src/networking/components/MediaStreamComponent';
import { Network } from '@xr3ngine/engine/src/networking/components/Network';
import { observer } from 'mobx-react';
import { selectAuthState } from '../../../redux/auth/selector';
import Fab from "@material-ui/core/Fab";

interface Props {
  authState?: any;
}

const mapStateToProps = (state: any): any => {
  return {
    authState: selectAuthState(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
});

const VideoChat = observer((props: Props) => {
  const {
    authState
  } = props;
  const user = authState.get('user');
  const gsProvision = async () => {
    if (MediaStreamComponent.instance.mediaStream == null) {
      await (Network.instance.transport as any).sendCameraStreams(user.partyId);
    } else {
      console.log('Ending video chat');
      await (Network.instance.transport as any).endVideoChat();
    }
  };
  return (
    <Fab color="primary" aria-label="VideoChat" onClick={gsProvision}>
      {MediaStreamComponent?.instance?.mediaStream == null && <VideoCall /> }
      {MediaStreamComponent?.instance?.mediaStream != null && <CallEnd /> }
    </Fab>
  );
});

export default connect(mapStateToProps, mapDispatchToProps)(VideoChat);
