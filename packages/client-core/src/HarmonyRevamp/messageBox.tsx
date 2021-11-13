import * as React from 'react'
import { Avatar, IconButton, Container } from '@mui/material'
import { AttachFile, LocalPhone, PhotoCamera, Send } from '@material-ui/icons'
import { useHarmonyStyles } from './style'
import { styled } from '@mui/material/styles'

const Input = styled('input')({
  display: 'none'
})

const MessageBox: React.FunctionComponent = () => {
  const classes = useHarmonyStyles()

  return (
    <>
      <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.p2}`}>
        <h2>Laura Palmeri</h2>
        <LocalPhone fontSize="small" />
      </div>
      <Container>
        <div className={`${classes.dFlex} ${classes.flexColumn} ${classes.justifyContentBetween} ${classes.h100}`}>
          <div className={`${classes.dFlex} ${classes.flexColumn} ${classes.my2}`}>
            <div className={`${classes.selfStart}`}>
              <div className={classes.dFlex}>
                <Avatar src="./Avatar.png" />
                <div className={`${classes.bgBlack} ${classes.mx2}`}>
                  <p>If you already have the Chrome extension installed, it should autoupdate within the next week. </p>
                </div>
              </div>
            </div>
            <div className={classes.selfEnd}>
              <div className={classes.dFlex}>
                <div className={`${classes.bgInfo} ${classes.mx2}`}>
                  <p>
                    You can also head to chrome://extensions and click “Update extensions now” if you’d like to get the
                    new version today.
                  </p>
                </div>
                <Avatar src="./Avatar.png" />
              </div>
            </div>
          </div>
          <div className={`${classes.dFlex} ${classes.justifyContentBetween} ${classes.alignCenter}`}>
            <label htmlFor="icon-button-file">
              <Input accept="image/*" id="icon-button-file" type="file" />
              <IconButton aria-label="upload picture" component="span">
                <AttachFile className={classes.white} />
              </IconButton>
            </label>
            <div className={classes.flexGrow}>
              <div className={`${classes.dFlex} ${classes.alignCenter}`}>
                <Avatar src="./Avatar.png" />
                <textarea className={classes.formControl} placeholder="Your message"></textarea>
              </div>
            </div>
            <label htmlFor="icon-button-file">
              <Input accept="image/*" id="icon-button-file" type="file" />
              <IconButton aria-label="upload picture" component="span">
                <Send className={classes.white} />
              </IconButton>
            </label>
          </div>
        </div>
      </Container>
    </>
  )
}

export default MessageBox
