"use client"

import PokerCard from "@/components/GameObject/PokerCard";
import CardPlayHolder from "@/components/UI/board/CardPlayHolder";
import OverlappingCards from "@/components/GameObject/OverlappingCards";
import {useOneCardGame} from "@/lib/hooks/useOneCardGame";
import {useCallback, useEffect, useRef, useState} from "react";
import styles from './SinglePlayerPage.module.css'
import {isValidPlay} from "@/lib/utils/cardUtils";

export default function SinglePlayerPage() {
        const {
                gameState,
                initializeGame,
                playCard,
                drawCard,
                getCurrentPlayer
        } = useOneCardGame();

        const [draggingCard, setDraggingCard] = useState<number | null>(null);
        const [isOverDropZone, setIsOverDropZone] = useState(false);
        const dropZoneRef = useRef<HTMLDivElement>(null);

        useEffect(() => {
                initializeGame({numberOfPlayers: 4, includeJokers: false, initHandSize: 5, maxHandSize: 10})
        }, [initializeGame])

        const openedCard = gameState.discardPile[0];
        const currentPlayer = getCurrentPlayer()
        const isMyTurn = useCallback(() => {return gameState.currentPlayerIndex === 0}, [gameState.currentPlayerIndex])

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

        const handleCardDragStart = (index: number) => {
                setDraggingCard(index);
        }

        const handleCardDrag = (clientX: number, clientY: number) => {
                if (!isMyTurn()) return
                if (dropZoneRef.current) {
                        const rect = dropZoneRef.current.getBoundingClientRect();
                        setIsOverDropZone(
                            isValidPlay(currentPlayer.hand[draggingCard!], openedCard) &&
                            clientX >= rect.left &&
                            clientX <= rect.right &&
                            clientY >= rect.top &&
                            clientY <= rect.bottom
                        )
                }
        }

        const handleCardDragEnd = () => {
                if (isOverDropZone && draggingCard !== null) {
                        playCard(gameState.currentPlayerIndex, draggingCard);
                }
                setDraggingCard(null);
                setIsOverDropZone(false);
        }


        return (
            <div className="w-full h-full flex items-center justify-center">
                    <div
                        className="aspect-square w-full max-w-[150vh] max-h-[85vh] grid grid-cols-9 grid-rows-9 gap-0.5">
                            <div className="flex items-center justify-center col-span-2 row-span-2"/>
                            <div className="relative flex items-center justify-center col-span-5 row-span-2">
                                    <span className={`absolute top-3 left-5 ${gameState.currentPlayerIndex == 2 ? "text-yellow-500" : "text-gray-500"}`}>{gameState.players[2].name}</span>
                                    <OverlappingCards>
                                            {gameState.players[2].hand.map((card, index) => (
                                                <PokerCard key={card.id} rank={card.rank} isJoker={card.isJoker}
                                                           isFlipped={card.isFlipped}
                                                           draggable={card.draggable} suit={card.suit}
                                                           onDragStart={() => handleCardDragStart(index)}
                                                           onDrag={handleCardDrag}
                                                           onDragEnd={handleCardDragEnd}
                                                />
                                            ))}
                                    </OverlappingCards>
                            </div>
                            <div className="flex items-center justify-center col-span-2 row-span-2" />
                            <div className="relative flex items-center justify-center row-span-5 col-span-2">
                                    <span
                                        className={`absolute top-3 left-5 ${gameState.currentPlayerIndex == 1 ? "text-yellow-500" : "text-gray-500"}`}>{gameState.players[1].name}</span>
                                    <OverlappingCards vertical={true}>
                                            {gameState.players[1].hand.map((card, index) => (
                                                <PokerCard key={card.id} rank={card.rank} isJoker={card.isJoker}
                                                           isFlipped={card.isFlipped}
                                                           draggable={card.draggable} suit={card.suit}
                                                           onDragStart={() => handleCardDragStart(index)}
                                                           onDrag={handleCardDrag}
                                                           onDragEnd={handleCardDragEnd}
                                                />
                                            ))}
                                    </OverlappingCards>
                            </div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs col-span-5"/>
                            <div className="relative flex items-center justify-center row-span-5 col-span-2">
                                    <span className={`absolute top-3 left-5 ${gameState.currentPlayerIndex == 3 ? "text-yellow-500" : "text-gray-500"}`}>{gameState.players[3].name}</span>
                                    <OverlappingCards vertical={true}>
                                            {gameState.players[3].hand.map((card, index) => (
                                                <PokerCard key={card.id} rank={card.rank} isJoker={card.isJoker}
                                                           isFlipped={card.isFlipped}
                                                           draggable={card.draggable} suit={card.suit}
                                                           onDragStart={() => handleCardDragStart(index)}
                                                           onDrag={handleCardDrag}
                                                           onDragEnd={handleCardDragEnd}
                                                />
                                            ))}
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
                                                        onClick={drawCard}
                                                    />
                                                    <PokerCard
                                                        key={openedCard.id}
                                                        isJoker={openedCard.isJoker} isFlipped={false}
                                                        suit={openedCard.suit} rank={openedCard.rank}
                                                        draggable={false}
                                                    />
                                            </CardPlayHolder>
                                    </div>
                            </div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs row-span-3" />
                            <div className="bg-gray-100 flex items-center justify-center text-xs col-span-5" />
                            <div  className="flex items-center justify-center col-span-2 row-span-2" />
                            <div className="relative flex items-center justify-center col-span-5 row-span-2">
                                    <span
                                        className={`absolute top-3 left-5 ${gameState.currentPlayerIndex == 0 ? "text-yellow-500" : "text-gray-500"}`}>{gameState.players[0].name}</span>
                                    <OverlappingCards>
                                            {gameState.players[0].hand.map((card, index) => (
                                                <PokerCard key={card.id} rank={card.rank} isJoker={card.isJoker} isFlipped={false}
                                                           draggable={true} suit={card.suit}
                                                           onDragStart={()=> handleCardDragStart(index)}
                                                           onDrag={handleCardDrag}
                                                           onDragEnd={handleCardDragEnd}
                                                />
                                            ))}
                                    </OverlappingCards>
                            </div>
                            <div className="flex items-center justify-center col-span-2 row-span-2"/>
                    </div>
            </div>
        );
}