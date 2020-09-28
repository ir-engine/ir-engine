import React, { CSSProperties, FunctionComponent } from "react";

export type HintBoxProps = {
  layout: string;
};

const styles: CSSProperties = {
  position: "fixed",
  bottom: "1em",
  left: "10em",
  color: '#FFFFFF'
};

const keyStyles: CSSProperties = {
  backgroundColor: "rgba(0,0,0,0.6)",
  borderRadius: '4px',
  boxShadow: '0 0 10px rgba(102,185,51,0.5)',
  boxSizing: 'border-box',
  display: 'inline-block',
  height: '2em', 
  lineHeight: '2em',
  margin: '3px',
  minWidth: '2em',
  padding: '0px 5px',
  textAlign: 'center',
  textTransform: 'capitalize',
  opacity: '1'
};

export const HintBox: FunctionComponent<HintBoxProps> = ({ layout }: HintBoxProps) => {
  const keysHintsList = {
    default: [{keys:['w','s','a','d'], title:'Movement'},{keys:['shift'], title:'Sprint'},{keys:['space'], title:'Jump'}],
    car: [{keys:['w','s','a','d'], title:'Movement'},{keys:['e'], title:'move out the car'}]
  };

  document.getElementById('control-hint-box') ?  document.getElementById('control-hint-box').style.opacity = '1' : null;

  setTimeout(()=>{
      var fadeTarget = document.getElementById('control-hint-box');
      var fadeEffect = setInterval(function () {
          if (!fadeTarget.style.opacity) {
              fadeTarget.style.opacity = '1';
          }
          if (parseFloat(fadeTarget.style.opacity) > 0) {
              fadeTarget.style.opacity = (parseFloat(fadeTarget.style.opacity) - 0.1).toString();
          } else {
              clearInterval(fadeEffect);
          }
      }, 2000);
      }, 2000);
  
  return <div id='control-hint-box' style={styles}>
          <h3>Controls</h3>
          {keysHintsList[layout].map(line=> 
            (<section key={line.title}>
              {line.keys.map(key=><span key={key} style={keyStyles}>{key}</span>)}
               to {line.title}</section>))}    
        </div>;
};