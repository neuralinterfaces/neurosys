import './style.css'

import { ScreenBrightness } from '@capacitor-community/screen-brightness';

import * as capacitorVolume from '@ottimis/capacitor-volumes'

import * as desktop from './desktop'

const rangeSlider = document.querySelector("input[type='range']") as HTMLInputElement
const toggleAnimationButton = document.querySelector("button") as HTMLButtonElement


const { WEB, DESKTOP, MOBILE, READY, PLUGINS, SERVICES } = commoners

let canIgnoreMouseEvents = true

const setIgnoreMouseEvents = async (ignore: boolean) => {
  const { transparent: { setIgnoreMouseEvents } } = await READY
  setIgnoreMouseEvents(ignore)
}

const getRenderedLevel = () => parseFloat(rangeSlider.value) // Between 0 and 1

const updateAppBrightness = async (level = getRenderedLevel()) => document.body.style.backgroundColor = `rgba(0, 0, 0, ${level})`
updateAppBrightness()


const registerAsInteractive = async (element: HTMLElement) => {
  element.onmouseover = () => setIgnoreMouseEvents(false)
  element.onmouseout = () => setIgnoreMouseEvents(canIgnoreMouseEvents)
}

const setGeneralLevel = async (level: number) => {

  updateAppBrightness(level)

  // Forward the level to a system-level service
  if (DESKTOP) {
    const volumeResult = await desktop.setVolume(level)
    const brightnessResult = await desktop.setBrightness(level)
    console.log(volumeResult, brightnessResult)
    return
  }

  // Forward the level to a system-level Capacitor plugin
  if (MOBILE) {

    await ScreenBrightness.setBrightness({ brightness: level });

    capacitorVolume.setVolumeLevel({ 
      value: level, 
      type: 'system' 
    })
  }

  // Cannot handle system-level volume control on the web

  console.error('No volume control available')
}


// Manually set the level and interrupt the animation
rangeSlider.addEventListener('input', async (e) => {
  runAnimation = false
  const level = getRenderedLevel()
  setGeneralLevel(level)
})


// Animate range slider in a sine wave loop
const animateSlider = () => {
  if (!runAnimation) return
  const level = (Math.sin(Date.now() / 1000) + 1) / 2
  rangeSlider.value = level.toString()
  updateAppBrightness(level)
  requestAnimationFrame(animateSlider)
}

let runAnimation = true
toggleAnimationButton && toggleAnimationButton.addEventListener('click', () => {
  runAnimation = !runAnimation
  if (runAnimation) animateSlider()
})


registerAsInteractive(rangeSlider)
registerAsInteractive(toggleAnimationButton)
