import { resolvePlugins } from "./commoners"

// Example Search Params: ?output=textFeedback&output=inspectFeedback&score=alphaScore
const searchParams = new URLSearchParams(window.location.search)

const urlSettings = {
    outputs: searchParams.getAll('output').reduce((acc, key) => ({ ...acc, [key]: { enabled: true } }), {}),
    score: searchParams.getAll('score').reduce((acc, key) => ({ ...acc, [key]: { enabled: true } }), {})
}

const hasUrlSettings = Object.values(urlSettings).some((o) => Object.keys(o).length > 0)

const enableSettings = async (enabled: boolean) => {
    const { menu: { enableSettings } } = await resolvePlugins()
    enableSettings(enabled)
}  

export const onSaveSettings = async (fn: Function) => {
  const { menu: { onSaveSettings } } = await resolvePlugins()
  onSaveSettings(fn)
}

export const loadSettings = async (data?: Record<string, any>) => {
    const { menu: { loadSettings } } = await resolvePlugins()
    if (!data) data = await SETTINGS.data
    loadSettings(data)
}

export const getSettings = async () => {
  const { settings } = await resolvePlugins()
  if (!settings) return {}
  const { get } = settings
  return get('settings')
}

const SETTINGS = {
    name: 'settings',
    data: hasUrlSettings ? urlSettings : getSettings(),
}


export const setValueInSettings = async (path: string, value: any) => {
  let resolved = await SETTINGS.data
  const segments = path.split('.')
  const lastSegment = segments.pop()
  for (const segment of segments) resolved = resolved[segment] ?? ( resolved[segment] = {} )
  const hasChanged = JSON.stringify(resolved[lastSegment]) !== JSON.stringify(value)
  if (!hasChanged) return
  resolved[lastSegment] = value
  enableSettings(true)
}


// ----------------------- Start Default Behaviors -----------------------
onSaveSettings(async () => {
    const { settings: { set } } = await resolvePlugins()
    const { name, data } = SETTINGS
    set(name, await data)
    enableSettings(false)
})