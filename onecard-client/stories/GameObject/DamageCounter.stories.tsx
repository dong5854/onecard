import type { Meta, StoryObj } from '@storybook/react';
import DamageCounter from '@/components/GameObject/DamageCounter';

const meta = {
	title: 'GameObject/DamageCounter',
	component: DamageCounter,
	parameters: {
		layout: 'centered',
	},
	tags: ['autodocs'],
	argTypes: {
		value: { control: { type: 'number', min: 0 } },
		maxValue: { control: { type: 'number', min: 0 } },
		helperText: { control: 'text' },
		isActive: { control: 'boolean' },
	},
} satisfies Meta<typeof DamageCounter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const AllClear: Story = {
	args: {
		value: 0,
	},
};

export const StackedPenalty: Story = {
	args: {
		value: 4,
		maxValue: 10,
		helperText: 'Draw penalty',
	},
};

export const CriticalState: Story = {
	args: {
		value: 8,
		maxValue: 8,
		helperText: 'Brace yourself',
	},
};

export const ManualAlert: Story = {
	args: {
		value: 0,
		helperText: 'Incoming attack',
		isActive: true,
	},
};
