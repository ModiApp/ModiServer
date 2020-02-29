import ioClient from "socket.io-client";
import ioServer from "socket.io";
import createConnectableLobby from "../../src/service/Lobby";

const testNspUri = "localhost:5000/lobbies/testLobby";
const io = ioServer(5000);

const testLobbyNamespace = io.of("/lobbies/testLobby");
const testLobbyOnStart = usernames => {
  console.log("Mock lobbys start event was triggered with users:", usernames);
  return "mockEventId";
};

const createUserSocket = username =>
  ioClient(testNspUri, {
    autoConnect: false,
    query: { username }
  });
const ikeysSocket = createUserSocket("Ikey");
const jakesSocket = createUserSocket("Jake");
const louiesSocket = createUserSocket("Louie");
const connorsSocket = createUserSocket("Connor");

describe("Lobby() unit tests:", () => {
  const testLobby = createConnectableLobby(
    testLobbyNamespace,
    testLobbyOnStart
  );
  test("new Lobby(nsp, mockOnStart) ");
});
