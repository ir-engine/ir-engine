import React, { FunctionComponent } from "react";
import { CommonInteractiveDataPayload } from "@xr3ngine/engine/src/templates/interactive/interfaces/CommonInteractiveData";
import dynamic from "next/dynamic";
import './style.scss';
import { Button, IconButton } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';

const ModelView = dynamic(() => import("./modelView").then((mod) => mod.ModelView),  { ssr: false });

export type InfoBoxProps = {
  onClose: unknown;
  data: CommonInteractiveDataPayload;
};

export const InfoBox: FunctionComponent<InfoBoxProps> = ({ onClose, data }: InfoBoxProps) => {

  if(!data){return null;}

const handleLinkClick = (url) =>{  
   window.open(url, "_blank");
};
  let modelView = null;
  if (data.modelUrl) {
    modelView = (<ModelView modelUrl={data.modelUrl} />);
  }

  return <div className="info-box-container">    
    <h6>{ data.name }<IconButton aria-label="close" className="dialogCloseButton" 
        onClick={(): void => { if (typeof onClose === 'function') { onClose(); } }}>
        <CloseIcon />
    </IconButton></h6>
    {modelView}
    { data.buyUrl && (<Button  variant="contained" color="primary" onClick={()=>handleLinkClick(data.buyUrl)}>Buy</Button>)}
    { data.learnMoreUrl && (<Button  variant="contained" color="primary" onClick={()=>handleLinkClick(data.learnMoreUrl)}>Learn more</Button>)}
    { data.url && (<p>{data.url}</p>)}
    {/* { data.url? <iframe className="iframe" src={data.url} /> : null } */}
  </div>;
};