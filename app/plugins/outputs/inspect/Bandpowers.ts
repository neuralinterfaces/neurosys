import { LitElement, html, css } from 'lit';

type BandpowersProps = {
    data: Record<string, Record<string, number>>
}

export class Bandpowers extends LitElement {
  static styles = css`

    :host {
      font-family: 'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }

    table {
        margin: 0;
        color: white;
        background: #111;
        border-radius: 5px;
        width: 100%;
        padding: 5px;
        font-size: 14px;
        border-collapse: separate; /* Needed for border-spacing to work */
        border-spacing: 10px; /* Sets gap between cells */
    }
        

    th {
        white-space: nowrap;
        width: min-content;
        font-weight: bold;
        text-align: right;
    }

    th:first-child {
        white-space: nowrap;
    }

    th:last-child {
        padding-left: 10px;
        width: 100%;
    }

    table tr {
        align-items: center;
        gap: 20px;
    }


    tr strong {
        font-size: 90%;
    }

    tr .bands {
        display: flex;
        flex-grow: 1;
        height: 10px;
        border-radius: 5px;
        overflow: hidden;
        background: #444;
    }

    .band {
        height: 100%;
    }

    .band.delta {
        background: #ff6969;
    }

    .band.theta {
        background: #fff569;
    }

    .band.alpha {
        background: #6cff69;
    }
        
    .band.beta {
        background: #69a3ff;
    }

    .band.gamma {
        background: #ff69f3;
    }

  `;

  static properties = {
    data: { type: Object }
  };

  declare data: BandpowersProps['data']

  constructor({ data = {} }: BandpowersProps = { data: {}}) {
    super();
    this.data = data;
  }

  render() {

    if (!Object.keys(this.data).length) return


    return html`<table>
        ${Object.entries(this.data).map(([ch, bands]) => html`
            <tr>
                <th>${ch}</th>
                <th>
                    <div class="bands">
                        ${Object.entries(bands).map(([band, value]) => html`<div
                            class="band ${band}"
                            style="width: ${value * 100}%"
                        ></div>`)}
                    </div>
                </th>
            </tr>
        `)}
    </table>`;
  }
}

customElements.define('bandpowers-component', Bandpowers);
