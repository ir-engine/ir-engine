import PropTypes from "prop-types";
import React from "react";
import PreviewDialog from "./PreviewDialog";
import { Button } from "../inputs/Button";

/**
 * [PublishedSceneDialog used to show dialog when scene get published]
 * @param       {function} onCancel
 * @param       {string} sceneName
 * @param       {string} sceneUrl
 * @param       {string} screenshotUrl
 * @param       {any} props
 * @constructor
 */
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

/**
 * [Declairing propTypes for PublishedSceneDialog]
 * @type {Object}
 */
PublishedSceneDialog.propTypes = {
  onCancel: PropTypes.func.isRequired,
  sceneName: PropTypes.string.isRequired,
  sceneUrl: PropTypes.string.isRequired,
  screenshotUrl: PropTypes.string.isRequired
};
