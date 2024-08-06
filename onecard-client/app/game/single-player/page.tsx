"use client"

import PokerCard from "@/components/GameObject/PokerCard";
import CardPlayHolder from "@/components/UI/board/CardPlayHolder";
import OverlappingCards from "@/components/GameObject/OverlappingCards";
import {useOneCardGame} from "@/lib/hooks/useOneCardGame";
import {useEffect, useRef, useState} from "react";
import styles from './SinglePlayerPage.module.css'

export default function SinglePlayerPage() {
        const {
                gameState,
                initializeGame,
                playCard,
                drawCard,
                getCurrentPlayer
        } = useOneCardGame();

        const [glowingCard, setGlowingCard] = useState<number | null>(null);
        const [isOverDropZone, setIsOverDropZone] = useState(false);
        const dropZoneRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
                initializeGame({numberOfPlayers: 4, includeJokers: false, initHandSize: 5, maxHandSize: 10})
        }, [initializeGame])

        const openedCard = gameState.discardPile[0];

        if (gameState.gameStatus == 'waiting')  {
                // TODO: 디자인 다듬기
                return <div style={{color : 'white'}}>Loading game...</div>;
        }

        if (gameState.gameStatus === 'finished') {
                // TODO: 디자인 다듬기
                return (
                    <div>
                            <h1>Game Over!</h1>
                            <p>Winner: {gameState.winner?.name}</p>
                            <button onClick={() => initializeGame(gameState.settings)}>Play Again</button>
                    </div>
                );
        }

        const currentPlayer = getCurrentPlayer();
        console.log(gameState.players)
        const handleCardDragStart = (index: number) => {
                setGlowingCard(index);
        }

        const handleCardDrag = (clientX: number, clientY: number) => {
                if (dropZoneRef.current) {
                        const rect = dropZoneRef.current.getBoundingClientRect();
                        setIsOverDropZone(
                            clientX >= rect.left &&
                            clientX <= rect.right &&
                            clientY >= rect.top &&
                            clientY <= rect.bottom
                        )
                }
        }

        const handleCardDragEnd = () => {
                if (isOverDropZone && glowingCard !== null) {
                        playCard(gameState.currentPlayerIndex, glowingCard);
                }
                setGlowingCard(null);
                setIsOverDropZone(false);
        }


        return (
            <div className="w-full h-full flex items-center justify-center">
                    <div
                        className="aspect-square w-full max-w-[150vh] max-h-[85vh] grid grid-cols-9 grid-rows-9 gap-0.5">
                            <div
                                className="bg-gray-100 flex items-center justify-center col-span-2 row-span-2">1
                            </div>
                            <div className="flex items-center justify-center col-span-5 row-span-2">
                                    <OverlappingCards>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                    </OverlappingCards>
                            </div>
                            <div
                                className="bg-gray-100 flex items-center justify-center col-span-2 row-span-2">2
                            </div>
                            <div className="flex items-center justify-center row-span-5 col-span-2">
                                    <OverlappingCards vertical={true}>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                    </OverlappingCards>
                            </div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs col-span-5"/>
                            <div className="flex items-center justify-center row-span-5 col-span-2">
                                    <OverlappingCards vertical={true}>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                    </OverlappingCards>
                            </div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs row-span-3" />
                            <div className="flex items-center justify-center text-xs col-span-3 row-span-3">
                                    <div
                                        ref={dropZoneRef}
                                        className={`relative ${isOverDropZone ? styles.dropZoneGlow : ''}`}
                                    >
                                            <CardPlayHolder width="200px" height="150px">
                                                    <PokerCard
                                                        key="deck-top"
                                                        isJoker={false}
                                                        isFlipped={true}
                                                        draggable={false}
                                                    />
                                                    <PokerCard
                                                        key="discard-top"
                                                        isJoker={openedCard.isJoker} isFlipped={false}
                                                        suit={openedCard.suit} rank={openedCard.rank}
                                                        draggable={false}
                                                    />
                                            </CardPlayHolder>
                                    </div>
                            </div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs row-span-3" />
                            <div className="bg-gray-100 flex items-center justify-center text-xs col-span-5" />
                            <div
                                className="bg-gray-100 flex items-center justify-center col-span-2 row-span-2">3
                            </div>
                            <div className="flex items-center justify-center col-span-5 row-span-2">
                                    <OverlappingCards>
                                            {gameState.players[0].hand.map((card, index) => (
                                                <PokerCard key={index} rank={card.rank} isJoker={card.isJoker} isFlipped={false}
                                                           draggable={true} suit={card.suit}
                                                           onDragStart={()=> handleCardDragStart(index)}
                                                           onDrag={handleCardDrag}
                                                           onDragEnd={handleCardDragEnd}
                                                />
                                            ))}
                                    </OverlappingCards>
                            </div>
                            <div
                                className="bg-gray-100 flex items-center justify-center col-span-2 row-span-2">4
                            </div>
                    </div>
            </div>
        );
}