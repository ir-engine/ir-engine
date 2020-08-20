import React from 'react';
import './style.scss';
import PartyParticipantWindow from '../PartyParticipantWindow';
import { Grid } from '@material-ui/core';

function Me (): JSX.Element {
  return (
    <Grid className="windowContainer" container>
      <PartyParticipantWindow
        containerProportions={{
          height: 145,
          width: 223
        }}
      />
    </Grid>
  );
}

export default Me;
