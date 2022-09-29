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
let stream;
let body = document.querySelector("body");
let btnHelp = document.querySelector("#btn-help");
let modalHelp = document.querySelector("#modal-help");
let modalVideo = document.querySelector("#modal-video");
let btnModalHelp = document.querySelector("#btn-modal-help");
let btnModalVideo = document.querySelector("#btn-modal-video");
let formHelp = document.querySelector("#form-help");
let formVideo = document.querySelector("#form-video");
let myNickname = document.querySelector("#my-nickname");

const videoGrid = document.getElementById("video-grid");
// let peers = new Map();
let peers = [];
