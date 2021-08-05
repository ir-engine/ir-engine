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
import termsText from './terms'
import policyText from './policy'

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
          <div dangerouslySetInnerHTML={{__html: termsText}}/>          
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
          <div dangerouslySetInnerHTML={{__html: policyText}}/>          
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
