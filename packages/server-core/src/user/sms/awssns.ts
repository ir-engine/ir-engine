import { PublishCommand, SNSClient } from '@aws-sdk/client-sns'

import config from '../../appconfig'
import logger from '../../ServerLogger'

const snsClient = new SNSClient(config.aws.sms)

export async function sendSmsWithAWS(phone: string, text: string): Promise<void> {
  const params = {
    Message: text,
    PhoneNumber: phone.length === 10 ? `+1${phone}` : phone
  }

  // Create promise and SNS service object
  const run = async () => {
    try {
      const data = await snsClient.send(new PublishCommand(params))
      logger.info(`MessageID is ${data.MessageId as string}`)
    } catch (err) {
      logger.error(err)
    }
  }
  run()
}
