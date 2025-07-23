document.addEventListener("DOMContentLoaded", function () {
  // Password toggle functionality
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

      fetch(`/contentoire/providers/keywords/rss/${currentProviderId}`)
        .then((response) => response.json())
        .then((data) => {
          const keywordsList = document.getElementById("keywordsList");
          keywordsList.innerHTML = data.keywords
            .map(
              (keyword) => `
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" value="${
                          keyword.id
                        }" id="keyword-${keyword.id}" ${
                keyword.selected ? "checked" : ""
              }>
                        <label class="form-check-label" for="keyword-${
                          keyword.id
                        }">
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

      fetch(`/contentoire/providers/keywords/rss/${currentProviderId}`, {
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
    const providerName = button.getAttribute("data-provider-name");
    const providerLogo = button.getAttribute("data-provider-logo");
    const providerOptions = JSON.parse(
      button.getAttribute("data-provider-options") || "{}"
    );
    const providerEndpoint = providerOptions.endpoint || "";
    const providerAccessToken = providerOptions.access_token || "";
    const providerDescription = providerOptions.description || "";
    var modal = $(this);

    if (providerId) {
      modal.find(".modal-title").text("Edit News Provider");
      modal.find("#provider-id").val(providerId);
      modal.find("#provider-name").val(providerName);
      modal.find("#provider-logo").val(providerLogo);
      modal.find("#provider-endpoint").val(providerEndpoint);
      modal.find("#provider-access-token").val(providerAccessToken);
      modal.find("#description").val(providerDescription);
      modal
        .find("form")
        .attr("action", `/contentoire/providers/rss/${providerId}`);
      $("#keywordsModal").attr("data-provider-id", providerId);
    } else {
      modal.find(".modal-title").text("Add News Provider");
      modal.find("form")[0].reset();
      modal.find("form").attr("action", "/contentoire/providers/rss/");
    }
  });
});
