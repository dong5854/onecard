import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { BackgroudMusic } from './BackgroudMusic';

const meta = {
  title: 'GameObject/BackgroundMusic',
  component: BackgroudMusic,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    url : {control : 'text'}
  }
} satisfies Meta<typeof BackgroudMusic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MainBGM : Story = {
  args: {
    url : "audio/bgm/SHK_101_Enjoy_Ending.mp3"
  }
}