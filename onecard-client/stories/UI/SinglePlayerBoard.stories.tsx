import '@/app/globals.css';
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Inter } from 'next/font/google';
import SinglePlayerBoard from '@/components/UI/board/SinglePlayerBoard';
import { Player } from '@/types/gamePlayer';
import { PokerCardPropsWithId, RankValue, SuitsValue } from '@/types/pokerCard';
import { BackgroundMusic } from '@/components/GameObject/BackgroudMusic';

type Story = StoryObj<typeof SinglePlayerBoard>;

const createCard = (
	key: string,
	rank: RankValue,
	suit: SuitsValue,
	options?: Partial<PokerCardPropsWithId>,
): PokerCardPropsWithId => ({
	id: key,
	rank,
	suit,
	isJoker: false,
	isFlipped: true,
	draggable: false,
	...options,
});

const createPlayer = (
	id: string,
	name: string,
	hand: PokerCardPropsWithId[],
	options?: Partial<Player>,
): Player => ({
	id,
	name,
	hand,
	isSelf: false,
	isAI: true,
	...options,
});

const createSelfHand = (): PokerCardPropsWithId[] => [
	createCard('self-7-hearts', 7, 'hearts', {
		isFlipped: false,
		draggable: true,
	}),
	createCard('self-10-spades', 10, 'spades', {
		isFlipped: false,
		draggable: true,
	}),
	createCard('self-1-clubs', 1, 'clubs', {
		isFlipped: false,
		draggable: true,
	}),
];

const createOpponentHand = (prefix: string): PokerCardPropsWithId[] => [
	createCard(`${prefix}-5-diamonds`, 5, 'diamonds'),
	createCard(`${prefix}-3-clubs`, 3, 'clubs'),
	createCard(`${prefix}-12-spades`, 12, 'spades'),
];

const openedCard = createCard('open-9-hearts', 9, 'hearts', {
	isFlipped: false,
	draggable: false,
});

const basePlayers = (count: number): Player[] => {
	const players: Player[] = [];
	for (let i = 0; i < count; i++) {
		if (i === 0) {
			players.push(
				createPlayer('player-self', 'You', createSelfHand(), {
					isSelf: true,
					isAI: false,
				}),
			);
		} else {
			players.push(
				createPlayer(
					`player-${i}`,
					`CPU ${i}`,
					createOpponentHand(`opponent-${i}`),
					{
						isAI: true,
					},
				),
			);
		}
	}
	return players;
};

const inter = Inter({ subsets: ['latin'] });

const meta: Meta<typeof SinglePlayerBoard> = {
	title: 'UI/SinglePlayerBoard',
	component: SinglePlayerBoard,
	args: {
		damage: 0,
		onDrawCard: fn(),
		onPlayCard: fn(),
		selfIndex: 0,
		openedCard,
	},
	parameters: {
		layout: 'fullscreen',
	},
	decorators: [
		Story => (
			<div
				className={`${inter.className} flex min-h-screen w-full flex-col items-center justify-start px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 2xl:px-24`}
			>
				<main className="w-full h-full flex flex-grow flex-col max-w-[95%] sm:max-w-[90%] md:max-w-[1400px] lg:max-w-[1600px] xl:max-w-[1800px] 2xl:max-w-[2000px] bg-[rgba(39,67,42,1)]">
					<nav className="w-full p-4">
						<div className="container mx-auto flex justify-end items-center mr-2">
							<BackgroundMusic
								url="/audio/bgm/SHK_055_Cosmic_Rainbow.mp3"
								className="z-10"
							/>
						</div>
					</nav>
					<div className="flex flex-col flex-grow items-center justify-center">
						<Story />
					</div>
				</main>
			</div>
		),
	],
};

export default meta;

export const TwoPlayers: Story = {
	args: {
		players: basePlayers(2),
		currentPlayerIndex: 0,
	},
};

export const ThreePlayers: Story = {
	args: {
		players: basePlayers(3),
		currentPlayerIndex: 1,
	},
};

export const FourPlayers: Story = {
	args: {
		players: basePlayers(4),
		currentPlayerIndex: 2,
	},
};
