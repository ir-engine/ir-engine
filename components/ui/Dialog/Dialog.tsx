import React, { Component } from 'react'
import { connect } from 'react-redux'
import Dialog from '@material-ui/core/Dialog'
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Typography from '@material-ui/core/Typography';
import { selectDialogState } from '../../../redux/dialog/selector'
import { closeDialog } from '../../../redux/dialog/service'
import { bindActionCreators, Dispatch } from 'redux'
import Router from 'next/router'
import './style.scss'

type Props = {
  dialog: any
  closeDialog: typeof closeDialog
}

const mapStateToProps = (state: any) => {
  return {
    dialog: selectDialogState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  closeDialog: bindActionCreators(closeDialog, dispatch)
})

class XDialog extends Component<Props> {
  componentDidMount() {
    Router.events.on('routeChangeStart', () => {
      this.props.closeDialog();
    })
  }

  handleClose = (e: any) => {
    e.preventDefault()
    this.props.closeDialog()
  }

  render() {
    const isOpened = this.props.dialog.get('isOpened')
    const content = this.props.dialog.get('content')

    return (
      <Dialog
        open={isOpened}
        onClose={this.handleClose}
        aria-labelledby="xr-dialog"
        >
        <DialogTitle disableTypography className="dialog-title">
          <Typography variant="h6">{(content && content.title) ?? ''}</Typography>
            <IconButton aria-label="close" className="dialog-close-button" onClick={this.handleClose}>
              <CloseIcon />
            </IconButton>
        </DialogTitle>

        <DialogContent className="dialog-content">
          {content && content.children}
        </DialogContent>
      </Dialog>
    )
  }
}

const DialogWraper = (props: any) => {
  // const router = useRouter()
  return <XDialog {...props} />
}

export default connect(mapStateToProps, mapDispatchToProps)(DialogWraper)
