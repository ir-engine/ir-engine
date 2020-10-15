import React, { CSSProperties, FunctionComponent } from "react";
import { CommonInteractiveDataPayload } from "@xr3ngine/engine/src/templates/interactive/interfaces/CommonInteractiveData";
import dynamic from "next/dynamic";
const ModelView = dynamic(() => import("./modelView").then((mod) => mod.ModelView),  { ssr: false });

export type InfoBoxProps = {
  onClose: unknown;
  data: CommonInteractiveDataPayload;
};

const styles: CSSProperties = {
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%,-50%)",
  width: "90%",
  height: "90%",
  overflowY: 'auto',
  backgroundColor: "#ffffff",
  //temporary - before MVP
  display: 'none'
};

const linkStyle: CSSProperties = {
  cursor: "pointer",
  backgroundColor: "#44d62c",
  padding: "5px",
  borderRadius: "2px 5px",
  margin: "0 2px",
  color: "#000000"
};

const iframeStyle: CSSProperties = {
  width: "100%",
  height: "100%"
};

export const InfoBox: FunctionComponent<InfoBoxProps> = ({ onClose, data }: InfoBoxProps) => {

  let modelView = null;
  if (data.modelUrl) {
    modelView = (<ModelView modelUrl={data.modelUrl} />);
  }

  return <div style={styles}>
    <h3>{ data.name }</h3>
    {modelView}
    <span style={linkStyle} onClick={(): void => { if (typeof onClose === 'function') { onClose(); } }}>Back</span>
    { data.buyUrl? <a style={linkStyle} target="_blank" href={data.buyUrl}>Buy</a> : null }
    { data.learnMoreUrl? <a style={linkStyle} target="_blank" href={data.learnMoreUrl}>Learn more</a> : null }
    { data.url? <span>{data.url}</span> : null }
    { data.url? <iframe style={iframeStyle} src={data.url} /> : null }
  </div>;
};