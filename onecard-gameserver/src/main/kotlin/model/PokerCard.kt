package model;

import kotlinx.serialization.Serializable

enum class Rank (val number : Int) {
    ACE(1), TWO(2), THREE(3), FOUR(4), FIVE(5),
    SIX(6), SEVEN(7), EIGHT(8), NINE(9), TEN(10),
    JACK(11), QUEEN(12), KING(13)
}

enum class Suit {
    CLUB, DIAMOND, HEART, SPADE
}

@Serializable
data class PokerCard(
    val rank : Rank?,
    val suit : Suit?,
    val isJoker : Boolean
)