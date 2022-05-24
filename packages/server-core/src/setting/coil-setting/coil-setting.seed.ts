export const coilSeed = {
  path: 'coil-setting',
  templates: [
    {
      paymentPointer: process.env.COIL_PAYMENT_POINTER || null,
      clientId: process.env.COIL_API_CLIENT_ID || null,
      clientSecret: process.env.COIL_API_CLIENT_SECRET || null
    }
  ]
}
