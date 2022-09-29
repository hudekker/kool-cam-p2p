boolRefresh =
  (window.performance.navigation && window.performance.navigation.type === 1) ||
  window.performance
    .getEntriesByType("navigation")
    .map((nav) => nav.type)
    .includes("reload");

if (boolRefresh) {
  // window.location.href = document.URL.split("#")[0];
}
// Use async wrapper because there are awaits
(async () => {
  // Initialize your own peer object

  // Connect to host
  await getHostBoolPeerObj();

  console.log(`Host Id = ${hostId}`);
  // boolHost = hostId === myPeer.id ? true : false;
  console.log(`boolHost = ${boolHost}`);

  // Open up your video stream and add it to the screen
  stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 1280, height: 720 },
    audio: false,
  });

  addVideoStream(myPeer.id, stream, videoGrid, hostId);

  // If you are not the host, then video call and data call the host
  if (!boolHost) {
    updateHelpModalPtnr();
    callPeerVideo(myPeer, hostId, stream, hostId);
    callPeerData(myPeer, hostId, stream, hostId);
  } else {
    updateHelpModalHost();
  }

  // Host is the only one who receives data connection request
  myPeer.on("connection", receiveConnRequest);

  // Host and Peers (3 or more) receive call video request from peer(s).
  myPeer.on("call", receiveCallRequest);

  // Modals
  formHelp.addEventListener("submit", function (e) {
    e.preventDefault();
  });
  formVideo.addEventListener("submit", function (e) {
    e.preventDefault();
  });

  // When the user clicks the button, open the modal
  // btnAddUser.onclick = function () {
  //   document.querySelector("#peer-id").innerHTML = `Your peer id is <span class="highlight">${myPeer.id}</span>`;
  //   modal.classList.remove("modal-hide");
  // };

  // When the user clicks on <span> (x), close the modal
  modalHelp.querySelector("#modal-help-close").onclick = function () {
    modalHelp.classList.add("modal-hide");
  };
  modalVideo.querySelector("#modal-video-close").onclick = function () {
    modalVideo.classList.add("modal-hide");
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target.id == "modal-help") {
      modalHelp.classList.add("modal-hide");
    }
    if (event.target.id == "modal-video") {
      modalVideo.classList.add("modal-hide");
    }
  };

  btnModalVideo.onclick = function () {
    myNickname = document.querySelector("#my-nickname").value;
    console.log(`my nickname is`, myNickname);
    let nicknameSpan = document.querySelector(`div[data-peer-id="${myPeer.id}"] span`);
    if (nicknameSpan) {
      nicknameSpan.innerText = myNickname;
    }
    modalVideo.classList.add("modal-hide");

    conns.forEach((conn) => {
      // check to see if not yourself?
      if (conn.peer === myPeer.id) {
        console.log(`conn.peer === myPeer.id`);
      }
      conn.send({ key: "nickname", val: { id: myPeer.id, name: myNickname } });
    });
    // if (myNickname !== "") callPeerVideo(ptnrPeerId);
    // modal.classList.add("modal-hide");
  };

  btnHelp.addEventListener("click", () => {
    modalHelp.classList.remove("modal-hide");
  });

  body.addEventListener("click", (event) => {
    if (event.target.tagName == "VIDEO") {
      document.querySelector("#peer-id").innerHTML = `Your peer id is <span class="highlight">${myPeer.id}</span>`;
      modalVideo.classList.remove("modal-hide");
    }
  });

  const beforeUnloadListener = (event) => {
    event.preventDefault();
    document.URL = document.URL.split("#")[0];
    conns.forEach((el) => {
      el.send({ key: "close", val: myPeer.id });
    });
    // window.location.href = document.URL.split("#")[0];
  };

  window.addEventListener("beforeunload", beforeUnloadListener, { capture: true });
})();
