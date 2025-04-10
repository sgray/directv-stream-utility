document.addEventListener("DOMContentLoaded", function () {
  const resetPlayerButton = document.getElementById("reset-player");
  resetPlayerButton.addEventListener("click", function () {
    // Query for the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      // Send message to content script in the active tab
      chrome.tabs.sendMessage(
        tabs[0].id,
        { action: "resetPlayer" },
        function (response) {
          if (response && response.success) {
            // Close the popup when the action is triggered
            window.close();
          }
        }
      );
    });
  });
});
