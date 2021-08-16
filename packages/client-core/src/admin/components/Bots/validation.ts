import * as yup from 'yup'

export const commondValidation = yup.object({
  name: yup.string().required(),
  description: yup.string().required()
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
