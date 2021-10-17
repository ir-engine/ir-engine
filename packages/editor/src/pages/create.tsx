import React, { Suspense } from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'

/**
 * Exporting component by dynamicaly loaded component.
 */
const CreateProjectPage = React.lazy(() => import('../components/projects old/CreateProjectPage'))

/**
 * Declaring Props interface having two props.
 *@authState can be of any type.
 *@doLoginAuto can be of type doLoginAuto component.
 *
 */
interface Props {}

/**
 * Function component providing project editor view.
 */
const CreatePage = (props: Props) => {
  return (
    <Suspense fallback={React.Fragment}>
      <CreateProjectPage />
    </Suspense>
  )
}

export default CreatePage
