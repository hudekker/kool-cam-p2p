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

  addVideoElement(myPeer.id, stream, videoGrid, hostId);

  updateHelpModalText();

  // If you are not the host, then video call and data call the host
  if (!boolHost) {
    sendVideoRequest(myPeer, hostId, stream, hostId);
    sendDataRequest(myPeer, hostId, stream, hostId);
  }

  // Host is the only one who receives data connection request
  myPeer.on("connection", receiveDataRequest);

  // Host and Peers (3 or more) receive call video request from peer(s).
  myPeer.on("call", receiveVideoRequest);

  // When the user clicks the button, open the modal
  // btnAddUser.onclick = function () {
  //   document.querySelector("#peer-id").innerHTML = `Your peer id is <span class="highlight">${myPeer.id}</span>`;
  //   modal.classList.remove("modal-hide");
  // };

  // Modals
  formHelp.addEventListener("submit", function (e) {
    e.preventDefault();
  });
  formVideo.addEventListener("submit", function (e) {
    e.preventDefault();
  });

  // Open the video modal
  body.addEventListener("click", (event) => {
    if (event.target.tagName == "VIDEO") {
      document.querySelector("#peer-id").innerHTML = `Your peer id is <span class="highlight">${myPeer.id}</span>`;
      modalVideo.classList.remove("modal-hide");
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

    // Send the nickname to the ptnrs
    conns
      .filter((el) => el.peer !== myPeer.id)
      .forEach((conn) => {
        conn.send({ key: "nickname", val: { id: myPeer.id, name: myNickname } });
      });

    // Close the video modal
    modalVideo.classList.add("modal-hide");
  };

  // Catch the exit event and send it all your ptnrs
  const beforeUnloadHandler = (event) => {
    event.preventDefault();
    document.URL = document.URL.split("#")[0];
    conns.forEach((el) => el.send({ key: "close", val: myPeer.id }));
  };

  window.addEventListener("beforeunload", beforeUnloadHandler, { capture: true });
})();
