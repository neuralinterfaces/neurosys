
import type { Meta, StoryObj } from '@storybook/web-components';

import type { FeaturesCollectionProps } from './FeaturesCollection';
import { FeaturesCollection } from './FeaturesCollection';

import { Bandpowers } from './Bandpowers';
import { Score } from './Score';
import { Norm } from '../../../../sdk/neurosys/src/core';

// Score stuff
const randomValues = Array.from({ length: 10 }, () => Math.random());
const min = Math.min(...randomValues);
const max = Math.max(...randomValues);
const other = randomValues.find(v => v !== min && v !== max);
const range = max - min;



// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Plugins/Outputs/Inspect',
  tags: [ 'plugin', 'output', 'inspect' ],
  render: ({ bands, score }) => {
    const bandsComponent = new Bandpowers({ data: bands });
    const scoreComponent = new Score(score);
    
    // Animate the score
    if (score) setInterval(() => {
        const { info } = scoreComponent
        const raw = info.raw
        info.update(raw + (Math.random() - 0.5) * 0.1) // Random walk of the score
        scoreComponent.requestUpdate()
    }, 500)
    

    return new FeaturesCollection([scoreComponent, bandsComponent]);
  }
} satisfies Meta<FeaturesCollectionProps>;

export default meta;
type Story = StoryObj<FeaturesCollectionProps>;



export const ScoreDisplay: Story = {
    args: {
        score: {
            info: new Norm({ raw: other, min, max })
        }
    },
};

export const ScoreDisplayWithTarget: Story = {
    args: {
        score: {
            info: new Norm({ raw: other, min, max }),
            target: [ min + range * 0.7, min + range * 0.9 ]
        }
    },
};

export const BandpowersDisplay: Story = {
    args: {  
        bands: {
            Fp1: { 'delta': 0.2, 'theta': 0.2, 'alpha': 0.3, 'beta': 0.1, 'gamma': 0.1 },
            Fp2: { 'alpha': 0.3, 'beta': 0.5 },
            AUX: { 'delta': 0.1, 'theta': 0.2 },
        }
    },
};

export const AllFeatures: Story = {
    args: {
      ...BandpowersDisplay.args,
      ...ScoreDisplayWithTarget.args
    },
  };
  

export const Empty: Story = {
  args: {},
};