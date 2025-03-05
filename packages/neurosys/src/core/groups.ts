const isEmptyObject = (value: any) => value && typeof value === 'object' && !Object.keys(value).length

export class StandardGroup<T> {
    
    __items: Record<string, T> = {}
    
    constructor(items = {}){
        this.__items = items
        Object.keys(this.__items).map(this.#clearEmptyObjects)

    }


    #clearEmptyObjects = (key: string) => {
        const resolved = this.__items[key]
        for (const k in resolved) {
            const value = resolved[k]
            if (isEmptyObject(value)) delete resolved[k]
        }
    }

    set(
        key: string, 
        value: Partial<T>
    ) {

        const newItem = this.has(key) ? { ...this.__items[key], ...value } : value // Merge vs. set
        this.__items[key] = Object.entries(newItem).reduce((acc, [ k, v ]) => !v ? acc : { ...acc, [k]: v }, {}) // Remove falsy values
        this.#clearEmptyObjects(key)

        return this.__items[key]
    }

    get(key: string) {
        return this.__items[key]
    }

    has(key: string) {
        return key in this.__items
    }

    remove(key: string) {
        delete this.__items[key]
    }

    export() {
        return Object.entries(this.__items).reduce((acc, [key, value]) => {
            if (isEmptyObject(value)) return acc // Remove empty objects
            return { ...acc, [key]: value }
        }, {})
    }
}

export class ExclusiveGroup<T> extends StandardGroup<T> {

    constructor(items: Record<string, T> = {}) {
        super(items)
        const nEnabled = this.#ensureAtLeastOneEnabled()
        if (nEnabled > 1) this.#ensureOnlyOneEnabled(Object.keys(this.__items)[0])
    }

    #ensureOnlyOneEnabled = (key: string) => {
        for (const k in this.__items) {
            if (k === key) continue
            delete this.__items[k].enabled // Disable all others
        }
    }

    #ensureAtLeastOneEnabled = () => {
        const items = Object.values(this.__items)
        const nEnabled = items.filter(({ enabled }) => !!enabled).length

        if (nEnabled === 0) {
            items[0].enabled = true // Enable the first one
            return 1
        }

        return  nEnabled
    }

    set(key: string, value: T) {
        const resolved = super.set(key, value)
        if (resolved && resolved.enabled) this.#ensureOnlyOneEnabled(key)
        this.#ensureAtLeastOneEnabled()
        return resolved
    }

}



