import randomDataDevicePlugin from './devices/index'
import currentWindowFeaturePlugin from './feature/index'
import averageVoltageScorePlugin from './score/index'
import mainProcessFeedbackPlugin from './feedback/index'


export default {
    device: {
        randomDataDevice: randomDataDevicePlugin,
    },
    feature: {
        window: currentWindowFeaturePlugin,
    },
    score: {
        averageVoltage: averageVoltageScorePlugin,
    },
    feedback: {
        mainProcess: mainProcessFeedbackPlugin,
    }
}