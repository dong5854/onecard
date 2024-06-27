import type { Meta, StoryObj } from '@storybook/react';
import { BackgroundMusic } from './BackgroudMusic';

const meta = {
  title: 'GameObject/BackgroundMusic',
  component: BackgroundMusic,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    url : {control : 'text'}
  }
} satisfies Meta<typeof BackgroundMusic>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MainBGM : Story = {
  args: {
    url : "audio/bgm/SHK_055_Cosmic_Rainbow.mp3"
  }
}