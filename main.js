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
  // Initialize your own peer object and get the host id
  await getHostIdMyPeerObj();

  console.log(`Host Id = ${hostId}`);
  console.log(`My peer Id = ${myPeer.id}`);
  console.log(`boolHost = ${boolHost}`);

  // Open up your video stream and add it to the screen
  myStream = await navigator.mediaDevices.getUserMedia({
    // video: { width: 1280, height: 720 },
    video: {
      width: { min: 1024, ideal: 1280, max: 1920 },
      height: { min: 576, ideal: 720, max: 1080 },
    },
    audio: true,
  });

  if (boolHost) {
    myNickname = "Host";
    peers.push({ id: myPeer.id, nickname: myNickname, order: 0, host: true });
  }

  addVideoElement(myPeer.id, myStream);

  updateHelpModalText();

  // Partners initiate request to host
  // think about a timeout loop every 3 seconds if ptnr arrives before host?
  if (!boolHost) {
    sendDataRequest(myPeer, hostId);
    sendVideoRequest(myPeer, hostId);
  }

  // Handle data request events
  myPeer.on("connection", handleDataEvents);

  // Handle video request events
  myPeer.on("call", receiveVideoRequest);

  // Modals
  // formHelp.addEventListener("submit", function (e) {
  //   e.preventDefault();
  // });
  formVideo.addEventListener("submit", function (e) {
    e.preventDefault();
  });

  // Open the video modal
  body.addEventListener("click", (event) => {
    if (event.target.tagName == "VIDEO") {
      // document.querySelector("#peer-id").innerHTML = `Your peer id is <span class="highlight">${myPeer.id}</span>`;
      document.querySelector("#my-nickname").value = myNickname;
      modalVideo.classList.remove("modal-hide");
      document.querySelector("#my-nickname").focus();
    }
  });

  // Open the help modal
  btnHelp.addEventListener("click", () => {
    modalHelp.classList.remove("modal-hide");
  });

  // Close the modals (click on the x)
  modalHelp.querySelector("#modal-help-close").onclick = function () {
    modalHelp.classList.add("modal-hide");
  };
  modalVideo.querySelector("#modal-video-close").onclick = function () {
    modalVideo.classList.add("modal-hide");
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    event.target.id == "modal-help" ? modalHelp.classList.add("modal-hide") : null;
    event.target.id == "modal-video" ? modalVideo.classList.add("modal-hide") : null;
  };

  // Video modal button click
  btnModalVideo.onclick = function () {
    // Set the nickname
    myNickname = document.querySelector("#my-nickname").value;
    document.querySelector(`div[data-peer-id="${myPeer.id}"] span`).innerText = myNickname;

    updatePeersNickname(myPeer.id, myNickname);

    // Send the nickname to the ptnrs
    conns
      .filter((el) => el.peer !== myPeer.id)
      .forEach((conn) => {
        conn.send({ key: "nickname", val: { id: myPeer.id, nickname: myNickname } });
      });

    // Close the video modal
    modalVideo.classList.add("modal-hide");
  };

  // Catch the exit event and send it all your ptnrs
  const beforeUnloadHandler = (event) => {
    event.preventDefault();
    document.URL = document.URL.split("#")[0];
    conns.forEach((el) => el.send({ key: "close", val: myPeer.id }));

    if (boolHost) {
      conns.forEach((el) => el.send({ key: "host-close", val: myPeer.id }));
    }
  };

  window.addEventListener("beforeunload", beforeUnloadHandler, { capture: true });
})();
