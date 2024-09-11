package model

object GameStatusRepository {
//    private val gameStatus = mutableListOf(
//        GameState(
//            players = listOf("dong", "lee", "lim", "park"),
//            currentPlayerIndex = 0,
//            deck = listOf(PokerCard(
//                suit = Suit.SPADE,
//                rank = Rank.ACE,
//                isJoker = false
//            )),
//            discardPile = listOf(PokerCard(
//                suit = null,
//                rank = null,
//                isJoker = true,
//            )),
//            direction = Direction.CLOCKWISE,
//            damage = 0,
//            gameStatus = GameStatus.WAITING,
//            setting = Settings(
//                numberOfPlayers = 4,
//                includeJokers = true,
//                initHandSize = 5,
//                maxHandSize = 15
//            )
//        )
//    )
    private val gameStatusMap = mutableMapOf<String, GameState>()

    fun getGameStatus(id : String) = gameStatusMap[id]

    fun updateGameStatus(id : String, gameState: GameState) {
        gameStatusMap[id] = gameState
    }

    fun removeGameStatus(id : String) {
        gameStatusMap.remove(id)
    }
}