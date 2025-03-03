// import { fn } from '@storybook/test';

import type { Meta, StoryObj } from '@storybook/web-components';

import { JSONSchemaForm } from './JSONSchemaForm';
import type { FormProps } from './JSONSchemaForm';

import schema from './schemas/demo/demo.schema.ts';
import data from './schemas/demo/demo.data.ts';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'App/JSONSchemaForm',
  render: (args) => new JSONSchemaForm(args)
} satisfies Meta<FormProps>;

export default meta;
type Story = StoryObj<FormProps>;


export const AllFeatures: Story = {
  args: {
    schema,
    data
  },
};