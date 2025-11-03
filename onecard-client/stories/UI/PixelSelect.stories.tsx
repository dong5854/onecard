import '@/app/globals.css';
import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import PixelSelect from '@/components/UI/PixelSelect';

type OptionValue = 'easy' | 'medium' | 'hard' | 'legendary';

interface DemoProps {
	options: { value: OptionValue; label: string; disabled?: boolean }[];
	placeholder?: string;
	ariaLabel?: string;
}

const DemoSelect = ({ options, placeholder, ariaLabel }: DemoProps) => {
	const [value, setValue] = useState<OptionValue>(options[0]?.value ?? 'easy');

	return (
		<div className="min-w-[240px]">
			<PixelSelect<OptionValue>
				value={value}
				onChange={setValue}
				options={options}
				placeholder={placeholder}
				ariaLabel={ariaLabel}
			/>
		</div>
	);
};

const meta: Meta<typeof DemoSelect> = {
	title: 'UI/PixelSelect',
	component: DemoSelect,
	args: {
		options: [
			{ value: 'easy', label: 'Easy' },
			{ value: 'medium', label: 'Medium' },
			{ value: 'hard', label: 'Hard' },
		],
		placeholder: 'Select option',
	},
	parameters: {
		layout: 'centered',
		backgrounds: {
			default: 'board',
			values: [
				{ name: 'board', value: 'rgba(39,67,42,1)' },
			],
		},
	},
	decorators: [Story => (
		<div className="min-h-screen w-full flex items-center justify-center bg-[#2d472c] text-[#E3F1A7]">
			<Story />
		</div>
	)],
};

export default meta;

type Story = StoryObj<typeof DemoSelect>;

export const Default: Story = {};

export const WithDisabledOption: Story = {
	args: {
		options: [
			{ value: 'easy', label: 'Easy' },
			{ value: 'medium', label: 'Medium' },
			{ value: 'hard', label: 'Hard', disabled: true },
		],
	},
};

export const CustomPlaceholder: Story = {
	args: {
		options: [
			{ value: 'easy', label: 'Easy' },
			{ value: 'medium', label: 'Medium' },
			{ value: 'hard', label: 'Hard' },
			{ value: 'legendary', label: 'Legendary' },
		],
		placeholder: 'Choose difficulty',
	},
};
