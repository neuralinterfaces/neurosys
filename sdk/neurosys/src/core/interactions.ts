import { resolvePlugins } from "./commoners"

export const setIgnoreMouseEvents = async (ignore: boolean) => {
  const { overlay } = await resolvePlugins()
  if (!overlay) return
  const { setIgnoreMouseEvents } = overlay
  setIgnoreMouseEvents(ignore)
}

export const registerAsInteractive = async (element: HTMLElement) => {
  element.onmouseover = () => setIgnoreMouseEvents(false)
  element.onmouseout = () => setIgnoreMouseEvents(true)
}