
import { LitElement, css } from 'lit';
import { Bandpowers } from './Bandpowers';
import { Score } from './Score';

type Feature = Bandpowers | Score
export type FeaturesCollectionProps = Feature[]


export class FeaturesCollection extends LitElement {
    static styles = css`

    :host {
        box-sizing: border-box;
        font-family: 'Nunito Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
        display: flex;
        flex-direction: column;
        gap: 10px;
        width: 300px;
    }
  `;


    constructor(private features: Feature[]) {
        super();
        this.features = features
    }

    render() {
        return this.features
    }
}

customElements.define('features-collection', FeaturesCollection);
