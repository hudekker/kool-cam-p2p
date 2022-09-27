const pageAccessedByReload =
  (window.performance.navigation && window.performance.navigation.type === 1) ||
  window.performance
    .getEntriesByType("navigation")
    .map((nav) => nav.type)
    .includes("reload");

if (pageAccessedByReload) {
  // window.location.href = document.URL.split("#")[0];
}
// Use async wrapper because there are awaits
(async () => {
  // Initialize your own peer object
  myPeer = getPeerObj();
  await myPeerOpen(myPeer);
  console.log(`My peer id = ${myPeer.id}`);

  // Connect to host
  hostId = getHost(myPeer.id);
  boolHost = hostId === myPeer.id ? true : false;
  console.log(`boolHost = ${boolHost}`);

  // Open up your video stream and add it to the screen
  stream = await navigator.mediaDevices.getUserMedia({
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
  myPeer.on("call", receiveCallRequest);

  // Modal
  formPartnerId.addEventListener("submit", function (e) {
    e.preventDefault();
  });

  // When the user clicks the button, open the modal
  // btnAddUser.onclick = function () {
  //   document.querySelector("#peer-id").innerHTML = `Your peer id is <span class="highlight">${myPeer.id}</span>`;
  //   modal.classList.remove("modal-hide");
  // };

  // When the user clicks on <span> (x), close the modal
  document.querySelector("#close").onclick = function () {
    modal.classList.add("modal-hide");
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.classList.add("modal-hide");
    }
  };

  // btnPartnerId.onclick = function () {
  //   ptnrPeerId = document.querySelector("#input-partner-id").value;
  //   if (ptnrPeerId !== "") callPeerVideo(ptnrPeerId);
  //   modal.classList.add("modal-hide");
  // };

  document.querySelector("body").addEventListener("click", (event) => {
    if (event.target.tagName == "VIDEO") {
      document.querySelector("#peer-id").innerHTML = `Your peer id is <span class="highlight">${myPeer.id}</span>`;
      modal.classList.remove("modal-hide");
      // calls.forEach((el) => {
      //   if (el.peer === event.target.dataset.peerId) {
      //     debugger;
      //     el.close();
      //     console.log(`Closing call for ${el.peer}`);
      //   }
      // });
    }
  });

  const beforeUnloadListener = (event) => {
    event.preventDefault();
    document.URL = document.URL.split("#")[0];
    conns.forEach((el) => {
      el.send({ key: "close", val: myPeer.id });
    });
    window.location.href = document.URL.split("#")[0];
  };

  window.addEventListener("beforeunload", beforeUnloadListener, { capture: true });
})();
