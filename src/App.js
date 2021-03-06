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
      roomname: "",
      team: [],

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
        const rand = Math.floor(Math.random() * 1000) + 10000;
        const yip = ip.split(".").join("");
        this.setState({ user: yip + rand });
        console.log(this.state.user);
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

    const temp_roomusers = this.state.room_users;

    temp_roomusers.push({ ip: this.state.user, room: room.id });

    this.setState({ room_users: temp_roomusers });

    this.setState({ active: room.id + 1 });
    this.findTeam(room.id);
  };

  authenticateUser = () => {
    console.log("AUTHENTICATING USER");
    this.setState({ active: -1 });
  };

  constructRoom = () => {
    console.log("CREATING ROOM");

    const temp_rooms = this.state.rooms;

    temp_rooms.push({ id: temp_rooms.length });
    this.setState({ rooms: temp_rooms });

    const temp_roomusers = this.state.room_users;

    temp_roomusers.push({ ip: this.state.user, room: temp_rooms.length - 1 });

    this.setState({ room_users: temp_roomusers });

    this.setState({ active: temp_rooms.length });
    this.findTeam(temp_rooms.length - 1);
  };

  findTeam = (id) => {
    console.log(id);
    const room_users = this.state.room_users;
    const team = [];

    for (let roomuser of room_users) {
      if (roomuser.room === id && roomuser.ip !== this.state.user) {
        console.log(roomuser.ip);
        team.push(roomuser.ip);
      }
    }

    console.log(team);

    this.setState({ team });
  };

  leaveRoom = () => {
    console.log("LEAVING ROOM");

    const room_users = this.state.room_users;
    const user = this.state.user;

    var filteredru = room_users.filter(function (value, index, arr) {
      if (value.ip !== user) {
        return value;
      }
    });

    this.setState({ room_users: filteredru });
    this.setState({ team: [] });
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
                    key={room.id + 1}
                    style={{
                      width: "18rem",
                      marginRight: "1rem",
                      textAlign: "center",
                    }}
                  >
                    <div className="card-body">
                      <h5 className="card-title">{room.id + 1}</h5>
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
                onClick={() => this.constructRoom()}
                className="btn btn-primary"
              >
                Create New Room
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

          <div className="row d-flex justify-content-around">
            In room {active}
          </div>

          <div className="row mt-5"></div>

          <VideoChatContainer
            username={this.state.user}
            team={this.state.team}
          />

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
