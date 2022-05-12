import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AdminBot, BotCommands, CreateBotCammand } from '@xrengine/common/src/interfaces/AdminBot'

import { Edit } from '@mui/icons-material'
import DeleteIcon from '@mui/icons-material/Delete'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { useAuthState } from '../../../user/services/AuthService'
import AddCommand from '../../common/AddCommand'
import AlertMessage from '../../common/AlertMessage'
import ConfirmModal from '../../common/ConfirmModal'
import { BotCommandService, useBotCommandState } from '../../services/BotsCommand'
import { BotService, useBotState } from '../../services/BotsService'
import styles from '../../styles/admin.module.scss'
import UpdateBot from './UpdateBot'

const DisplayBots = () => {
  const [expanded, setExpanded] = useState<string | false>('panel0')
  const [command, setCommand] = useState<BotCommands>({
    name: '',
    description: ''
  })
  const [open, setOpen] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [bot, setBot] = useState<AdminBot>()
  const [popConfirmOpen, setPopConfirmOpen] = useState(false)
  const [botName, setBotName] = useState('')
  const [botId, setBotId] = useState('')

  const handleChangeCommand = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setCommand({ ...command, [name]: value })
  }

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }
  const botAdmin = useBotState()
  const botCommand = useBotCommandState()
  const user = useAuthState().user
  const botAdminData = botAdmin.bots
  const { t } = useTranslation()

  useEffect(() => {
    if (user.id.value && botAdmin.updateNeeded.value) {
      BotService.fetchBotAsAdmin()
    }
  }, [botAdmin.updateNeeded.value, user?.id?.value])

  const handleOpenModal = (bot) => {
    setBot(bot)
    setOpenModal(true)
  }

  const handleCloseModal = () => {
    setOpenModal(false)
  }

  const handleCloseConfirmModal = () => {
    setPopConfirmOpen(false)
  }

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return
    }

    setOpen(false)
  }

  const submitCommandBot = (id: string) => {
    const data: CreateBotCammand = {
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
    <div className={styles.botRootRight}>
      {botAdminData.value.map((bot, index) => {
        return (
          <Accordion expanded={expanded === `panel${index}`} onChange={handleChange(`panel${index}`)} key={bot.id}>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}bh-content`}
              id={`panel${index}bh-header`}
              className={styles.summary}
            >
              <Typography className={styles.heading}>{bot.name}</Typography>
              <Typography className={styles.secondaryHeading}>{bot?.description}</Typography>
            </AccordionSummary>
            <AccordionDetails className={styles.botDetails}>
              <div style={{ width: '100%' }}>
                <Grid container spacing={5}>
                  <Grid item xs={8}>
                    <Grid container spacing={5}>
                      <Grid item xs={4}>
                        <Typography className={styles.thirdHeading} component="h1">
                          {t('admin:components.bot.location')}:
                        </Typography>
                        <Typography className={styles.thirdHeading} component="h1">
                          {t('admin:components.bot.instance')}:
                        </Typography>
                      </Grid>
                      <Grid item xs={8}>
                        <Typography className={styles.secondaryHeading} style={{ marginTop: '15px' }} component="h1">
                          {bot?.location?.name}
                        </Typography>
                        <Typography className={styles.secondaryHeading} style={{ marginTop: '15px' }} component="h1">
                          {bot?.instance?.ipAddress}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={4} style={{ display: 'flex' }}>
                    <div style={{ marginLeft: 'auto' }}>
                      <IconButton onClick={() => handleOpenModal(bot)} size="large">
                        <Edit style={{ color: 'var(--iconButtonColor)' }} />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setPopConfirmOpen(true)
                          setBotId(bot.id)
                          setBotName(bot.name)
                        }}
                        size="large"
                      >
                        <DeleteIcon style={{ color: 'var(--iconButtonColor)' }} />
                      </IconButton>
                    </div>
                  </Grid>
                </Grid>

                <Typography
                  className={styles.secondaryHeading}
                  style={{ marginTop: '25px', marginBottom: '10px' }}
                  component="h1"
                >
                  {t('admin:components.bot.addMoreCommand')}
                </Typography>

                <AddCommand
                  command={command}
                  handleChangeCommand={handleChangeCommand}
                  addCommandData={() => addCommand(bot.id)}
                  commandData={bot.botCommands ?? []}
                  removeCommand={removeCommand}
                />
              </div>
            </AccordionDetails>
          </Accordion>
        )
      })}

      <AlertMessage
        open={open}
        handleClose={handleClose}
        severity="warning"
        message={t('admin:components.bot.commandRequired')}
      />

      <UpdateBot open={openModal} handleClose={handleCloseModal} bot={bot} />

      <ConfirmModal
        popConfirmOpen={popConfirmOpen}
        handleCloseModal={handleCloseConfirmModal}
        submit={submitRemoveBot}
        name={botName}
        label={'bot'}
      />
    </div>
  )
}

export default DisplayBots
