import React from 'react'

import { Edit } from '@mui/icons-material'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import MuiAlert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Typography from '@mui/material/Typography'

import { useDispatch } from '../../../store'
import { useAuthState } from '../../../user/services/AuthService'
import { BotCommandService } from '../../services/BotsCommand'
import { useBotCommandState } from '../../services/BotsCommand'
import { BotService } from '../../services/BotsService'
import { useBotState } from '../../services/BotsService'
import { useStylesForBots as useStyles } from './styles'
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
  const botAdmin = botsAdminState
  const botCommand = useBotCommandState()
  const user = useAuthState().user
  const botAdminData = botAdmin.bots

  React.useEffect(() => {
    if (user.id.value && botAdmin.updateNeeded.value) {
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
    BotCommandService.createBotCammand(data)
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
                      <IconButton onClick={() => handleOpenModel(bot)} size="large">
                        <Edit style={{ color: '#fff' }} />
                      </IconButton>
                      <IconButton onClick={() => BotService.removeBots(bot.id)} size="large">
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
                              onClick={() => BotCommandService.removeBotsCommand(el.id)}
                              size="large"
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
