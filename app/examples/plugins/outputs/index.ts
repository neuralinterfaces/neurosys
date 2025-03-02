import { Output } from "neurosys/plugins"

export const print = new Output({
    label: 'Print',
    start() {
        const { cache = 0 } = this
        const counter = cache + 1
        console.log('Plugin activated', counter)
        this.counter = counter
    },
    stop() {
        console.log('Plugin deactivated')
        this.cache = this.counter
    },
    set(features){
        console.log(`Features (${this.counter})`, features)
    }
})


export const printInMainProcess = new Output({
    label: 'Print — Main Process',
    set (features) {
        this.commoners.send("features", features) 
    }
})

// Hijack the desktop methods
printInMainProcess.desktop = {
    load() { 
        this.on("features", (_, features) => console.log("Features:", features) ) 
    }
}