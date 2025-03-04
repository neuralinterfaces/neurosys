import { LitElement, css, html, unsafeCSS } from 'lit';

// Styling for light and dark themes
import '@jsfe/shoelace';
import lightCSS from '@shoelace-style/shoelace/dist/themes/light.css?raw'
import darkCSS from '@shoelace-style/shoelace/dist/themes/dark.css?raw'

import { utils } from 'neurosys'

import type { JSONSchema7, UiSchema } from '@jsfe/shoelace';

import Ajv from "ajv";
const ajv = new Ajv({ 
	allErrors: true, 
	$data: true
});

// -----------------------------------------------------------------------------
function assertValidData(data: any, schema: any) {
	const validate = ajv.compile(schema);
	const valid = validate(data);
	
	return {
		valid,
		errors: validate.errors
	}
}

export type FormProps = {
    data?: any
    schema: JSONSchema7,
	ui?: UiSchema,
	submitButton?: boolean
}

export class JSONSchemaForm extends LitElement {

	static get styles() {
		return css`
			${unsafeCSS(lightCSS)}
			@media (prefers-color-scheme: dark) {
				${unsafeCSS(darkCSS)}
			}
		`;
	}

    declare data: any
    declare schema: FormProps['schema']
	declare ui: FormProps['ui']
	declare submitButton: boolean

    static get properties() {
        return {
            data: { type: Object },
            schema: { type: Object },
			ui: { type: Object },
			submitButton: { type: Boolean }
        }
    }

    constructor({ 
		data = {}, 
		schema, 
		ui,
		submitButton = true
	}: FormProps) {
        super()
        this.schema = schema
        this.data = data
		this.ui = ui || {}
		this.submitButton = submitButton
    }


	override render() {

		const schema = utils.schema.resolveSchema(this.schema, this.data);
		const data = utils.schema.getTemplate(schema, this.data);

		return html`
			<jsf-shoelace
				.schema=${schema}
				.data=${data}
				.uiSchema=${this.ui}
				.submitButton=${this.submitButton}
				.dataChangeCallback=${(newData: unknown) => {
					const validation = assertValidData(newData, schema)
					if (validation.valid) this.data = newData
					else console.error('Invalid data:', validation.errors, structuredClone(newData))
					this.dispatchEvent(new CustomEvent('change', { detail: validation.valid }))
				}}
				.submitCallback=${(newData: unknown, valid: boolean) => {
					if (!valid) return 
					const schema = utils.schema.resolveSchema(this.schema, newData);
					const validation = assertValidData(newData, schema)
					if (!validation.valid) return console.error('Invalid data:', validation.errors, structuredClone(newData))
					this.dispatchEvent(new CustomEvent('submit'))
				}}
			></jsf-shoelace>
		`;
	}
}

customElements.define('custom-json-schema-form', JSONSchemaForm);