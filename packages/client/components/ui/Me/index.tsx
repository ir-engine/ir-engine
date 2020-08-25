import React, { useEffect, useState } from 'react';
import './style.scss';
import PartyParticipantWindow from '../PartyParticipantWindow';
import { Grid } from '@material-ui/core';
import { MediaStreamComponent } from '@xr3ngine/engine/src/networking/components/MediaStreamComponent';
import { MediaStreamSystem } from '@xr3ngine/engine/src/networking/systems/MediaStreamSystem';

function Me (): JSX.Element {
    const [camVideoStream, setCamVideoStream] = useState(null)
    const [camAudioStream, setCamAudioStream] = useState(null)
    const [screenVideoStream, setScreenVideoStream] = useState(null)
    const [screenAudioStream, setScreenAudioStream] = useState(null)
    useEffect(() => {
        console.log('Me component useeffect')
        console.log(MediaStreamComponent.instance)
        if (MediaStreamComponent.instance.camVideoProducer != undefined) {
            setCamVideoStream(MediaStreamComponent.instance.camVideoProducer)
        }
        if (MediaStreamComponent.instance.camAudioProducer != undefined) {
            setCamAudioStream(MediaStreamComponent.instance.camAudioProducer)
        }
        if (MediaStreamComponent.instance.screenVideoProducer != undefined) {
            setScreenVideoStream(MediaStreamComponent.instance.screenVideoProducer)
        }
        if (MediaStreamComponent.instance.screenAudioProducer != undefined) {
            setScreenAudioStream(MediaStreamComponent.instance.screenAudioProducer)
        }
    }, [MediaStreamComponent.instance?.camVideoProducer])
  return (
    <Grid className="windowContainer" container>
        { (camVideoStream != null || camAudioStream != null) && <PartyParticipantWindow
            containerProportions={{
              height: 145,
              width: 223
            }}
            videoStream={camVideoStream}
            audioStream={camAudioStream}
            peerId={'me_cam'}
            />
        }
        {
            (screenVideoStream != null || screenAudioStream != null) && <PartyParticipantWindow
                containerProportions={{
                    height: 135,
                    width: 240
                }}
                videoStream={screenVideoStream}
                audioStream={screenAudioStream}
                peerId={'me_screen'}
            />
        }
    </Grid>
  );
}

export default Me;
