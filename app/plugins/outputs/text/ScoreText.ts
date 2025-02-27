import { LitElement, html, css } from 'lit';


// const element = document.createElement('p')
// element.style.padding = "10px 20px"
// element.style.color = "white"
// element.style.background = "#111"
// element.style.borderRadius = "10px"
// element.style.position = "absolute"
// element.style.top = "35px"
// element.style.right = "25px"
// element.innerHTML = "<b>Score:</b> <span class='score'>—</span>"
// document.body.append(element)
// const scoreEl = element.querySelector(".score") as HTMLSpanElement


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
