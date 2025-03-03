import { LitElement, css, html } from 'lit';

import '@jsfe/form';
import type { JSONSchema7 } from '@jsfe/form';

// -----------------------------------------------------------------------------
function assertValidData(data: unknown): boolean {
	// Use your AJV or other schema checker here, if you need thorough validation
    console.log("validate data", data)
	return true;
}

export type FormProps = {
    data: any
    schema: JSONSchema7
}

export class JSONSchemaForm extends LitElement {

    declare data: FormProps['data']
    declare schema: FormProps['schema']

	static get styles() {
		return css`
			json-schema-form {
				margin: 2rem;
				width: calc(50rem + 5vw);
			}
		`;
	}

    static get properties() {
        return {
            data: { type: Object },
            schema: { type: Object }
        }
    }

    constructor({ data, schema }: FormProps) {
        super()
        this.schema = schema
        this.data = data
    }



	override render() {
		console.log('Rendering JSONSchemaForm...', this.schema, this.data);
		return html`
			<json-schema-form
				.schema=${this.schema}
				.uiSchema=${{
					bar: {
						'ui:widget': 'switch',
					},
				}}
				.data=${this.data}
				.dataChangeCallback=${(newData: unknown) => {
					console.log({ 'Data from Lit': newData });

					if (assertValidData(newData)) this.data = newData;
					else console.error('Invalid data!');
				}}
				.submitCallback=${(newData: unknown, valid: boolean) => {
					console.log({ 'Submitted from Lit!': newData, valid });

					if (assertValidData(newData)) {
						// Do stuff...
					}
				}}

				
			></json-schema-form>

			<pre>${JSON.stringify({ data: this.data }, null, 2)}</pre>
		`;
	}
}

customElements.define('custom-json-schema-form', JSONSchemaForm);