import React from 'react'
import './TermsandPolicy.module.scss'
import { Button } from '@mui/material'
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import terms from '../../components/TermsandPolicy/terms'
import Heading from './components/Heading'
import SubHeading from './components/SubHeading'
import Paragraph from './components/Paragraph'

const Terms = ({ setView }) => {
  const { t } = useTranslation()
  const history = useHistory()
  return (
    <div
      style={{
        padding: '2% 5%'
      }}
    >
      <Button
        variant="text"
        className="backButton"
        onClick={() => {
          // history.goBack()
          setView('featured')
        }}
      >
        <ArrowBackIosIcon />
        {t('social:creatorForm.back')}
      </Button>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          textAlign: 'center'
        }}
      >
        <SubHeading>
          AR CREATIVE MEDIA, INC.
          <br />
          TERMS OF SERVICE
          <br />
          Last updated: June [ ], 2021
        </SubHeading>
      </div>
      <Paragraph>
        These terms of service (the “<u>Terms of Service</u>”) are a legal agreement between you and AR Creative Media,
        Inc. (“<u>AR Creative Media</u>”, “<u>ARC</u>” “<u>we,</u>” “<u>us,</u>” or “<u>our</u>”). These Terms of
        Service specify the terms under which you may access and use our website located at arcmedia.us (the “
        <u>Website</u>”) and our application (the “<u>App,</u>” and together with the Website, the “<u>Services</u>”)
      </Paragraph>
      <SubHeading>
        PLEASE READ THESE TERMS OF SERVICE CAREFULLY BEFORE ACCESSING AND USING THE SERVICES OR ANY PORTION THEREOF,
        BECAUSE BY ACCEPTING THESE TERMS OF SERVICE, USING ANY OF THE SERVICES, OR OTHERWISE MANIFESTING YOUR ASSENT TO
        THESE TERMS OF SERVICE, YOU AGREE TO BE BOUND BY THESE TERMS OF SERVICE AND OUR PRIVACY POLICY (THE “
        <u>PRIVACY POLICY</u>”), TOGETHER WITH THE TERMS OF SERVICE, THE “<u>AGREEMENT</u>”), WHICH IS HEREBY
        INCORPORATED BY REFERENCE. IF YOU DO NOT AGREE TO (OR CANNOT COMPLY WITH) ALL OF THE TERMS OF THESE TERMS OF
        SERVICE, DO NOT ACCESS OR USE THE SERVICES.
      </SubHeading>
      <SubHeading>
        THE SECTIONS BELOW TITLED “BINDING ARBITRATION” AND “CLASS ACTION WAIVER” CONTAIN A BINDING ARBITRATION
        AGREEMENT, AND CLASS ACTION WAIVER. THEY AFFECT YOUR LEGAL RIGHTS. PLEASE READ THEM.
      </SubHeading>
      <Paragraph>
        If you accept or agree to this Agreement on behalf of a company or other legal entity, you represent and warrant
        that you have the authority to bind that company or other legal entity to the Agreement and, in such event, “
        <u>you</u>” and “<u>your</u>” will refer and apply to that company or other legal entity.
      </Paragraph>
      <Paragraph>
        Capitalized terms not defined in these Terms of Service shall have the meaning set forth in our Privacy Policy.
      </Paragraph>
      <ol>
        <li>
          <Heading>OUR SERVICES AND USERS.</Heading>
        </li>
      </ol>
      <Paragraph>
        The Services provide a platform where users (each, a “<u>User</u>”) (i) create videos based on content by us,
        such as the volumetric captures of individuals, software, text, graphics, images, sounds, music and other
        material provided by or on behalf of ARC or its licensors (collectively referred to as the “ ARC Content”) and
        (ii) view such created videos.
      </Paragraph>
      <Paragraph>Our Services have several types of users:</Paragraph>
      <ol type="a">
        <li>
          <Paragraph>
            <u>Visitors</u>. Visitors to our Services, as the term implies, are people who do not register for an
            account, but want to explore and watch the videos that are created and stored on the Services. No login is
            required for visitors to the Services. Visitors can access all publicly-available content and features of
            the Services and can contact us using the contact link on either the Website or the App.
          </Paragraph>
        </li>
        <li>
          <Paragraph>
            <u>Registered Users and Accounts</u>. In order to become a video creator (a “<u>Registered User</u>”) you
            must establish an account with us. ARC is under no obligation to accept any individual or entity as an
            account holder, and may accept or reject any registration in our sole and complete discretion. Visitors and
            Registered Users may sometimes be collectively referred to as Users.
          </Paragraph>
        </li>
      </ol>
      <Paragraph>
        To create an account, you or your authorized representative will be prompted to insert your email and create a
        password and perhaps provide certain additional information that will assist in authenticating your identity
        when you log-in in the future (collectively “<u>Login Credentials</u>”). You may not transfer your account to
        anyone else without our prior written permission. When creating your account, you must provide true, accurate,
        current, and complete information about yourself. Each email and corresponding password can be used by only one
        individual. You are responsible for maintaining the confidentiality of your account Login Credentials. You are
        fully responsible for all activities that are associated with your account (including, but not limited to, any
        videos created on your account, use of the Services, or communications from your account to other Users or ARC).
        You agree to immediately notify us of any unauthorized use or suspected unauthorized use of your account or any
        other breach of security.
      </Paragraph>
      <ol start={2}>
        <li>
          <Heading>USER CONTENT; LICENSES</Heading>
          <Paragraph>
            The Service allows Users to create a profile (“<u>Profile</u>”). Users will be permitted to post or upload
            the original videos they create integrating the ARC Content (collectively, “<u>User Content</u>”) onto their
            Profiles. YOU, AND NOT ARC, ARE ENTIRELY RESPONSIBLE FOR ALL YOUR USER CONTENT THAT YOU UPLOAD, POST,
            E-MAIL, OR OTHERWISE TRANSMIT. You expressly acknowledge and agree that once you submit your User Content
            for inclusion into the Services, there is no confidentiality or privacy with respect to such User Content,
            including, without limitation, any personally identifying information that you may make available. We are
            not obligated to publish any User Content, and we reserve the right to remove any User Content at any time
            in our sole discretion, with or without notice.
          </Paragraph>
          <Paragraph>
            You retain all copyrights and other intellectual property rights in and to your own User Content. You do,
            however, hereby grant us and our sub-licensees an exclusive, royalty-free, freely sub-licensable, perpetual,
            irrevocable license to modify, compile, combine with other content, copy, record, synchronize, transmit,
            translate, format, distribute, publicly display, publicly perform, and otherwise use or exploit (including
            for profit) your User Content and all intellectual property and moral rights therein throughout the
            universe, in each case, by or in any means, methods, media, or technology now known or hereafter devised.
          </Paragraph>
        </li>
        <li>
          <Heading>INTELLECTUAL PROPERTY.</Heading>
          <Paragraph>
            The Services are protected by copyright, trademark, and other laws of the United States and foreign
            countries. Except as expressly provided in this Agreement, ARC and our licensors exclusively own all right,
            title, and interest in and to the Services, including all associated intellectual property rights. You will
            not remove, alter, or obscure any copyright, trademark, service mark, or other proprietary rights notices
            incorporated in or accompanying the Services.
          </Paragraph>
          <Paragraph>
            The ARC Content may be owned by us or third parties. The ARC Content is protected under both United States
            and foreign laws. Unauthorized use of the ARC Content may violate copyright, trademark, and other laws. We
            and our licensors retain all right, title, and interest, including all intellectual property rights, in and
            to the ARC Content. You must retain all copyright and other proprietary notices contained in the original
            ARC Content. You may not sell, transfer, assign, license or sublicense the ARC Content. You may post or
            upload the original video you create to all manner of social media and video platforms. You are permitted to
            use the ARC Content solely in connection with the creation of the User Content.
          </Paragraph>
          <Paragraph>
            The trademarks, service marks, and logos of ARC (the “<u>ARC Trademarks</u>”) used and displayed on the
            Services together with the ARC Content are registered and unregistered trademarks or service marks of ARC.
            Other company, product, and service names located on the Services and the ARC Content may be trademarks or
            service marks owned by third parties (the “<u>Third-Party Trademarks,</u>” and, collectively with ARC
            Trademarks, the “<u>Trademarks</u>”). Nothing on the Services should be construed as granting, by
            implication, estoppel, or otherwise, any license or right to use the Trademarks, without our prior written
            permission specific for each such use.
          </Paragraph>
          <Paragraph>
            Elements of the Services and ARC Content are protected by trade dress, trademark, unfair competition, and
            other state and federal laws and may not be copied or imitated in whole or in part, by any means, including,
            but not limited to, the use of framing or mirrors.
          </Paragraph>
        </li>
        <li>
          <Heading>FEEDBACK.</Heading>
          <Paragraph>
            As a registered User of our App, you may elect to provide us with feedback, comments, and suggestions with
            respect to our Services (“<u>Feedback</u>”). You agree that ARC will be free to use, reproduce, disclose,
            and otherwise exploit any and all such Feedback without compensation or attribution to you.
          </Paragraph>
        </li>
        <li>
          <Heading>COMMUNITY GUIDELINES.</Heading>
          <Paragraph>
            The Services are available only to individuals aged 13 years or older. If you are 13 or older, but under the
            age of majority in your jurisdiction, you should review this Agreement with your parent or guardian to make
            sure that you and your parent or guardian understand it. If you are under the age of 13, you may use the
            Services only with the consent of your parent or guardian.
          </Paragraph>
          <Paragraph>
            Subject to the terms and conditions of this Agreement, ARC grants you a limited, non-transferable,
            non-exclusive, license to access and use the Services and the ARC Content solely for your personal purposes.
            ARC may terminate this license at any time for any reason. Further, when using or accessing the Services,
            you agree that:
          </Paragraph>
          <Paragraph>
            You will not upload, post, e-mail, transmit, or otherwise make available any User Content that:
          </Paragraph>
          <Paragraph>
            infringes any copyright, trademark, right of publicity, or other proprietary rights of any person or entity;
            or
            <br />
            is defamatory, libelous, indecent, obscene, pornographic, sexually explicit, invasive of another’s privacy,
            promotes violence or illegal activity, or contains hate speech (i.e., speech that attacks or demeans a group
            based on race or ethnic origin, religion, disability, gender, age, veteran status, and/or sexual
            orientation/gender identity); or <br />
            discloses any sensitive information about another person, including that person’s e-mail address, postal
            address, phone number, credit card information, or any similar information.
          </Paragraph>
          <Paragraph>
            You will comply with all applicable laws in your use of the Services and will not use the Services for any
            unlawful purpose;
          </Paragraph>
          <Paragraph>
            You will not access or use the Services to collect any market research for a competing business;
          </Paragraph>
          <Paragraph>
            You will not impersonate any person or entity or falsely state or otherwise misrepresent your affiliation
            with a person or entity;
          </Paragraph>
          <Paragraph>
            You will not interfere with, or attempt to interrupt the proper operation of, the Services through the use
            of any virus, device, information collection or transmission mechanism, software or routine, or access or
            attempt to gain access to any ARC Content, data, files, or passwords related to the Services through
            hacking, password or data mining, or any other means;
          </Paragraph>
          <Paragraph>
            You will not decompile, reverse engineer, or disassemble any software or other products or processes
            accessible through the Services;
          </Paragraph>
          <Paragraph>
            You will not cover, obscure, block, or in any way interfere with any advertisements and/or safety features
            on the Services;
          </Paragraph>
          <Paragraph>
            You will not use any robot, spider, scraper, or other automated means to access the Services for any purpose
            without our express written permission;
          </Paragraph>
          <Paragraph>
            You will not take any action that imposes or may impose (in our sole discretion) an unreasonable or
            disproportionately large load on our technical infrastructure;
          </Paragraph>
          <Paragraph>You will not allow anyone to access and use your account;</Paragraph>
          <Paragraph>
            You will not resell, distribute, or sublicense the Services or use it for the benefit of anyone other than
            you or your business;
          </Paragraph>
          <Paragraph>
            You will not remove or modify any proprietary markings or restrictive legends placed on the Services; and
          </Paragraph>
          <Paragraph>
            You will not introduce, post, or upload to the Services any Harmful Code. As used herein, “
            <u>Harmful Code</u>” means computer code, programs, or programming devices that are intentionally designed
            to disrupt, modify, access, delete, damage, deactivate, disable, harm, or otherwise impede in any manner,
            including aesthetic disruptions or distortions, the operation of the Services, or any other associated
            software, firmware, hardware, computer system, or network (including, without limitation, “Trojan horses,”
            “viruses,” “worms,” “time bombs,” “time locks,” “devices,” “traps,” “access codes,” or “drop dead” or “trap
            door” devices) or any other harmful, malicious, or hidden procedures, routines or mechanisms that would
            cause the Services to cease functioning or to damage or corrupt data, storage media, programs, equipment, or
            communications, or otherwise interfere with the operations of the Services.
          </Paragraph>
          <Paragraph>
            ARC reserves the right, at any time, to modify, suspend, or discontinue the Services or any part thereof
            with or without notice. You agree that we will not be liable to you or to any third party for any
            modification, suspension, or discontinuance of the Services or any part thereof. You are free to stop using
            the Services at any time.
          </Paragraph>
        </li>
        <li>
          <Heading>NO WARRANTIES; LIMITATION OF LIABILITY.</Heading>
          <Paragraph>
            THE SERVICES, AND ALL CONTENT AND OTHER INFORMATION ON OR ACCESSIBLE FROM OR THROUGH THE SERVICES ARE
            PROVIDED BY ARC ON AN “AS IS” AND “AS AVAILABLE” BASIS WITHOUT WARRANTY OF ANY KIND, EITHER EXPRESS OR
            IMPLIED. ARC EXPRESSLY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, REGARDING THE SERVICES, THE CONTENT,
            AND ALL PRODUCTS AND SERVICES OFFERED BY SERVICE PROVIDERS THROUGH THE SERVICES, INCLUDING BUT NOT LIMITED
            TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, SECURITY OR ACCURACY,
            AND ANY WARRANTIES ARISING FROM COURSE OF DEALING, COURSE OF PERFORMANCE, OR USAGE OF TRADE. WITHOUT
            LIMITING THE GENERALITY OF THE FOREGOING, ARC DOES NOT WARRANT THAT: (1) THE INFORMATION ON THE SERVICES IS
            CORRECT, ACCURATE OR RELIABLE; (2) THE FUNCTIONS CONTAINED ON THIS SERVICES WILL BE UNINTERRUPTED OR
            ERROR-FREE; OR (3) DEFECTS WILL BE CORRECTED, OR THAT THE SERVICES OR THE SERVER THAT MAKE THEM AVAILABLE IS
            FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
          </Paragraph>
          <Paragraph>
            IN CONNECTION WITH ANY WARRANTY, CONTRACT, OR COMMON LAW TORT CLAIMS: (I) WE SHALL NOT BE LIABLE FOR ANY
            INCIDENTAL OR CONSEQUENTIAL DAMAGES, LOST PROFITS, OR DAMAGES RESULTING FROM LOST DATA OR SERVICE PROVIDER
            INTERRUPTION RESULTING FROM THE USE OR INABILITY TO ACCESS AND USE THE SERVICES, THE CONTENT, EVEN IF WE
            HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES; AND (II) ANY DIRECT DAMAGES, NOT ATTRIBUTABLE TO
            PERSONAL INJURIES, THAT YOU MAY SUFFER AS A RESULT OF YOUR USE OF THE SERVICES OR THE CONTENT SHALL BE
            LIMITED TO ONE HUNDRED UNITED STATES DOLLARS (US $100).
          </Paragraph>
          <Paragraph>
            SOME JURISDICTIONS, INCLUDING THE STATE OF NEW YORK, DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES OR
            LIMITATION OF CERTAIN LIABILITIES. THEREFORE, SOME OF THE ABOVE LIMITATIONS IN THIS SECTION MAY NOT APPLY TO
            YOU.
          </Paragraph>
          <Paragraph>
            NOTHING IN THIS AGREEMENT SHALL AFFECT ANY NON-WAIVABLE STATUTORY RIGHTS THAT APPLY TO YOU.
          </Paragraph>
        </li>
        <li>
          <Heading>REPRESENTATIONS AND WARRANTIES; INDEMNIFICATION.</Heading>
        </li>
      </ol>
      <ol type="a">
        <li>
          <Paragraph>
            <u>Representations and Warranties.</u>
          </Paragraph>
          <Paragraph>You hereby represent, warrant, and covenant that:</Paragraph>
          <Paragraph>
            You own or have the necessary licenses, rights, consents, and permissions (collectively, “Permissions”) to
            all trademark, trade secret, copyright, or other proprietary, privacy, and publicity rights in and to your
            User Content, and any other works that you incorporate into your User Content and all the rights necessary
            to grant the Permissions you grant hereunder;
          </Paragraph>
          <Paragraph>
            Use of User Content in the manner contemplated in these Terms of Service shall not violate or misappropriate
            the intellectual property, privacy, publicity, contractual, or other rights of any third party; and
          </Paragraph>
        </li>
        <li>
          <Paragraph>
            <u>Indemnification.</u>
          </Paragraph>
          <br />
          <Paragraph>
            You shall indemnify, defend, and hold harmless ARC, its affiliates, and its and their respective officers,
            managers, partners, employees, and agents (collectively, “<u>Indemnitees</u>”) from and against any and all
            losses, civil penalties, liabilities, damages, judgments, costs, and expenses, including reasonable
            attorney’s fees and court costs (collectively, “<u>Losses</u>”), incurred in connection with any proceeding,
            claim, or action (collectively, “<u>Claim</u>”) arising out of or related to (i) your breach of this
            Agreement, (ii) your misuse of the ARC Content or the Services; and/or (iii) your violation of any
            third-party rights, including without limitation any copyright, trademark, property, publicity, or privacy
            right.
          </Paragraph>
        </li>
      </ol>
      <ol start={8}>
        <li>
          <Heading>COMPLIANCE WITH APPLICABLE LAWS.</Heading>
          <Paragraph>
            The Services are based in the United States. We make no claims concerning whether the Services are
            accessible, or whether ARC Content may be downloaded, viewed, or be appropriate for use, or Purchases may be
            made, outside of the United States. Whether inside or outside of the United States, you are solely
            responsible for ensuring compliance with the laws of your specific jurisdiction. ARC is a provider of
            “interactive computer services” as defined under the Communications Decency Act, 47 U.S.C. Section 230, and
            as such, our liability for defamation, libel, product disparagement, and other claims arising out of any
            User Content is limited as described therein. We are not responsible for any User Content. We neither
            warrant the accuracy of the User Content nor exercise any editorial control over User Content, nor do we
            assume any legal obligation for editorial control of User Content or liability in connection with User
            Content, including any responsibility or liability for investigating or verifying the accuracy of any User
            Content.
          </Paragraph>
        </li>
        <li>
          <Heading>CONTROLLING LAW</Heading>
          <Paragraph>
            This Agreement and any action related thereto will be governed by the laws of the State of New York without
            regard to its conflict of laws provisions.
          </Paragraph>
        </li>
        <li>
          <Heading>BINDING ARBITRATION.</Heading>
          <Paragraph>
            In the event of a dispute arising between you and ARC under or relating to this Agreement or the Services
            (each, a “<u>Dispute</u>”), such Dispute will be finally and exclusively resolved by binding arbitration
            governed by the Federal Arbitration Act (“<u>FAA</u>”). Any election to arbitrate, at any time, shall be
            final and binding on the other party. IF NEITHER PARTY SHALL HAVE THE RIGHT TO LITIGATE SUCH CLAIM IN COURT
            OR TO HAVE A JURY TRIAL, EXCEPT EITHER PARTY MAY BRING ITS CLAIM IN ITS LOCAL SMALL CLAIMS COURT, IF
            PERMITTED BY THAT SMALL CLAIMS COURT RULES AND IF WITHIN SUCH COURT’S JURISDICTION. ARBITRATION IS DIFFERENT
            FROM COURT, AND DISCOVERY AND APPEAL RIGHTS MAY ALSO BE LIMITED IN ARBITRATION. All disputes will be
            resolved before a neutral arbitrator selected jointly by you and ARC, whose decision will be final, except
            for a limited right of appeal under the FAA. The arbitration shall be commenced and conducted by JAMS
            pursuant to its then current Comprehensive Arbitration Rules and Procedures and in accordance with the
            Expedited Procedures in those rules, or, where appropriate, pursuant to JAMS’ Streamlined Arbitration Rules
            and Procedures. All applicable JAMS’ rules and procedures are available at the JAMS website{' '}
            <a href="http://www.jamsadr.com/" target="_blank">
              www.jamsadr.com
            </a>
            . Each of you and ARC will be responsible for paying any JAMS filing, administrative, and arbitrator fees in
            accordance with JAMS rules. Judgment on the arbitrator’s award may be entered in any court having
            jurisdiction. This clause shall not preclude parties from seeking provisional remedies in aid of arbitration
            from a court of appropriate jurisdiction. The arbitration may be conducted in person, through the submission
            of documents, by phone, or online. If conducted in person, the arbitration shall take place in the United
            States county where you reside. The parties may litigate in court to compel arbitration, to stay a
            proceeding pending arbitration, or to confirm, modify, vacate, or enter judgment on the award entered by the
            arbitrator. The parties shall cooperate in good faith in the voluntary and informal exchange of all
            non-privileged documents and other information (including electronically stored information) relevant to the
            Dispute immediately after commencement of the arbitration. As set forth in <u>Section 15</u> below, nothing
            in this Agreement will prevent us from seeking injunctive relief in any court of competent jurisdiction as
            necessary to protect our proprietary interests.
          </Paragraph>
        </li>
        <li>
          <Heading>CLASS ACTION WAIVER.</Heading>
          <Paragraph>
            You agree that any arbitration or proceeding shall be limited to the Dispute between us and you
            individually. To the full extent permitted by law, (i) no arbitration or proceeding shall be joined with any
            other; (ii) there is no right or authority for any Dispute to be arbitrated or resolved on a class
            action-basis or to utilize class action procedures; and (iii) there is no right or authority for any Dispute
            to be brought in a purported representative capacity on behalf of the general public or any other persons.
            YOU AGREE THAT YOU MAY BRING CLAIMS AGAINST US ONLY IN YOUR INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR
            CLASS MEMBER IN ANY PURPORTED CLASS OR REPRESENTATIVE PROCEEDING.
          </Paragraph>
        </li>
        <li>
          <Heading>EQUITABLE RELIEF.</Heading>
          <Paragraph>
            You acknowledge and agree that in the event of a breach or threatened violation of our intellectual property
            rights and confidential and proprietary information by you, we will suffer irreparable harm and will
            therefore be entitled to injunctive relief to enforce this Agreement. We may, without waiving any other
            remedies under this Agreement, seek from any court having jurisdiction any interim, equitable, provisional,
            or injunctive relief that is necessary to protect our rights and property pending the outcome of the
            arbitration referenced above. You hereby irrevocably and unconditionally consent to the personal and subject
            matter jurisdiction of the federal and state courts in New York for purposes of any such action by us.
          </Paragraph>
        </li>
        <li>
          <Heading>DISPUTES BETWEEN AND AMONG USERS.</Heading>
          <Paragraph>
            If there is a dispute between or among Users of the Services, you agree to initiate the dispute with ARC
            directly. ARC will take steps to mediate the User dispute in its sole, reasonable discretion. ARC will keep
            each party updated as to the status of disputes by messaging the parties through the accounts on the
            Service. Notwithstanding ARC’s good faith efforts, some disputes may not be resolved in a manner that
            satisfies all parties. ARC’s decision with respect to all disputes is final. In the event that you have a
            dispute with one or more other Users, you release ARC, its officers, employees, agents, and successors from
            claims, demands, and damages of every kind or nature, known or unknown, suspected or unsuspected, disclosed
            or undisclosed, arising out of or in any way related to such disputes and/or our Services.
          </Paragraph>
        </li>
        <li>
          <Heading>EXTERNAL WEBSITES.</Heading>
          <Paragraph>
            The Services may contain links to third-party websites (“<u>External Websites</u>”). These links are
            provided solely as a convenience to you and not as an endorsement by us of the content on such External
            Websites. The content of such External Websites is developed and provided by others. You should contact the
            site administrator or webmaster for those External Websites if you have any concerns regarding such links or
            any content located on such External Websites. We are not responsible for the content of any linked External
            Websites and do not make any representations regarding the content or accuracy of materials on such External
            Websites. You should take precautions when downloading files from all websites to protect your computer from
            viruses and other destructive programs. If you decide to access linked External Websites, you do so at your
            own risk.
          </Paragraph>
        </li>
        <li>
          <Heading>CHANGES TO THE AGREEMENT.</Heading>
          <Paragraph>
            These Terms of Service are effective as of the last updated date stated at the top. We may change these
            Terms of Service from time to time. Any such changes will be posted on the Website. By accessing the
            Services after we make any such changes to these Terms of Service, you are deemed to have accepted such
            changes. Please refer back to these Terms of Service on a regular basis.
          </Paragraph>
        </li>
        <li>
          <Heading>TERMINATION OF THIS AGREEMENT</Heading>
          <Paragraph>
            We reserve the right, in our sole discretion, to restrict, suspend, or terminate this Agreement and the
            Services, and your access to all or any part of the Services, at any time and for any reason without prior
            notice or liability. Sections 2, 6-19, 22 shall survive the termination of this Agreement.
          </Paragraph>
          <br />
        </li>
        <li>
          <Heading>DIGITAL MILLENNIUM COPYRIGHT ACT</Heading>
          <Paragraph>
            ARC respects the intellectual property rights of others and attempts to comply with all relevant laws. We
            will review all claims of copyright infringement received and remove any ARC Content or User Content deemed
            to have been posted or distributed in violation of any such laws.
          </Paragraph>
          <Paragraph>
            Our designated agent under the Digital Millennium Copyright Act (the “<u>Act</u>”) for the receipt of any
            Notification of Claimed Infringement which may be given under that Act is as follows:
          </Paragraph>
          <div style={{ marginLeft: '0.5in' }}>
            <Paragraph>
              AR Creative Media, Inc.
              <br />
              141 Flushing Ave., Ste. 506
              <br />
              Brooklyn, NY 11205
              <br />
              Attn: Copyright Agent
              <br />
              Email: info@arcmedia.us
              <br />
            </Paragraph>
          </div>
          <Paragraph>
            If you believe that your work has been copied on the Services in a way that constitutes copyright
            infringement, please provide our agent with notice in accordance with the requirements of the Act, including
            (i) a description of the copyrighted work that has been infringed and the specific location on the Services
            where such work is located; (ii) a description of the location of the original or an authorized copy of the
            copyrighted work; (iii) your address, telephone number and e-mail address; (iv) a statement by you that you
            have a good faith belief that the disputed use is not authorized by the copyright owner, its agent or the
            law; (v) a statement by you, made under penalty of perjury, that the information in your notice is accurate
            and that you are the copyright owner or authorized to act on the copyright owner’s behalf; and (vi) an
            electronic or physical signature of the owner of the copyright or the person authorized to act on behalf of
            the owner of the copyright interest.
          </Paragraph>
        </li>
        <li>
          <Heading>DOWNLOADING THE APP APPLICATION.</Heading>
          <Paragraph>
            We make the App available through the Google Play Store or Apple App Store. The following terms apply to the
            App when accessed through or downloaded from the Apple App Store where the App may now or in the future be
            made available. You acknowledge and agree that:
          </Paragraph>
          <Paragraph>
            These Terms of Service are between you and ARC, and not with Apple, and ARC (not Apple), is solely
            responsible for the App.
          </Paragraph>
          <Paragraph>
            Apple has no obligation to furnish any maintenance and support services with respect to the App.
          </Paragraph>
          <Paragraph>
            In the event of any failure of the App to conform to any applicable warranty, you may notify Apple, and
            Apple will refund the purchase price for the App to you (if applicable) and, to the maximum extent permitted
            by applicable law, Apple will have no other warranty obligation whatsoever with respect to the App. Any
            other claims, losses, liabilities, damages, costs or expenses attributable to any failure to conform to any
            warranty will be the sole responsibility of ARC.
          </Paragraph>
          <Paragraph>
            Apple is not responsible for addressing any claims you have or any claims of any third party relating to the
            App or your possession and use of the App, including, but not limited to: (i) product liability claims; (ii)
            any claim that the App fails to conform to any applicable legal or regulatory requirement; and (iii) claims
            arising under consumer protection or similar legislation.
          </Paragraph>
          <Paragraph>
            In the event of any third party claim that the App or your possession and use of that App infringes that
            third party’s intellectual property rights, ARC will be solely responsible for the investigation, defense,
            settlement and discharge of any such intellectual property infringement claim to the extent required by this
            Agreement.
          </Paragraph>
          <Paragraph>
            Apple and its affiliates are third-party beneficiaries of this Agreement as related to your license to the
            App, and that, upon your acceptance of this Agreement, Apple will have the right (and will be deemed to have
            accepted the right) to enforce this Agreement as related to your license of the App against you as a
            third-party beneficiary thereof.
          </Paragraph>
          <Paragraph>
            You represent and warrant that (i) you are not located in a country that is subject to a U.S. Government
            embargo, or that has been designated by the U.S. Government as a terrorist-supporting country; (ii) you are
            not listed on any U.S. Government list of prohibited or restricted parties; (iii) you are not an individual,
            or associated with an entity, designated under the UK’s Terrorist Asset-Freezing etc. Act 2010 (TAFA 2010);
            and (iv) you are not otherwise subject to or affected in any way by any national security or terrorism
            related rules whether applicable to you personally or to your location or other circumstances.
          </Paragraph>
          <Paragraph>
            You must also comply with all applicable third party terms of service when using the App.
          </Paragraph>
        </li>
        <li>
          <Heading>GENERAL.</Heading>
          <Paragraph>
            Our failure to act on or enforce any provision of the Agreement shall not be construed as a waiver of that
            provision or any other provision in this Agreement. No waiver shall be effective against us unless made in
            writing, and no such waiver shall be construed as a waiver in any other or subsequent instance. Except as
            expressly agreed by us and you in writing, this Agreement constitutes the entire Agreement between you and
            us with respect to the subject matter, and supersedes all previous or contemporaneous agreements, whether
            written or oral, between the parties with respect to the subject matter. The section headings are provided
            merely for convenience and shall not be given any legal import. This Agreement will inure to the benefit of
            our successors, assigns, licensees, and sublicensees.
          </Paragraph>
        </li>
        <li>
          <Heading>HOW TO CONTACT US.</Heading>
          <Paragraph>
            If you have questions about the Agreement or our Services, please contact us via email at info@arcmedia.us.
          </Paragraph>
          <Paragraph>
            YOU HEREBY ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS, UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. IF
            YOU ARE ENTERING THESE TERMS ON BEHALF OF AN ENTITY, YOU REPRESENT AND WARRANT THAT YOU HAVE THE RIGHT AND
            AUTHORITY TO LEGALLY BIND THE ENTITY TO THESE TERMS.
          </Paragraph>
          <Paragraph>I AGREE</Paragraph>
          <br />
          <Paragraph>Copyright 2021 AR Creative Media, Inc. All rights reserved.</Paragraph>
        </li>
      </ol>
    </div>
  )
}

export default Terms
