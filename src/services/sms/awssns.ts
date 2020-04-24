import AWS from 'aws-sdk'

// export function setSmsType() {
//     const aws_region: string = config.get('aws.sns.region')
//     const messageType = "Transactional"

//     const params = {
//         attributes: {
//           'DefaultSMSType': messageType,
//         }
//     };
//     const setSMSTypePromise= new AWS.SNS({
//         apiVersion: '2010-03-31',
//         accessKeyId: config.get('aws.sns.access_key_id') ?? '',
//         secretAccessKey: config.get('aws.sns.secret_access_key') ?? '',
//         region: aws_region
//     }).setSMSAttributes(params).promise()

//     return setSMSTypePromise
//         .then((data: any) => {
//           console.log(data);
//         })
//         .catch((err: any) => {
//           console.error(err, err.stack);
//         })
// }

export async function sendSms (phone: string, text: string): Promise<void> {
  const awsRegion: string = process.env.AWS_SMS_REGION ?? '' // config.get('aws.sns.region')
  const params = {
    Message: text,
    PhoneNumber: phone
    // TopicArn: process.env.AWS_SMS_TOPIC_ARN ?? ''
  }

  // Create promise and SNS service object
  const publishTextPromise = new AWS.SNS({
    apiVersion: '2010-03-31',
    accessKeyId: process.env.AWS_SMS_ACCESS_KEY_ID ?? '', // config.get('aws.sns.access_key_id') ?? '',
    secretAccessKey: process.env.AWS_SMS_SECRET_ACCESS_KEY ?? '', // config.get('aws.sns.secret_access_key') ?? '',
    region: awsRegion
  }).publish(params).promise()

  return await publishTextPromise
    .then((data: any) => {
      console.log(`MessageID is ${data.MessageId as string}`)
    })
    .catch((err: any) => {
      console.error(err, err.stack)
    })
}
