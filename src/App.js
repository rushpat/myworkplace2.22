import React, { Component } from "react";
import "./App.css";
import VideoChatContainer from "./VideoChatContainer";
import firebase from "firebase/app";
import config from "./config";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      retreivedData: false, //probing end of componentDidMount
      user: "", //ip address
      active: -2, //-2 for no activity; -1 is not in a room, 0 is new room, otherwise room number + 1
      busy: false, //boolean for whether in Teams meeting or not

      rooms: [], //list of rooms and their IDs, which is their index within the array
      room_users: [], //entry of ip address and room IDs +1
    };

    fetch("https://api.ipify.org?format=jsonp?callback=?", {
      method: "GET",
      headers: {},
    })
      .then((res) => {
        return res.text();
      })
      .then((ip) => {
        this.setState({ user: ip });
      });
  }

  componentDidMount = async () => {
    //component mounts, only after the first render on the client side
    console.log("COMPONENT DID MOUNT");

    firebase.initializeApp(config);

    //this.writeUserData();

    await this.getUserData();
  };

  componentDidUpdate(prevProps, prevState) {
    //before completion of componentDidMount
    if (this.state.retreivedData === false) {
      return;
    }

    //after completion of componentDidMount
    if (this.state.retreivedData === true) {
      console.log("COMPONENT DID UPDATE");
      if (prevState !== this.state) {
        this.writeUserData();
      }
    }
  }

  writeUserData = () => {
    //save the state
    console.log("SAVING DATA");

    firebase.database().ref("/rooms").set(this.state.rooms);
    firebase.database().ref("/roomusers").set(this.state.room_users);
  };

  async getUserData() {
    //retrieve data from firebase
    console.log("RETREIVING DATA");

    await firebase
      .database()
      .ref("rooms")
      .once("value")
      .then((snapshot) => {
        this.gotRooms(snapshot);
      });

    await firebase
      .database()
      .ref("roomusers")
      .once("value")
      .then((snapshot) => {
        this.gotRoomUsers(snapshot);
      });

    this.setState({ retreivedData: true });
  }

  gotRooms(data) {
    console.log("GOT ROOMS");

    const temp_rooms = data.val();
    const parsed_rooms = Object.keys(temp_rooms).map((room) => {
      return { id: temp_rooms[room].id };
    });

    this.setState({ rooms: parsed_rooms });
  }

  gotRoomUsers(data) {
    console.log("GOT ROOMUSERS");

    const temp_roomusers = data.val();
    const parsed_roomusers = Object.keys(temp_roomusers).map((roomuser) => {
      return {
        ip: temp_roomusers[roomuser].ip,
        room: temp_roomusers[roomuser].room,
      };
    });

    this.setState({ room_users: parsed_roomusers });
  }

  errData = (err) => {
    console.log("GOT AN ERROR");

    console.log(err);
  };

  nameNewRoom = () => {
    console.log("NAMING NEW ROOM");
    this.setState({ active: 0 });
  };

  enterRoom = (room) => {
    console.log("ENTERING ROOM" + room.id);
    this.setState({ active: room.id + 1 });
  };

  authenticateUser = () => {
    console.log("AUTHENTICATING USER");
    this.setState({ active: -1 });
  };

  constructRoom = () => {
    console.log("CREATING ROOM");
    this.setState({ active: 1 });
  };

  leaveRoom = () => {
    console.log("LEAVING ROOM");
    this.setState({ active: -1 });
  };

  render() {
    const { rooms } = this.state;
    const { room_users } = this.state;
    const { active } = this.state;

    if (active === -2) {
      return (
        <React.Fragment>
          <div className="container-fluid">
            <div className="row align-items-center bg-primary">
              <div className="col-xl-12">
                <h1 className="display-1 text-center">myWorkplace</h1>
              </div>
              <div className="col-xl-12">
                <p className="text-center text-light">
                  myWorkplace is a prototype application intended to facilitate
                  more spontanenous virtual conversations.
                </p>
              </div>
            </div>

            <div className="row mt-5"></div>

            <div className="row d-flex justify-content-around">
              <button
                onClick={() => this.authenticateUser()}
                className="btn btn-primary"
              >
                Click to enter myWorkplace
              </button>
            </div>
          </div>
        </React.Fragment>
      );
    }

    if (active === -1) {
      return (
        <React.Fragment>
          <div className="container-fluid">
            <div className="row align-items-center bg-primary">
              <div className="col-xl-12">
                <h1 className="display-1 text-center">myWorkplace</h1>
              </div>
              <div className="col-xl-12">
                <p className="text-center text-light">
                  myWorkplace is a prototype application intended to facilitate
                  more spontanenous virtual conversations.
                </p>
              </div>
            </div>

            <div className="row mt-5"></div>

            <div className="row d-flex justify-content-around">
              {rooms.map((room) => (
                <div className="col-sm-4 d-flex justify-content-around">
                  <div
                    key={room.id}
                    style={{
                      width: "18rem",
                      marginRight: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <div className="card-body">
                      <h5 className="card-title">{room.id}</h5>
                      <p className="card-text">List users here</p>
                      <button
                        onClick={() => this.enterRoom(room)}
                        className="btn btn-link"
                      >
                        Enter room
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="row mt-5"></div>

            <div className="row d-flex justify-content-around">
              <button
                onClick={() => this.nameNewRoom()}
                className="btn btn-primary"
              >
                Create new room
              </button>
            </div>
          </div>
        </React.Fragment>
      );
    }

    if (active === 0) {
      return (
        <React.Fragment>
          <div className="container-fluid">
            <div className="row align-items-center bg-primary">
              <div className="col-xl-12">
                <h1 className="display-1 text-center">myWorkplace</h1>
              </div>
              <div className="col-xl-12">
                <p className="text-center text-light">
                  myWorkplace is a prototype application intended to facilitate
                  more spontanenous virtual conversations.
                </p>
              </div>
            </div>

            <div className="row mt-5"></div>

            <div className="row d-flex justify-content-around">
              <input
                type="text"
                ref="name"
                className="form-control col-md-3"
                placeholder="Enter a name for your new room"
              />
            </div>

            <div className="row mt-5"></div>

            <div className="row d-flex justify-content-around">
              <button
                onClick={() => this.constructRoom()}
                className="btn btn-primary"
              >
                Create room
              </button>
            </div>
          </div>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <div className="container-fluid">
          <div className="row align-items-center bg-primary">
            <div className="col-xl-12">
              <h1 className="display-1 text-center">myWorkplace</h1>
            </div>
            <div className="col-xl-12">
              <p className="text-center text-light">
                myWorkplace is a prototype application intended to facilitate
                more spontanenous virtual conversations.
              </p>
            </div>
          </div>

          <div className="row mt-5"></div>

          <div className="row d-flex justify-content-around">In room</div>

          <div className="row mt-5"></div>

          <VideoChatContainer />

          <div className="row mt-5"></div>

          <div className="row d-flex justify-content-around">
            <button
              onClick={() => this.leaveRoom()}
              className="btn btn-primary"
            >
              Leave room {active}
            </button>
          </div>
        </div>
      </React.Fragment>
    );

    //return (
    //  <div className="app">
    //    <h1>React Video Chat App</h1>
    //    <h2>WebRTC + Firebase</h2>
    //    <VideoChatContainer />
    //  </div>
    //);
  }
}

export default App;
