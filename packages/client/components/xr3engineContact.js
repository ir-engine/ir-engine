import React, { Component} from 'react'
import emailjs from 'emailjs-com'
import styles from './Contact.module.css'

export default class xr3ngineContact extends Component{

    state={
        userName:  "",
        emailAddress:   "",
        companyName:    "",
        message:        ""
    }

    handleSubmit = (e) => {
        e.preventDefault()

        var templateParams = {
            from_name:  this.state.userName,
            to_name:    'Administrator',
            company:    this.state.companyName,
            email:      this.state.emailAddress,
            message:    this.state.message
        };

        console.log(process.env.EMAILJS_SERVICE_ID, 
            process.env.EMAILJS_TEMPLATE_ID, 
            templateParams, 
            process.env.EMAILJS_USER_ID);
        

        emailjs.send(
            process.env.EMAILJS_SERVICE_ID, 
            process.env.EMAILJS_TEMPLATE_ID, 
            templateParams, 
            process.env.EMAILJS_USER_ID
        ).then(
            result => {
                alert('Message Sent, I\'ll get back to you shortly', result.text);
            },
            error => {
                alert( 'An error occured, Plese try again',error.text);
            }
        )

        this.setState({
            userName:       "",
            emailAddress:   "",
            companyName:    "",
            message:        ""
        })
    }

    handleChange=(e)=>{
        var name = e.target.name;
        var value = e.target.value;
        this.setState({
            [name]: value
        })
    }
    
    render(){
        return (
                    <div className={styles.emailDiv}>
                        <p className={styles.emailTitle}>Get In Touch!</p>
                        <p className={styles.emailDetail}>
                            We’d love to help you with your virtual events, digital retail, entertainment and other needs.
                        </p>
                        <div className="row">
                            <input type="text" className={styles.emailInput} value={this.state.userName} name="userName" onChange={this.handleChange} placeholder="Name"/>
                        </div>
                        <div className="row mt-4">
                            <input type="text" className={styles.emailInput} value={this.state.emailAddress} name="emailAddress" onChange={this.handleChange} placeholder="Email"/>
                        </div>
                        <div className="row mt-4">
                            <input type="text" className={styles.emailInput} value={this.state.companyName} name="companyName" onChange={this.handleChange} placeholder="Company"/>
                        </div>
                        <div className="row mt-4">
                            <textarea type="text" className={styles.emailInput} rows="5" placeholder="Describe your Project" 
                            value={this.state.message} name="message" onChange={this.handleChange}/>
                        </div>
                        <div className="row mt-3">
                            <button className="button email-button" type="button" onClick={this.handleSubmit}>Send</button>
                        </div>
                    </div>
        )
    }
}