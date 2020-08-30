import React, { useEffect } from 'react';
import './style.scss';
import PartyParticipantWindow from '../PartyParticipantWindow';
import { Grid } from '@material-ui/core';
import { MediaStreamComponent } from '@xr3ngine/engine/src/networking/components/MediaStreamComponent';
import { MediaStreamSystem } from '@xr3ngine/engine/src/networking/systems/MediaStreamSystem';

function Me (): JSX.Element {
    let localVideoTrack;
  console.log(MediaStreamComponent.instance);
    // useEffect(() => {
    //     console.log('Me component useeffect')
    //     if (MediaStreamComponent.instance.localStream != undefined) {
    //         const localVideoTracks = MediaStreamComponent.instance.localStream.getVideoTracks();
    //         console.log('localVideoTracks:')
    //         console.log(localVideoTracks)
    //         localVideoTrack = localVideoTracks[0]
    //     }
    // }, MediaStreamComponent.instance)
  return (
    <Grid className="windowContainer" container>
      <PartyParticipantWindow
        containerProportions={{
          height: 145,
          width: 223
        }}
        videoTrack={localVideoTrack}
      />
    </Grid>
  );
}

export default Me;
