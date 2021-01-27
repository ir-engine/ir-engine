import React, { useEffect, useState } from 'react';
import styles from './PartyParticipantWindow.module.scss';
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
      MediaStreamComponent.instance?.consumers.forEach((consumer) => {
        const peerId = consumer._appData.peerId;
        const kind = consumer._track.kind;
        if (newConsumers[peerId] == null) {
          newConsumers[peerId] = {};
        }
        newConsumers[peerId][kind] = consumer;
      });
      setParsedConsumers(Object.entries(newConsumers));
    });
  }, []);

  return (
    <Grid className={ styles['party-user-container']} container direction="row" wrap="nowrap">
      { parsedConsumers.map(([key, tracks]) => (
        <PartyParticipantWindow
            peerId={tracks.video ? tracks.video._appData.peerId : tracks.audio._appData.peerId}
            key={key}
        />
      ))}
    </Grid>
  );
});

export default PartyVideoWindows;
