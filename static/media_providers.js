document.addEventListener("DOMContentLoaded", function () {
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("provider-access-token");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", function () {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      this.querySelector("i").classList.toggle("fa-eye");
      this.querySelector("i").classList.toggle("fa-eye-slash");
    });
  }

  let currentProviderId;
  // Get keywords when modal is shown
  document
    .getElementById("keywordsModal")
    .addEventListener("show.bs.modal", function (event) {
      const button = event.relatedTarget;
      currentProviderId = button.getAttribute("data-provider-id");

      fetch(`/contentoire/providers/keywords/media/${currentProviderId}`)
        .then((response) => response.json())
        .then((data) => {
          const keywordsList = document.getElementById("keywordsList");
          keywordsList.innerHTML = data.keywords
            .map(
              (keyword) => `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${keyword.id}" id="keyword-${keyword.id}" ${keyword.selected ? "checked" : ""}>
                        <label class="form-check-label" for="keyword-${keyword.id}">
                            ${keyword.keyword}
                        </label>
                    </div>
                `
            )
            .join("");
        });
    });

  // Save selected keywords
  document
    .getElementById("saveKeywords")
    .addEventListener("click", function () {
      const selectedKeywords = Array.from(
        document.querySelectorAll(".form-check-input:checked")
      ).map((checkbox) => checkbox.value);

      if (selectedKeywords.length === 0) {
        alert("Please select at least one keyword");
        return;
      }

      fetch(`/contentoire/providers/keywords/media/${currentProviderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `keywords[]=${selectedKeywords.join("&keywords[]=")}`,
      })
        .then((response) => response.json())
        .then((data) => {
          $("#keywordsModal").modal("hide");
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    });

  // Modal show handler
  $("#providerModal").on("show.bs.modal", function (event) {
    const button = event.relatedTarget;
    const providerId = button.getAttribute("data-provider-id");
    const mediaName = button.getAttribute("data-provider-name");
    const providerLogo = button.getAttribute("data-provider-logo");
    const providerOptions = JSON.parse(
      button.getAttribute("data-provider-options") || "{}"
    );
    const clientId = providerOptions.client_id || "";
    const clientSecret = providerOptions.client_secret || "";
    const providerDescription = providerOptions.description || "";
    const providerName = providerOptions.provider_name || "";
    var modal = $(this);

    if (providerId) {
      modal.find(".modal-title").text("Edit Media Provider");
      modal.find("#provider-id").val(providerId);
      modal.find("#media_name").val(mediaName);
      modal.find("#media_type").val(providerName);
      modal.find("#client-id").val(clientId);
      modal.find("#client-secret").val(clientSecret);
      modal.find("#description").val(providerDescription);
      modal.find("form").attr("action", `/providers/media/${providerId}`);
      $('#keywordsModal').attr('data-provider-id', providerId);
    } else {
      modal.find(".modal-title").text("Add Media Provider");
      modal.find("form")[0].reset();
      modal.find("form").attr("action", "/providers/media/");
    }
  });
});
