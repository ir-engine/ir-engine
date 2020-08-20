import React from 'react';
import './style.scss';
import { Grid } from '@material-ui/core';
import PartyParticipantWindow from '../PartyParticipantWindow';

// Artificial Users
const otherParticipants = [1, 2, 3, 4, 5, 6];

function PartyVideoWindows (): JSX.Element {
  return (
    <Grid className="rootContainer" container direction="row" wrap="nowrap">
      {otherParticipants.map((key) => (
        <PartyParticipantWindow key={key} />
      ))}
    </Grid>
  );
}

export default PartyVideoWindows;
