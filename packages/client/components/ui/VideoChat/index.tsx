import io from 'socket.io-client';
import feathers from '@feathersjs/client';
import { client } from '../../../redux/feathers';
import { Button } from '@material-ui/core';
import { VideoCall, CallEnd } from '@material-ui/icons';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { selectInstanceConnectionState } from '../../../redux/instanceConnection/selector';
import {
  provisionInstanceServer,
  connectToInstanceServer
} from '../../../redux/instanceConnection/service';
import { useEffect } from 'react';
import { MediaStreamSystem } from '@xr3ngine/engine/src/networking/systems/MediaStreamSystem';
import { MediaStreamComponent } from '@xr3ngine/engine/src/networking/components/MediaStreamComponent';
import { Network } from '@xr3ngine/engine/src/networking/components/Network';

const locationId = 'e3523270-ddb7-11ea-9251-75ab611a30da';
interface Props {
  provisionInstanceServer?: any;
  connectToInstanceServer?: any;
  instanceConnectionState?: any;
}

const mapStateToProps = (state: any): any => {
  return {
    instanceConnectionState: selectInstanceConnectionState(state)
  };
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  provisionInstanceServer: bindActionCreators(provisionInstanceServer, dispatch),
  connectToInstanceServer: bindActionCreators(connectToInstanceServer, dispatch)
});

const VideoChat = (props: Props) => {
  const {
    instanceConnectionState,
    connectToInstanceServer,
    provisionInstanceServer
  } = props;
  const gsProvision = async () => {
    if (MediaStreamComponent.instance.mediaStream == null) {
      await MediaStreamSystem.instance.startCamera();
      await provisionInstanceServer(locationId);
    } else {
      console.log('Ending video chat')
      console.log((Network.instance.transport as any).stopSendingMediaStreams)
      await (Network.instance.transport as any).stopSendingMediaStreams();
    }
  };
  useEffect(() => {
    if (instanceConnectionState.get('instanceProvisioned') === true && instanceConnectionState.get('readyToConnect') === true) {
      console.log('Calling connectToInstanceServer');
      connectToInstanceServer();
    }
  }, [instanceConnectionState]);
  return (
    <Button onClick={gsProvision}>
      {MediaStreamComponent?.instance?.mediaStream == null && <VideoCall /> }
      {MediaStreamComponent?.instance?.mediaStream != null && <CallEnd /> }
    </Button>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(VideoChat);
