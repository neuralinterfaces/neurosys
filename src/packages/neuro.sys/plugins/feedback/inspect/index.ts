
export default {
    load() {
        return {
            label: 'Inspect Features',

            async start() {

                // Dynamic import to avoid conflict with Commoners
                const Bandpowers = (await import('./Bandpowers')).Bandpowers

                const featuresDiv = document.createElement("div")
                featuresDiv.style.position = "absolute"
                featuresDiv.style.top = "40px";
                featuresDiv.style.left = "10px";
                featuresDiv.style.display = "flex";
                featuresDiv.style.flexDirection = "column";
                featuresDiv.style.gap = "10px";

                const bandpowersDisplay = new Bandpowers()
                featuresDiv.append(bandpowersDisplay)
                document.body.append(featuresDiv)

                return { 
                    container: featuresDiv,
                    bandpowers: bandpowersDisplay
                }
            },
            stop({ container }) {
                container.remove()
            },
            set(score, info) {
                const { bandpowers: bandEl } = info
                const { bands } = this.__features
                if (bands) bandEl.data = bands
            }
        }
    }
}