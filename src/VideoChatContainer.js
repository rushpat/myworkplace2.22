import React from "react";
import "./App.css";
import {
  createOffer,
  initiateConnection,
  startCall,
  sendAnswer,
  addCandidate,
  initiateLocalStream,
  listenToConnectionEvents,
} from "./modules/RTCModule";
import firebase from "firebase/app";
import "firebase/database";
import config from "./config";
import {
  doOffer,
  doAnswer,
  doLogin,
  doCandidate,
  removeNotifs,
} from "./modules/FirebaseModule";
import "webrtc-adapter";
import VideoChat from "./VideoChat";

class VideoChatContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      database: null,
      connectedUser: null,
      connectedUser2: null,
      connectedUser3: null,
      localStream: null,
      localStreamSet: null,
      localConnectionSet: null,
      localConnection: null,
      username: this.props.username,
      team: this.props.team,
      counter: 0,
      calling: false,
    };
    this.localVideoRef = React.createRef();
    //this.localVideoRef2 = React.createRef();
    //this.localVideoRef3 = React.createRef();
    //this.localVideoRef4 = React.createRef();
    this.remoteVideoRef = React.createRef();
    this.remoteVideoRef2 = React.createRef();
    this.remoteVideoRef3 = React.createRef();
    this.remoteVideoRef4 = React.createRef();
  }

  componentDidMount = async () => {
    // getting local video stream
    console.log("In component did mount");

    console.log(this.state.username);

    const localStream1 = await initiateLocalStream();
    const localStream2 = await initiateLocalStream();
    const localStream3 = await initiateLocalStream();
    const localStream4 = await initiateLocalStream();

    const localStreamSet = [
      localStream1,
      localStream2,
      localStream3,
      localStream4,
    ];

    const localConnectionSet = await initiateConnection();

    console.log(localConnectionSet[0]);

    const localConnection = localConnectionSet[this.state.counter];

    const localStream = localStreamSet[this.state.counter];

    this.localVideoRef.srcObject = localStreamSet[0];
    //this.localVideoRef2.srcObject = localStreamSet[1];
    //this.localVideoRef3.srcObject = localStreamSet[2];
    //this.localVideoRef4.srcObject = localStreamSet[3];

    this.setState({
      database: firebase.database(),
      localStream,
      localStreamSet,
      localConnectionSet,
      localConnection,
    });

    await this.onLogin(this.state.username);

    const team = this.state.team;

    if (team.length !== 0) {
      this.startCall(this.state.username, team[0]);
    }
  };

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.database !== nextState.database) {
      return false;
    }
    if (this.state.localStream !== nextState.localStream) {
      return false;
    }
    if (this.state.localConnection !== nextState.localConnection) {
      return false;
    }

    return true;
  }

  componentDidUpdate(prevProps, prevState) {
    console.log("In component did update");

    const counter = this.state.counter;
    console.log(counter);
    const team = this.state.team;
    const localConnectionSet = this.state.localConnectionSet;
    const localStreamSet = this.state.localStreamSet;

    if (prevState.counter !== counter) {
      console.log("changing connection and stream");
      console.log("previous connection");
      console.log(this.state.localConnection);
      console.log(this.state.localStream);
      var localConn = localConnectionSet[counter];
      var localStr = localStreamSet[counter];
      console.log("new connection");
      console.log(localConn);
      console.log(localStr);
      this.setState({ localConnection: localConn });
      this.setState({ localStream: localStr });
      console.log("checking state 1");
      console.log(this.state.localConnection);
      console.log(this.state.localStream);
    }

    if (prevState.counter !== counter && counter < team.length) {
      console.log("will be connecting to new user");
      this.setState({ calling: true }, function () {
        console.log("async setstate");
        this.startCall(this.state.username, team[counter]);
      });
    }
  }

  startCall = async (username, userToCall) => {
    console.log("In starting call");
    this.setState({ calling: true });

    const { database } = this.state;
    var localConnection = this.state.localConnection;
    var localStream = this.state.localStream;
    var counter = this.state.counter;
    console.log("next is counter");
    console.log(counter);
    // listenToConnectionEvents(
    //   localConnection,
    //   username,
    //   userToCall,
    //   database,
    //   this.remoteVideoRef,
    //   doCandidate
    // );

    if (counter === 0) {
      console.log("number 1");
      console.log(localConnection);
      console.log("number 1");
      console.log(this.remoteVideoRef);
      console.log("number 1");
      console.log(doCandidate);
      console.log("number 1");
      listenToConnectionEvents(
        localConnection,
        username,
        userToCall,
        database,
        this.remoteVideoRef,
        doCandidate
      );
    }
    if (counter === 1) {
      listenToConnectionEvents(
        localConnection,
        username,
        userToCall,
        database,
        this.remoteVideoRef2,
        doCandidate
      );
    }
    if (counter === 2) {
      listenToConnectionEvents(
        localConnection,
        username,
        userToCall,
        database,
        this.remoteVideoRef3,
        doCandidate
      );
    }

    console.log(localConnection);

    // create an offer

    createOffer(
      localConnection,
      localStream,
      userToCall,
      doOffer,
      database,
      username
    );
  };

  onLogin = async (username) => {
    console.log("In onlogin");
    return await doLogin(username, this.state.database, this.handleUpdate);
  };

  setLocalVideoRef = (ref) => {
    console.log("In setlocalvideoref");
    this.localVideoRef = ref;
  };

  setRemoteVideoRef = (ref) => {
    console.log("In setremotevideoref");
    this.remoteVideoRef = ref;
  };

  setRemoteVideoRef2 = (ref) => {
    console.log("In setremotevideoref2");
    this.remoteVideoRef2 = ref;
  };

  handleUpdate = (notif, username) => {
    console.log("In handleupdate");
    const { localConnection, database, localStream } = this.state;
    var counter = this.state.counter;
    var calling = this.state.calling;
    const user = this.state.username;
    const called = this.state.called;
    const connectedUser = this.state.connectedUser;
    const connectedUser2 = this.state.connectedUser2;

    console.log(connectedUser);

    if (notif) {
      switch (notif.type) {
        case "offer":
          console.log("case offer");

          if (counter === 0) {
            this.setState({
              connectedUser: notif.from,
            });

            listenToConnectionEvents(
              localConnection,
              username,
              notif.from,
              database,
              this.remoteVideoRef,
              doCandidate
            );
          }

          if (counter === 1) {
            this.setState({
              connectedUser2: notif.from,
            });

            listenToConnectionEvents(
              localConnection,
              username,
              notif.from,
              database,
              this.remoteVideoRef2,
              doCandidate
            );
          }

          sendAnswer(
            localConnection,
            localStream,
            notif,
            doAnswer,
            database,
            username
          );

          this.setState({ called: "CALLED" });

          break;
        case "answer":
          console.log("case answer");

          if (counter === 0) {
            this.setState({
              connectedUser: notif.from,
            });
          }

          if (counter === 1) {
            this.setState({
              connectedUser2: notif.from,
            });
          }

          startCall(localConnection, notif);
          break;
        case "candidate":
          console.log("case candidate");
          addCandidate(localConnection, notif);
          if (calling === true) {
            this.setState({ calling: false });
            if (counter === 0) {
              removeNotifs(database, user, connectedUser);
            }
            if (counter === 1) {
              removeNotifs(database, user, connectedUser2);
            }
            counter = counter + 1;
            this.setState({ counter });
          }
          if (called === "CALLED8") {
            this.setState({ called: "" });
            counter = counter + 1;
            this.setState({ counter });
          }
          if (called === "CALLED7") {
            this.setState({ called: "CALLED8" });
          }
          if (called === "CALLED6") {
            this.setState({ called: "CALLED7" });
          }
          if (called === "CALLED5") {
            this.setState({ called: "CALLED6" });
          }
          if (called === "CALLED4") {
            if (counter === 1) {
              if (
                connectedUser2.substring(0, connectedUser2.length - 6) ===
                user.substring(0, user.length - 6)
              ) {
                this.setState({ called: "" });
                counter = counter + 1;
                this.setState({ counter });
              } else {
                this.setState({ called: "CALLED5" });
              }
            }
            if (counter === 0) {
              if (
                connectedUser.substring(0, connectedUser.length - 6) ===
                user.substring(0, user.length - 6)
              ) {
                this.setState({ called: "" });
                counter = counter + 1;
                this.setState({ counter });
              } else {
                this.setState({ called: "CALLED5" });
              }
            }
          }
          if (called === "CALLED3") {
            this.setState({ called: "CALLED4" });
          }
          if (called === "CALLED2") {
            this.setState({ called: "CALLED3" });
          }
          if (called === "CALLED") {
            this.setState({ called: "CALLED2" });
          }
          break;
        default:
          break;
      }
    }
  };

  render() {
    return (
      <VideoChat
        startCall={this.startCall}
        onLogin={this.onLogin}
        setLocalVideoRef={this.setLocalVideoRef}
        setRemoteVideoRef={this.setRemoteVideoRef}
        setRemoteVideoRef2={this.setRemoteVideoRef2}
        connectedUser={this.state.connectedUser}
        connectedUser2={this.state.connectedUser2}
        username={this.state.username}
        team={this.state.team}
      />
    );
  }
}

export default VideoChatContainer;
