import React, { forwardRef, useState } from 'react'
import Dialog from '@material-ui/core/Dialog'
import Slide from '@material-ui/core/Slide'
import { TransitionProps } from '@material-ui/core/transitions'
import { useTranslation } from 'react-i18next'

// @ts-ignore
import classes from './TermsandPolicy.module.scss'
import DialogContent from '@material-ui/core/DialogContent/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText/DialogContentText'
import TextField from '@material-ui/core/TextField/TextField'

const Transition = React.forwardRef(
  (props: TransitionProps & { children?: React.ReactElement<any, any> }, ref: React.Ref<unknown>) => {
    return <Slide direction="up" ref={ref} {...props} />
  }
)

export const TermsAndPolicy = () => {
  const [open, setOpen] = useState(true)
  const [openPP, setOpenPP] = useState(false)
  const { t } = useTranslation()
  const [agree, setAgree] = useState(false)
  const [agreePP, setAgreePP] = useState(false)

  const checkboxHandler = () => {
    // if agree === true, it will be set to false
    // if agree === false, it will be set to true
    setAgree(!agree)
    // Don't miss the exclamation mark
  }

  const checkboxHandlerPP = () => {
    // if agree === true, it will be set to false
    // if agree === false, it will be set to true
    setAgreePP(!agreePP)
    // Don't miss the exclamation mark
  }

  // When the button is clicked
  const btnHandler = () => {
    setOpen(false)
    setOpenPP(true)
  }

  const btnHandlerPP = () => {
    setOpenPP(false)
  }

  return (
    <div className={classes.mainBlock}>
      <Dialog
        open={open}
        TransitionComponent={Transition}
        keepMounted
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        className={classes.dialogWindow}
        PaperProps={{
          style: {
            width: '100%',
            maxWidth: '100%',
            height: 'max-content',
            borderRadius: '12px'
          }
        }}
      >
        <DialogContent>
          <DialogContentText>
            AR CREATIVE MEDIA, INC. TERMS OF SERVICE Last updated: June [ ], 2021 These terms of service (the “Terms of
            Service”) are a legal agreement between you and AR Creative Media, Inc. (“AR Creative Media”, “ARC” “we,”
            “us,” or “our”). These Terms of Service specify the terms under which you may access and use our website
            located at arcmedia.us (the “Website”) and our application (the “App,” and together with the Website, the
            “Services”) PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE ACCESSING AND USING THE SERVICES OR ANY
            PORTION THEREOF, BECAUSE BY ACCEPTING THESE TERMS OF SERVICE, USING ANY OF THE SERVICES, OR OTHERWISE
            MANIFESTING YOUR ASSENT TO THESE TERMS OF SERVICE, YOU AGREE TO BE BOUND BY THESE TERMS OF SERVICE AND OUR
            PRIVACY POLICY (THE “PRIVACY POLICY”), TOGETHER WITH THE TERMS OF SERVICE, THE “AGREEMENT”), WHICH IS HEREBY
            INCORPORATED BY REFERENCE. IF YOU DO NOT AGREE TO (OR CANNOT COMPLY WITH) ALL OF THE TERMS OF THESE TERMS OF
            SERVICE, DO NOT ACCESS OR USE THE SERVICES. THE SECTIONS BELOW TITLED “BINDING ARBITRATION” AND “CLASS
            ACTION WAIVER” CONTAIN A BINDING ARBITRATION AGREEMENT, AND CLASS ACTION WAIVER. THEY AFFECT YOUR LEGAL
            RIGHTS. PLEASE READ THEM. If you accept or agree to this Agreement on behalf of a company or other legal
            entity, you represent and warrant that you have the authority to bind that company or other legal entity to
            the Agreement and, in such event, “you” and “your” will refer and apply to that company or other legal
            entity. Capitalized terms not defined in these Terms of Service shall have the meaning set forth in our
            Privacy Policy. 1. OUR SERVICES AND USERS. The Services provide a platform where users (each, a “User”) (i)
            create videos based on content by us, such as the volumetric captures of individuals, software, text,
            graphics, images, sounds, music and other material provided by or on behalf of ARC or its licensors
            (collectively referred to as the “ ARC Content”) and (ii) view such created videos. Our Services have
            several types of users: a. Visitors. Visitors to our Services, as the term implies, are people who do not
            register for an account, but want to explore and watch the videos that are created and stored on the
            Services. No login is required for visitors to the Services. Visitors can access all publicly-available
            content and features of the Services and can contact us using the contact link on either the Website or the
            App. b. Registered Users and Accounts. In order to become a video creator (a “Registered User”) you must
            establish an account with us. ARC is under no obligation to accept any individual or entity as an account
            holder, and may accept or reject any registration in our sole and complete discretion. Visitors and
            Registered Users may sometimes be collectively referred to as Users. To create an account, you or your
            authorized representative will be prompted to insert your email and create a password and perhaps provide
            certain additional information that will assist in authenticating your identity when you log-in in the
            future (collectively “Login Credentials”). You may not transfer your account to anyone else without our
            prior written permission. When creating your account, you must provide true, accurate, current, and complete
            information about yourself. Each email and corresponding password can be used by only one individual. You
            are responsible for maintaining the confidentiality of your account Login Credentials. You are fully
            responsible for all activities that are associated with your account (including, but not limited to, any
            videos created on your account, use of the Services, or communications from your account to other Users or
            ARC). You agree to immediately notify us of any unauthorized use or suspected unauthorized use of your
            account or any other breach of security. 2. USER CONTENT; LICENSES The Service allows Users to create a
            profile (“Profile”). Users will be permitted to post or upload the original videos they create integrating
            the ARC Content (collectively, “User Content”) onto their Profiles. YOU, AND NOT ARC, ARE ENTIRELY
            RESPONSIBLE FOR ALL YOUR USER CONTENT THAT YOU UPLOAD, POST, E-MAIL, OR OTHERWISE TRANSMIT. You expressly
            acknowledge and agree that once you submit your User Content for inclusion into the Services, there is no
            confidentiality or privacy with respect to such User Content, including, without limitation, any personally
            identifying information that you may make available. We are not obligated to publish any User Content, and
            we reserve the right to remove any User Content at any time in our sole discretion, with or without notice.
            You retain all copyrights and other intellectual property rights in and to your own User Content. You do,
            however, hereby grant us and our sub-licensees an exclusive, royalty-free, freely sub-licensable, perpetual,
            irrevocable license to modify, compile, combine with other content, copy, record, synchronize, transmit,
            translate, format, distribute, publicly display, publicly perform, and otherwise use or exploit (including
            for profit) your User Content and all intellectual property and moral rights therein throughout the
            universe, in each case, by or in any means, methods, media, or technology now known or hereafter devised. 3.
            INTELLECTUAL PROPERTY. The Services are protected by copyright, trademark, and other laws of the United
            States and foreign countries. Except as expressly provided in this Agreement, ARC and our licensors
            exclusively own all right, title, and interest in and to the Services, including all associated intellectual
            property rights. You will not remove, alter, or obscure any copyright, trademark, service mark, or other
            proprietary rights notices incorporated in or accompanying the Services. The ARC Content may be owned by us
            or third parties. The ARC Content is protected under both United States and foreign laws. Unauthorized use
            of the ARC Content may violate copyright, trademark, and other laws. We and our licensors retain all right,
            title, and interest, including all intellectual property rights, in and to the ARC Content. You must retain
            all copyright and other proprietary notices contained in the original ARC Content. You may not sell,
            transfer, assign, license or sublicense the ARC Content. You may post or upload the original video you
            create to all manner of social media and video platforms. You are permitted to use the ARC Content solely in
            connection with the creation of the User Content. The trademarks, service marks, and logos of ARC (the “ARC
            Trademarks”) used and displayed on the Services together with the ARC Content are registered and
            unregistered trademarks or service marks of ARC. Other company, product, and service names located on the
            Services and the ARC Content may be trademarks or service marks owned by third parties (the “Third-Party
            Trademarks,” and, collectively with ARC Trademarks, the “Trademarks”). Nothing on the Services should be
            construed as granting, by implication, estoppel, or otherwise, any license or right to use the Trademarks,
            without our prior written permission specific for each such use. Elements of the Services and ARC Content
            are protected by trade dress, trademark, unfair competition, and other state and federal laws and may not be
            copied or imitated in whole or in part, by any means, including, but not limited to, the use of framing or
            mirrors. 4. FEEDBACK. As a registered User of our App, you may elect to provide us with feedback, comments,
            and suggestions with respect to our Services (“Feedback”). You agree that ARC will be free to use,
            reproduce, disclose, and otherwise exploit any and all such Feedback without compensation or attribution to
            you. 5. COMMUNITY GUIDELINES. The Services are available only to individuals aged 13 years or older. If you
            are 13 or older, but under the age of majority in your jurisdiction, you should review this Agreement with
            your parent or guardian to make sure that you and your parent or guardian understand it. If you are under
            the age of 13, you may use the Services only with the consent of your parent or guardian. Subject to the
            terms and conditions of this Agreement, ARC grants you a limited, non-transferable, non-exclusive, license
            to access and use the Services and the ARC Content solely for your personal purposes. ARC may terminate this
            license at any time for any reason. Further, when using or accessing the Services, you agree that: • You
            will not upload, post, e-mail, transmit, or otherwise make available any User Content that: ◦ infringes any
            copyright, trademark, right of publicity, or other proprietary rights of any person or entity; or ◦ is
            defamatory, libelous, indecent, obscene, pornographic, sexually explicit, invasive of another’s privacy,
            promotes violence or illegal activity, or contains hate speech (i.e., speech that attacks or demeans a group
            based on race or ethnic origin, religion, disability, gender, age, veteran status, and/or sexual
            orientation/gender identity); or ◦ discloses any sensitive information about another person, including that
            person’s e-mail address, postal address, phone number, credit card information, or any similar information.
            • You will comply with all applicable laws in your use of the Services and will not use the Services for any
            unlawful purpose; • You will not access or use the Services to collect any market research for a competing
            business; • You will not impersonate any person or entity or falsely state or otherwise misrepresent your
            affiliation with a person or entity; • You will not interfere with, or attempt to interrupt the proper
            operation of, the Services through the use of any virus, device, information collection or transmission
            mechanism, software or routine, or access or attempt to gain access to any ARC Content, data, files, or
            passwords related to the Services through hacking, password or data mining, or any other means; • You will
            not decompile, reverse engineer, or disassemble any software or other products or processes accessible
            through the Services; • You will not cover, obscure, block, or in any way interfere with any advertisements
            and/or safety features on the Services; • You will not use any robot, spider, scraper, or other automated
            means to access the Services for any purpose without our express written permission; • You will not take any
            action that imposes or may impose (in our sole discretion) an unreasonable or disproportionately large load
            on our technical infrastructure; • You will not allow anyone to access and use your account; • You will not
            resell, distribute, or sublicense the Services or use it for the benefit of anyone other than you or your
            business; • You will not remove or modify any proprietary markings or restrictive legends placed on the
            Services; and • You will not introduce, post, or upload to the Services any Harmful Code. As used herein,
            “Harmful Code” means computer code, programs, or programming devices that are intentionally designed to
            disrupt, modify, access, delete, damage, deactivate, disable, harm, or otherwise impede in any manner,
            including aesthetic disruptions or distortions, the operation of the Services, or any other associated
            software, firmware, hardware, computer system, or network (including, without limitation, “Trojan horses,”
            “viruses,” “worms,” “time bombs,” “time locks,” “devices,” “traps,” “access codes,” or “drop dead” or “trap
            door” devices) or any other harmful, malicious, or hidden procedures, routines or mechanisms that would
            cause the Services to cease functioning or to damage or corrupt data, storage media, programs, equipment, or
            communications, or otherwise interfere with the operations of the Services. ARC reserves the right, at any
            time, to modify, suspend, or discontinue the Services or any part thereof with or without notice. You agree
            that we will not be liable to you or to any third party for any modification, suspension, or discontinuance
            of the Services or any part thereof. You are free to stop using the Services at any time. 6. NO WARRANTIES;
            LIMITATION OF LIABILITY. THE SERVICES, AND ALL CONTENT AND OTHER INFORMATION ON OR ACCESSIBLE FROM OR
            THROUGH THE SERVICES ARE PROVIDED BY ARC ON AN “AS IS” AND “AS AVAILABLE” BASIS WITHOUT WARRANTY OF ANY
            KIND, EITHER EXPRESS OR IMPLIED. ARC EXPRESSLY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, REGARDING THE
            SERVICES, THE CONTENT, AND ALL PRODUCTS AND SERVICES OFFERED BY SERVICE PROVIDERS THROUGH THE SERVICES,
            INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
            NON-INFRINGEMENT, SECURITY OR ACCURACY, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING, COURSE OF
            PERFORMANCE, OR USAGE OF TRADE. WITHOUT LIMITING THE GENERALITY OF THE FOREGOING, ARC DOES NOT WARRANT THAT:
            (1) THE INFORMATION ON THE SERVICES IS CORRECT, ACCURATE OR RELIABLE; (2) THE FUNCTIONS CONTAINED ON THIS
            SERVICES WILL BE UNINTERRUPTED OR ERROR-FREE; OR (3) DEFECTS WILL BE CORRECTED, OR THAT THE SERVICES OR THE
            SERVER THAT MAKE THEM AVAILABLE IS FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS. IN CONNECTION WITH ANY
            WARRANTY, CONTRACT, OR COMMON LAW TORT CLAIMS: (I) WE SHALL NOT BE LIABLE FOR ANY INCIDENTAL OR
            CONSEQUENTIAL DAMAGES, LOST PROFITS, OR DAMAGES RESULTING FROM LOST DATA OR SERVICE PROVIDER INTERRUPTION
            RESULTING FROM THE USE OR INABILITY TO ACCESS AND USE THE SERVICES, THE CONTENT, EVEN IF WE HAVE BEEN
            ADVISED OF THE POSSIBILITY OF SUCH DAMAGES; AND (II) ANY DIRECT DAMAGES, NOT ATTRIBUTABLE TO PERSONAL
            INJURIES, THAT YOU MAY SUFFER AS A RESULT OF YOUR USE OF THE SERVICES OR THE CONTENT SHALL BE LIMITED TO ONE
            HUNDRED UNITED STATES DOLLARS (US $100). SOME JURISDICTIONS, INCLUDING THE STATE OF NEW YORK, DO NOT ALLOW
            THE EXCLUSION OF CERTAIN WARRANTIES OR LIMITATION OF CERTAIN LIABILITIES. THEREFORE, SOME OF THE ABOVE
            LIMITATIONS IN THIS SECTION MAY NOT APPLY TO YOU. NOTHING IN THIS AGREEMENT SHALL AFFECT ANY NON-WAIVABLE
            STATUTORY RIGHTS THAT APPLY TO YOU. 7. REPRESENTATIONS AND WARRANTIES; INDEMNIFICATION. (a) Representations
            and Warranties. You hereby represent, warrant, and covenant that: ◦ You own or have the necessary licenses,
            rights, consents, and permissions (collectively, “Permissions”) to all trademark, trade secret, copyright,
            or other proprietary, privacy, and publicity rights in and to your User Content, and any other works that
            you incorporate into your User Content and all the rights necessary to grant the Permissions you grant
            hereunder; ◦ Use of User Content in the manner contemplated in these Terms of Service shall not violate or
            misappropriate the intellectual property, privacy, publicity, contractual, or other rights of any third
            party; and (b) Indemnification. ◦ You shall indemnify, defend, and hold harmless ARC, its affiliates, and
            its and their respective officers, managers, partners, employees, and agents (collectively, “Indemnitees”)
            from and against any and all losses, civil penalties, liabilities, damages, judgments, costs, and expenses,
            including reasonable attorney’s fees and court costs (collectively, “Losses”), incurred in connection with
            any proceeding, claim, or action (collectively, “Claim”) arising out of or related to (i) your breach of
            this Agreement, (ii) your misuse of the ARC Content or the Services; and/or (iii) your violation of any
            third-party rights, including without limitation any copyright, trademark, property, publicity, or privacy
            right. 8. COMPLIANCE WITH APPLICABLE LAWS. The Services are based in the United States. We make no claims
            concerning whether the Services are accessible, or whether ARC Content may be downloaded, viewed, or be
            appropriate for use, or Purchases may be made, outside of the United States. Whether inside or outside of
            the United States, you are solely responsible for ensuring compliance with the laws of your specific
            jurisdiction. ARC is a provider of “interactive computer services” as defined under the Communications
            Decency Act, 47 U.S.C. Section 230, and as such, our liability for defamation, libel, product disparagement,
            and other claims arising out of any User Content is limited as described therein. We are not responsible for
            any User Content. We neither warrant the accuracy of the User Content nor exercise any editorial control
            over User Content, nor do we assume any legal obligation for editorial control of User Content or liability
            in connection with User Content, including any responsibility or liability for investigating or verifying
            the accuracy of any User Content. 9. CONTROLLING LAW This Agreement and any action related thereto will be
            governed by the laws of the State of New York without regard to its conflict of laws provisions. 10. BINDING
            ARBITRATION. In the event of a dispute arising between you and ARC under or relating to this Agreement or
            the Services (each, a “Dispute”), such Dispute will be finally and exclusively resolved by binding
            arbitration governed by the Federal Arbitration Act (“FAA”). Any election to arbitrate, at any time, shall
            be final and binding on the other party. IF NEITHER PARTY SHALL HAVE THE RIGHT TO LITIGATE SUCH CLAIM IN
            COURT OR TO HAVE A JURY TRIAL, EXCEPT EITHER PARTY MAY BRING ITS CLAIM IN ITS LOCAL SMALL CLAIMS COURT, IF
            PERMITTED BY THAT SMALL CLAIMS COURT RULES AND IF WITHIN SUCH COURT’S JURISDICTION. ARBITRATION IS DIFFERENT
            FROM COURT, AND DISCOVERY AND APPEAL RIGHTS MAY ALSO BE LIMITED IN ARBITRATION. All disputes will be
            resolved before a neutral arbitrator selected jointly by you and ARC, whose decision will be final, except
            for a limited right of appeal under the FAA. The arbitration shall be commenced and conducted by JAMS
            pursuant to its then current Comprehensive Arbitration Rules and Procedures and in accordance with the
            Expedited Procedures in those rules, or, where appropriate, pursuant to JAMS’ Streamlined Arbitration Rules
            and Procedures. All applicable JAMS’ rules and procedures are available at the JAMS website www.jamsadr.com.
            Each of you and ARC will be responsible for paying any JAMS filing, administrative, and arbitrator fees in
            accordance with JAMS rules. Judgment on the arbitrator’s award may be entered in any court having
            jurisdiction. This clause shall not preclude parties from seeking provisional remedies in aid of arbitration
            from a court of appropriate jurisdiction. The arbitration may be conducted in person, through the submission
            of documents, by phone, or online. If conducted in person, the arbitration shall take place in the United
            States county where you reside. The parties may litigate in court to compel arbitration, to stay a
            proceeding pending arbitration, or to confirm, modify, vacate, or enter judgment on the award entered by the
            arbitrator. The parties shall cooperate in good faith in the voluntary and informal exchange of all
            non-privileged documents and other information (including electronically stored information) relevant to the
            Dispute immediately after commencement of the arbitration. As set forth in Section 15 below, nothing in this
            Agreement will prevent us from seeking injunctive relief in any court of competent jurisdiction as necessary
            to protect our proprietary interests. 11. CLASS ACTION WAIVER. You agree that any arbitration or proceeding
            shall be limited to the Dispute between us and you individually. To the full extent permitted by law, (i) no
            arbitration or proceeding shall be joined with any other; (ii) there is no right or authority for any
            Dispute to be arbitrated or resolved on a class action-basis or to utilize class action procedures; and
            (iii) there is no right or authority for any Dispute to be brought in a purported representative capacity on
            behalf of the general public or any other persons. YOU AGREE THAT YOU MAY BRING CLAIMS AGAINST US ONLY IN
            YOUR INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE
            PROCEEDING. 12. EQUITABLE RELIEF. You acknowledge and agree that in the event of a breach or threatened
            violation of our intellectual property rights and confidential and proprietary information by you, we will
            suffer irreparable harm and will therefore be entitled to injunctive relief to enforce this Agreement. We
            may, without waiving any other remedies under this Agreement, seek from any court having jurisdiction any
            interim, equitable, provisional, or injunctive relief that is necessary to protect our rights and property
            pending the outcome of the arbitration referenced above. You hereby irrevocably and unconditionally consent
            to the personal and subject matter jurisdiction of the federal and state courts in New York for purposes of
            any such action by us. 13. DISPUTES BETWEEN AND AMONG USERS. If there is a dispute between or among Users of
            the Services, you agree to initiate the dispute with ARC directly. ARC will take steps to mediate the User
            dispute in its sole, reasonable discretion. ARC will keep each party updated as to the status of disputes by
            messaging the parties through the accounts on the Service. Notwithstanding ARC’s good faith efforts, some
            disputes may not be resolved in a manner that satisfies all parties. ARC’s decision with respect to all
            disputes is final. In the event that you have a dispute with one or more other Users, you release ARC, its
            officers, employees, agents, and successors from claims, demands, and damages of every kind or nature, known
            or unknown, suspected or unsuspected, disclosed or undisclosed, arising out of or in any way related to such
            disputes and/or our Services. 14. EXTERNAL WEBSITES. The Services may contain links to third-party websites
            (“External Websites”). These links are provided solely as a convenience to you and not as an endorsement by
            us of the content on such External Websites. The content of such External Websites is developed and provided
            by others. You should contact the site administrator or webmaster for those External Websites if you have
            any concerns regarding such links or any content located on such External Websites. We are not responsible
            for the content of any linked External Websites and do not make any representations regarding the content or
            accuracy of materials on such External Websites. You should take precautions when downloading files from all
            websites to protect your computer from viruses and other destructive programs. If you decide to access
            linked External Websites, you do so at your own risk. 15. CHANGES TO THE AGREEMENT. These Terms of Service
            are effective as of the last updated date stated at the top. We may change these Terms of Service from time
            to time. Any such changes will be posted on the Website. By accessing the Services after we make any such
            changes to these Terms of Service, you are deemed to have accepted such changes. Please refer back to these
            Terms of Service on a regular basis. 16. TERMINATION OF THIS AGREEMENT We reserve the right, in our sole
            discretion, to restrict, suspend, or terminate this Agreement and the Services, and your access to all or
            any part of the Services, at any time and for any reason without prior notice or liability. Sections 2,
            6-19, 22 shall survive the termination of this Agreement. 17. DIGITAL MILLENNIUM COPYRIGHT ACT ARC respects
            the intellectual property rights of others and attempts to comply with all relevant laws. We will review all
            claims of copyright infringement received and remove any ARC Content or User Content deemed to have been
            posted or distributed in violation of any such laws. Our designated agent under the Digital Millennium
            Copyright Act (the “Act”) for the receipt of any Notification of Claimed Infringement which may be given
            under that Act is as follows: AR Creative Media, Inc. 141 Flushing Ave., Ste. 506 Brooklyn, NY 11205 Attn:
            Copyright Agent Email: info@arcmedia.us If you believe that your work has been copied on the Services in a
            way that constitutes copyright infringement, please provide our agent with notice in accordance with the
            requirements of the Act, including (i) a description of the copyrighted work that has been infringed and the
            specific location on the Services where such work is located; (ii) a description of the location of the
            original or an authorized copy of the copyrighted work; (iii) your address, telephone number and e-mail
            address; (iv) a statement by you that you have a good faith belief that the disputed use is not authorized
            by the copyright owner, its agent or the law; (v) a statement by you, made under penalty of perjury, that
            the information in your notice is accurate and that you are the copyright owner or authorized to act on the
            copyright owner’s behalf; and (vi) an electronic or physical signature of the owner of the copyright or the
            person authorized to act on behalf of the owner of the copyright interest. 18. DOWNLOADING THE APP
            APPLICATION.
          </DialogContentText>
        </DialogContent>
        <div className="App">
          <div className="container">
            <div>
              <input type="checkbox" id="agree" onChange={checkboxHandler} />
              <label htmlFor="agree">
                {' '}
                I agree to <b>terms of service</b>
              </label>
            </div>

            {/* Don't miss the exclamation mark* */}
            <button disabled={!agree} className="btn" onClick={btnHandler}>
              Continue
            </button>
          </div>
        </div>
      </Dialog>
      <Dialog
        open={openPP}
        TransitionComponent={Transition}
        keepMounted
        aria-labelledby="alert-dialog-slide-title"
        aria-describedby="alert-dialog-slide-description"
        className={classes.dialogWindow}
        PaperProps={{
          style: {
            width: '100%',
            maxWidth: '100%',
            height: 'max-content',
            borderRadius: '12px'
          }
        }}
      >
        <DialogContent>
          <DialogContentText>
            PRIVACY POLICY Last Updated: June [ ], 2021 AR Creative Media, Inc. (“AR Creative Media,” “ARC” “we,” “us,”
            or “our”) welcomes you. This privacy policy (“Privacy Policy”) describes how we collect and use your
            information when you access and use our Services. By accessing or using any part of the Services, you agree
            to be bound by this Privacy Policy. If you do not agree to (or cannot comply with) all of the terms of this
            Privacy Policy, you may not access or use the Services. If you accept or agree to this Privacy Policy on
            behalf of a company or other legal entity, you represent and warrant that you have the authority to bind
            that company or other legal entity to the Privacy Policy and, in such event, “you” and “your” will refer and
            apply to that company or other legal entity. Capitalized terms not defined in this Privacy Policy shall have
            the meaning set forth in our Terms of Service. THE INFORMATION WE COLLECT AND HOW WE USE IT In the course of
            operating the Services, ARC collects or receives the following types of information, which may include
            personal information. Contact Information We collect contact information through our Services; contact
            information typically includes your name, email address, phone number (optional), and any information you
            provide in messages to us. We use such contact information for purposes such as registering you for an
            account, allowing you to create videos, providing you with information about the Services, responding to
            your inquiries, sending you alerts (including marketing emails and text messages), subscribing your for our
            newsletter, or providing you the Services. Server Log Information Our servers keep log files that record
            data each time a device accesses those servers. The log files contain data about the nature of such access,
            including the device’s IP address, user agent string (e.g., operating system and browser type/version), and
            the pages you’ve clicked on while on our Website, and details regarding your activity on the Website such as
            time spent on the Website and other performance and usage data. We may use these log files for purposes such
            as assisting in monitoring and troubleshooting errors and incidents, analyzing traffic, or optimizing the
            user experience. Cookies We may collect information using “cookie” and other similar technologies. Cookies
            are small packets of data that a website stores on your computer’s or mobile device’s hard drive (or other
            storage medium) so that your computer will “remember” information about your use. We use both 1st and
            3rd-party session cookies and persistent cookies. We may also collect information about you from your device
            such as device type, machine or mobile device identification number and unique advertising identifiers.
            Below is a general primer on session and persistent cookies; information collected by cookies depends on its
            particular purpose. For more information, please see the information regarding analytics providers discussed
            further below. • Session Cookies: We use session cookies to make it easier for you to navigate our Services.
            A session ID cookie expires when you close the Services. • Persistent Cookies: A persistent cookie remains
            on your device for an extended period of time or until you delete them. You can remove persistent cookies by
            following directions provided in your web browser’s “help” file. To the extent we provide a log-in portal or
            related feature on our Website, persistent cookies can be used to store your passwords so that you don’t
            have to enter it more than once. Persistent cookies also enable us to track and target the interests of our
            visitors to personalize the experience on our Website. In some cases, we may associate information that you
            have provided to us (e.g., email address) with the cookies that we use. In addition to facilitating the
            purposes described above, this is useful in understanding your engagement with other content related to our
            Services (e.g., email open rates, URL click-throughs). If you do not want us to place a cookie on your
            device, you may be able to turn that feature off on your device. Please consult your browser’s documentation
            for information on how to do this and how to delete persistent cookies. However, if you decide not to accept
            cookies from us, certain aspects of the Website may not function properly or as intended. Third-Party
            Analytics Providers We use one or more third–party analytics services to evaluate your use of the Services,
            as the case may be, by compiling reports on activity (based on their collection of IP addresses, Internet
            service provider, browser type, operating system and language, referring and exit pages and URLs, data and
            time, amount of time spent on particular pages, what sections of the Services you visit, number of links
            clicked, search terms and other similar usage data) and analyzing performance metrics. These third parties
            use cookies and other technologies to help collect, analyze, and provide us reports or other data. By
            accessing and using the Services, you consent to the processing of data about you by these analytics
            providers in the manner and for the purposes set out in this Privacy Policy. For more information on these
            third parties, including how to opt out from certain data collection, please visit the sites below. Please
            be advised that if you opt out of any service, you may not be able to use the full functionality of the
            Services. For Google Analytics, please see: https://support.google.com/analytics/answer/6004245?hl=en and
            https://tools.google.com/dlpage/gaoptout Third Party Advertisers/Remarketers We may share or receive
            information about you with/from third parties, including, but not limited to, advertising and remarketing
            providers, or similar partners, for purposes of personalizing or otherwise understanding how you engage with
            ads or other content. These third parties may use cookies, pixel tags, or other technologies to collect
            information in furtherance of such purposes, including to tailor, target (i.e., behavioral, contextual,
            retargeting, and remarketing), analyze, report on, and/or manage advertising campaigns or other initiatives.
            For example, when a browser visits a site, pixel tags enable us and these third-parties to recognize certain
            cookies stored within the browser to learn which ads or other content bring a user to a given site.
            Information that we may receive from these third parties, including through their service providers, may
            include advertising identifiers, IP addresses, reports, and campaign data. By accessing and using the
            Services, you consent to the processing of data about you by these advertisers/remarketing providers in the
            manner and for the purposes set out in this Privacy Policy, provided however, to the extent we collect and
            use your mobile unique advertising identifiers through our App, we will do so in accordance with any
            applicable mobile provider opt-in requirements. For more information about digital targeting and
            advertising, and how you can opt out, you can visit the sites below, and http://optout.aboutads.info and
            www.networkadvertising.org/consumer/opt_out.asp Geolocational Information We may automatically collect
            geolocation information from your device via your browser’s location services. You may provide permission
            for this collection on the device level (e.g., you have consented to location services generally through
            your browser’s settings) or by accepting our request for geolocation access on the Services. Please consult
            your browser’s documentation regarding how to turn off location services. If you disable location services,
            you may not be able to use the full array of features and functionalities available through our Services.
            Aggregate Data In an ongoing effort to better understand our Services and users of the Services, we might
            analyze your information in aggregate form to operate, maintain, manage, and improve the Services. This
            aggregate information does not identify you personally. We may share this aggregate data with service
            providers, and our affiliates, agents, and business partners. We may also disclose aggregated user
            statistics to describe the Services to current and prospective business partners and to other third parties
            for other lawful purposes. Onward Transfer to Third Parties • Like many businesses, we hire other companies
            to perform certain business-related services. We may disclose personal information to certain types of third
            party companies but only to the extent needed to enable them to provide such services. The types of
            companies that may receive personal information and their functions are: technical assistance, database
            management/back-up services, use analytics, email marketing platforms, customer service, and our hosting
            provider, ARC. • To provide our Services and administer promotional programs, we may share your personal
            information with our third-party promotional and marketing partners, including, without limitation,
            businesses participating in our various programs. • We may, from time to time, share and/or license personal
            information to other companies who may provide you information about the products and services they or their
            partners offer. However, to the extent required by law, you will be given the opportunity to opt out of such
            sharing. • We may also disclose personal information to our parent companies, subsidiaries, affiliates,
            joint ventures, or other companies under common control to support the marketing of the Services and sale of
            the Products. Business Transfers In the event of a merger, dissolution, reorganization or similar corporate
            event, or the sale of all or substantially all of our assets, we expect that the information that we have
            collected, including personal information, would be transferred to the surviving entity in a merger or the
            acquiring entity. All such transfers shall be subject to our commitments with respect to the privacy and
            confidentiality of such personal information as set forth in this Privacy Policy. This policy shall be
            binding upon ARC and its legal successors in interest. Disclosure to Public Authorities We are required to
            disclose personal information in response to lawful requests by public authorities, including for the
            purpose of meeting national security or law enforcement requirements. We may also disclose personal
            information to other third parties when compelled to do so by government authorities or required by law or
            regulation including, but not limited to, in response to court orders and subpoenas.  OPT-OUT FOR DIRECT
            MARKETING; EMAIL MANAGEMENT You may opt out at any time from the use of your personal information for direct
            marketing purposes by emailing the instructions to info@arcmedia.us or by clicking on the “Unsubscribe” link
            located on the bottom of any ARC marketing email and following the instructions found on the page to which
            the link takes you. Please allow us a reasonable time to process your request. You cannot opt out of
            receiving transactional e-mails related to the Services. HOW WE PROTECT YOUR INFORMATION ARC takes very
            seriously the security and privacy of the personal information that it collects pursuant to this Privacy
            Policy. Accordingly, we implement reasonable security measures designed to protect your personal information
            from loss, misuse and unauthorized access, disclosure, alteration and destruction, taking into account the
            risks involved in processing and the nature of such data, and to comply with applicable laws and
            regulations. Please understand, however, that no security system is impenetrable. We cannot guarantee the
            security of our databases or the databases of the third parties with which we may share your information (as
            permitted herein), nor can we guarantee that the information you supply will not be intercepted while being
            transmitted over the Internet. In particular, e-mail sent to us may not be secure, and you should therefore
            take special care in deciding what information you send to us via e-mail. CHILDREN We do not knowingly
            collect personal information from children under the age of 13 through the Services. If you are under 13,
            please do not give us any personal information. We encourage parents and legal guardians to monitor their
            children’s Internet usage and to help enforce our Privacy Policy by instructing their children to never
            provide personal information without their permission. If you have reason to believe that a child under the
            age of 13 has provided personal information to us, please contact us at info@arcmedia.us, and we will
            endeavor to delete that information from our databases. IMPORTANT NOTICE TO ALL NON-US RESIDENTS Our servers
            are located in the United States. Please be aware that your information may be transferred to, processed,
            maintained, and used on computers, servers, and systems located outside of your state, province, country, or
            other governmental jurisdiction where the privacy laws may not be as protective as those in your country of
            origin. If you are located outside the United States and choose to use the Services, you do so at your own
            risk. CALIFORNIA PRIVACY RIGHTS Pursuant to Section 1798.83 of the California Civil Code, residents of
            California have the right to obtain certain information about the types of personal information that
            companies with whom they have an established business relationship (and that are not otherwise exempt) have
            shared with third parties for direct marketing purposes during the preceding calendar year, including the
            names and addresses of those third parties, and examples of the types of services or products marketed by
            those third parties. If you wish to submit a request pursuant to Section 1798.83, please contact ARC via
            email at info@arcmedia.us. DO NOT TRACK ARC does not respond to “Do Not Track” settings or other related
            mechanisms at this time. NEVADA PRIVACY RIGHTS If you are a resident of Nevada, you have the right to
            opt-out of the sale of certain personal information to third parties who intend to license or sell that
            personal information. You can exercise this right by contacting us at info@arcmedia.us with the subject line
            “Nevada Do Not Sell Request” and providing us with your name and the email address associated with your
            account. Please note that we do not currently sell your personal information as sales are defined in Nevada
            Revised Statutes Chapter 603A. LINKS TO EXTERNAL WEBSITES The Website may contain links to third-party
            websites (“External Sites”). ARC has no control over the privacy practices or the content of any such
            External Sites. As such, we are not responsible for the content or the privacy policies of such External
            Sites. You should check the applicable privacy policy and terms of service when visiting any such External
            Sites. CHANGES TO THIS PRIVACY POLICY This Privacy Policy is effective as of the last updated date stated at
            the top of this Privacy Policy. We may change this Privacy Policy from time to time with or without notice
            to you. By accessing the Services after we make any such changes to this Privacy Policy, you are deemed to
            have accepted such changes. Please be aware that, to the extent permitted by applicable law, our use of the
            information collected is governed by the Privacy Policy in effect at the time we collect the information.
            Please refer back to this Privacy Policy on a regular basis. HOW TO CONTACT US If you have questions about
            this Privacy Policy, please contact us by e-mail at info@arcmedia.us with “Privacy Policy” in the subject.
          </DialogContentText>
        </DialogContent>
        <div className="App">
          <div className="container">
            <div>
              <input type="checkbox" id="agreePP" onChange={checkboxHandlerPP} />
              <label htmlFor="agree">
                {' '}
                I agree to <b>Privacy Policy</b>
              </label>
            </div>

            {/* Don't miss the exclamation mark* */}
            <button disabled={!agreePP} className="btn" onClick={btnHandlerPP}>
              Continue
            </button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}

export default TermsAndPolicy
