import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import FormField from '../inputs/FormField'
import StringInput from '../inputs/StringInput'
import PreviewDialog from './PreviewDialog'

/**
 * PublishDialog used to show the dialog when we are going to publish scene.
 *
 * @author Robert Long
 * @type {class component}
 */
export class PublishDialog extends Component<{ t: Function }> {
  //initializing state when object of class get invoked.
  constructor(props) {
    super(props)
    this.state = {
      name: '',
      ...props.initialSceneParams
    }
  }

  //setting state when there is change in name.
  onChangeName = (name) => this.setState({ name })

  //function to handle the confirmation of publishDialog
  onConfirm = () => {
    const publishState = { ...this.state } as any
    publishState.name = publishState.name.trim()
    ;(this.props as any).onPublish(publishState)
  }

  // creating and rendering PreviewDialog view.
  render() {
    const { onCancel, screenshotUrl } = this.props as any
    const { name } = this.state as any
    return (
      <PreviewDialog
        imageSrc={screenshotUrl}
        title={this.props.t('editor:dialog.publish.title')}
        onConfirm={this.onConfirm}
        onCancel={onCancel}
        confirmLabel={this.props.t('editor:dialog.publish.lbl-confirm')}
      >
        <FormField>
          <label htmlFor="sceneName">{this.props.t('editor:dialog.publish.lbl-name')}</label>
          <StringInput
            id="sceneName"
            required
            pattern={'[A-Za-z0-9-\':"!@#$%^&*(),.?~ ]{4,64}'}
            title={this.props.t('editor:dialog.publish.info-name')}
            value={name}
            onChange={this.onChangeName}
          />
        </FormField>
      </PreviewDialog>
    )
  }
}

export default withTranslation()(PublishDialog)
