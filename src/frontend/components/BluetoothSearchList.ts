import { css, html, LitElement } from "lit";

interface Device {
    deviceName: string
    deviceId: string
}

export interface BluetoothSearchListProps {
    devices?: Device[]
    emptyMessage?: string
    onSelect?: (deviceId: string) => void
}

export class BluetoothSearchList extends LitElement {

    declare devices: Device[]
    declare emptyMessage: string
    declare onSelect: BluetoothSearchListProps["onSelect"]


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

            .empty {
                display: block;
                padding: 20px;
                text-align: center;
                font-size: 80%;
            }

            ul li {
                display: flex;
                justify-content: space-between;
                gap: 10px;
                align-items: center;
                padding: 20px 0px;
            }

            ul li {
                cursor: pointer;
            }

            ul li:not(:first-child) {
                border-top: 1px solid #333;
            }
        `
    }

    static properties = {
        devices: { type: Array },
        emptyMessage: { type: String },
    };


    constructor({ 
        devices = [], 
        emptyMessage = "",
        onSelect
    }: BluetoothSearchListProps) {
        super();
        this.devices = devices
        this.emptyMessage = emptyMessage
        this.onSelect = onSelect
    }

    render() {

        const isEmpty = !this.devices.length
        if (isEmpty) return html`<div class="empty">${this.emptyMessage}</div><ul></ul>`

        return html`
            <ul>
                ${this.devices.map(({ deviceName, deviceId }) => html`
                    <li @click=${() => this.onSelect?.(deviceId)} data-device-id=${deviceId}>${deviceName}</li>
                `)}
            </ul>
        `
    }
}
customElements.define('bluetooth-search-list', BluetoothSearchList);