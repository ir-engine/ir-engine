import React, { Component } from "react";
import PropTypes from "prop-types";
import configs from "../../../editor/configs";
import PreviewDialog from "../ui/dialogs/PreviewDialog";
import StringInput from "../ui/inputs/StringInput";
import BooleanInput from "../ui/inputs/BooleanInput";
import FormField from "../ui/inputs/FormField";

export default class PublishDialog extends Component {
  static propTypes = {
    onCancel: PropTypes.func,
    screenshotUrl: PropTypes.string,
    contentAttributions: PropTypes.array,
    onPublish: PropTypes.func,
    published: PropTypes.bool,
    sceneUrl: PropTypes.string,
    initialSceneParams: PropTypes.object
  };

  constructor(props) {
    super(props);

    this.state = {
      name: "",
      creatorAttribution: "",
      allowRemixing: false,
      allowPromotion: false,
      ...props.initialSceneParams
    };
  }

  onChangeName = name => this.setState({ name });

  onChangeCreatorAttribution = creatorAttribution => this.setState({ creatorAttribution });

  onChangeAllowRemixing = allowRemixing => this.setState({ allowRemixing });

  onChangeAllowPromotion = allowPromotion => this.setState({ allowPromotion });

  onConfirm = () => {
    const publishState = { ...this.state, contentAttributions: this.props.contentAttributions };
    publishState.name = publishState.name.trim();
    publishState.creatorAttribution = publishState.creatorAttribution.trim();
    this.props.onPublish(publishState);
  };

  render() {
    const { onCancel, screenshotUrl, contentAttributions } = this.props;
    const { creatorAttribution, name, allowRemixing, allowPromotion } = this.state;

    return (
      <PreviewDialog
        imageSrc={screenshotUrl}
        title={configs.isXR3() ? "Publish to Hubs" : "Publish Scene"}
        onConfirm={this.onConfirm}
        onCancel={onCancel}
        confirmLabel="Save and Publish"
      >
        <FormField>
          <label htmlFor="sceneName">Scene Name</label>
          <StringInput
            id="sceneName"
            required
            pattern={"[A-Za-z0-9-':\"!@#$%^&*(),.?~ ]{4,64}"}
            title="Name must be between 4 and 64 characters and cannot contain underscores"
            value={name}
            onChange={this.onChangeName}
          />
        </FormField>
        <FormField>
          <label htmlFor="creatorAttribution">Your Attribution (optional):</label>
          <StringInput id="creatorAttribution" value={creatorAttribution} onChange={this.onChangeCreatorAttribution} />
        </FormField>
        <FormField inline>
          <label htmlFor="allowRemixing">
            Allow other users to remix your scene with
            <br />
            Creative Commons&nbsp;
            <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">
              CC-BY 3.0
            </a>
          </label>
          <BooleanInput id="allowRemixing" value={allowRemixing} onChange={this.onChangeAllowRemixing} />
        </FormField>
        <FormField inline>
          <label htmlFor="allowPromotion">
            Allow scene to appear on front page
          </label>
          <BooleanInput id="allowPromotion" value={allowPromotion} onChange={this.onChangeAllowPromotion} />
        </FormField>
        {contentAttributions && (
          <FormField>
            <label>Model Attribution:</label>
            <p>{contentAttributions.map(a => `${a.name} by ${a.author}\n`)}</p>
          </FormField>
        )}
      </PreviewDialog>
    );
  }
}
