function runClient() {
  const player = new Plyr("#player", {
    autoplay: false,
    muted: true,
    captions: {
      active: true,
      language: 'auto',
    }
  });
  window.player = player;

  const ws = new WebSocket(`ws://${window.location.host}/ws`);

  ws.onmessage = function (event) {
    console.log(`WS: ${event.data}`);
    const data = JSON.parse(event.data);

    if (data["type"] == "pause") {
      player.pause();
    }
    if (data["type"] == "progress" && data["playing"] === true) {
      setVideo(player, data.videoName);
      player.currentTime = data.currentTime;
      player.play();
    }
    if (data["type"] == "playing") {
      setVideo(player, data.videoName);
      player.currentTime = data.currentTime;
      player.play();
    }
  };
  ws.onopen = function (event) {};
  ws.onclose = function (event) {};

  function setVideo(player, videoName) {
    if (!videoName) return;
    const oldSrc = player.source;
    const newSrc = `${window.location.origin}/video/${videoName}.mp4`;
    if (oldSrc == newSrc) return;

    console.log("BUUUUUM");

    player.source = {
      type: 'video',
      title: videoName,
      sources: [
        {
          src: `/video/${videoName}.mp4`,
          type: 'video/mp4',
        },
      ],
      poster: `/uploads/${videoName}.jpg`,
      tracks: [
        {
          kind: 'captions',
          label: 'Russian',
          srclang: 'ru',
          src: `/uploads/${videoName}.vtt`,
          default: true,
        },
      ],
    };
  }
}

ready(runClient);
