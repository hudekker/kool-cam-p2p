const getPeerObj = (id = null) => {
  let myPeer = new Peer(id, {
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
const getHostBoolPeerObj = async (myId) => {
  // myPeer = getPeerObj();
  // await myPeerOpen(myPeer);
  // console.log(`My peer id = ${myPeer.id}`);
  // https://kool.cam is the base
  let base = document.URL.split("#")[0];
  base = "https://kool.cam";
  let hash = document.URL.split("#")[1];
  let host = hash?.split("/")[0];
  let slash = hash?.split("/")[1];

  // If there is no host suffix (www.kool.cam), then it's first time and you are the host
  // www.kool.cam
  if (!host) {
    boolHost = true;
    myPeer = getPeerObj();
    await myPeerOpen(myPeer);
    hostId = myPeer.id;
    window.location.href = base + "#" + hostId + "/host";
    return;
  }

  // If there slash is host (/host) then you are host, so get that host peer obj (id=host)
  // www.kool.cam#<host id>/host
  if (slash == "host") {
    boolHost = true;
    myPeer = getPeerObj(host);
    await myPeerOpen(myPeer);
    hostId = myPeer.id;
    window.location.href = base + "#" + hostId + "/host";
    return;
  }

  // If there is host and type is not host, then the type is the friend peerId
  // www.kool.com#<host id>/<friend id>
  if (host && slash && slash !== "host") {
    boolHost = false;
    myPeer = getPeerObj(slash);
    await myPeerOpen(myPeer);
    hostId = host;
    window.location.href = base + "#" + hostId + "/" + myPeer.id;
    return;
  }

  // Otherwise you are friend, so get your peer obj (id=null)
  // www.kool.cam#<host id>
  boolHost = false;
  myPeer = getPeerObj();
  await myPeerOpen(myPeer);
  hostId = host;
  window.location.href = base + "#" + hostId + "/" + myPeer.id;
  return;
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
    p.innerHTML = `<i class="fa-solid fa-user"></i> ${peerId}`;
  }

  div.append(video);
  div.append(p);
  videoGrid.append(div);

  video.addEventListener("loadedmetadata", () => video.play());
};

const removePeer = (peerId) => {
  console.log(`Remove peer ${peerId}`);
  document.querySelector(`[data-peer-id="${peerId}"]`)?.parentElement?.remove();
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
  // Create the conn
  conn = myPeer.connect(partnerId);
  conns.push(conn);

  // Wait for the conn to open and add it to the dropdown
  await connOpen(conn);

  // Keep this event listener open, will receive data multiple times
  // In this implementation, caller is peer and receives only 1 conn.on
  conn.on("data", (data) => {
    // This is NOT recursive because the check is for key == peers and this is only from host
    if (data.key == "peers") {
      let oldPeers = [...peers];
      peers = [...data.val];

      let newPeers = [...peers.filter((x) => !oldPeers.includes(x))];
      newPeers = [...newPeers.filter((x) => x.id != myPeer.id)];

      newPeers.forEach((el) => {
        console.log(`Calling peer Id = ${el}`);
        callPeerVideo(myPeer, el.id, stream, hostId);
        callPeerData(myPeer, el.id, stream, hostId);
      });
    }

    if (data.key == "close") {
      console.log(`Peer ${data.val} closed`);
      removePeer(data.val);
    }
  });

  conn.on("close", () => {
    console.log(`${partnerId} left the chat`, "admin-msg");
    removePeer(partnerId);
  });

  conn.on("error", (err) => {
    console.log(`Error ${err.type} `);
    removePeer(partnerId);
  });
};

// Connect to the host
const callPeerVideo = (myPeer, ptnrPeerId, stream, hostId) => {
  // Get the call object
  const call = myPeer.call(ptnrPeerId, stream, { metadata: "partner nickname" });
  calls.push(call);

  // peerjs on event 'stream', partner peer send you his stream
  call.on("stream", (ptnrStream) => {
    addVideoStream(ptnrPeerId, ptnrStream, videoGrid, hostId);
  });
};

const receiveConnRequest = async (conn) => {
  // Wait for the connection to open
  conns.push(conn);
  await connOpen(conn);

  // If you are the host then send peers array to peer
  if (myPeer.id === hostId) {
    conn.send({ key: "peers", val: peers });
  }

  // Keep this event listener open, will receive data multiple times
  conn.on("data", (data) => {
    if (data.key == "peer-close") {
      removePeer(data.val);
    }

    if (data.key == "close") {
      console.log(`Peer ${data.val} closed`);
      removePeer(data.val);
    }
  });

  conn.on("close", () => {
    console.log(`${conn.peer} left the chat`);
    removePeer(conn.peer);
  });
};

const receiveCallRequest = (call) => {
  // partner Peer Id
  const ptnrPeerId = call.peer;
  let ptnrNickname = call.metadata;

  // Keep track of peers, this is sent by host to peers on data requests
  if (boolHost) {
    peers.push({ id: ptnrPeerId, nickname: ptnrNickname, order: numUser, host: false });
  }

  // Answer the call and give them your stream
  call.answer(stream);

  // peerjs on event 'stream', partner peer send you his stream
  call.on("stream", (ptnrStream) => {
    addVideoStream(ptnrPeerId, ptnrStream, videoGrid, hostId);
  });
};
