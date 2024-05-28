import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { PockerCard } from './PockerCard'

const meta = {
  title: 'GamObject/PockerCard',
  component: PockerCard,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    rank: { control: 'text' }, // rank prop을 텍스트로 입력할 수 있게 함
    suit: { control: 'select', options: ['clubs', 'hearts', 'diamonds', 'spades'] }, // suit prop을 드롭다운으로 선택할 수 있게 함
    isJoker: { control: 'boolean' }, // isJoker prop을 boolean으로 제어
  },
  args: { onClick: action('onClick'),  },
} satisfies Meta<typeof PockerCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    rank: 'A',
    suit: 'spades',
    isJoker: false,
  },
};

export const JokerCard: Story = {
  args: {
    isJoker: true,
  },
};

export const AceOfSpades: Story = {
  args: {
    rank: 'A',
    suit: 'spades',
    isJoker: false,
  },
}

export const FiveOfHearts: Story = {
  args: {
    rank: '5',
    suit: 'hearts',
    isJoker: false,
  },
};