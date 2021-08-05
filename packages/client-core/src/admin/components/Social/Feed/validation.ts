import * as yup from 'yup'

export const mediaValidationSchema = yup.object({
  title: yup.string().required('Title is required'),
  type: yup.string().required('Type is required!')
})

export const formValid = (rest, formErrors) => {
  let valid = true

  // validate form errors being empty
  Object.values(formErrors).forEach((val) => {
    val.length > 0 && (valid = false)
  })

  // validate the form was filled out
  Object.values(rest).forEach((val) => {
    val === null && (valid = false)
  })

  return valid
}
