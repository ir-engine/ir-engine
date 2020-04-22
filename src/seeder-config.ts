module.exports = {
  services: [
    {
      // TODO: If production, disable
      disabled: false,
      delete: true,
      path: 'user',
      template: {
        userId: '{{internet.userName}}',
        password: '{{internet.password}}',
        email: '{{internet.email}}',
        isVerified: 'true'
      }
    }
  ]
}
