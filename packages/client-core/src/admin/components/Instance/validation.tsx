import * as yup from 'yup'

export const instanceValidationSchema = yup.object({
  currentUsers: yup.number().required('Current users is required'),
  ipAddress: yup
    .string()
    .required('Ip Address is required!')
    .matches(
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
      'Ip Address is not valid'
    )
})
