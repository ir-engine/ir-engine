import React, { Component } from "react";
import PropTypes from "prop-types";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import SelectInput from "../inputs/SelectInput";
import BooleanInput from "../inputs/BooleanInput";
import { PuzzlePiece } from "@styled-icons/fa-solid/PuzzlePiece";
import styled from "styled-components";

const SubPiecesHeader = (styled as any).div`
  color: ${props => props.theme.text2};
  margin-left: 8px;
`;

const SubPiecesContainer = (styled as any).div`
  display: flex;
  flex-direction: column;
`;

const SubPieceItemContainer = (styled as any).div`
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.panel2};
  border-radius: 4px;
  margin: 8px;
`;

const SubPieceItemTitle = (styled as any).div`
  display: flex;
  color: ${props => props.theme.text2};
  align-items: center;
  background-color: ${props => props.theme.toolbar};
  padding: 8px;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
`;

const MaterialSlotList = (styled as any).div`
  display: flex;
  flex-direction: column;
  margin-left: 12px;
  padding: 8px;
`;

const MaterialSlotItemContainer = (styled as any).div`
  display: flex;
  padding: 4px 0;
`;

const MaterialSlotItemTitle = (styled as any).div`
  display: flex;
  color: ${props => props.theme.text2};
  align-items: center;
`;

const MaterialSlotContent = (styled as any).div`
  display: flex;
  padding: 0 8px;
  flex: 1;
`;

function SubPieceItem({ name, children, ...rest }) {
  return (
    <SubPieceItemContainer {...rest}>
      <SubPieceItemTitle>{name}</SubPieceItemTitle>
      <MaterialSlotList>{children}</MaterialSlotList>
    </SubPieceItemContainer>
  );
}

SubPieceItem.propTypes = {
  name: PropTypes.string,
  children: PropTypes.node
};

function MaterialSlotItem({ name, children, ...rest }) {
  return (
    <MaterialSlotItemContainer {...rest}>
      <MaterialSlotItemTitle>{name} Material</MaterialSlotItemTitle>
      <MaterialSlotContent>{children}</MaterialSlotContent>
    </MaterialSlotItemContainer>
  );
}

MaterialSlotItem.propTypes = {
  name: PropTypes.string,
  children: PropTypes.node
};

export default class KitPieceNodeEditor extends Component {
  static propTypes = {
    editor: PropTypes.object,
    node: PropTypes.object,
    multiEdit: PropTypes.bool
  };

  static iconComponent = PuzzlePiece;

  static description = "";

  onChangeMaterialSlot = (subPiece, materialSlot, materialId) => {
    (this.props as any).editor.loadMaterialSlotSelected(subPiece.id, materialSlot.id, materialId);
  };

  onChangeAnimation = activeClipIndex => {
    ((this.props as any).editor as any).setPropertySelected("activeClipIndex", activeClipIndex);
  };

  onChangeCollidable = collidable => {
    ((this.props as any).editor as any).setPropertySelected("collidable", collidable);
  };

  onChangeWalkable = walkable => {
    ((this.props as any).editor as any).setPropertySelected("walkable", walkable);
  };

  onChangeCastShadow = castShadow => {
    ((this.props as any).editor as any).setPropertySelected("castShadow", castShadow);
  };

  onChangeReceiveShadow = receiveShadow => {
    ((this.props as any).editor as any).setPropertySelected("receiveShadow", receiveShadow);
  };

  isAnimationPropertyDisabled() {
    const { multiEdit, editor, node } = this.props as any;

    if (multiEdit) {
      return editor.selected.some(
        selectedNode => selectedNode.kitId !== node.kitId || selectedNode.pieceId !== node.pieceId
      );
    }

    return false;
  }

  render() {
    const { node, editor } = this.props as any;

    const uniqueSubPieces = [];

    for (const node of editor.selected) {
      for (const subPiece of node.subPieces) {
        if (!uniqueSubPieces.some(p => p.id === subPiece.id)) {
          uniqueSubPieces.push(subPiece);
        }
      }
    }

    return (
      /* @ts-ignore */
      <NodeEditor {...this.props} description={KitPieceNodeEditor.description}>
        {uniqueSubPieces.length > 0 && (
          <>
            <SubPiecesHeader>Sub Pieces:</SubPiecesHeader>
            <SubPiecesContainer>
              {uniqueSubPieces.map(subPiece => (
                <SubPieceItem key={"subPiece-" + subPiece.id} name={subPiece.name}>
                  {subPiece.materialSlots.map(materialSlot => (
                    <MaterialSlotItem key={"materialSlot-" + materialSlot.id} name={materialSlot.name}>
                      { /* @ts-ignore */ }
                      <SelectInput
                        options={materialSlot.options.map(o => ({ value: o.id, label: o.name }))}
                        value={materialSlot.value ? materialSlot.value.id : null}
                        // TODO: This is definitely a bug
                        /* @ts-ignore */
                        onChange={(value, option) => this.onChangeMaterialSlot(subPiece, materialSlot, value, option)}
                      />
                    </MaterialSlotItem>
                  ))}
                </SubPieceItem>
              ))}
            </SubPiecesContainer>
          </>
        )}
        { /* @ts-ignore */ }
        <InputGroup name="Loop Animation">
          { /* @ts-ignore */ }
          <SelectInput
            disabled={this.isAnimationPropertyDisabled()}
            options={node.getClipOptions()}
            value={node.activeClipIndex}
            onChange={this.onChangeAnimation}
          />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Collidable">
          <BooleanInput value={node.collidable} onChange={this.onChangeCollidable} />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Walkable">
          <BooleanInput value={node.walkable} onChange={this.onChangeWalkable} />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Cast Shadow">
          <BooleanInput value={node.castShadow} onChange={this.onChangeCastShadow} />
        </InputGroup>
        { /* @ts-ignore */ }
        <InputGroup name="Receive Shadow">
          <BooleanInput value={node.receiveShadow} onChange={this.onChangeReceiveShadow} />
        </InputGroup>
      </NodeEditor>
    );
  }
}
