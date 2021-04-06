import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import StringInput from "../inputs/StringInput";
import FormField from "../inputs/FormField";
import PreviewDialog from "./PreviewDialog";

/**
 * [SaveNewProjectDialog used to show dialog when to save new project]
 * @param       {string} thumbnailUrl
 * @param       {string} initialName
 * @param       {function} onConfirm
 * @param       {function} onCancel
 * @constructor
 */
export default function SaveNewProjectDialog({ thumbnailUrl, initialName, onConfirm, onCancel }) {
  const [name, setName] = useState(initialName);

  const onChangeName = useCallback(
    value => {
      setName(value);
    },
    [setName]
  );

  /**
   * [onConfirmCallback callback function is used handle confirm dialog]
   * @type {function}
   */
  const onConfirmCallback = useCallback(
    e => {
      e.preventDefault();
      onConfirm({ name });
    },
    [name, onConfirm]
  );

 /**
  * [onCancelCallback callback function used to handle cancel of dialog]
  * @type {function}
  */
  const onCancelCallback = useCallback(
    e => {
      e.preventDefault();
      onCancel();
    },
    [onCancel]
  );

  //returning view for dialog view.
  return (
    <PreviewDialog
      imageSrc={thumbnailUrl}
      title="Save Project"
      onConfirm={onConfirmCallback}
      onCancel={onCancelCallback}
      confirmLabel="Save Project"
    >
      { /* @ts-ignore */ }
      <FormField>
        <label htmlFor="name">Project Name</label>
        <StringInput
          /* @ts-ignore */
          id="name"
          required
          pattern={"[A-Za-z0-9-':\"!@#$%^&*(),.?~ ]{4,64}"}
          title="Name must be between 4 and 64 characters and cannot contain underscores"
          value={name}
          onChange={onChangeName}
        />
      </FormField>
    </PreviewDialog>
  );
}

/**
 * [declairing propTypes for SaveNewProjectDialog]
 * @type {Object}
 */
SaveNewProjectDialog.propTypes = {
  thumbnailUrl: PropTypes.string.isRequired,
  initialName: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};
