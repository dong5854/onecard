import type { Meta, StoryObj } from '@storybook/react';
import PlayerBadge from '@/components/UI/PlayerBadge';

const meta = {
	title: 'UI/PlayerBadge',
	component: PlayerBadge,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		name: { control: 'text' },
		isActive: { control: 'boolean' },
	},
} satisfies Meta<typeof PlayerBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		name: 'Player 1',
		isActive: false,
	},
};

export const Active: Story = {
	args: {
		name: 'Player 2',
		isActive: true,
	},
};

export const LongName: Story = {
	args: {
		name: 'Pixel Warrior 9000',
		isActive: true,
	},
};
