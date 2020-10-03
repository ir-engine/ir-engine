import React, { CSSProperties, FunctionComponent } from "react";
import './style.scss';

export type HintBoxProps = {
  layout: string;
};

export const HintBox: FunctionComponent<HintBoxProps> = ({ layout }: HintBoxProps) => {
  const keysHintsList = {
    default: [{keys:['w','s','a','d'], title:'Move'},{keys:['space'], title:'Jump'}],
    car: [{keys:['w','s','a','d'], title:'Move'},{keys:['e'], title:'get out of the car'}]
  };

  document.getElementById('control-hint-box') ?  document.getElementById('control-hint-box').style.opacity = '1' : null;

  // setTimeout(()=>{
  //     var fadeTarget = document.getElementById('control-hint-box');
  //     var fadeEffect = setInterval(function () {
  //         if (!fadeTarget.style.opacity) {
  //             fadeTarget.style.opacity = '1';
  //         }
  //         if (parseFloat(fadeTarget.style.opacity) > 0) {
  //             fadeTarget.style.opacity = (parseFloat(fadeTarget.style.opacity) - 0.1).toString();
  //         } else {
  //             clearInterval(fadeEffect);
  //         }
  //     }, 2000);
  //     }, 2000);
  
  return <div id="control-hint-box" className='controlsHintBox'>
            <h3>Controls</h3>
            {keysHintsList[layout].map(line=> 
              (<section key={line.title}>
                {line.keys.map(key=><span key={key} className='keyButton'>{key}</span>)}
                to {line.title}</section>))}    
          </div>;
};