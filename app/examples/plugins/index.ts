import randomDataDevicePlugin from './devices/index'
import currentWindowFeaturePlugin from './feature/index'
import averageVoltageEvaluationPlugin from './evaluation/index'
import { print, printInMainProcess} from './outputs/index'


export default {
    devices: {
        random: randomDataDevicePlugin,
    },
    features: {
        window: currentWindowFeaturePlugin,
    },
    evaluations: {
        averageVoltage: averageVoltageEvaluationPlugin,
    },
    outputs: {
        printInMainProcess,
        print,
    }
}