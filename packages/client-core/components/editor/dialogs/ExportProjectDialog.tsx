import React, { useState, useCallback } from "react";
import PropTypes from "prop-types";
import BooleanInput from "../inputs/BooleanInput";
import FormField from "../inputs/FormField";
import Dialog from "./Dialog";
import styled from "styled-components";

/**
 * [FormContainer used as a wrapper element for FormFields]
 * @type {Styled Component}
 */
const FormContainer = (styled as any).div`
  display: flex;
  flex-direction: column;
  flex: 1;
`;

/**
 * [ExportProjectDialog used to provide view containing FormFields ]
 * @param       {Object} defaultOptions
 * @param       {function} onConfirm
 * @param       {function} onCancel
 * @constructor
 */
export default function ExportProjectDialog({ defaultOptions, onConfirm, onCancel }) {

  // initializing options using defaultOptions
  const [options, setOptions] = useState(defaultOptions);

  //callback function used to handle changes in options.combinedMesh property
  const onChangeCombineMeshes = useCallback(
    combineMeshes => {
      setOptions({ ...options, combineMeshes });
    },
    [options, setOptions]
  );

  // callback function used to handle change in options.removeUnusedObjects property
  const onChangeRemoveUnusedObjects = useCallback(
    removeUnusedObjects => {
      setOptions({ ...options, removeUnusedObjects });
    },
    [options, setOptions]
  );

  // callback function used to handle confirmation on dialog.
  const onConfirmCallback = useCallback(
    e => {
      e.preventDefault();
      onConfirm(options);
    },
    [options, onConfirm]
  );

  // callback functionto handle cancel of confirmation dialog.
  const onCancelCallback = useCallback(
    e => {
      e.preventDefault();
      onCancel();
    },
    [onCancel]
  );

  // returning view containing FormFields
  return (
    <Dialog
      title="Export Project"
      onConfirm={onConfirmCallback}
      onCancel={onCancelCallback}
      confirmLabel="Export Project"
    >
      <FormContainer>
        { /* @ts-ignore */ }
        <FormField>
          <label htmlFor="combineMeshes">Combine Meshes</label>
          <BooleanInput
          /* @ts-ignore */
          id="combineMeshes" value={options.combineMeshes} onChange={onChangeCombineMeshes} />
        </FormField>
        { /* @ts-ignore */ }
        <FormField>
          <label htmlFor="removeUnusedObjects">Remove Unused Objects</label>
          <BooleanInput
          /* @ts-ignore */
            id="removeUnusedObjects"
            value={options.removeUnusedObjects}
            onChange={onChangeRemoveUnusedObjects}
          />
        </FormField>
      </FormContainer>
    </Dialog>
  );
}

/**
 * [declairing propTypes for ExportProjectDialog]
 * @type {Object}
 */
ExportProjectDialog.propTypes = {
  defaultOptions: PropTypes.object.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};
