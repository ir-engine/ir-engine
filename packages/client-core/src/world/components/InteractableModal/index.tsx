import React, { FunctionComponent } from "react";
import { CommonInteractiveData } from "@xr3ngine/engine/src/interaction/interfaces/CommonInteractiveData";
import dynamic from "next/dynamic";
// @ts-ignore
import styles from './style.module.scss';
import { Button, Dialog, DialogContent, DialogTitle, IconButton, Typography } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import { useTranslation } from "react-i18next";

type ModelViewProps = {
  modelUrl: string
}

const ModelView = dynamic<ModelViewProps>(() => import("./modelView").then((mod) => mod.ModelView),  { ssr: false });

export type InteractableModalProps = {
  onClose: unknown;
  data: CommonInteractiveData;
};

export const InteractableModal: FunctionComponent<InteractableModalProps> = ({ onClose, data }: InteractableModalProps) => {
  const { t } = useTranslation();

  if(!data){return null;}

  const handleLinkClick = (url) =>{
    window.open(url, "_blank");
  };

  let modelView = null;
  if (data.payloadModelUrl) {
    modelView = (<ModelView modelUrl={data.payloadModelUrl} />);
  }
  return  (<Dialog open={true} aria-labelledby="xr-dialog"
      classes={{
        root: styles.customDialog,
        paper: styles.customDialogInner,
      }}
      BackdropProps={{ style: { backgroundColor: "transparent" } }} >
      { data.payloadUrl && 
        <DialogTitle disableTypography className={styles.dialogTitle}>
          <IconButton aria-label="close" className={styles.dialogCloseButton} color="primary"
              onClick={(): void => { if (typeof onClose === 'function') { onClose(); } }}><CloseIcon /></IconButton>
          <Typography variant="h2"align="left" >{data.interactionText}</Typography>          
        </DialogTitle>}
        <DialogContent className={styles.dialogContent}>
          {modelView}
          {/* eslint-disable-next-line react/no-danger */}
          { data.payloadHtmlContent && (<div dangerouslySetInnerHTML={{__html: data.payloadHtmlContent}} />)}
          { data.payloadUrl && (<p>{data.payloadUrl}</p>)}
          { data.payloadBuyUrl && (<Button  variant="outlined" color="primary" onClick={()=>handleLinkClick(data.payloadBuyUrl)}>{t('editor:interactableModel.lbl-buy')}</Button>)}
          { data.payloadLearnMoreUrl && (<Button  variant="outlined" color="secondary" onClick={()=>handleLinkClick(data.payloadLearnMoreUrl)}>{t('editor:interactableModel.lbl-learnMore')}</Button>)}
          {/* { data.url? <iframe className="iframe" src={data.url} /> : null } */}
        </DialogContent>
    </Dialog>);
};
