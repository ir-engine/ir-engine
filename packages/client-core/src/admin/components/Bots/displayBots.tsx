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
import { BotService } from '../../state/BotsService'
import { useDispatch } from '../../../store'
import { useBotState } from '../../state/BotsState'
import { useAuthState } from '../../../user/state/AuthState'
import Button from '@material-ui/core/Button'
import MuiAlert from '@material-ui/lab/Alert'
import Snackbar from '@material-ui/core/Snackbar'
import UpdateBot from './updateBot'

interface Props {}

const Alert = (props) => {
  return <MuiAlert elevation={6} variant="filled" {...props} />
}

const DisplayBots = (props: Props) => {
  const dispatch = useDispatch()
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
  const botsAdminState = useBotState()
  const botAdmin = botsAdminState.bots
  const user = useAuthState().user
  const botAdminData = botAdmin.bots
  React.useEffect(() => {
    if (user.id.value && botAdmin.updateNeeded) {
      BotService.fetchBotAsAdmin()
    }
  }, [botAdmin.updateNeeded.value, user?.id?.value])

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

  const submitCommandBot = (id: string) => {
    const data = {
      name: name,
      description: description,
      botId: id
    }
    BotService.createBotCammand(data)
    setName('')
    setDescription('')
  }

  return (
    <div className={classes.rootRigt}>
      {botAdminData.value.map((bot, index) => {
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
                      <IconButton onClick={() => BotService.removeBots(bot.id)}>
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
                      submitCommandBot(bot.id)
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
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => BotService.removeBotsCommand(el.id)}
                            >
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

export default DisplayBots
