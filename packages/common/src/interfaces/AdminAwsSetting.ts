export interface AdminAwsSetting {
  id: string
  keys?: Keys
  route53?: Route53
  s3?: S3
  cloudfront?: CloudFront
  sms?: Sms
  createdAt: string
  updatedAt: string
}

interface Keys {
  accessKeyId: string
  secretAccessKey: string
}

interface Route53 {
  hostedZoneId: string
  keys: Route53Keys
}

interface Route53Keys {
  accessKeyId: string
  secretAccessKey: string
}

interface S3 {
  baseUrl: string
  staticResourceBucket: string
  region: string
  avatarDir: string
  s3DevMode: string
}

interface CloudFront {
  domain: string
  distributionId: string
}

interface Sms {
  accessKeyId: string
  applicationId: string
  region: string
  senderId: string
  secretAccessKey: string
}
