import { Output } from "../../../../sdk/neurosys/src/core/plugins/output"

const print = new Output({
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
    set: ({ score }, info) => console.log(`Score (${info.counter})`, score)
})


const printInMainProcess = new Output({
    label: 'Print — Main Process',
    set ({ score }) {
        this.__commoners.send("score", score) 
    }
})

// Hijack the desktop methods
printInMainProcess.desktop = {
    load() { 
        this.on("score", (_, score) => console.log("Score:", score) ) 
    }
}

export {
    print,
    printInMainProcess
}