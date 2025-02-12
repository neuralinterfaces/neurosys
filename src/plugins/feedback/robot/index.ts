
const feedback = {
    name: "Robot.js Mouse Noise"
}

export function load () {

    return {
        feedback,
        set: (score) => this.send("robot.mouseNoise", score)
    }

}

export const desktop = {
        load: async function() {

            let mouseNoise = 0
            const MAX_RADIAL_DISPLACEMENT = 10

            // Move the mouse across the screen as a sine wave.
            const robot = require('robotjs');

            // Track the displacement so that the mouse is always centered around a user-defined point
            const animationFunction = () => {

                const { x: currentX, y: currentY } = robot.getMousePos()

                const radialDisplacement = mouseNoise * MAX_RADIAL_DISPLACEMENT
                const angularDisplacement = Math.random() * Math.PI * 2

                const xDisp = radialDisplacement * Math.cos(angularDisplacement)
                const yDisp = radialDisplacement * Math.sin(angularDisplacement)

                const x = currentX + xDisp
                const y = currentY + yDisp

                robot.moveMouse(x, y);
                setTimeout(animationFunction, 1000 / 60);
            }

            // Start the animation
            animationFunction()

            // Allow for the noise level to be set from the main thread
            this.on("robot.mouseNoise", (event, level) => mouseNoise = level)

        }
    }
},