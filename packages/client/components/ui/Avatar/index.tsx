import React, { Fragment } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import './style.module.css';

const LetterAvatars = (): any => {
  return (
    <Fragment>
      <Typography variant="body1" color="inherit">
        Shaw
      </Typography>
      <div className="root">
        <Avatar className="purple">S</Avatar>
      </div>
    </Fragment>
  );
};

export default LetterAvatars;
