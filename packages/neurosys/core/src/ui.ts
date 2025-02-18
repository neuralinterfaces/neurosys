import { setIgnoreMouseEvents } from "./interactions"

export const createModal = ({ title, content }: { 
  title: string,
  content?: HTMLElement,
  emptyMessage?: string
}) => {

  const modal = document.createElement('dialog') 

  const header = document.createElement('header')
  header.innerText = title
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
  modal.addEventListener('close', () => setIgnoreMouseEvents(true))

  const ogShowModal = modal.showModal.bind(modal)
  modal.showModal = async () => {
    await setIgnoreMouseEvents(false)
    ogShowModal()
  }

  return modal
}