import { InviteService, useInviteState } from '../../social/services/InviteService'
import styles from "./index.module.scss";
import {Button} from "@xrengine/editor/src/components/inputs/Button";
import React, { useEffect } from "react";
import { useTranslation } from 'react-i18next'

interface Props {
    animate?: any
}

const InviteToast = (props: Props) => {
    const InviteState = useInviteState()
    console.log('InviteState', InviteState)
    const newestInvite = InviteState.receivedInvites.total.value > 0 ? InviteState.receivedInvites.invites[0].value : {}
    console.log('newestInvite', newestInvite)
    const { t } = useTranslation()

    useEffect(() => {
        InviteService.retrieveReceivedInvites('decrement', undefined, 'createdAt', 'desc')
    }, [])

    const acceptInvite = (invite) => {
        InviteService.acceptInvite(invite.id, invite.passcode)
    }

    const declineInvite = (invite) => {
        InviteService.declineInvite(invite)
    }
    return (
        <div className={`${styles.inviteToast}`}>
            {InviteState.receivedInvites.total.value > 0 &&
                <div>
                    <span>`${newestInvite.inviteType} from ${newestInvite.user?.name}`</span>
                    <Button variant="contained" className={styles.acceptBtn} onClick={() => acceptInvite(newestInvite)}>
                        {t('social:invite.accept')}
                    </Button>
                    <Button variant="contained" className={styles.declineBtn} onClick={() => declineInvite(newestInvite)}>
                        {t('social:invite.decline')}
                    </Button>
                </div>
            }
        </div>
    )
}

export default InviteToast