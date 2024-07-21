import type { Meta, StoryObj } from '@storybook/react';
import PokerCard from "@/stories/GameObject/PokerCard";
import OverlappingCards from "./OverlappingCards";

const meta = {
  title: 'GameObject/OverlappingCards',
  component: OverlappingCards,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    spacing: { control: 'number' },
  },

} satisfies Meta<typeof OverlappingCards>;

export default meta;
type Story = StoryObj<typeof meta>;

const defaultCards = [
  <PokerCard key={1} rank={1} isJoker={false} isFlipped={false} suit="hearts" />,
  <PokerCard key={2} rank={13} isJoker={false} isFlipped={false} suit="spades" />,
  <PokerCard key={3} rank={12} isJoker={false} isFlipped={false} suit="diamonds" />,
  <PokerCard key={4} rank={10} isJoker={false} isFlipped={false} suit="clubs" />,
  <PokerCard key={5} rank={7} isJoker={false} isFlipped={false} suit="hearts" />,
];

// 기본 스토리
export const Default: Story = {
  args: {
    spacing: 30,
    children: defaultCards,
  },
};

// 간격이 넓은 스토리
export const WideSpacing: Story = {
  args: {
    ...Default.args,
    spacing: 50,
  },
};

// 카드가 적은 스토리
export const FewCards: Story = {
  args: {
    ...Default.args,
    children: defaultCards.slice(0, 3),
  },
};

// 카드가 많은 스토리
export const ManyCards: Story = {
  args: {
    ...Default.args,

    children: [
      ...defaultCards,
      <PokerCard key={6} rank={3} isJoker={false} isFlipped={false} suit="spades" />,
      <PokerCard key={7} rank={5} isJoker={false} isFlipped={false} suit="diamonds" />,
      <PokerCard key={8} rank={9} isJoker={false} isFlipped={false} suit="clubs" />,
    ],
  },
};

// 조커 포함 스토리
export const WithJoker: Story = {
  args: {
    ...Default.args,
    children: [
      ...defaultCards.slice(0, 2),
      <PokerCard key={3} isJoker={true} isFlipped={false} />,
      ...defaultCards.slice(3, 5),
    ],
  },
};

// 카드가 적은 스토리
export const FewCardsVertical: Story = {
  args: {
    ...Default.args,
    vertical: true,
    children: defaultCards.slice(0, 3),
  },
};

// 카드가 많은 스토리
export const ManyCardsVertical: Story = {
  args: {
    ...Default.args,
    vertical: true,
    children: [
      ...defaultCards,
      <PokerCard key={6} rank={3} isJoker={false} isFlipped={false} suit="spades" />,
      <PokerCard key={7} rank={5} isJoker={false} isFlipped={false} suit="diamonds" />,
      <PokerCard key={8} rank={9} isJoker={false} isFlipped={false} suit="clubs" />,
    ],
  },
};