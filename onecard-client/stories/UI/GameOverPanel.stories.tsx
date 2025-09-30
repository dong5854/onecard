import type { Meta, StoryObj } from '@storybook/react';
import GameOverPanel from '@/components/UI/GameOverPanel';
import { fn } from '@storybook/test';

const meta = {
	title: 'UI/GameOverPanel',
	component: GameOverPanel,
	parameters: {
		layout: 'fullscreen',
		backgrounds: {
			default: 'board',
			values: [{ name: 'board', value: '#0d1511' }],
		},
	},
	tags: ['autodocs'],
	argTypes: {
		winnerName: { control: 'text' },
		roundsPlayed: { control: { type: 'number', min: 0 } },
		cardsDrawn: { control: { type: 'number', min: 0 } },
		onRestart: { action: 'restart clicked' },
	},
} satisfies Meta<typeof GameOverPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		winnerName: 'Player 1',
		roundsPlayed: 7,
		cardsDrawn: 23,
		onRestart: fn(),
		variant: 'inline',
	},
};

export const UnknownWinner: Story = {
	args: {
		onRestart: fn(),
		roundsPlayed: 5,
		cardsDrawn: 12,
		variant: 'inline',
	},
};

export const Minimal: Story = {
	args: {
		winnerName: 'AI Bot',
		onRestart: fn(),
		variant: 'inline',
	},
};

export const OverlayExample: Story = {
	args: {
		winnerName: 'Player 1',
		roundsPlayed: 9,
		cardsDrawn: 30,
		onRestart: fn(),
		variant: 'overlay',
	},
};
