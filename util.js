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
const getHostIdMyPeerObj = async (myId) => {
  // myPeer = getPeerObj();
  // await myPeerOpen(myPeer);
  let base = document.URL.split("#")[0];
  // if (base === "https://kool.cam/") base = "https://kool.cam";

  // base = "https://kool.cam";
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

const updateHelpModalText = () => {
  if (boolHost) {
    document.querySelector("#modal-help-host").classList.remove("modal-hide");
    document.querySelector("#ptnr-link2").innerHTML = `Friend link (send to your friends) <br><span class=highlight>https://kool.cam/#${hostId}`;
    document.querySelector("#host-link").innerHTML = `Host link (this is your link) <br><span class=highlight>https://kool.cam/#${hostId}/host`;
  } else {
    document.querySelector("#modal-help-ptnr").classList.remove("modal-hide");
    document.querySelector("#ptnr-link").innerHTML = `To add friends to the chat, send them this link <br><span class=highlight>https://kool.cam/#${hostId}`;
  }
};

const addVideoElement = (peerId, stream) => {
  console.log("inside addVideoElement");
  if (document.querySelector(`video[data-peer-id="${peerId}"]`)) {
    console.log("inside addVideoElement but return since = peerId");
    return;
  }

  // Existing elements
  let a = document.querySelectorAll("div[data-order]");
  a.forEach((el) => {
    let b = peers?.filter((el2) => el2.id === el.dataset.peerId)[0]?.order;
    if (b) {
      el.dataset.order = peers?.filter((el2) => el2.id === el.dataset.peerId)[0]?.order;
    }
  });

  let numOrder = peers?.filter((el) => el.id === peerId)[0]?.order;
  if (!numOrder) {
    numOrder = 0;
  }

  const div = document.createElement("div");
  div.dataset.peerId = peerId;
  div.dataset.order = numOrder;
  div.classList.add("box");

  const video = document.createElement("video");
  video.srcObject = stream;
  video.dataset.peerId = peerId;
  video.setAttribute("playsinline", true);

  const p = document.createElement("p");
  p.classList.add("name");

  if (peerId == hostId) {
    p.innerHTML = `<i class="fa-solid fa-ghost"></i> <span class='nickname'>Host</span>`;
  } else {
    // p.innerHTML = `<i class="fa-solid fa-user-secret"></i> Person #${numUser}`;
    myNickname = `Friend ${numOrder}`;
    p.innerHTML = `<i class="fa-solid fa-user"></i> <span class='nickname'>${myNickname}</span>`;
    // updatePeersNickname(id, `Friend ${numOrder}`);
  }

  div.append(video);
  div.append(p);
  videoGrid.append(div);

  video.addEventListener("loadedmetadata", () => video.play());
};

const removePeer = (peerId) => {
  debugger;
  console.log(`Remove peer ${peerId}`);
  document.querySelector(`div[data-peer-id="${peerId}"]`)?.remove();
  peers = [...peers.filter((el) => el.id != peerId)];
};

const connOpen = (conn) => {
  return new Promise((resolve, reject) => {
    conn.on("open", () => {
      console.log(`Data connected with ${conn.peer}`);
      resolve();
    });
  });
};
const handleDataEvents = async (conn) => {
  // Wait for the connection to open
  conns.push(conn);
  await connOpen(conn);

  // If you are the host then send everyone the updated peers array to peer
  if (myPeer.id === hostId) {
    // conn.send({ key: "peers", val: peers });
    conns.forEach((el) => el.send({ key: "peers", val: peers }));
  }

  // Do I need this?
  // if (myNickname) {
  //   conn.send({ key: "nickname", val: { id: myPeer.id, nickname: myNickname } });
  //   // if (myPeer.id === hostId) {
  //   //   conn.send({ key: "peers", val: peers });
  //   // }
  // }

  // Keep this event listener open, will receive data multiple times
  conn.on("data", async (data) => {
    switch (data.key) {
      // Not recursive
      case "peers":
        let oldPeers = [...peers];
        peers = [...data.val];

        // Update display peers
        debugger;
        for (let i = 0; i < peers.length; i++) {
          let span = document.querySelector(`div [data-peer-id=${peers[i].id}] span.nickname`);
          span ? (span.innerText = peers[i].nickname) : null;
        }

        let newPeers = [...peers.filter((x) => !oldPeers.includes(x))];
        newPeers = [...newPeers.filter((x) => x.id != myPeer.id)];

        for (let i = 0; i < newPeers.length; i++) {
          ptnrPeer = newPeers[i];
          console.log(`Calling partner peer Id = ${ptnrPeer.id}`);

          sendVideoRequest(myPeer, ptnrPeer.id);
          sendDataRequest(myPeer, ptnrPeer.id);
        }

        break;

      case "host-close":
        removePeer(data.val);
        conns.forEach((el) => el.send({ key: "close", val: myPeer.id }));
        break;

      case "close":
        console.log(`Peer ${data.val} closed`);
        removePeer(data.val);
        break;

      case "nickname":
        let { id, nickname } = data.val;
        console.log(`received id, name = `, id, nickname);
        document.querySelector(`div[data-peer-id="${id}"] span`).innerText = nickname;

        // If you are the host, update the peers array and send it out
        debugger;
        updatePeersNickname(id, nickname);

        // let nicknameElement = document.querySelector(`div[data-peer-id="${id}"] span`);
        // if (nicknameElement) {
        //   nicknameElement.innerText = name;
        // }
        break;

      default:
        console.log(`Unknown data.key ${data.key} from ${conn.peer}`);
        break;
    }
  });

  conn.on("close", () => {
    console.log(`${conn.peer} left the chat`, "admin-msg");
    removePeer(conn.peer);
  });
};

const sendDataRequest = async (myPeer, ptnrId) => {
  // Create the conn
  let conn = myPeer.connect(ptnrId);

  // conns.push(conn);
  // await connOpen(conn);

  await handleDataEvents(conn);
  // // Keep this event listener open, will receive data multiple times
  // conn.on("data", (data) => {
  //   if (data.key == "peers") {
  //     let oldPeers = [...peers];
  //     peers = [...data.val];

  //     let newPeers = [...peers.filter((x) => !oldPeers.includes(x))];
  //     newPeers = [...newPeers.filter((x) => x.id != myPeer.id)];

  //     newPeers.forEach((el) => {
  //       console.log(`Calling peer Id = ${el}`);
  //       sendVideoRequest(myPeer, el.id, stream, hostId);
  //       sendDataRequest(myPeer, el.id, stream, hostId);
  //     });
  //   }

  //   if (data.key == "close") {
  //     console.log(`Peer ${data.val} closed`);
  //     removePeer(data.val);
  //   }

  //   if (data.key == "nickname") {
  //     let { id, name } = data.val;
  //     console.log(`received id, name = `, id, name);
  //     let nicknameElement = document.querySelector(`div[data-peer-id="${id}"] span`);
  //     if (nicknameElement) {
  //       nicknameElement.innerText = name;
  //     }
  //   }
  // });

  // conn.on("close", () => {
  //   console.log(`${partnerId} left the chat`, "admin-msg");
  //   removePeer(partnerId);
  // });
};

// Connect to the host
const sendVideoRequest = (myPeer, ptnrPeerId) => {
  // Get the call object
  const call = myPeer.call(ptnrPeerId, myStream, { metadata: "partner nickname" });
  calls.push(call);

  // peerjs on event 'stream', partner peer send you his stream
  call.on("stream", (ptnrStream) => {
    addVideoElement(ptnrPeerId, ptnrStream);
  });
};

const receiveDataRequest = async (conn) => {
  // Keep this event listener open, will receive data multiple times
  handleDataEvents(conn);

  // conn.on("data", (data) => {
  //   if (data.key == "peer-close") {
  //     removePeer(data.val);
  //   }

  //   if (data.key == "close") {
  //     console.log(`Peer ${data.val} closed`);
  //     removePeer(data.val);
  //   }

  //   if (data.key == "nickname") {
  //     let { id, name } = data.val;
  //     console.log(`received id, name = `, id, name);
  //     let nicknameElement = document.querySelector(`div[data-peer-id="${id}"] span`);
  //     if (nicknameElement) {
  //       nicknameElement.innerText = name;
  //     }
  //   }
  // });

  // conn.on("close", () => {
  //   console.log(`${conn.peer} left the chat`, `admin-msg`);
  //   removePeer(conn.peer);
  // });
};

const receiveVideoRequest = (call) => {
  // partner Peer Id
  const ptnrPeerId = call.peer;
  let orderNum = peers.length + 1;
  let ptnrNickname = `Friend ${orderNum}`;
  // let ptnrNickname = call.metadata;

  // Keep track of peers, this is sent by host to peers on data requests
  if (boolHost) {
    peers = peers.filter((el) => el.id != ptnrPeerId);
    peers.push({ id: ptnrPeerId, nickname: ptnrNickname, order: orderNum, host: false });
  }

  // Answer the call and give them your stream
  call.answer(myStream);

  // peerjs on event 'stream', partner peer send you his stream
  call.on("stream", (ptnrStream) => {
    addVideoElement(ptnrPeerId, ptnrStream);
  });
};

const updatePeersNickname = (id, nickname) => {
  peers = [
    ...peers.map((el) => {
      el.id === id ? (el.nickname = nickname) : null;
      return el;
    }),
  ];
};
