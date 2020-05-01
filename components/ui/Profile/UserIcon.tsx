import React from 'react'
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Button from '@material-ui/core/Button';
import './style.scss'
import { uploadFile } from '../../../redux/video/service'
import { bindActionCreators, Dispatch } from 'redux'
import { connect } from 'react-redux'

interface profileProps {
  uploadFile: typeof uploadFile
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
  uploadFile: bindActionCreators(uploadFile, dispatch)
})

const UserProfile: React.FC<profileProps> = (props) => {

    const [file,setFile] = React.useState('')
    const handleChange = (e:any) =>{
      let efile = e.target.files[0]
      let formData = new FormData()
      formData.append('file',efile,efile.type)
      let file = efile
       setFile(file)
      }

    const handleSubmit = async () => {
      let data = new FormData();
      data.append('file',file)
        data.append('name', 'User avatar')
      console.log(data,"datatata")
      await props.uploadFile(data)
    }
    return (
        <div className="uploadform">
        <label htmlFor="fileInput">
           
        {file ? <img
          src={URL.createObjectURL(file)}
          className="rounded mx-auto d-block"
          width="200px"
          height="150px"
        />: <AccountCircleIcon style={{fontSize:150}}/>}
        
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
      </div>
    )
}

export default connect(null, mapDispatchToProps)(UserProfile);