// import { fn } from '@storybook/test';

import type { Meta, StoryObj } from '@storybook/web-components';

import type { DeviceListProps } from '../../frontend/components/DeviceList';
import { DeviceList } from '../../frontend/components/DeviceList';

const exampleDeviceList = [
    { name: 'EEG Device', protocols: { generate: "Generate", load: { label: "Load File", enabled: false } }, category: 'EEG' },
    { name: 'EMG Device', protocols: { generate: "Generate" }, category: 'EMG' },
    { name: 'ECG Device', protocols: { generate: "Generate" }, category: 'ECG' },
    { name: 'Misc Device', protocols: { generate: "Generate" }, category: 'Misc' },
]

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Lists/Devices',
  tags: ['autodocs'],
  render: (args) => new DeviceList(args),
  argTypes: {
    // backgroundColor: { control: 'color' },
    // size: {
    //   control: { type: 'select' },
    //   options: ['small', 'medium', 'large'],
    // },
  },
  args: { 
    // onClick: fn() 
  },
} satisfies Meta<DeviceListProps>;

export default meta;
type Story = StoryObj<DeviceListProps>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Populated: Story = {
  args: {
    devices: exampleDeviceList
  },
};