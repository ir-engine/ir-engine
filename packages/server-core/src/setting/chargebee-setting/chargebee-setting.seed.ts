export const chargebeeSeed = {
  path: 'chargebee-setting',
  templates: [
    {
      url: process.env.CHARGEBEE_SITE + '.chargebee.com' || 'dummy.not-chargebee.com',
      apiKey: process.env.CHARGEBEE_API_KEY || null
    }
  ]
}
