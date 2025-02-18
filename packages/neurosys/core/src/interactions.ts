import { resolvePlugins } from "./commoners/utils"

export const setIgnoreMouseEvents = async (ignore: boolean) => {
  const { systemOverlay } = await resolvePlugins()
  if (!systemOverlay) return
  const { setIgnoreMouseEvents } = systemOverlay
  setIgnoreMouseEvents(ignore)
}

export const registerAsInteractive = async (element: HTMLElement) => {
  element.onmouseover = () => setIgnoreMouseEvents(false)
  element.onmouseout = () => setIgnoreMouseEvents(true)
}