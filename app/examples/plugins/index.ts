import randomDataDevicePlugin from './devices/index'
import currentWindowFeaturePlugin from './feature/index'
import averageVoltageScorePlugin from './score/index'
import mainProcessOutputPlugin from './outputs/index'


export default {
    devices: {
        random: randomDataDevicePlugin,
    },
    features: {
        window: currentWindowFeaturePlugin,
    },
    scores: {
        averageVoltage: averageVoltageScorePlugin,
    },
    outputs: {
        mainProcess: mainProcessOutputPlugin,
    }
}