package model

import kotlinx.serialization.Serializable


enum class Direction {
    CLOCKWISE, COUNTERCLOCKWISE
}

enum class GameStatus {
    WAITING, PLAYING
}

@Serializable
data class GameState (
    val players: List<String>,
    val currentPlayerIndex: Int,
    val deck: List<PokerCard>,
    val discardPile: List<PokerCard>,
    val direction: Direction,
    val damage : Int,
    val gameStatus: GameStatus,
    val setting : Settings,
)

@Serializable
data class Settings (
    val numberOfPlayers: Int,
    val includeJokers: Boolean,
    val initHandSize: Int,
    val maxHandSize: Int,
)