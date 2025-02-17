import randomDataDevicePlugin from './devices/index'
import currentWindowFeaturePlugin from './feature/index'
import averageVoltageScorePlugin from './score/index'
import mainProcessFeedbackPlugin from './feedback/index'


export default {
    __randomDataDevice: randomDataDevicePlugin,
    __window: currentWindowFeaturePlugin,
    __averageVoltageScore: averageVoltageScorePlugin,
    __mainProcessFeedback: mainProcessFeedbackPlugin,
}