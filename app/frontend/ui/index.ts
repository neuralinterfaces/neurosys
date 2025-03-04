
export * from './DeviceDiscoveryList'
export * from './DeviceList'

const setIgnoreMouseEvents = async (ignore: boolean) => {
  const { commoners = {} } = globalThis
  const { overlay } = await commoners.READY
  if (!overlay) return
  const { setIgnoreMouseEvents } = overlay
  setIgnoreMouseEvents(ignore)
}

// export const registerAsInteractive = async (element: HTMLElement) => {
//   element.onmouseover = () => setIgnoreMouseEvents(false)
//   element.onmouseout = () => setIgnoreMouseEvents(true)
// }


export const createModal = ({ header, content }: { 
  header: string | HTMLElement,
  content?: HTMLElement
}) => {

  const modal = document.createElement('dialog') 

  if (typeof header === 'string') {
    const headerElement = document.createElement('header')
    headerElement.innerText = header
    header = headerElement
  }

  modal.appendChild(header)

  const main = document.createElement('main')
  modal.appendChild(main)

  const footer = document.createElement('footer')
  modal.appendChild(footer)

  if (content) main.appendChild(content)

  // Dismiss modal if user clicks outside on the backdrop
  modal.addEventListener('click', (event) => {
    const target = event.target as Node
    if (target === modal) modal.close()
  });

  // Ensure that no interactions can happen when a modal is open
  modal.addEventListener('close', async () => setIgnoreMouseEvents(true))

  const ogShowModal = modal.showModal.bind(modal)
  modal.showModal = async () => {
    await setIgnoreMouseEvents(false)
    ogShowModal()
  }

  return modal
}