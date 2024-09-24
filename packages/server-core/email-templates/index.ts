import appRootPath from 'app-root-path'
import * as path from 'path'

const accountTemplateFolder = path.join(appRootPath.path, 'packages', 'server-core', 'email-templates', 'account')
const inviteTemplateFolder = path.join(appRootPath.path, 'packages', 'server-core', 'email-templates', 'invite')

export interface EmailTemplate {
  path: string
  defaultVars?: Record<string, any>
}

const templates: Record<string, EmailTemplate> = {
  //account
  ['magiclink-email']: {
    path: path.join(accountTemplateFolder, 'magiclink-email.pug')
  },
  ['magiclink-sms']: {
    path: path.join(accountTemplateFolder, 'magiclink-sms.pug')
  },
  //invite
  ['magiclink-email-invite-friend']: {
    path: path.join(inviteTemplateFolder, 'magiclink-email-invite-friend.pug')
  },
  ['magiclink-email-invite-group']: {
    path: path.join(inviteTemplateFolder, 'magiclink-email-invite-group.pug')
  },
  ['magiclink-email-invite-instance']: {
    path: path.join(inviteTemplateFolder, 'magiclink-email-invite-instance.pug')
  },
  ['magiclink-email-invite-location']: {
    path: path.join(inviteTemplateFolder, 'magiclink-email-invite-location.pug')
  },
  ['magiclink-email-invite-new-user']: {
    path: path.join(inviteTemplateFolder, 'magiclink-email-invite-new-user.pug')
  },
  ['magiclink-email-invite-party']: {
    path: path.join(inviteTemplateFolder, 'magiclink-email-invite-party.pug')
  },
  ['magiclink-sms-invite-friend']: {
    path: path.join(inviteTemplateFolder, 'magiclink-sms-invite-friend.pug')
  },
  ['magiclink-sms-invite-group']: {
    path: path.join(inviteTemplateFolder, 'magiclink-sms-invite-group.pug')
  },
  ['magiclink-sms-invite-instance']: {
    path: path.join(inviteTemplateFolder, 'magiclink-sms-invite-instance.pug')
  },
  ['magiclink-sms-invite-location']: {
    path: path.join(inviteTemplateFolder, 'magiclink-sms-invite-location.pug')
  },
  ['magiclink-sms-invite-new-user']: {
    path: path.join(inviteTemplateFolder, 'magiclink-sms-invite-new-user.pug')
  },
  ['magiclink-sms-invite-party']: {
    path: path.join(inviteTemplateFolder, 'magiclink-sms-invite-party.pug')
  }
}

/**
 * A function used to get the template path
 *
 * @param templateName name of the template
 * @returns {string} template path
 */
export const getEmailTemplate = (templateName: string): EmailTemplate => {
  const template = templates[templateName]
  if (!template) {
    throw new Error('Unable to find template')
  }
  return template
}

/**
 * A function used overide an existing template's path
 * or add a new template
 *
 * @param name name of the template
 * @param template new template or template to update
 * @returns {void}
 */
export const setEmailTemplate = (name: string, template: EmailTemplate) => {
  templates[name] = template
}
