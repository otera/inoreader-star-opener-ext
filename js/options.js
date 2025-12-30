document.addEventListener('DOMContentLoaded', function () {
  const tabcountInput = document.getElementById('iso_tabcount');
  const saveButton = document.getElementById('save');
  const statusDiv = document.getElementById('status');

  function showStatus(message, isError = false) {
    statusDiv.textContent = message;
    statusDiv.className = 'status-message ' + (isError ? 'error' : 'success');
    statusDiv.style.display = 'block';

    setTimeout(function () {
      statusDiv.style.display = 'none';
    }, 3000);
  }

  function updateFormTabcount(val) {
    tabcountInput.value = val;
    return val;
  }

  // Save button click handler
  saveButton.addEventListener('click', function () {
    const tabcount = tabcountInput.value;

    chrome.runtime.sendMessage(
      { method: 'setOptions', tabcount: tabcount },
      function (response) {
        if (chrome.runtime.lastError) {
          showStatus(
            'Error saving settings: ' + chrome.runtime.lastError.message,
            true
          );
        } else {
          showStatus('Settings saved successfully!');
        }
      }
    );
  });

  // Load initial value
  chrome.runtime.sendMessage({ method: 'getOptions' }, function (response) {
    if (chrome.runtime.lastError) {
      showStatus(
        'Error loading settings: ' + chrome.runtime.lastError.message,
        true
      );
    } else {
      const tabcount = response.iso_tabcount;
      updateFormTabcount(tabcount);
    }
  });
});
