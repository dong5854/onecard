// https://spring.io/guides/gs/messaging-stomp-websocket
const stompClient = new StompJs.Client({
  brokerURL: "ws://localhost:8080/app",
});

console.log("app.js loaded");
stompClient.activate();
console.log(stompClient);

stompClient.onConnect = (frame) => {
  console.log(`connected: ${frame}`);
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
