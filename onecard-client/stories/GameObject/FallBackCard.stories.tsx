import type { Meta, StoryObj } from '@storybook/react';
import { action } from '@storybook/addon-actions';
import { FallBackCard } from '@/components/GameObject/FallBackCard';

const meta = {
	title: 'GameObject/FallBackCard',
	component: FallBackCard,
	parameters: {
		layout: 'centered',
		backgrounds: {
			default: 'board',
			values: [{ name: 'board', value: '#0d1511' }],
		},
	},
	tags: ['autodocs'],
	argTypes: {
		rank: { control: 'number' }, // rank prop을 텍스트로 입력할 수 있게 함
		suit: {
			control: 'select',
			options: ['clubs', 'hearts', 'diamonds', 'spades'],
		}, // suit prop을 드롭다운으로 선택할 수 있게 함
	},
	args: { onClick: action('onClick') },
} satisfies Meta<typeof FallBackCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		rank: 1,
		suit: 'spades',
		isJoker: false,
		isFlipped: false,
	},
};

export const JokerCard: Story = {
	args: {
		isJoker: true,
		isFlipped: false,
	},
};

export const AceOfSpades: Story = {
	args: {
		rank: 1,
		suit: 'spades',
		isJoker: false,
		isFlipped: false,
	},
};

export const FiveOfHearts: Story = {
	args: {
		rank: 5,
		suit: 'hearts',
		isJoker: false,
		isFlipped: false,
	},
};

export const ClubNine: Story = {
	args: {
		rank: 9,
		suit: 'clubs',
		isJoker: false,
		isFlipped: false,
	},
};

export const FlippedCard: Story = {
	args: {
		isJoker: false,
		isFlipped: true,
	},
};
