// DIRECTV Stream Utility
// Adds keyboard shortcuts, cursor hiding, and a broken player fix to the
// DIRECTV Stream player

// Keyboard controls
function setupKeyboardControls() {
  function clickElement(selector) {
    const element = document.querySelector(selector);
    if (!element) {
      return;
    }
    element.click();
  }

  document.addEventListener("keydown", function (event) {
    if (["ArrowLeft", "ArrowRight", " ", "m", "Escape"].includes(event.key)) {
      event.preventDefault();
    }

    switch (event.key) {
      // Rewind
      case "ArrowLeft":
        clickElement(".player-button__backward");
        break;
      // Play/Pause
      case " ":
        const pauseButton = document.querySelector(".player-button__pause");
        if (pauseButton) {
          pauseButton.click();
        } else {
          clickElement(".player-button__play");
        }
        break;
      // Fast forward
      case "ArrowRight":
        clickElement(".player-button__forward");
        break;
      // Mute/Unmute
      case "m":
        clickElement(".player-button__volume");
        break;
      // Back to previous screen
      case "Escape":
        clickElement(".player-button__back");
        break;
    }
  });
}

// Cursor hiding functionality
function setupCursorHiding() {
  let videoPlayer = null;
  let cursorTimeoutId = null;

  function toggleCursor(hide) {
    document.body.style.cursor = hide ? "none" : "auto";
  }

  function handleMouseMove(e) {
    // Show cursor immediately
    toggleCursor(false);

    // Clear any existing timeout
    clearTimeout(cursorTimeoutId);

    // Set timer to hide cursor after inactivity
    if (videoPlayer.contains(e.target)) {
      cursorTimeoutId = setTimeout(() => toggleCursor(true), 2000);
    }
  }

  // Wait for video player to be available
  const observer = new MutationObserver((mutations, obs) => {
    videoPlayer = document.querySelector(".video-player");
    if (videoPlayer) {
      videoPlayer.addEventListener("mousemove", handleMouseMove, {
        passive: true,
      });
      videoPlayer.addEventListener("mouseleave", () => {
        clearTimeout(cursorTimeoutId);
        toggleCursor(false);
      });

      obs.disconnect();
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("unload", () => {
    if (videoPlayer) {
      videoPlayer.removeEventListener("mousemove", handleMouseMove);
    }
    clearTimeout(cursorTimeoutId);
  });
}

function resetVideoPlayer() {
  const drmKeys = [
    "vstb_internal_ciscoDrm_activationData",
    "vstb_internal_ciscoDrm_userId",
    "vstb_internal_vstb__lock",
  ];

  drmKeys.forEach((key) => localStorage.removeItem(key));

  const notification = document.createElement("div");
  notification.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 20px;
    border-radius: 8px;
    z-index: 99999;
    font-size: 18px;
    text-align: center;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
  `;
  notification.innerHTML = "Fixing player...<br><small>Please wait</small>";
  document.body.appendChild(notification);

  // Force cache invalidation by adding a timestamp to the URL
  const url = new URL(window.location.href);
  url.searchParams.set("_reload", Date.now());

  // Wait a moment, then reload
  setTimeout(() => {
    window.location.href = url.toString();
  }, 500);
}

function setupResetPlayerListener() {
  // Listen for messages from the extension popup
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action !== "resetPlayer") {
      return;
    }
    resetVideoPlayer();
    sendResponse({ success: true });
  });
}

function init() {
  setupKeyboardControls();
  setupCursorHiding();
  setupResetPlayerListener();
}

init();
