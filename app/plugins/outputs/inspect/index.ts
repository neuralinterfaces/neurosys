import { Output } from 'neurosys/plugins'


export default new Output({
    label: 'Inspect Features',

    async start() {

        const { FeaturesCollection } = await import('./FeaturesCollection')


        const Score = (await import('./Score')).Score

        // Dynamic import to avoid conflict with Commoners
        const Bandpowers = (await import('./Bandpowers')).Bandpowers

        const anchorDiv = document.createElement("div")
        anchorDiv.style.position = "absolute"
        anchorDiv.style.top = "50px";
        anchorDiv.style.left = "10px";

        const features = {
            score: new Score(),
            bands: new Bandpowers(),
        }

        const featuresCollection = new FeaturesCollection(Object.values(features))
        anchorDiv.append(featuresCollection)
        document.body.append(anchorDiv)


        return { 
            anchor: anchorDiv,
            features
        }
    },
    stop({ anchor }) {
        anchor.remove()
    },
    set({ bands, __score }, { features }) {
        if (bands) features.bands.data = bands
        if (__score) {
            features.score.info = __score // No way to pass target yet...
            features.score.requestUpdate() // Ensure re-render
        }
    }
})