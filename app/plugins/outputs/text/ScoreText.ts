import { LitElement, html, css } from 'lit';

export interface ScoreTextProps {
    score: number | typeof NaN
}

export class ScoreText extends LitElement {
  static styles = css`

    :host {
      font-family: 'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    }

    div {
        display: flex;
        gap: 10px;
        align-items: end;
        padding: 10px 20px;
        border-radius: 5px;
        background: #111;
        color: white;
        width: min-content;
        white-space: nowrap;
    }

    span {
        font-size: 90%;
    }
   
  `;

  static properties = {
    score: { type: Number }
  };

  declare score: ScoreTextProps['score']

  constructor({ score = NaN }: ScoreTextProps = { score: NaN}) {
    super();
    this.score = score;
  }

  render() {
    const hasScore = this.score !== undefined && this.score === this.score;
    return html`<div>
       <b>Score</b><span>${hasScore ? this.score.toFixed(3) :  "—"}</span>
    </div>`;
  }
}

customElements.define('scoretext-component', ScoreText);
