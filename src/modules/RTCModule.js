export const createOffer = async (
  connection,
  localStream,
  userToCall,
  doOffer,
  database,
  username
) => {
  console.log("In createoffer");
  try {
    console.log(connection);
    console.log(localStream);
    connection.addStream(localStream);
    console.log("1");
    const offer = await connection.createOffer();
    console.log("2");
    await connection.setLocalDescription(offer);
    console.log("3");
    doOffer(userToCall, offer, database, username);
  } catch (exception) {
    console.error(exception);
  }
};

export const initiateLocalStream = async () => {
  console.log("In initiatelocalstream");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    return stream;
  } catch (exception) {
    console.error(exception);
  }
};

export const initiateConnection = async () => {
  console.log("In initiateconnection");
  try {
    // using Google public stun server
    var configuration1 = {
      iceServers: [{ urls: "stun:stun1.1.google.com:19302" }],
    };
    var configuration2 = {
      iceServers: [{ urls: "stun:stun2.1.google.com:19302" }],
    };
    var configuration3 = {
      iceServers: [{ urls: "stun:stun3.1.google.com:19302" }],
    };
    var configuration4 = {
      iceServers: [{ urls: "stun:stun4.1.google.com:19302" }],
    };

    const conn1 = new RTCPeerConnection(configuration1);
    const conn2 = new RTCPeerConnection(configuration2);
    const conn3 = new RTCPeerConnection(configuration3);
    const conn4 = new RTCPeerConnection(configuration4);

    //const conn = [conn1, conn2, conn3, conn4];

    console.log(conn1);
    console.log(conn2);

    const conn = [conn1, conn2, conn3, conn4];

    console.log(conn[0]);

    return conn;
  } catch (exception) {
    console.error(exception);
  }
};

export const listenToConnectionEvents = (
  conn,
  username,
  remoteUsername,
  database,
  remoteVideoRef,
  doCandidate
) => {
  console.log("In listentoconnectionevents");
  conn.onicecandidate = function (event) {
    if (event.candidate) {
      doCandidate(remoteUsername, event.candidate, database, username);
    }
  };

  // when a remote user adds stream to the peer connection, we display it
  conn.ontrack = function (e) {
    if (remoteVideoRef.srcObject !== e.streams[0]) {
      remoteVideoRef.srcObject = e.streams[0];
    }
  };
};

export const sendAnswer = async (
  conn,
  localStream,
  notif,
  doAnswer,
  database,
  username
) => {
  console.log("In sendanswer");
  try {
    conn.addStream(localStream);
    console.log("1");

    const offer = JSON.parse(notif.offer);
    console.log("2");
    conn.setRemoteDescription(offer);
    console.log("3");

    // create an answer to an offer
    const answer = await conn.createAnswer();
    console.log("4");
    conn.setLocalDescription(answer);
    console.log("5");

    doAnswer(notif.from, answer, database, username);
  } catch (exception) {
    console.error(exception);
  }
};

export const startCall = (yourConn, notif) => {
  console.log("In startcall");
  const answer = JSON.parse(notif.answer);
  yourConn.setRemoteDescription(answer);
};

export const addCandidate = (yourConn, notif) => {
  console.log("In addcandidate");
  // apply the new received candidate to the connection
  const candidate = JSON.parse(notif.candidate);
  yourConn.addIceCandidate(new RTCIceCandidate(candidate));
};
