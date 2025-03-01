import { FeatureId, MenuLabel, ResolvedFeature, Settings } from "./types"



type EvaluationProps = {
    label: MenuLabel,
    features?: Record<FeatureId, Settings>,
    get: (resolvedFeatures: Record<FeatureId, ResolvedFeature>) => any
}

export class Evaluate {

    label: EvaluationProps['label']
    features: EvaluationProps['features']
    get: EvaluationProps['get']

    constructor(props: EvaluationProps) {
        this.label = props.label
        this.features = props.features || {}
        this.get = props.get
    }
}