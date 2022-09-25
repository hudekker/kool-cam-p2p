// Use async wrapper because there are awaits
(async () => {
  // Initialize your own peer object
  let myPeer = getPeerObj();
  await myPeerOpen(myPeer);
  console.log(`My peer id = ${myPeer.id}`);

  // Connect to host
  let hostId = getHost(myPeer.id);
  let boolHost = hostId === myPeer.id ? true : false;
  console.log(`boolHost = ${boolHost}`);

  // Open up your video stream and add it to the screen
  let stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720 },
    audio: false,
  });

  addVideoStream(myPeer.id, stream, videoGrid, hostId);

  // If you are not the host, then video call and data call the host
  if (!boolHost) {
    callPeerVideo(myPeer, hostId, stream, hostId);
    callPeerData(myPeer, hostId, stream, hostId);
  }

  // Host is the only one who receives data connection request
  myPeer.on("connection", receiveConnRequest);

  // Host and Peers (3 or more) receive call video request from peer(s).
  myPeer.on("call", (call) => {
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
      // add the stream
      addVideoStream(ptnrPeerId, ptnrStream, videoGrid, hostId);
    });

    // peerjs on event 'close'
    call.on("close", () => {
      // Remove video element
      let el = document.querySelector(`[data-peer-id = "${ptnrPeerId}"]`);
      el ? el.remove() : console.log(`Video element ${ptnrPeerId} not found`);
      // Remove partner peer from list
      // peers.delete(ptnrPeerId);
      peers = peers.filter((el) => el != ptnrPeerId);

      // Send updated peers?
    });

    call.on("disconnected", () => {
      alert(`Ptnr closed ${ptnrPeerId}`);
    });

    call.on("error", () => {
      alert(`Ptnr closed ${ptnrPeerId}`);
    });
  });

  // formPartnerId.addEventListener("submit", function (e) {
  //   e.preventDefault();
  // });

  // // When the user clicks the button, open the modal
  // btnAddUser.onclick = function () {
  //   document.querySelector("#peer-id").innerHTML = `Your peer id is <span class="highlight">${myPeer.id}</span>`;
  //   modal.classList.remove("modal-hide");
  // };

  // // When the user clicks on <span> (x), close the modal
  // document.querySelector("#close").onclick = function () {
  //   modal.classList.add("modal-hide");
  // };

  // // When the user clicks anywhere outside of the modal, close it
  // window.onclick = function (event) {
  //   if (event.target == modal) {
  //     modal.classList.add("modal-hide");
  //   }
  // };

  // btnPartnerId.onclick = function () {
  //   ptnrPeerId = document.querySelector("#input-partner-id").value;
  //   if (ptnrPeerId !== "") callPeerVideo(ptnrPeerId);
  //   modal.classList.add("modal-hide");
  // };

  // window.onbeforeunload = function () {
  //   alert("window is closing!");
  // };

  // document.querySelector("body").addEventListener("click", (event) => {
  //   if (event.target.tagName == "VIDEO") {
  //     // calls.forEach((el) => {
  //     //   if (el.peer === event.target.dataset.peerId) {
  //     //     debugger;
  //     //     el.close();
  //     //     console.log(`Closing call for ${el.peer}`);
  //     //   }
  //     // });

  //     conns.forEach((el) => {
  //       // if (el.peer === event.target.dataset.peerId) {
  //       //   debugger;
  //       el.close();
  //       console.log(`Closing call for ${el.peer}`);
  //       // }
  //     });
  //   }
  // });

  const beforeUnloadListener = (event) => {
    event.preventDefault();
    conns.forEach((el) => {
      el.close();
    });
  };

  window.addEventListener("beforeunload", beforeUnloadListener, { capture: true });
})();
