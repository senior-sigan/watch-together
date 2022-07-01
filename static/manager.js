function runManager() {
  const player = new Plyr("#player");
  window.player = player;

  const videoName = window.location.pathname.split('/manager/')[1];

  const ws = new WebSocket(`ws://${window.location.host}/ws`);
  ws.onmessage = function (event) {
    console.log(`WS: ${event.data}`);
  };
  ws.onopen = function (event) {
    console.log("Open WS");
    setupPlayerListeners();
  };
  ws.onclose = function (event) {
    console.log("Close WS");
  };

  function setupPlayerListeners() {
    player.on("progress", (ev) => {
      console.log("PROGRESS");
      ws.send(
        JSON.stringify({
          type: "progress",
          playing: player.playing,
          currentTime: player.currentTime,
          videoName: videoName,
        })
      );
    });
    player.on("playing", (ev) => {
      console.log("START PLAYING at " + player.currentTime);
      ws.send(
        JSON.stringify({
          type: "playing",
          currentTime: player.currentTime,
          videoName: videoName,
        })
      );
    });
    player.on("pause", (ev) => {
      console.log("PAUSE");
      ws.send(
        JSON.stringify({
          type: "pause",
          currentTime: player.currentTime,
          videoName: videoName,
        })
      );
    });
  }
}


ready(runManager);
