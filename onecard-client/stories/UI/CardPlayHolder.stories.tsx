import type { Meta, StoryObj } from '@storybook/react';
import CardPlayHolder from '@/components/UI/board/CardPlayHolder';

const meta = {
	title: 'UI/CardPlayHolder',
	component: CardPlayHolder,
	parameters: {
		layout: 'centered',
		backgrounds: {
			default: 'board',
			values: [
				{ name: 'board', value: '#0d1511' },
			],
		},
	},
	tags: ['autodocs'],
	argTypes: {
		width: { control: 'text' },
		height: { control: 'text' },
		isActive: { control: 'boolean' },
		label: { control: 'text' },
	},
} satisfies Meta<typeof CardPlayHolder>;

export default meta;

type Story = StoryObj<typeof meta>;

const PlaceholderCard = ({ label }: { label: string }) => (
	<div
		style={{
			width: '85px',
			height: '120px',
			backgroundColor: '#203425',
			border: '3px solid #3a5234',
			boxShadow: '0 0 0 3px #0f1a10',
			color: '#d0db61',
			fontFamily: 'Stacked-pixel, "VT323", "Courier New", monospace',
			fontSize: '14px',
			letterSpacing: '2px',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			textTransform: 'uppercase',
			imageRendering: 'pixelated',
		}}
	>
		{label}
	</div>
);

export const Default: Story = {
	render: args => (
		<CardPlayHolder {...args}>
			<PlaceholderCard label="deck" />
			<PlaceholderCard label="top" />
		</CardPlayHolder>
	),
	args: {
		width: '260px',
		height: '180px',
		label: 'Play Zone',
	},
};

export const ActiveDropZone: Story = {
	render: args => (
		<CardPlayHolder {...args}>
			<PlaceholderCard label="deck" />
			<PlaceholderCard label="play" />
		</CardPlayHolder>
	),
	args: {
		...Default.args,
		isActive: true,
	},
};

export const Compact: Story = {
	render: args => (
		<CardPlayHolder {...args}>
			<PlaceholderCard label="deck" />
		</CardPlayHolder>
	),
	args: {
		width: '180px',
		height: '120px',
		label: 'Draw',
	},
};
