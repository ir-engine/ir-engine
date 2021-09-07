import React, { Suspense } from 'react'
import { Dispatch } from 'redux'
import { connect } from 'react-redux'

/**
 * Exporting component by dynamicaly loaded component.
 */
const CreateProjectPage = React.lazy(() => import('@xrengine/editor/src/components/projects/CreateProjectPage'))

/**
 * Declaring Props interface having two props.
 *@authState can be of any type.
 *@doLoginAuto can be of type doLoginAuto component.
 *
 */
interface Props {}

/**
 *Function component providing authState on the basis of state.
 */

const mapStateToProps = (state: any): any => {
  return {}
}

/**
 *Function component providing doAutoLogin on the basis of dispatch.
 */
const mapDispatchToProps = (dispatch: Dispatch): any => ({})

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

export default connect(mapStateToProps, mapDispatchToProps)(CreatePage)
