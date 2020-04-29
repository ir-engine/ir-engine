import React from 'react'
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import Button from '@material-ui/core/Button';
import './style.scss'





const UserProfile: React.FC = () => {

    const [file,setFile] = React.useState('')
    const handleChange = (file:any) =>{
       setFile(file)
      }
    return (
        <div className="uploadform">
        <label htmlFor="fileInput">
           
        {file ? <img
          src={file}
          className="rounded mx-auto d-block"
          width="200px"
          height="150px"
        />: <AccountCircleIcon style={{fontSize:150}}/>}
        
      </label>
      <input
        id="fileInput"
        name="product_image"
        placeholder="Upload Product Image"
        type="file"
        className="signup__fileField"
        onChange={handleChange}
      />
      <Button variant="contained" color="primary">
      Upload Avatar
      </Button>
      </div>
    )
}

export default UserProfile;