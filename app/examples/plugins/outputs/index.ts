import { Output } from "neurosys/plugins"

export const print = new Output({
    label: 'Print',
    start({ cache = 0 }) {
        const counter = cache + 1
        console.log('Plugin activated', counter)
        return { counter }
    },
    stop({ counter }) {
        console.log('Plugin deactivated')
        return { cache: counter }
    },
    set: (features, info) => console.log(`Features (${info.counter})`, features)
})


export const printInMainProcess = new Output({
    label: 'Print — Main Process',
    set (features) {
        this.__commoners.send("features", features) 
    }
})

// Hijack the desktop methods
printInMainProcess.desktop = {
    load() { 
        this.on("features", (_, features) => console.log("Features:", features) ) 
    }
}