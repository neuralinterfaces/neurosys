// import { fn } from '@storybook/test';

import type { Meta, StoryObj } from '@storybook/web-components';

import type { ScoreTextProps } from './ScoreText';
import { ScoreText } from './ScoreText';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Plugins/Outputs/Text/ScoreText',
  tags: [ 'plugin', 'output', 'text' ],
  render: (args) => new ScoreText(args)
} satisfies Meta<ScoreTextProps>;

export default meta;
type Story = StoryObj<ScoreTextProps>;


export const Zero: Story = {
  args: {
    score: 0
  },
};

export const NotANumber: Story = {
  args: {
    score: NaN
  },
};

export const Positive: Story = {
  args: {
    score: 0.123
  },
};

export const Negative: Story = {
  args: {
    score: -0.123
  },
};

export const Large: Story = {
  args: {
    score: 123
  },
};