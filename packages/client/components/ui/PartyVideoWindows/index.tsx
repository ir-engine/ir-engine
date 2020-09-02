import React, { useEffect, useState } from 'react';
import './style.scss';
import { Grid } from '@material-ui/core';
import PartyParticipantWindow from '../PartyParticipantWindow';
import { MediaStreamComponent } from '@xr3ngine/engine/src/networking/components/MediaStreamComponent';
import { observer } from 'mobx-react';
import { autorun } from 'mobx';

// Artificial Users

const PartyVideoWindows = observer((): JSX.Element => {
  const [parsedConsumers, setParsedConsumers] = useState([]);

  useEffect(() => {
    autorun(() => {
      const newConsumers = {};
      console.log('Consumer useEffect');
      console.log(MediaStreamComponent.instance?.consumers);
      MediaStreamComponent.instance?.consumers.forEach((consumer) => {
        const peerId = consumer._appData.peerId;
        console.log(`PeerId: ${peerId}`);
        const kind = consumer._track.kind;
        console.log(`kind: ${kind}`);
        if (newConsumers[peerId] == null) {
          newConsumers[peerId] = {};
        }
        newConsumers[peerId][kind] = consumer;
      });
      console.log(newConsumers);
      console.log(Object.entries(newConsumers));
      setParsedConsumers(Object.entries(newConsumers));
    });
  }, []);

  return (
    <Grid className="party-user-container" container direction="row" wrap="nowrap">
      { parsedConsumers.map(([key, tracks]) => (
        <PartyParticipantWindow
            containerProportions={{
              height: 135,
              width: 240
            }}
            peerId={tracks.video ? tracks.video._appData.peerId : tracks.audio._appData.peerId}
            key={key}
        />
      ))}
    </Grid>
  );
});

export default PartyVideoWindows;
