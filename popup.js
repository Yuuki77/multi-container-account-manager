document.addEventListener("DOMContentLoaded", function () {
  // Delete existing containers
  document.getElementById("delete").addEventListener("click", function () {
    browser.contextualIdentities.query({}).then((identities) => {
      if (identities.length === 0) {
        console.log("No containers found.");
        alert("No containers found.");
        return;
      }
      identities.forEach(async (identity) => {
        await browser.contextualIdentities.remove(identity.cookieStoreId);
      });
      alert("All containers have been deleted.");
    });
  });

  // Extract existing container information
  document.getElementById("extract").addEventListener("click", function () {
    browser.contextualIdentities.query({}).then((identities) => {
      const csvContent = ["name,url,email,password,color,icon"];

      identities.forEach((identity) => {
        const { name, color, icon } = identity;
        csvContent.push([name, "null", "null", "null", color, icon].join(","));
      });

      const csvString = csvContent.join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "existing_containers.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  });

  // Process CSV from textarea
  document
    .getElementById("processCSV")
    .addEventListener("click", async function () {
      const csvContent = document.getElementById("csvInput").value;
      const lines = csvContent.split("\n").slice(1);

      const authUsername = document.getElementById("username").value;
      const authPassword = document.getElementById("password").value;

      for (const line of lines) {
        const [name, url, email, password, color, icon] = line.split(",");
        if (name) {
          try {
            const identity = await browser.contextualIdentities.create({
              name,
              color: color || "blue",
              icon: icon || "fingerprint",
            });

            // Open the URL in the newly created container tab
            if (url) {
              const tab = await browser.tabs.create({
                url,
                cookieStoreId: identity.cookieStoreId,
              });

              if (authUsername && authPassword) {
                await browser.storage.local.set({
                  [identity.cookieStoreId]: { authUsername, authPassword },
                });
              }

              // Inject the content script to fill email and password
              if (email && password) {
                const code = `
                const inputs = document.querySelectorAll('input');
                inputs.forEach((input) => {
                  if (input.getAttribute('autocomplete') === 'username' || input.id.includes('email') || input.name === 'login' || input.id === 'login_field') {
                    input.value = "${email}";
                  }
                  if (input.getAttribute('autocomplete') === 'current-password' || input.name === 'pass' || input.name === 'password' || input.id === 'password') {
                    input.value = "${password}";
                  }
                });
              `;
                await browser.tabs.executeScript(tab.id, { code });
              }
            }
          } catch (e) {
            alert(e);
          }
        }
      }
    });
});
