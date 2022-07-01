function ready(fn) {
  if (document.readyState != "loading") {
    fn();
  } else {
    document.addEventListener("DOMContentLoaded", fn);
  }
}

function setupSubtitles(videoName) {
  if (!SubtitlesOctopus) return;
  const video = document.getElementsByTagName("video")[0];
  console.log("TRY SET SUBS");
  if (!video) return;
  console.log("SETUP SUBS");

  const options = {
    video: video,
    subUrl: `/uploads/${videoName}.ass`,
    fonts: [
      "/static/fonts/Arial.ttf",
      "/static/fonts/TimesNewRoman.ttf",
      "/static/fonts/Bookman Old Style.ttf",
      "/static/fonts/Stylo.ttf",
      "/static/fonts/Verdana.ttf",
      "/static/fonts/Continuum Medium.ttf",
      "/static/fonts/Modern Antiqua.ttf",
    ],
    //onReady: onReadyFunction,
    //debug: true,
    workerUrl:
      "/static/subtitles-octopus-worker.js",
  };
  window.octopusInstance = new SubtitlesOctopus(options); // You can experiment in console
}
