export const doLogin = async (username, database, handleUpdate) => {
  console.log("In doLogin");
  await database.ref("/notifs/" + username).remove();
  database.ref("/notifs/" + username).on("value", (snapshot) => {
    snapshot.exists() && handleUpdate(snapshot.val(), username);
  });
};

export const removeNotifs = async (database, username, connectedUser) => {
  console.log("In removenotifs");
  await database.ref("/notifs/" + username).remove();
  await database.ref("/notifs/" + connectedUser).remove();
};

export const doOffer = async (to, offer, database, username) => {
  console.log("In doOffer");
  await database.ref("/notifs/" + to).set({
    type: "offer",
    from: username,
    offer: JSON.stringify(offer),
  });
};

export const doAnswer = async (to, answer, database, username) => {
  console.log("In doAnswer");
  await database.ref("/notifs/" + to).update({
    type: "answer",
    from: username,
    answer: JSON.stringify(answer),
  });
};

export const doLeaveNotif = async (to, database, username) => {
  console.log("In doLeaveNotif");
  await database.ref("/notifs/" + to).update({
    type: "leave",
    from: username,
  });
};

export const doCandidate = async (to, candidate, database, username) => {
  console.log("In docandidate");
  // send the new candiate to the peer
  await database.ref("/notifs/" + to).update({
    type: "candidate",
    from: username,
    candidate: JSON.stringify(candidate),
  });
};
