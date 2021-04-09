import React, { Component } from "react";
import PropTypes from "prop-types";
import configs from "../configs";
import PreviewDialog from "./PreviewDialog";
import StringInput from "../inputs/StringInput";
import BooleanInput from "../inputs/BooleanInput";
import FormField from "../inputs/FormField";
import { Trans, withTranslation } from "react-i18next";

/**
 * PublishDialog used to show the dialog when we are going to publish scene.
 * 
 * @author Robert Long
 * @type {class component}
 */
export class PublishDialog extends Component<{t: Function}> {

/**
 * Declairing propTypes for publishDialog component.
 * 
 * @author Robert Long
 * @type {Object}
 */
  static propTypes = {
    onCancel: PropTypes.func,
    screenshotUrl: PropTypes.string,
    contentAttributions: PropTypes.array,
    onPublish: PropTypes.func,
    isPublished: PropTypes.bool,
    sceneUrl: PropTypes.string,
    initialSceneParams: PropTypes.object,
    t: PropTypes.func,
  };

  //initializing state when object of class get invoked.
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

  //setting state when there is change in name.
  onChangeName = name => this.setState({ name });

  //setting state when there is change creatorAttribution property.
  onChangeCreatorAttribution = creatorAttribution => this.setState({ creatorAttribution });

  //setting state when there is changes in allowRemixing property.
  onChangeAllowRemixing = allowRemixing => this.setState({ allowRemixing });

  //setting state  when there is change in allowPromotion property
  onChangeAllowPromotion = allowPromotion => this.setState({ allowPromotion });

  //function to handle the confirmation of publishDialog
  onConfirm = () => {
    const publishState = { ...this.state, contentAttributions: (this.props as any).contentAttributions } as any;
    publishState.name = publishState.name.trim();
    publishState.creatorAttribution = publishState.creatorAttribution.trim();
    (this.props as any).onPublish(publishState);
  };

  // creating and rendering PreviewDialog view.
  render(){
    const { onCancel, screenshotUrl, contentAttributions } = this.props as any;
    const { creatorAttribution, name, allowRemixing, allowPromotion } = this.state as any;
    return (
      <PreviewDialog
        imageSrc={screenshotUrl}
        title={this.props.t('editor:dialog.publish.title')}
        onConfirm={this.onConfirm}
        onCancel={onCancel}
        confirmLabel={this.props.t('editor:dialog.publish.lbl-confirm')}
      >
        { /* @ts-ignore */ }
        <FormField>
          <label htmlFor="sceneName">{this.props.t('editor:dialog.publish.lbl-name')}</label>
          <StringInput
          //@ts-ignore
            id="sceneName"
            required
            pattern={"[A-Za-z0-9-':\"!@#$%^&*(),.?~ ]{4,64}"}
            title={this.props.t('editor:dialog.publish.info-name')}
            value={name}
            onChange={this.onChangeName}
          />
        </FormField>
        { /* @ts-ignore */ }
        <FormField>
          <label htmlFor="creatorAttribution">{this.props.t('editor:dialog.publish.lbl-yourAttribution')}</label>
          <StringInput
          // @ts-ignore
          id="creatorAttribution" value={creatorAttribution} onChange={this.onChangeCreatorAttribution} />
        </FormField>
        { /* @ts-ignore */ }
        <FormField inline>
          <label htmlFor="allowRemixing">
            <Trans i18nKey="editor:dialog.publish.lbl-remixScene" t={this.props.t as any}>
              Allow other users to remix your scene with
              <br />
              Creative Commons&nbsp;
              <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">
                CC-BY 3.0
              </a>
            </Trans>
          </label>
          { /* @ts-ignore */ }
          <BooleanInput id="allowRemixing" value={allowRemixing} onChange={this.onChangeAllowRemixing} />
        </FormField>
        <FormField inline>
          <label htmlFor="allowPromotion">
          {this.props.t('editor:dialog.publish.lbl-appearOnFront')}
          </label>
          { /* @ts-ignore */ }
          <BooleanInput id="allowPromotion" value={allowPromotion} onChange={this.onChangeAllowPromotion} />
          </FormField>
        { contentAttributions && (
          /* @ts-ignore */
          <FormField>
            <label>{this.props.t('editor:dialog.publish.lbl-modelAttribution')}</label>
            <p>{contentAttributions.map(a => `${a.name} by ${a.author}\n`)}</p>
          </FormField>
        )}
      </PreviewDialog>
    );
  }
}

export default withTranslation()(PublishDialog);
