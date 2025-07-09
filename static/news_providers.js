document
  .getElementById("togglePassword")
  .addEventListener("click", function () {
    const passwordInput = document.getElementById("provider-access-token");
    const icon = this.querySelector("i");
    if (passwordInput.type === "password") {
      passwordInput.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      passwordInput.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  });

$("#providerModal").on("show.bs.modal", function (event) {
  var providerId = $(event.relatedTarget).data("provider-id");
  var providerName = $(event.relatedTarget).data("provider-name");
  var providerLogo = $(event.relatedTarget).data("provider-logo");
  var providerEndpoint = $(event.relatedTarget).data("provider-endpoint");
  var providerAccessToken = $(event.relatedTarget).data(
    "provider-access-token"
  );
  var providerDescription = $(event.relatedTarget).data("provider-description");

  var modal = $(this);
  if (providerId) {
    modal.find(".modal-title").text("Edit Provider");
    modal.find("#provider-name").val(providerName);
    modal.find("#provider-logo").val(providerLogo);
    modal.find("#provider-endpoint").val(providerEndpoint);
    modal.find("#provider-access-token").val(providerAccessToken);
    modal.find("#provider-description").val(providerDescription);
    modal
      .find("form")
      .attr("action", "/contentoire/providers/news/" + providerId);
  } else {
    modal.find(".modal-title").text("Add Provider");
    modal.find("form")[0].reset();
    modal.find("form").attr("action", "/contentoire/providers/news/");
  }
});
