package com.dong.plugins

import com.typesafe.config.ConfigException.Null
import io.ktor.serialization.kotlinx.*
import io.ktor.server.application.*
import io.ktor.server.routing.*
import io.ktor.server.websocket.*
import io.ktor.websocket.*
import kotlinx.coroutines.delay
import kotlinx.serialization.json.Json
import model.*
import java.time.Duration

fun Application.configureSockets() {
    install(WebSockets) {
        contentConverter = KotlinxWebsocketSerializationConverter(Json)
        pingPeriod = Duration.ofSeconds(15)
        timeout = Duration.ofSeconds(15)
        maxFrameSize = Long.MAX_VALUE
        masking = false
    }
    routing {
        webSocket("/game") {
            val gameState = GameState(
                players = listOf("dong", "lee", "lim", "park"),
                currentPlayerIndex = 0,
                deck = listOf(PokerCard(
                    suit = Suit.SPADE,
                    rank = Rank.ACE,
                    isJoker = false
                )),
                discardPile = listOf(PokerCard(
                    suit = null,
                    rank = null,
                    isJoker = true,
                )),
                direction = Direction.CLOCKWISE,
                damage = 0,
                gameStatus = GameStatus.WAITING,
                setting = Settings(
                    numberOfPlayers = 4,
                    includeJokers = true,
                    initHandSize = 5,
                    maxHandSize = 15
                )
            )

            sendSerialized(gameState)
            delay(1000)

            close(CloseReason(CloseReason.Codes.NORMAL, "All done"))
            // https://ktor.io/docs/server-create-websocket-application.html#understanding-websockets
        }
    }
}
