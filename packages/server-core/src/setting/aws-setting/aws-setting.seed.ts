export const awsSeed = {
  path: 'aws-setting',
  templates: [
    {
      keys: JSON.stringify({
        accessKeyId: process.env.STORAGE_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.STORAGE_AWS_ACCESS_KEY_SECRET
      }),
      route53: JSON.stringify({
        hostedZoneId: process.env.ROUTE53_HOSTED_ZONE_ID,
        keys: JSON.stringify({
          accessKeyId: process.env.ROUTE53_ACCESS_KEY_ID,
          secretAccessKey: process.env.ROUTE53_ACCESS_KEY_SECRET
        })
      }),
      s3: JSON.stringify({
        baseUrl: 'https://s3.amazonaws.com',
        staticResourceBucket: process.env.STORAGE_S3_STATIC_RESOURCE_BUCKET,
        region: process.env.STORAGE_S3_REGION,
        avatarDir: process.env.STORAGE_S3_AVATAR_DIRECTORY,
        s3DevMode: process.env.STORAGE_S3_DEV_MODE
      }),
      cloudfront: JSON.stringify({
        domain: process.env.STORAGE_CLOUDFRONT_DOMAIN,
        distributionId: process.env.STORAGE_CLOUDFRONT_DISTRIBUTION_ID
      }),
      sms: JSON.stringify({
        accessKeyId: process.env.AWS_SMS_ACCESS_KEY_ID,
        applicationId: process.env.AWS_SMS_APPLICATION_ID,
        region: process.env.AWS_SMS_REGION,
        senderId: process.env.AWS_SMS_SENDER_ID,
        secretAccessKey: process.env.AWS_SMS_SECRET_ACCESS_KEY
      })
    }
  ]
}
