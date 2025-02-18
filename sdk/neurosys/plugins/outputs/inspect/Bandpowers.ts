import { LitElement, html, css } from 'lit';

type BandpowersProps = {
    data: Record<string, Record<string, number>>
}

export class Bandpowers extends LitElement {
  static styles = css`

    :host {
      font-family: 'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }

    #channels-container {
        display: flex;
        flex-direction: column;
        color: white;
        background: #111;
        width: min-content;
        border-radius: 5px;
    }

    #channels-container .channel {
        display: flex;
        justify-content: end;
        align-items: center;
        gap: 20px;
        padding: 10px 20px;

    }

    #channels-container .channel:not(:first-child) {
        padding-top: 0px
    }

    #channels-container .channel strong {
        font-size: 90%;
    }

    #channels-container .bands {
        display: flex;
        width: 150px;
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
    return html`<div id="channels-container">
        ${Object.entries(this.data).map(([ch, bands]) => html`
            <div class="channel">
                <strong>${ch}</strong>
                <div class="bands">
                ${Object.entries(bands).map(([band, value]) => html`<div
                    class="band ${band}"
                    style="width: ${value * 100}%"
                ></div>`)}
                </div>
            </div>
        `)}
    </div>`;
  }
}

customElements.define('bandpowers-component', Bandpowers);
