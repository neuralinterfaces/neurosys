import randomDataDevicePlugin from './devices/index'
import currentWindowFeaturePlugin from './feature/index'
import averageVoltageScorePlugin from './score/index'
import mainProcessOutputPlugin from './outputs/index'


export default {
    device: {
        random: randomDataDevicePlugin,
    },
    feature: {
        window: currentWindowFeaturePlugin,
    },
    score: {
        averageVoltage: averageVoltageScorePlugin,
    },
    outputs: {
        mainProcess: mainProcessOutputPlugin,
    }
}