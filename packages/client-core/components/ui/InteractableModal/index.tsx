import React, { FunctionComponent } from "react";
import { CommonInteractiveDataPayload } from "@xr3ngine/engine/src/templates/interactive/interfaces/CommonInteractiveData";
import dynamic from "next/dynamic";
import styles from './style.module.scss';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';

type ModelViewProps = {
  modelUrl: string
}

const ModelView = dynamic<ModelViewProps>(() => import("./modelView").then((mod) => mod.ModelView),  { ssr: false });

export type InteractableModalProps = {
  onClose: unknown;
  data: CommonInteractiveDataPayload;
};

export const InteractableModal: FunctionComponent<InteractableModalProps> = ({ onClose, data }: InteractableModalProps) => {

  if(!data){return null;}

  const handleLinkClick = (url) =>{  
    window.open(url, "_blank");
  };

  let modelView = null;
  if (data.modelUrl) {
    modelView = (<ModelView modelUrl={data.modelUrl} />);
  }
  return  (<Dialog open={true} aria-labelledby="xr-dialog" 
      classes={{
        root: styles.customDialog,
        paper: styles.customDialogInner, 
      }}
      BackdropProps={{ style: { backgroundColor: "transparent" } }} >
      { data.name && 
        <DialogTitle disableTypography className={styles.dialogTitle}>
          <IconButton aria-label="close" className={styles.dialogCloseButton} color="primary"
              onClick={(): void => { if (typeof onClose === 'function') { onClose(); } }}><CloseIcon /></IconButton>
          <Typography variant="h2"align="left" >{data.name}</Typography>          
        </DialogTitle>}
        <DialogContent className={styles.dialogContent}>
          {modelView}
          {/* eslint-disable-next-line react/no-danger */}
          { data.htmlContent && (<div dangerouslySetInnerHTML={{__html: data.htmlContent}} />)}
          { data.url && (<p>{data.url}</p>)}
          { data.buyUrl && (<Button  variant="outlined" color="primary" onClick={()=>handleLinkClick(data.buyUrl)}>Buy</Button>)}
          { data.learnMoreUrl && (<Button  variant="outlined" color="secondary" onClick={()=>handleLinkClick(data.learnMoreUrl)}>Learn more</Button>)}
          {/* { data.url? <iframe className="iframe" src={data.url} /> : null } */}
        </DialogContent>
    </Dialog>);
};