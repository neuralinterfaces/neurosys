import { FeatureId, MenuLabel, ResolvedFeature, Settings } from "./types"



type ScoreProps = {
    label: MenuLabel,
    features?: Record<FeatureId, Settings>,
    get: (resolvedFeatures: Record<FeatureId, ResolvedFeature>) => any
}

export class Score {

    label: ScoreProps['label']
    features: ScoreProps['features']
    get: ScoreProps['get']

    constructor(props: ScoreProps) {
        this.label = props.label
        this.features = props.features || {}
        this.get = props.get
    }
}