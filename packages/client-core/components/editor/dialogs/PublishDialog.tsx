import PropTypes from "prop-types";
import React, { Component } from "react";
import BooleanInput from "../inputs/BooleanInput";
import FormField from "../inputs/FormField";
import StringInput from "../inputs/StringInput";
import PreviewDialog from "./PreviewDialog";

export default class PublishDialog extends Component {
  static propTypes = {
    onCancel: PropTypes.func,
    screenshotUrl: PropTypes.string,
    contentAttributions: PropTypes.array,
    onPublish: PropTypes.func,
    isPublished: PropTypes.bool,
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
    const publishState = { ...this.state, contentAttributions: (this.props as any).contentAttributions } as any;
    publishState.name = publishState.name.trim();
    publishState.creatorAttribution = publishState.creatorAttribution.trim();
    (this.props as any).onPublish(publishState);
  };

  render() {
    const { onCancel, screenshotUrl, contentAttributions } = this.props as any;
    const { creatorAttribution, name, allowRemixing, allowPromotion } = this.state as any;

    return (
      <PreviewDialog
        imageSrc={screenshotUrl}
        title="Publish Scene"
        onConfirm={this.onConfirm}
        onCancel={onCancel}
        confirmLabel="Save and Publish"
      >
        { /* @ts-ignore */ }
        <FormField>
          <label htmlFor="sceneName">Scene Name</label>
          <StringInput
          //@ts-ignore
            id="sceneName"
            required
            pattern={"[A-Za-z0-9-':\"!@#$%^&*(),.?~ ]{4,64}"}
            title="Name must be between 4 and 64 characters and cannot contain underscores"
            value={name}
            onChange={this.onChangeName}
          />
        </FormField>
        { /* @ts-ignore */ }
        <FormField>
          <label htmlFor="creatorAttribution">Your Attribution (optional):</label>
          <StringInput
          // @ts-ignore
          id="creatorAttribution" value={creatorAttribution} onChange={this.onChangeCreatorAttribution} />
        </FormField>
        { /* @ts-ignore */ }
        <FormField inline>
          <label htmlFor="allowRemixing">
            Allow other users to remix your scene with
            <br />
            Creative Commons&nbsp;
            <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">
              CC-BY 3.0
            </a>
          </label>
          { /* @ts-ignore */ }
          <BooleanInput id="allowRemixing" value={allowRemixing} onChange={this.onChangeAllowRemixing} />
        </FormField>
        <FormField inline>
          <label htmlFor="allowPromotion">
            Allow scene to appear on front page
          </label>
          { /* @ts-ignore */ }
          <BooleanInput id="allowPromotion" value={allowPromotion} onChange={this.onChangeAllowPromotion} />
        </FormField>
        { contentAttributions && (
          /* @ts-ignore */
          <FormField>
            <label>Model Attribution:</label>
            <p>{contentAttributions.map(a => `${a.name} by ${a.author}\n`)}</p>
          </FormField>
        )}
      </PreviewDialog>
    );
  }
}
