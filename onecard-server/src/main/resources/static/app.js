// https://spring.io/guides/gs/messaging-stomp-websocket
// STOMP
const stompClient = new StompJs.Client({
  brokerURL: "ws://localhost:8080/app",
});

console.log("app.js loaded");
const userId = "dong5854"
stompClient.activate();
console.log(stompClient);

stompClient.onConnect = (frame) => {
    console.log(`connected: ${frame}`);
    stompClient.subscribe(`/queue/player/${userId}`, (join) => {
      try {
        console.log("Received join message:", JSON.parse(join.body));
      } catch (error) {
        console.error('Error parsing JSON:', error);
      }
      alert(`player ${userId} entered app!`);
    });

    stompClient.publish({
        destination: `/players`,
        body: JSON.stringify(
            {
                playerId: `${userId}`
            }
        )
    })
};

stompClient.onWebSocketError = (error) => {
  console.error("Error with websocket", error);
};

stompClient.onStompError = (frame) => {
  console.error("Broker reported error: " + frame.headers["message"]);
  console.error("Additional details: " + frame.body);
};

stompClient.debug = (frame) => {
  console.log(`debug: ${frame}`);
};

// REST API
async function createRoom() {
  const response = await fetch("http://localhost:8080/one-card/rooms", {
      method : "POST",
      headers: {
          "Content-Type" : "application/json"
      },
      body : JSON.stringify(
          {
            name: "원카드룸",
            adminId: "dong5854"
          }
      )
  })
  return response
}

let id;

async function createRoomAndConnectSocket() {
    const response = await createRoom()
    const roomData = await response.json()
    id = roomData.id;

    console.log("Room created with ID:", id)

    let subscription = stompClient.subscribe(`/topic/rooms/${id}`, (join) => {
        try {
            console.log("Received join message:", JSON.parse(join.body));
        } catch (error) {
            console.error('Error parsing JSON:', error);
        }
        alert("Received join message!");
    });

    stompClient.publish({
        destination: `/one-card/rooms/${id}/join`,
        body: JSON.stringify(
            {
                playerId: `${userId}`
            }
        )
    })
}


function startPlaying() {
    stompClient.publish({
        destination: `/one-card/rooms/${id}/start`
    })
}

function joinRoom() {
    console.log(id)
    stompClient.publish({
        destination: `/one-card/rooms/${id}/join`,
        body: JSON.stringify(
            {
                playerId: "합류한 플레이어"
            }
        )
    })
}