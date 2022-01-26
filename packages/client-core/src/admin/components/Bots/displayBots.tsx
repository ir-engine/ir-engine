import React, { useState, useEffect } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Typography from '@mui/material/Typography'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import IconButton from '@mui/material/IconButton'
import DeleteIcon from '@mui/icons-material/Delete'
import Grid from '@mui/material/Grid'
import { Edit } from '@mui/icons-material'
import { BotService } from '../../services/BotsService'
import { BotCommandService } from '../../services/BotsCommand'
import { useDispatch } from '../../../store'
import { useBotState } from '../../services/BotsService'
import { useBotCommandState } from '../../services/BotsCommand'
import { useAuthState } from '../../../user/services/AuthService'
import UpdateBot from './updateBot'
import ConfirmModel from '../../common/ConfirmModel'
import { useStyles } from '../../styles/ui'
import AlertMessage from '../../common/AlertMessage'
import AddCommand from '../../common/AddCommand'

interface Props {}

const DisplayBots = (props: Props) => {
  const dispatch = useDispatch()
  const classes = useStyles()
  const [expanded, setExpanded] = useState<string | false>('panel0')
  const [command, setCommand] = useState({
    name: '',
    description: ''
  })
  const [open, setOpen] = useState(false)
  const [openModel, setOpenModel] = useState(false)
  const [bot, setBot] = useState('')
  const [popConfirmOpen, setPopConfirmOpen] = useState(false)
  const [botName, setBotName] = useState('')
  const [botId, setBotId] = useState('')

  const handleChangeCommand = (e) => {
    const { name, value } = e.target
    setCommand({ ...command, [name]: value })
  }

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }
  const botsAdminState = useBotState()
  const botAdmin = botsAdminState
  const botCommand = useBotCommandState()
  const user = useAuthState().user
  const botAdminData = botAdmin.bots

  useEffect(() => {
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

  const handleCloseConfirmModel = () => {
    setPopConfirmOpen(false)
  }

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const submitCommandBot = (id: string) => {
    const data = {
      name: command.name,
      description: command.description,
      botId: id
    }
    BotCommandService.createBotCammand(data)
    setCommand({
      name: '',
      description: ''
    })
  }

  const submitRemoveBot = async () => {
    await BotService.removeBots(botId)
    setPopConfirmOpen(false)
  }

  const botRefresh = async () => {
    if (botCommand.updateNeeded.value) await BotService.fetchBotAsAdmin()
  }

  const removeCommand = async (id) => {
    await BotCommandService.removeBotsCommand(id)
    botRefresh()
  }

  const addCommand = (id) => {
    if (command.name) {
      submitCommandBot(id)
      botRefresh()
    } else {
      setOpen(true)
    }
  }

  return (
    <div className={classes.botRootRight}>
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
            <AccordionDetails className={classes.botDetails}>
              <div style={{ width: '100%' }}>
                <Grid container spacing={5}>
                  <Grid item xs={8}>
                    <Grid container spacing={5}>
                      <Grid item xs={4}>
                        <Typography className={classes.thirdHeading} component="h1">
                          Location:
                        </Typography>
                        <Typography className={classes.thirdHeading} component="h1">
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
                      <IconButton
                        onClick={() => {
                          setPopConfirmOpen(true)
                          setBotId(bot.id)
                          setBotName(bot.name)
                        }}
                        size="large"
                      >
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

                <AddCommand
                  command={command}
                  handleChangeCommand={handleChangeCommand}
                  addCommandData={() => addCommand(bot.id)}
                  commandData={bot.botCommands}
                  removeCommand={removeCommand}
                />
              </div>
            </AccordionDetails>
          </Accordion>
        )
      })}

      <AlertMessage open={open} handleClose={handleClose} severity="warning" message="Fill in command is required!" />

      <UpdateBot open={openModel} handleClose={handleCloseModel} bot={bot} />

      <ConfirmModel
        popConfirmOpen={popConfirmOpen}
        handleCloseModel={handleCloseConfirmModel}
        submit={submitRemoveBot}
        name={botName}
        label={'bot'}
      />
    </div>
  )
}

export default DisplayBots
