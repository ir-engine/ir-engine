import React from 'react'
import { MoreHoriz } from '@material-ui/icons'
import { useHarmonyStyles } from '../style'

interface Props {
  party: any
  setActiveChat: any
  setShowChat: any
  handleClick: any
}

const Party = (props: Props) => {
  const classes = useHarmonyStyles()
  const { party, setActiveChat, setShowChat, handleClick } = props
  return (
    <>
      {[...party]
        .sort((a, b) => a.createdAt - b.createdAt)
        .map((part) => {
          return (
            <div key={part.id} className={`${classes.dFlex} ${classes.alignCenter} ${classes.my2} ${classes.cpointer}`}>
              <div
                onClick={() => {
                  setShowChat(true), setActiveChat('party', part)
                }}
                className={`${classes.mx2} ${classes.flexGrow2}`}
              >
                <h4 className={classes.fontBig}>{part.name}</h4>
                <small className={classes.textMuted}>Party id: </small>
                <small className={classes.textMuted}>{part.instance?.ipAddress}</small>
              </div>

              <div>
                <a href="#" className={classes.border0} onClick={handleClick}>
                  <MoreHoriz />
                </a>
              </div>
            </div>
          )
        })}
    </>
  )
}

export default Party
