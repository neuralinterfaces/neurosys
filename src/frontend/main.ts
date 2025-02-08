import './style.css'

import { ScreenBrightness } from '@capacitor-community/screen-brightness';

import * as capacitorVolume from '@ottimis/capacitor-volumes'
console.log('capacitorVolume', capacitorVolume)

import * as desktop from './desktop'

const errorDisplay = document.querySelector("#error") as HTMLElement

const { DESKTOP, MOBILE, READY } = commoners

let canIgnoreMouseEvents = true

const setIgnoreMouseEvents = async (ignore: boolean) => {
  const { transparent: { setIgnoreMouseEvents } } = await READY
  setIgnoreMouseEvents(ignore)
}

const setMouseNoise = async (level: number) => {
  const { levels: { setMouseNoise } } = await READY
  setMouseNoise(level)
}

const onAnimationToggled = async (fn: Function) => {
  const { menu: { onAnimationToggled } } = await READY
  onAnimationToggled(fn)
}

const updateAppBrightness = async (level: number) => document.body.style.backgroundColor = `rgba(0, 0, 0, ${level})`
updateAppBrightness(0)


const registerAsInteractive = async (element: HTMLElement) => {
  element.onmouseover = () => setIgnoreMouseEvents(false)
  element.onmouseout = () => setIgnoreMouseEvents(canIgnoreMouseEvents)
}

const setGeneralLevel = async (level: number) => {

  updateAppBrightness(level)

  // Forward the level to a system-level service
  if (DESKTOP) {
    setMouseNoise(level)
    const volumeResult = await desktop.setVolume(level)
    const brightnessResult = await desktop.setBrightness(level)
    const error = volumeResult.error || brightnessResult.error
    errorDisplay.innerText = error ? `Error: ${error}` : ''
    return
  }

  // Forward the level to a system-level Capacitor plugin
  if (MOBILE) {

    await ScreenBrightness.setBrightness({ brightness: level });

    // capacitorVolume.setVolumeLevel({ 
    //   value: level, 
    //   type: 'system' 
    // })
  }

  // Cannot handle system-level volume control on the web

  console.error('No volume control available')
}


// Animate range slider in a sine wave loop
const animateSlider = () => {
  if (!runAnimation) return
  const level = (Math.sin(Date.now() / 1000) + 1) / 2
  setGeneralLevel(level) // Set the level displayed on the system
  requestAnimationFrame(animateSlider)
}

let runAnimation = false

onAnimationToggled(() => {
  runAnimation = !runAnimation
  if (runAnimation) animateSlider()
})