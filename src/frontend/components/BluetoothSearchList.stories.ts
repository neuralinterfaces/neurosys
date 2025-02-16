// import { fn } from '@storybook/test';

import type { Meta, StoryObj } from '@storybook/web-components';

import type { BluetoothSearchListProps } from './BluetoothSearchList';
import { BluetoothSearchList } from './BluetoothSearchList';

const exampleDeviceList = [
    { deviceId: 'id1', deviceName: 'Device-1' },
    { deviceId: 'id2', deviceName: 'Device-2' },
    { deviceId: 'id3', deviceName: 'Device-3' },
]

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'Lists/BluetoothSearch',
  tags: ['autodocs'],
  render: (args) => new BluetoothSearchList(args),
  argTypes: {
    emptyMessage: { control: 'text' }
  },
  args: { 
    emptyMessage: "No devices found.",
  },
} satisfies Meta<BluetoothSearchListProps>;

export default meta;
type Story = StoryObj<BluetoothSearchListProps>;


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