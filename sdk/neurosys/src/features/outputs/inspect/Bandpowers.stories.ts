// import { fn } from '@storybook/test';

import type { Meta, StoryObj } from '@storybook/web-components';

import type { BandpowersProps } from './Bandpowers';
import { Bandpowers } from './Bandpowers';

const exampleBandpowerData = {
  Fp1: { 'delta': 0.2, 'theta': 0.2, 'alpha': 0.3, 'beta': 0.1, 'gamma': 0.1 },
  Fp2: { 'alpha': 0.3, 'beta': 0.5 },
  AUX: { 'delta': 0.1, 'theta': 0.2 },
}

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Plugins/Outputs/Inspect/Bandpowers',
  tags: [ 'plugin', 'output', 'inspect' ],
  render: (args) => new Bandpowers(args)
} satisfies Meta<BandpowersProps>;

export default meta;
type Story = StoryObj<BandpowersProps>;


export const Populated: Story = {
  args: {
    data: exampleBandpowerData
  },
};

export const Empty: Story = {
  args: {
    data: {}
  },
};