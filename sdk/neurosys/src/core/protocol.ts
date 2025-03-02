export type ProtocolSettings = {
    outputs: Record<string, any>
    evaluations: Record<string, any>
}

export class Protocol {

    outputs: ProtocolSettings['outputs'] = {}
    evaluations: ProtocolSettings['evaluations'] = {}

    constructor(settings: ProtocolSettings) {
        Object.assign(this, settings)
        console.log('Protocol loaded', this)
    }

    update(type: keyof ProtocolSettings, plugin: string, settings = {}) {
        const collection = this[type]
        const oldValue = collection[plugin]

        Object.assign(collection[plugin] ?? (collection[plugin] = {}), settings)

        const isOnlyDisabled = typeof settings === 'object' && Object.keys(settings).length <= 1 && !settings.enabled
        if (isOnlyDisabled) delete collection[plugin]     
        
        const hasChanged = JSON.stringify(oldValue) !== JSON.stringify(collection[plugin])

        return {
            changed: hasChanged,
            value: collection[plugin]
        }
    }
}