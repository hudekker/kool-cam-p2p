let formMsg = document.getElementById("form-msg");
let inputMsg = document.getElementById("input-msg");
let formPartnerId = document.getElementById("form-partner-id");
let inputPartnerId = document.getElementById("input-partner-id");
let numUser = 0;
let calls = [];
let conns = [];

let myPeer;
let hostId;
let boolHost;
let partnerId;
let stream;
let modal = document.querySelector("#add-user-modal");
// let btnAddUser = document.querySelector("#btn-add-user");
let btnPartnerId = document.querySelector("#btn-partner-id");

const videoGrid = document.getElementById("video-grid");
// let peers = new Map();
let peers = [];
