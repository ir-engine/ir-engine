import React from 'react'
import AccountCircleIcon from '@material-ui/icons/AccountCircle'
import Button from '@material-ui/core/Button'
import './style.scss'
import { uploadFile } from '../../../redux/video/service'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

interface ProfileProps {
  avatar: any
  uploadFile: typeof uploadFile
}

// const mapStateToProps = (state: any) => {
//   return {
//     auth: selectAuthState(state)
//   }
// }

const mapDispatchToProps = (dispatch: Dispatch) => ({
  uploadFile: bindActionCreators(uploadFile, dispatch)
})

const UserProfile: React.FC<ProfileProps> = (props: ProfileProps) => {
  const [file, setFile] = React.useState({})
  const [fileUrl, setFileUrl] = React.useState('')
  const handleChange = (e: any) => {
    const efile = e.target.files[0]
    const formData = new FormData()
    formData.append('file', efile, efile.type)
    formData.append('name', efile.name)

    const file = formData

    setFile(file)
    setFileUrl(efile)
  }

  const handleSubmit = async () => {
    await props.uploadFile(file)
  }
  return (
    <div className="uploadform">
      {props.avatar ? (
        <img
          src={URL.createObjectURL(fileUrl)}
          className="rounded mx-auto d-block"
          width="200px"
          height="150px"
        />
      ) : (
        <>
          <label htmlFor="fileInput">
            {fileUrl ? (
              <img
                src={URL.createObjectURL(fileUrl)}
                className="rounded mx-auto d-block"
                width="200px"
                height="150px"
              />
            ) : (
              <AccountCircleIcon style={{ fontSize: 150 }} />
            )}
          </label>
          <input
            id="fileInput"
            name="file"
            placeholder="Upload Product Image"
            type="file"
            className="signup__fileField"
            onChange={handleChange}
          />
          <Button variant="contained" color="primary" onClick={handleSubmit}>
            Upload Avatar
          </Button>
        </>
      )}
    </div>
  )
}

export default connect(null, mapDispatchToProps)(UserProfile)
