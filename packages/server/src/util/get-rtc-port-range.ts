import app from '../app';
import config from '../config';

interface RtcPortRange {
    startPort: number;
    endPort: number;
}

export default async (startPort: number, blockSize: number) => {
    try {
        console.log('getRtcPortRange')
        const portBlockResult = await app.service('rtc-ports').find({
            query: {
                start_port: startPort,
                end_port: startPort + blockSize
            }
        })
        console.log(portBlockResult)
        if ((portBlockResult as any).total === 0) {
            if (startPort + blockSize >= config.gameserver.rtc_end_port) {
                throw Error('No more RTC port available for gameserver use!')
            }
            await app.service('rtc-ports').create({
                allocated: true,
                start_port: startPort,
                end_port: startPort + blockSize
            });

            config.gameserver.rtc_start_port = startPort;
            config.gameserver.rtc_end_port = startPort + blockSize;
            return;
        } else {
            const block = (portBlockResult as any).data[0]
            if (block.allocated === true) {
                return this.getRtcPortRange(startPort + blockSize, blockSize);
            }
            await app.service('rtc-ports').patch(block.id, {
                allocated: true
            });

            config.gameserver.rtc_start_port = startPort;
            config.gameserver.rtc_end_port = startPort + blockSize;
            return;
        }
    } catch (err) {
        console.log('get RTC port range error')
        console.log(err)
    }
}