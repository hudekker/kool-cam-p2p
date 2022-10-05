const handleModalVideoOpen = (event) => {
  let clickPeerId = event.currentTarget.parentElement.dataset.peerId;
  // await sleep(2000);

  // Prepopulate the name
  let boolMe = clickPeerId === myPeer.id ? true : false;

  let name = document.querySelector(`div[data-peer-id="${clickPeerId}"] span`).innerText;
  document.querySelector("#my-nickname").value = name;
  modalVideo.classList.remove("modal-hide");
  document.querySelector("#my-nickname").focus();

  document.querySelector("#my-nickname").disabled = !boolMe;

  // Show the current speaker state
  let video = document.querySelector(`video[data-peer-id='${clickPeerId}']`);

  if (video.volume == 0) {
    document.querySelector("#speaker-off").checked = true;
  } else {
    document.querySelector("#speaker-off").checked = false;
  }

  // Show the current microphone state
  if (boolMe) {
    document.querySelector("#mic-section").classList.remove("modal-hide");
    document.querySelector("#video-section").classList.remove("modal-hide");
  } else {
    document.querySelector("#mic-section").classList.add("modal-hide");
    document.querySelector("#video-section").classList.add("modal-hide");
  }

  if (boolMe) {
    let audioTracks = myStream.getAudioTracks();
    let boolMic = audioTracks.reduce(accum, (el) => accum && el.enabled === true, true);
    document.querySelector("#mic-off").checked = !boolMic;

    // Show the current state of camera
    let videoTracks = myStream.getVideoTracks();
    let boolVid = videoTracks.reduce(accum, (el) => accum && el.enabled === true, true);
    document.querySelector("#video-off").checked = !boolVid;
  }
};

const handleModalVideoSubmit = (event) => {
  let clickPeerId = event.currentTarget.parentElement.dataset.peerId;
  let boolMe = clickPeerId === myPeer.id ? true : false;

  // If this is you, then you can update your nickname, mic, and vid
  if (boolMe) {
    // HANDLE NICKNAME
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

    // HANDLE MICROPHONE
    let micOff = document.querySelector("#mic-off").checked;
    let audioTracks = myStream.getAudioTracks();

    if (micOff) {
      audioTracks.forEach((track) => (track.enabled = false));
    } else {
      audioTracks.forEach((track) => (track.enabled = true));
    }

    // HANDLE VIDEO
    // Handle the video off
    let videoOff = document.querySelector("#video-off").checked;
    let videoTracks = myStream.getVideoTracks();

    if (videoOff) {
      videoTracks.forEach((track) => (track.enabled = false));
    } else {
      videoTracks.forEach((track) => (track.enabled = true));
    }
  }

  // HANDLE SPEAKER
  let speakerOff = document.querySelector("#speaker-off").checked;
  let video = document.querySelector(`video[data-peer-id="${clickPeerId}"]`);

  if (speakerOff) {
    video.volume = 0;
  } else {
    video.volume = 1;
  }

  // Handle the large / small video (true is small)
  let mobileSm = document.querySelector("#mobile-sm").checked;
  console.log(`mobileSm = ${mobileSm}`);

  if (mobileSm) {
    document.querySelector("#video-grid").classList.add("sm");
  } else {
    document.querySelector("#video-grid").classList.remove("sm");
  }

  // Close the video modal
  modalVideo.classList.add("modal-hide");
};
