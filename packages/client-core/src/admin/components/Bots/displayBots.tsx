import React from 'react'
import Accordion from '@material-ui/core/Accordion'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import Typography from '@material-ui/core/Typography'
import ExpandMoreIcon from '@material-ui/icons/ExpandMore'
import { useStylesForBots as useStyles } from './styles'
import List from '@material-ui/core/List'
import ListItem from '@material-ui/core/ListItem'
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction'
import ListItemText from '@material-ui/core/ListItemText'
import IconButton from '@material-ui/core/IconButton'
import DeleteIcon from '@material-ui/icons/Delete'
import Paper from '@material-ui/core/Paper'
import InputBase from '@material-ui/core/InputBase'
import Grid from '@material-ui/core/Grid'
import { Edit } from '@material-ui/icons'
import { fetchBotAsAdmin } from '../../reducers/admin/bots/service'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'
import { selectAdminBotsState } from '../../reducers/admin/bots/selector'
import { selectAuthState } from '../../../user/reducers/auth/selector'
import Button from '@material-ui/core/Button'
import { createBotCammand, removeBots, removeBotsCommand } from '../../reducers/admin/bots/service'
import MuiAlert from '@material-ui/lab/Alert'
import Snackbar from '@material-ui/core/Snackbar'
import UpdateBot from './updateBot'

interface Props {
  fetchBotAsAdmin?: any
  botsAdminState?: any
  authState?: any
  createBotCammand?: any
  removeBots?: any
  removeBotsCommand?: any
}

const mapStateToProps = (state: any): any => {
  return {
    botsAdminState: selectAdminBotsState(state),
    authState: selectAuthState(state)
  }
}

const mapDispatchToProps = (dispatch: Dispatch): any => ({
  fetchBotAsAdmin: bindActionCreators(fetchBotAsAdmin, dispatch),
  createBotCammand: bindActionCreators(createBotCammand, dispatch),
  removeBots: bindActionCreators(removeBots, dispatch),
  removeBotsCommand: bindActionCreators(removeBotsCommand, dispatch)
})

const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const DisplayBots = (props: Props) => {
  const { fetchBotAsAdmin, botsAdminState, authState, createBotCammand, removeBots, removeBotsCommand } = props
  const classes = useStyles()
  const [expanded, setExpanded] = React.useState<string | false>('panel0')
  const [name, setName] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [openModel, setOpenModel] = React.useState(false)
  const [bot, setBot] = React.useState('')

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }

  const botAdmin = botsAdminState.get('bots')
  const user = authState.get('user')
  const botAdminData = botAdmin.get('bots')
  React.useEffect(() => {
    if (user.id && botAdmin.get('updateNeeded')) {
      fetchBotAsAdmin()
    }
  }, [botAdmin, user])

  const handleOpenModel = (bot) => {
    setBot(bot)
    setOpenModel(true)
  }

  const handleCloseModel = () => {
    setOpenModel(false)
  }

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setOpen(false)
  }

  const sudmitCommandBot = (id: string) => {
    const data = {
      name: name,
      description: description,
      botId: id
    }
    createBotCammand(data)
    setName('')
    setDescription('')
  }

  return (
    <div className={classes.rootRigt}>
      {botAdminData.map((bot, index) => {
        return (
          <Accordion expanded={expanded === `panel${index}`} onChange={handleChange(`panel${index}`)} key={bot.id}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}bh-content`}
              id={`panel${index}bh-header`}
              className={classes.summary}
            >
              <Typography className={classes.heading}>{bot.name}</Typography>
              <Typography className={classes.secondaryHeading}>{bot?.description}</Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <div style={{ width: '100%' }}>
                <Grid container spacing={5}>
                  <Grid item xs={8}>
                    <Grid container spacing={5}>
                      <Grid item xs={4}>
                        <Typography className={classes.thirdHeadding} component="h1">
                          Location:
                        </Typography>
                        <Typography className={classes.thirdHeadding} component="h1">
                          Instance:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography className={classes.secondaryHeading} style={{ marginTop: '15px' }} component="h1">
                          {bot?.location?.name}
                        </Typography>
                        <Typography className={classes.secondaryHeading} style={{ marginTop: '15px' }} component="h1">
                          {bot?.instance?.ipAddress}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={4} style={{ display: 'flex' }}>
                    <div style={{ marginLeft: 'auto' }}>
                      <IconButton onClick={() => handleOpenModel(bot)}>
                        <Edit style={{ color: '#fff' }} />
                      </IconButton>
                      <IconButton onClick={() => removeBots(bot.id)}>
                        <DeleteIcon style={{ color: '#fff' }} />
                      </IconButton>
                    </div>
                  </Grid>
                </Grid>

                <Typography
                  className={classes.secondaryHeading}
                  style={{ marginTop: '25px', marginBottom: '10px' }}
                  component="h1"
                >
                  Add more command
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <label>Command</label>
                    <Paper component="div" className={classes.createInput}>
                      <InputBase
                        className={classes.input}
                        placeholder="Enter command"
                        style={{ color: '#fff' }}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={8}>
                    <label>Description</label>
                    <Paper component="div" className={classes.createInput}>
                      <InputBase
                        className={classes.input}
                        placeholder="Enter description"
                        style={{ color: '#fff' }}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                    </Paper>
                  </Grid>
                </Grid>

                <Button
                  variant="contained"
                  fullWidth={true}
                  style={{ color: '#fff', background: '#3a4149', marginBottom: '20px' }}
                  onClick={() => {
                    if (name) {
                      sudmitCommandBot(bot.id)
                    } else {
                      setOpen(true)
                    }
                  }}
                >
                  Add command
                </Button>
                {bot.botCommands.map((el, i) => {
                  return (
                    <div className={classes.alterContainer} key={i}>
                      <List dense={true}>
                        <ListItem>
                          <ListItemText primary={`/${el.name} --> ${el.description} `} />
                          <ListItemSecondaryAction>
                            <IconButton edge="end" aria-label="delete" onClick={() => removeBotsCommand(el.id)}>
                              <DeleteIcon style={{ color: '#fff' }} />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      </List>
                    </div>
                  )
                })}
              </div>
            </AccordionDetails>
          </Accordion>
        )
      })}
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleClose} severity="warning">
          {' '}
          Fill in command is requiired!
        </Alert>
      </Snackbar>
      <UpdateBot open={openModel} handleClose={handleCloseModel} bot={bot} />
    </div>
  )
}

export default connect(mapStateToProps, mapDispatchToProps)(DisplayBots)
