import React from 'react';
import Slider from '@material-ui/core/Slider';

interface SProps {
    value: number;
    onChange: any;
    arialabelledby: any;
}


const CommonSlider: React.FC<SProps> = (props) => {
    return (
        <Slider value={props.value} onChange={props.onChange} aria-labelledby={props.arialabelledby}/>
    )
}

export default CommonSlider;