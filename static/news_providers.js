document.addEventListener('DOMContentLoaded', function () {
  // Password toggle functionality
  const togglePassword = document.getElementById('togglePassword');
  const passwordInput = document.getElementById('provider-access-token');

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', function () {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      this.querySelector('i').classList.toggle('fa-eye');
      this.querySelector('i').classList.toggle('fa-eye-slash');
    });
  }

  // Keywords modal functionality
  const keywordsModal = new bootstrap.Modal(document.getElementById('keywordsModal'));
  let currentProviderId = null;

  // Get keywords when modal is shown
  document.getElementById('keywordsModal').addEventListener('show.bs.modal', function (event) {
    const button = event.relatedTarget;
    currentProviderId = button.closest('form').querySelector('input[name="provider-id"]').value;

    fetch(`/providers/news/${currentProviderId}/keywords`)
      .then(response => response.json())
      .then(data => {
        const keywordsList = document.getElementById('keywordsList');
        keywordsList.innerHTML = data.keywords.map(keyword => `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${keyword.keyword}" id="keyword-${keyword.id}" ${keyword.selected ? 'checked' : ''}>
                        <label class="form-check-label" for="keyword-${keyword.id}">
                            ${keyword.keyword}
                        </label>
                    </div>
                `).join('');
      });
  });

  // Cancel button
  document.getElementById('cancelKeywords').addEventListener('click', function () {
    keywordsModal.hide();
  });

  // Save selected keywords
  document.getElementById('saveKeywords').addEventListener('click', function () {
    const selectedKeywords = Array.from(document.querySelectorAll('.form-check-input:checked'))
      .map(checkbox => checkbox.value);

    if (selectedKeywords.length === 0) {
      alert('Please select at least one keyword');
      return;
    }

    fetch(`/providers/news/${currentProviderId}/keywords`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `keywords[]=${selectedKeywords.join('&keywords[]=')}`
    })
      .then(response => response.json())
      .then(data => {
        keywordsModal.hide();
        alert('Keywords updated successfully');
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Error updating keywords');
      });
  });

  // Modal show handler
  $("#providerModal").on("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    const providerId = button.getAttribute('data-provider-id');
    const providerName = button.getAttribute('data-provider-name');
    const providerLogo = button.getAttribute('data-provider-logo');
    const providerOptions = JSON.parse(button.getAttribute('data-provider-options') || '{}');
    const providerEndpoint = providerOptions.endpoint || '';
    const providerAccessToken = providerOptions.access_token || '';
    const providerDescription = providerOptions.description || '';
    var modal = $(this);

    if (providerId) {
      modal.find('.modal-title').text('Edit Provider');
      modal.find('#provider-id').val(providerId);
      modal.find('#provider-name').val(providerName);
      modal.find('#provider-logo').val(providerLogo);
      modal.find('#provider-endpoint').val(providerEndpoint);
      modal.find('#provider-access-token').val(providerAccessToken);
      modal.find('#provider-description').val(providerDescription);
      modal.find('form').attr('action', `/providers/news/${providerId}`);
    } else {
      modal.find('.modal-title').text('Add Provider');
      modal.find('form')[0].reset();
      modal.find('form').attr('action', '/providers/news/');
    }
  });
});