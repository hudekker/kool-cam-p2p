const getPeerObj = () => {
  let myPeer = new Peer(null, {
    host: "evening-atoll-16293.herokuapp.com",
    port: 443,
    secure: true,
  });

  return myPeer;
};

const myPeerOpen = (myPeer) => {
  return new Promise((resolve, reject) => {
    myPeer.on("open", (id) => resolve(id));
  });
};
// Determine if you are the host
const getHost = (myId) => {
  //   let a = document.URL.split("?")?.slice(1)[0]?.split("&");
  //   let b = new Map();
  //   a?.forEach((el) => b.set(el.split("=")[0], el.split("=")[1]));
  //   let host = b.get("host");

  //   console.log(`myId = ${myId}`);

  let host = document.URL.split("#")[1];

  // If host query parameter doesn't not exist, then you are not the host
  if (!host) {
    host = myId;
    window.location.href = document.URL + "#" + host;
  }

  return host;
};

const addVideoStream = (peerId, stream, videoGrid, hostId) => {
  if (document.querySelector(`video[data-peer-id="${peerId}"]`)) return;

  const div = document.createElement("div");
  div.dataset.order = numUser;
  div.classList.add("box");

  const video = document.createElement("video");
  video.srcObject = stream;
  video.dataset.peerId = peerId;
  video.setAttribute("playsinline", true);

  const p = document.createElement("p");
  p.classList.add("name");

  if (peerId == hostId) {
    p.innerHTML = `<i class="fa-solid fa-ghost"></i> Host`;
  } else {
    // p.innerHTML = `<i class="fa-solid fa-user-secret"></i> Person #${numUser}`;
    p.innerHTML = `<i class="fa-solid fa-user-secret"></i> ${peerId}`;
  }

  div.append(video);
  div.append(p);
  videoGrid.append(div);

  video.addEventListener("loadedmetadata", () => video.play());
};

const removeVideoElement = (peerId) => {
  [...document.querySelectorAll(`[data-peer-id = "${peerId}"]`)]?.map((el) => {
    el.remove();
  });

  peers.delete(peerId);
};

const connOpen = (conn) => {
  return new Promise((resolve, reject) => {
    conn.on("open", () => {
      console.log(`Data connected with ${conn.peer}`);
      resolve();
    });
  });
};

const callPeerData = async (myPeer, partnerId, stream, hostId) => {
  console.log("callPeerData");
  // Create the conn
  conn = myPeer.connect(partnerId);
  conns.push(conn);

  // Wait for the conn to open and add it to the dropdown
  await connOpen(conn);

  // Keep this event listener open, will receive data multiple times
  // In this implementation, caller is peer and receives only 1 conn.on
  conn.on("data", (data) => {
    let oldPeers = [...peers];
    peers = [...data];

    console.log("Inside callPeerData, conn.on => received data");
    // data.forEach((el) => console.log(el));
    console.log(peers);
    // console.log(peers);

    let newPeers = [...peers.filter((x) => !oldPeers.includes(x))];

    newPeers.forEach((el) => {
      console.log(`Calling peer Id = ${el}`);
      callPeerVideo(myPeer, el.id, stream, hostId);
    });

    console.log("peers");
    peers.forEach((el) => console.log(el));
  });

  conn.on("close", () => {
    console.log(`${partnerId} left the chat`, "admin-msg");
    conn.close();
    conn = "";
  });

  conn.on("error", (err) => {
    console.log(`Error ${err.type} `);
    conn.close();
    conn = "";
  });
};

// Connect to the host
const callPeerVideo = (myPeer, ptnrPeerId, stream, hostId) => {
  // Get the call object
  const call = myPeer.call(ptnrPeerId, stream, { metadata: "partner nickname" });
  calls.push(call);

  // peerjs on event 'stream', partner peer send you his stream
  call.on("stream", (ptnrStream) => {
    // add the stream
    addVideoStream(ptnrPeerId, ptnrStream, videoGrid, hostId);
  });
};

const receiveConnRequest = async (conn2) => {
  // Wait for the connection to open
  let conn = conn2;
  conns.push(conn);
  console.log("Host receiveConnRequest");

  await connOpen(conn);

  // Send peers to peer
  conn.send(peers);

  // Keep this event listener open, will receive data multiple times
  // Host will receive requests multiple times, once per 3rd and more peers
  conn.on("data", (data) => {
    console.log(`Host received from peers this data`);
    console.log(data);
  });

  conn.on("close", () => {
    // alert(`Peer conn ${conn.peer} is closed`);
    console.log(`${conn.peer} left the chat`);
    // conn.close();
    // conn = "";
    debugger;
    // remove grid video
    document.querySelector(`[data-peer-id="${conn.peer}"]`).parentElement?.remove();
    // peers = peers.filter((el) => el.id != conn.peer);
    console.log(`Removed ${conn.peer}`);
    console.log(peers);
    // [...document.querySelectorAll(`[data-peer-id = "${conn.peer}"]`)]?.map((el) => {
    //   el.remove();
    // });
  });

  conn.on("error", (err) => {
    // alert("conn error is closed");
    console.log(`${err} `);
    // conn.close();
    // conn = "";

    // remove grid video
    [...document.querySelectorAll(`[data-peer-id = "${conn.id}"]`)]?.map((el) => {
      el.remove();
    });
  });
};
