import type { Meta, StoryObj } from '@storybook/react';
import { StartGameButton } from './StartGameBtn';

const meta = {
  title: 'UI/StartGameButton',
  component: StartGameButton,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
} satisfies Meta<typeof StartGameButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: 'Start Game'
  }
}