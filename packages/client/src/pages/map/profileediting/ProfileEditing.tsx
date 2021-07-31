import React from "react"
import styles from "./Accepted.module.scss"
import Group from "./Group.svg"
import backarrow from "./Backarrow.svg"
import Oval from "./Oval.svg"
import Microphonee from "./Microphonee.svg"
import Username from "./UserName.svg"
import Groupp from "./Groupp.svg"
import Avatarselection from "./AvatarSelection.svg"
import Glasss from  "./Glasss.svg"
import Widgget from "./Widgget.svg"



const ProfileEditing = () =>{
    return (
        <div className={styles.editgroup}>
            <section>
                <div className={styles.groupicon}>
                  <img src={backarrow} alt="backarrow"></img>
                  <img src={Group} alt="group"></img>
                </div>
            </section>
            <section className={styles.profileusers}>
                <div>
                <img className={styles.avatar} src={Oval} alt="oval"></img>
                <img className={styles.btnmark}src={Microphonee} alt="Microphonee"></img>
                </div>

                <div>
                <img src={Username} alt="username"></img>
                </div>

                <div>             
                 <img src={Avatarselection} alt="avatarselection"></img>
                </div>

                <div>
                <input className={styles.btninput} placeholder="Where would you like to go?"/>
                 <img className={styles.iconsearch}src={Groupp} alt="groupp"></img>
                </div>
                
                <div className={styles.map}>
                <img src={Glasss} alt="glasss"></img>
                <img  className={styles.widget}src={Widgget} alt="widgget"></img>
                </div>
            </section>
        </div>
    )
}

export default ProfileEditing