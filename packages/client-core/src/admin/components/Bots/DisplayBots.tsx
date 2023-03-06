import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmDialog from '@etherealengine/client-core/src/common/components/ConfirmDialog'
import { AdminBot, BotCommands, CreateBotCammand } from '@etherealengine/common/src/interfaces/AdminBot'
import Accordion from '@etherealengine/ui/src/Accordion'
import AccordionDetails from '@etherealengine/ui/src/AccordionDetails'
import AccordionSummary from '@etherealengine/ui/src/AccordionSummary'
import Grid from '@etherealengine/ui/src/Grid'
import Icon from '@etherealengine/ui/src/Icon'
import IconButton from '@etherealengine/ui/src/IconButton'
import Typography from '@etherealengine/ui/src/Typography'

import { NotificationService } from '../../../common/services/NotificationService'
import { useAuthState } from '../../../user/services/AuthService'
import AddCommand from '../../common/AddCommand'
import { AdminBotCommandService, useAdminBotCommandState } from '../../services/BotsCommand'
import { AdminBotService, useAdminBotState } from '../../services/BotsService'
import styles from '../../styles/admin.module.scss'
import UpdateBot from './UpdateBot'

const DisplayBots = () => {
  const [expanded, setExpanded] = useState<string | false>('panel0')
  const [command, setCommand] = useState<BotCommands>({
    name: '',
    description: ''
  })
  const [openUpdateBot, setOpenUpdateBot] = useState(false)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [bot, setBot] = useState<AdminBot>()
  const [botName, setBotName] = useState('')
  const [botId, setBotId] = useState('')

  const handleChangeCommand = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target
    setCommand({ ...command, [name]: value })
  }

  const handleChange = (panel: string) => (event: React.ChangeEvent<{}>, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false)
  }
  const botAdmin = useAdminBotState()
  const botCommand = useAdminBotCommandState()
  const user = useAuthState().user
  const botAdminData = botAdmin.bots
  const { t } = useTranslation()

  useEffect(() => {
    if (user.id.value && botAdmin.updateNeeded.value) {
      AdminBotService.fetchBotAsAdmin()
    }
  }, [botAdmin.updateNeeded.value, user?.id?.value])

  const handleOpenUpdateBot = (bot) => {
    setBot(bot)
    setOpenUpdateBot(true)
  }

  const submitCommandBot = (id: string) => {
    const data: CreateBotCammand = {
      name: command.name,
      description: command.description,
      botId: id
    }
    AdminBotCommandService.createBotCammand(data)
    setCommand({
      name: '',
      description: ''
    })
  }

  const submitRemoveBot = async () => {
    await AdminBotService.removeBots(botId)
    setOpenConfirm(false)
  }

  const botRefresh = async () => {
    if (botCommand.updateNeeded.value) await AdminBotService.fetchBotAsAdmin()
  }

  const removeCommand = async (id) => {
    await AdminBotCommandService.removeBotsCommand(id)
    botRefresh()
  }

  const addCommand = (id) => {
    if (command.name) {
      submitCommandBot(id)
      botRefresh()
    } else {
      NotificationService.dispatchNotify(t('admin:components.bot.commandRequired'), { variant: 'error' })
    }
  }

  return (
    <div className={styles.botRootRight}>
      {botAdminData.value.map((bot, index) => {
        return (
          <Accordion expanded={expanded === `panel${index}`} onChange={handleChange(`panel${index}`)} key={bot.id}>
            <AccordionSummary
              expandIcon={<Icon type="ExpandMore" />}
              aria-controls={`panel${index}bh-content`}
              id={`panel${index}bh-header`}
              className={styles.summary}
            >
              <Typography className={styles.heading}>{bot?.name}</Typography>
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
                      <IconButton
                        onClick={() => handleOpenUpdateBot(bot)}
                        size="large"
                        icon={<Icon type="Edit" style={{ color: 'var(--iconButtonColor)' }} />}
                      />
                      <IconButton
                        onClick={() => {
                          setBotId(bot.id)
                          setBotName(bot.name)
                          setOpenConfirm(true)
                        }}
                        size="large"
                        icon={<Icon type="Delete" style={{ color: 'var(--iconButtonColor)' }} />}
                      />
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

      <UpdateBot open={openUpdateBot} onClose={() => setOpenUpdateBot(false)} bot={bot} />

      <ConfirmDialog
        open={openConfirm}
        description={`${t('admin:components.bot.confirmBotDelete')} '${botName}'?`}
        onClose={() => setOpenConfirm(false)}
        onSubmit={submitRemoveBot}
      />
    </div>
  )
}

export default DisplayBots
