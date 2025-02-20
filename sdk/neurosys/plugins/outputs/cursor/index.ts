import { createCursor } from "./cursors/shader/shader"

import redSquareShader from './shaders/redSquare.glsl?raw'
import breathingCircle from './shaders/breathingCircle.glsl?raw'
import { Output } from "../../../core/src/plugins/output"

const cursorStyles = {
    width: '200px',
    height: '200px',
    transform: 'translate(-50%, -50%)',
    position: 'absolute',
    pointerEvents: 'none'
}

export function load() {

    return new Output({

        label: 'Cursor Animation',
        
        start() {

            const outputs = createCursor(breathingCircle)
            // const outputs = createCursor(redSquareShader)
            
            const { cursor } = outputs

            // Create a custom cursor
            Object.assign(cursor.style, cursorStyles)

            // Update the cursor position
            document.addEventListener('mousemove', (event) => {
                cursor.style.left = event.clientX + 'px'
                cursor.style.top = event.clientY + 'px'
            })

            function addEvent(obj, evt, fn) {
                if (obj.addEventListener) obj.addEventListener(evt, fn, false);
                else if (obj.attachEvent) obj.attachEvent("on" + evt, fn);
            }

            addEvent(window, "load", (e) => {
                addEvent(document, "mouseout", (e) => {
                    e = e ? e : window.event;
                    var from = e.relatedTarget || e.toElement;
                    if (!from || from.nodeName == "HTML") cursor.style.display = 'none';
                });

                addEvent(document, "mouseenter", () => {
                    cursor.style.display = 'block'; // NOTE: This calls alls the time...
                })

            });

            document.body.append(cursor)


            return outputs
        },

        set(score, info) {
            info.score = score
        },

        stop(outputs) {
            outputs.cursor.remove()
            outputs.animate = false
        }
    })
}