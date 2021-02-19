// @ts-nocheck
import React, { Component } from "react";
import NodeEditor from "./NodeEditor";
import InputGroup from "../inputs/InputGroup";
import SelectInput from "../inputs/SelectInput";
import BooleanInput from "../inputs/BooleanInput";
import StringInput from "../inputs/StringInput";
import { Running } from "@styled-icons/fa-solid/Running";

//Array containing component options
const componentOptions = [
  {
    label: "video",
    value: "video",
    nodeNames: ["Video"],
    propertyOptions: [
      {
        label: "paused",
        value: "paused",
        component: "video",
        input: BooleanInput,
        default: false
      }
    ]
  },
  {
    label: "loop-animation",
    value: "loop-animation",
    nodeNames: ["Model"],
    propertyOptions: [
      {
        label: "paused",
        value: "paused",
        component: "loop-animation",
        input: BooleanInput,
        default: false
      }
    ]
  }
];

//Declairing TriggerVolumeNodeEditor properties
type TriggerVolumeNodeEditorProps = {
  editor?: object;
  node?: object;
  multiEdit?: boolean;
};

//Declairing TriggerVolumeNodeEditor state
type TriggerVolumeNodeEditorState = {
  options: any[];
};

/**
 * [TriggerVolumeNodeEditor provides the editor view to customize properties]
 * @type {class component}
 */
export default class TriggerVolumeNodeEditor extends Component<
  TriggerVolumeNodeEditorProps,
  TriggerVolumeNodeEditorState
> {

  //initializing props and state
  constructor(props) {
    super(props);
    this.state = {
      options: []
    };
  }

  //updating state when component get mounted
  componentDidMount() {
    const options = [];
    const sceneNode = (this.props.editor as any).scene;
    sceneNode.traverse(o => {
      if (o.isNode && o !== sceneNode) {
        options.push({ label: o.name, value: o.uuid, nodeName: o.nodeName });
      }
    });
    this.setState({ options });
  }

  //initializing iconComponent with icon name
  static iconComponent = Running;

  //initializing description and will appears on editor view
  static description = "Sets a property on the target object on enter and leave.";

  //function to handle the changes in target
  onChangeTarget = target => {
    (this.props.editor as any).setPropertiesSelected({
      target,
      enterComponent: null,
      enterProperty: null,
      enterValue: null,
      leaveComponent: null,
      leaveProperty: null,
      leaveValue: null
    });
  };

  // function to handle changes in enterComponent
  onChangeEnterComponent = value => {
    (this.props.editor as any).setPropertiesSelected({
      enterComponent: value,
      enterProperty: null,
      enterValue: null
    });
  };

 // function to handle changes in enter property
  onChangeEnterProperty = (value, option) => {
    (this.props.editor as any).setPropertiesSelected({
      enterProperty: value,
      enterValue: option.default !== undefined ? option.default : null
    });
  };

 //function to handle the changes in enterValue property
  onChangeEnterValue = value => {
    (this.props.editor as any).setPropertySelected("enterValue", value);
  };

 // function to handle the changes leaveComponent
  onChangeLeaveComponent = value => {
    (this.props.editor as any).setPropertiesSelected({
      leaveComponent: value,
      leaveProperty: null,
      leaveValue: null
    });
  };


 // function to handle the changes in leave property
  onChangeLeaveProperty = (value, option) => {
    (this.props.editor as any).setPropertiesSelected({
      leaveProperty: value,
      leaveValue: option.default !== undefined ? option.default : null
    });
  };

 // function to handle the changes in leaveValue
  onChangeLeaveValue = value => {
    (this.props.editor as any).setPropertySelected("leaveValue", value);
  };


 //rendering editor view for property customization
  render() {
    const { node, multiEdit } = this.props as any;
    const targetOption = this.state.options.find(o => o.value === node.target);
    const target = targetOption ? targetOption.value : null;
    const targetNotFound = node.target && target === null;
    const filteredComponentOptions = targetOption
      ? componentOptions.filter(
          o => o.nodeNames.indexOf(targetOption.nodeName) !== -1
        )
      : [];
    const enterComponentOption = filteredComponentOptions.find(
      o => o.value === node.enterComponent
    );
    const enterComponent = enterComponentOption
      ? enterComponentOption.value
      : null;
    const leaveComponentOption = filteredComponentOptions.find(
      o => o.value === node.leaveComponent
    );
    const leaveComponent = leaveComponentOption
      ? leaveComponentOption.value
      : null;
    const filteredEnterPropertyOptions = enterComponentOption
      ? enterComponentOption.propertyOptions.filter(
          o => o.component === node.enterComponent
        )
      : [];
    const enterPropertyOption = filteredEnterPropertyOptions.find(
      o => o.value === node.enterProperty
    );
    const enterProperty = enterPropertyOption
      ? enterPropertyOption.value
      : null;
    const filteredLeavePropertyOptions = leaveComponentOption
      ? leaveComponentOption.propertyOptions.filter(
          o => o.component === node.leaveComponent
        )
      : [];
    const leavePropertyOption = filteredLeavePropertyOptions.find(
      o => o.value === node.leaveProperty
    );
    const leaveProperty = leavePropertyOption
      ? leavePropertyOption.value
      : null;
    const EnterInput = enterPropertyOption && enterPropertyOption.input;
    const LeaveInput = leavePropertyOption && leavePropertyOption.input;
    return (
      <NodeEditor
        description={TriggerVolumeNodeEditor.description}
        {...this.props}
      >
        <InputGroup name="Target">
          <SelectInput
            error={targetNotFound}
            placeholder={
              targetNotFound ? "Error missing node." : "Select node..."
            }
            value={node.target}
            onChange={this.onChangeTarget}
            options={this.state.options}
            disabled={multiEdit}
          />
        </InputGroup>
        <InputGroup name="Enter Component">
          <SelectInput
            placeholder={node.enterComponent || "Select component..."}
            value={node.enterComponent}
            onChange={this.onChangeEnterComponent}
            options={filteredComponentOptions}
            disabled={multiEdit || !target}
          />
        </InputGroup>
        <InputGroup name="Enter Property">
          <SelectInput
            placeholder={node.enterProperty || "Select property..."}
            value={node.enterProperty}
            onChange={this.onChangeEnterProperty}
            options={filteredEnterPropertyOptions}
            disabled={multiEdit || !enterComponent}
          />
        </InputGroup>
        <InputGroup name="Enter Value">
          {EnterInput ? (
            <EnterInput
              value={node.enterValue}
              onChange={this.onChangeEnterValue}
              disabled={
                multiEdit || !(target && enterComponent && enterProperty)
              }
            />
          ) : (
            <StringInput disabled />
          )}
        </InputGroup>
        <InputGroup name="Leave Component">
          <SelectInput
            placeholder={node.leaveComponent || "Select component..."}
            value={node.leaveComponent}
            onChange={this.onChangeLeaveComponent}
            options={filteredComponentOptions}
            disabled={multiEdit || !target}
          />
        </InputGroup>
        <InputGroup name="Leave Property">
          <SelectInput
            placeholder={node.leaveProperty || "Select property..."}
            value={node.leaveProperty}
            onChange={this.onChangeLeaveProperty}
            options={filteredLeavePropertyOptions}
            disabled={multiEdit || !leaveComponent}
          />
        </InputGroup>
        <InputGroup name="Leave Value">
          {LeaveInput ? (
            <LeaveInput
              value={node.leaveValue}
              onChange={this.onChangeLeaveValue}
              disabled={
                multiEdit || !(target && leaveComponent && leaveProperty)
              }
            />
          ) : (
            <StringInput disabled />
          )}
        </InputGroup>
      </NodeEditor>
    );
  }
}
