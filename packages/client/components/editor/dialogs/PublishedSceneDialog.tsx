import PropTypes from "prop-types";
import React from "react";
import PreviewDialog from "./PreviewDialog";
import { Button } from "../inputs/Button";

export default function PublishedSceneDialog({ onCancel, sceneName, sceneUrl, screenshotUrl, ...props }) {
  return (
    <PreviewDialog imageSrc={screenshotUrl} title="Scene Published" {...props}>
      <h1>{sceneName}</h1>
      <p>Your scene has been published.</p>
      <Button as="a" href={sceneUrl} target="_blank">
        View Your Scene
      </Button>
    </PreviewDialog>
  );
}

PublishedSceneDialog.propTypes = {
  onCancel: PropTypes.func.isRequired,
  sceneName: PropTypes.string.isRequired,
  sceneUrl: PropTypes.string.isRequired,
  screenshotUrl: PropTypes.string.isRequired
};
