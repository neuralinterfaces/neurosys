
import { css, html, LitElement } from "lit";

interface Device {
    name: string
    protocols: {
        id: string
        label: string
        enabled?: boolean
    }[],
    connect: (protocolId: string) => any
}

export interface DeviceListProps {
    devices?: Device[]
    onSelect?: (device: Device, protocol: string) => void
}

export class DeviceList extends LitElement {

    declare devices: Device[]
    declare onSelect: DeviceListProps["onSelect"]

    static get styles() {
        return css`
        
            :host {
              font-family: 'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            }
        
            ul {
                list-style: none;
                padding: 0px 20px;
                margin: 0;
            }

            ul li {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                align-items: center;
                padding: 20px 0px;
            }

            button {
                cursor: pointer;
            }

            .buttons {
                display: flex;
                gap: 10px;
            }

            ul li:not(:first-child) {
                border-top: 1px solid #333;
            }
        `
    }

    static properties = {
        devices: { type: Array },
    };


    constructor({ devices = [], onSelect }: DeviceListProps) {
        super();
        this.devices = devices
        this.onSelect = onSelect
    }

    render() {

        const resolvedAndSortedDevices = this.devices.map((info) => {

                // Resolve protocols
                const resolvedProtocols = Object.entries(info.protocols ?? {}).map(([ id, protocol ]) => {
                    const overrides = typeof protocol === 'string' ? { label: protocol } : {}
                    return { ...protocol, ...overrides, id }
                })
            
                return { ...info, protocols: resolvedProtocols}
            })
            .sort((a,b) => a.name.localeCompare(b.name))
            .sort((a,b) => {
                
        
            const firstAnyEnabled = a.protocols.find(({ enabled = !!a.connect }) => enabled)
            const secondAnyEnabled =  b.protocols.find(({ enabled = !!b.connect }) => enabled)
        
            if (!firstAnyEnabled && !secondAnyEnabled) return 0
            if (!firstAnyEnabled && secondAnyEnabled) return 1
            if (firstAnyEnabled && !secondAnyEnabled) return -1
        })
            


        return html`
            <ul>
                ${resolvedAndSortedDevices.map((info) => {
                const { name, protocols, connect } = info
                return html`
                    <li>
                        <strong>${name}</strong>
                        <div class="buttons">
                            ${protocols.map(({ id: protocol, label, enabled = !!connect }) => html`
                                <button ?disabled=${!enabled} @click=${async () => this.onSelect?.(info, protocol)}>${label}</button>
                            `)}
                        </div>
                    </li>
                `
            })}
            </ul>
        `
    }
}
customElements.define('device-list', DeviceList);