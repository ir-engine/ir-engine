import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';

import './style.scss';

interface Props {
  label?: string;
}
const LinearProgressComponent = ({ label = '' }: Props): any => {
  return (
    <section className="linearProgressContainer">
        {label.length > 0 && (<span className="loadingProgressTile">{label}</span>)}        
        <LinearProgress className="linearProgress" />
    </section>
  );
};
export default LinearProgressComponent;
