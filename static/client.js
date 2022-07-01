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
      setupSubtitles(data.videoName);
    }
    if (data["type"] == "playing") {
      setVideo(player, data.videoName);
      player.currentTime = data.currentTime;
      player.play();
      setupSubtitles(data.videoName);
    }
  };
  ws.onopen = function (event) {};
  ws.onclose = function (event) {};

  function setVideo(player, videoName) {
    if (!videoName) return;
    const oldSrc = player.source;
    const newSrc = `${window.location.origin}/video/${videoName}.mp4`;
    if (oldSrc == newSrc) return;

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
    };
  }
}

ready(runClient);
