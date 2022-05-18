import * as yup from 'yup'

export const userValidationSchema = yup.object({
  name: yup.string().required('Name is required'),
  avatar: yup.string().required('Avatar is required!'),
  inviteCode: yup.string().required('Invite code is required!')
})

export const validateUserForm = (rest, formErrors) => {
  let valid = true

  // validate form errors being empty
  Object.values<any>(formErrors).forEach((val) => {
    val.length > 0 && (valid = false)
  })

  // validate the form was filled out
  Object.values(rest).forEach((val) => {
    val === null && (valid = false)
  })

  return valid
}
