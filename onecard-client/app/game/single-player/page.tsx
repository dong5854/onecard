"use client"

import PokerCard from "@/components/GameObject/PokerCard";
import CardPlayHolder from "@/components/UI/board/CardPlayHolder";
import OverlappingCards from "@/components/GameObject/OverlappingCards";
import {useOneCardGame} from "@/lib/hooks/useOneCardGame";
import {useEffect} from "react";


export default function SinglePlayerPage() {
        const {
                gameState,
                initializeGame,
                playCard,
                drawCard,
                getCurrentPlayer
        } = useOneCardGame();

        useEffect(() => {
                initializeGame({numberOfPlayers: 4, includeJokers: false, maxHandSize: 10})
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


        return (
            <div className="w-full h-full flex items-center justify-center">
                    <div className="aspect-square w-full max-w-[150vh] max-h-[85vh] grid grid-cols-9 grid-rows-9 gap-0.5">
                            <div className="bg-gray-100 flex items-center justify-center col-span-2 row-span-2">1-2-10-11</div>
                            <div className="flex items-center justify-center col-span-5 row-span-2">
                                    <OverlappingCards>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                    </OverlappingCards>
                            </div>
                            <div className="bg-gray-100 flex items-center justify-center col-span-2 row-span-2">8-9-17-18</div>
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
                            <div className="bg-gray-100 flex items-center justify-center text-xs">20</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">21</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">22</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">23</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">24</div>
                            <div className="flex items-center justify-center row-span-5 col-span-2">
                                    <OverlappingCards vertical={true}>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                    </OverlappingCards>
                            </div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">29</div>
                            <div className="flex items-center justify-center text-xs col-span-3 row-span-3">
                                    <CardPlayHolder width="200px" height="150px">
                                            <PokerCard isJoker={false} isFlipped={true} draggable={false}/>
                                            <PokerCard
                                                isJoker={openedCard.isJoker} isFlipped={false}
                                                suit={openedCard.suit} rank={openedCard.rank}
                                                draggable={false}
                                            />
                                    </CardPlayHolder>
                            </div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">33</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">38</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">42</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">47</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">51</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">56</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">57</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">58</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">59</div>
                            <div className="bg-gray-100 flex items-center justify-center text-xs">60</div>
                            <div className="bg-gray-100 flex items-center justify-center col-span-2 row-span-2">63-64-73-74</div>
                            <div className="flex items-center justify-center col-span-5 row-span-2">
                                    <OverlappingCards>
                                            <PokerCard key={6} rank={3} isJoker={false} isFlipped={false} draggable={true} suit="spades" />
                                            <PokerCard key={7} rank={5} isJoker={false} isFlipped={false} draggable={true} suit="diamonds" />
                                            <PokerCard key={8} rank={9} isJoker={false} isFlipped={false} draggable={true} suit="clubs" />
                                    </OverlappingCards>
                            </div>
                            <div className="bg-gray-100 flex items-center justify-center col-span-2 row-span-2">71-72-80-81</div>
                    </div>
            </div>
        );
}