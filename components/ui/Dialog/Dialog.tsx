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
import { createStyles, makeStyles } from '@material-ui/core/styles';

type Props = {
  dialog: any,
  classes: any,
  closeDialog: typeof closeDialog
}

const useStyles = makeStyles((/* theme: Theme */) =>
  createStyles({
    dialogTitle: {
      margin: 0,
      padding: '10px'
    },
  
    dialogCloseButton: {
      position: 'absolute',
      right: '10px',
      top: '10px',
      zIndex: 2000
    },
  
    dialogContent: {
      paddingBottom: '40px'
    }
  }),
);

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
    const classes = this.props.classes

    return (
      <Dialog
        open={isOpened}
        onClose={this.handleClose}
        aria-labelledby="xr-dialog"
        >
        <DialogTitle disableTypography className={classes.dialogTitle}>
          <Typography variant="h6">{(content && content.title) ?? ''}</Typography>
            <IconButton aria-label="close" className={classes.dialogCloseButton} onClick={this.handleClose}>
              <CloseIcon />
            </IconButton>
        </DialogTitle>

        <DialogContent className={classes.dialogContent}>
          {content && content.children}
        </DialogContent>
      </Dialog>
    )
  }
}

const DialogWraper = (props: any) => {
  const classes = useStyles()
  return <XDialog {...props} classes={classes}/>
}

export default connect(mapStateToProps, mapDispatchToProps)(DialogWraper)
