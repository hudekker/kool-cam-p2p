// let formMsg = document.getElementById("form-msg");
// let inputMsg = document.getElementById("input-msg");
// let formPartnerId = document.getElementById("form-partner-id");
// let inputPartnerId = document.getElementById("input-partner-id");
let numUser = 0;
let boolRefresh;
let calls = [];
let conns = [];

let myPeer;
let hostId;
let boolHost;
let partnerId;
let myStream;
let body = document.querySelector("body");
let btnHelp = document.querySelector("#btn-help");
let modalHelp = document.querySelector("#modal-help");
let modalVideo = document.querySelector("#modal-video");
let btnModalHelp = document.querySelector("#btn-modal-help");
let btnModalVideoOk = document.querySelector("#btn-modal-video-ok");
let formHelp = document.querySelector("#form-help");
let formVideo = document.querySelector("#form-video");
let btnHangup = document.querySelector("#btn-hangup");
let myNickname;
let clickPeerId;

const videoGrid = document.getElementById("video-grid");
// let peers = new Map();
let peers = [];

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
