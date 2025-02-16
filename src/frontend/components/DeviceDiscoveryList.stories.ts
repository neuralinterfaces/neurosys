// import { fn } from '@storybook/test';

import type { Meta, StoryObj } from '@storybook/web-components';

import type { DeviceDiscoveryListProps } from './DeviceDiscoveryList';
import { DeviceDiscoveryList } from './DeviceDiscoveryList';

const exampleDeviceList = [
    { id: 'id1', name: 'Device-1' },
    { id: 'id2', name: 'Device-2' },
    { id: 'id3', name: 'Device-3' },
]

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Lists/DeviceDiscovery',
  tags: ['autodocs'],
  render: (args) => new DeviceDiscoveryList(args),
  argTypes: {
    emptyMessage: { control: 'text' }
  },
  args: { 
    emptyMessage: "No devices found.",
  },
} satisfies Meta<DeviceDiscoveryListProps>;

export default meta;
type Story = StoryObj<DeviceDiscoveryListProps>;


export const Populated: Story = {
  args: {
    devices: exampleDeviceList
  },
};

export const Empty: Story = {
  args: {
    devices: []
  },
};