"use strict";
(function () {
  const player = new Plyr("#player", {
    'autoplay': false, 
    'muted': true,
  });
  window.player = player;

  var socket_id = null;
  var lock = false;

  const video_name = window.location.pathname.split('/video/')[1];

  const ws = new WebSocket(`ws://${window.location.host}/ws/${video_name}`);
  ws.onmessage = function (event) {
    console.log(`WS: ${event.data}`);
    const data = JSON.parse(event.data);
    if (data["type"] == "hello") {
      socket_id = data["id"];
    }

    if (!!socket_id) {
      if (socket_id == data['from']) return;

      if (data["type"] == "pause") {
        lock = true;
        player.pause();
      }
      if (data["type"] == "progress" && data['playing'] === true) {
        lock = true;
        player.currentTime = data["currentTime"];
        player.play();
      }
      if (data["type"] == "playing") {
        lock = true;
        player.currentTime = data["currentTime"];
        player.play();
      }
    }
  };
  ws.onopen = function (event) {
    console.log("Open WS");
    setupPlayerListeners();
  };
  ws.onclose = function (event) {
    console.log("Close WS");
    player.destroy();
  };

  function setupPlayerListeners() {
    player.on("progress", (ev) => {
      if (lock) {
        lock = false;
        return;
      }
      console.log("PROGRESS");
      ws.send(
        JSON.stringify({
          type: "progress",
          playing: player.playing,
          currentTime: player.currentTime,
        })
      );
    });
    player.on("playing", (ev) => {
      if (lock) {
        lock = false;
        return;
      }
      console.log("START PLAYING at " + player.currentTime);
      ws.send(
        JSON.stringify({
          type: "playing",
          currentTime: player.currentTime,
        })
      );
    });
    player.on("pause", (ev) => {
      if (lock) {
        lock = false;
        return;
      }
      console.log("PAUSE");
      ws.send(
        JSON.stringify({
          type: "pause",
          currentTime: player.currentTime,
        })
      );
    });
  }
})();
