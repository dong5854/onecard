import type { Meta, StoryObj } from '@storybook/react';
import GameTitle from './GameTitle';

const meta = {
	title: 'game/GameTitle',
	component: GameTitle,
	parameters: {
		// Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
		layout: 'centered',
	},
	// This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
	tags: ['autodocs'],
} satisfies Meta<typeof GameTitle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		title: 'One Card',
		subtitle: 'web game',
	},
};
