import { Button } from '@material-ui/core';
import { VideoCall, CallEnd } from '@material-ui/icons';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { useEffect } from 'react';
import { MediaStreamSystem } from '@xr3ngine/engine/src/networking/systems/MediaStreamSystem';
import { MediaStreamComponent } from '@xr3ngine/engine/src/networking/components/MediaStreamComponent';
import { Network } from '@xr3ngine/engine/src/networking/components/Network';
import { observer } from 'mobx-react';

const locationId = 'e3523270-ddb7-11ea-9251-75ab611a30da';
interface Props {}

const mapStateToProps = (state: any): any => {
  return {};
};

const mapDispatchToProps = (dispatch: Dispatch): any => ({
});

const VideoChat = observer((props: Props) => {
  const {
  } = props;
  const gsProvision = async () => {
    if (MediaStreamComponent.instance.mediaStream == null) {
      await (Network.instance.transport as any).sendCameraStreams();
    } else {
      console.log('Ending video chat');
      await (Network.instance.transport as any).endVideoChat();
    }
  };
  return (
    <Button onClick={gsProvision}>
      {MediaStreamComponent?.instance?.mediaStream == null && <VideoCall /> }
      {MediaStreamComponent?.instance?.mediaStream != null && <CallEnd /> }
    </Button>
  );
});

export default connect(mapStateToProps, mapDispatchToProps)(VideoChat);
