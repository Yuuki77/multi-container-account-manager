function renderAuth() {
  browser.storage.local.get(["username", "password"]).then((result) => {
    if (result.username && result.password) {
      document.getElementById("username").value = result.username;
      document.getElementById("password").value = result.password;
    }
  });
}
async function removeAllContainers() {
  browser.contextualIdentities.query({}).then(async (identities) => {
    if (identities.length === 0) {
      console.log("No containers found.");
      alert("No containers found.");
      return;
    }
    identities.forEach(async (identity) => {
      await browser.contextualIdentities.remove(identity.cookieStoreId);
    });

    await renderContainers();
    alert("All containers have been deleted.");
  });
}

async function getContainers() {
  const containers = await browser.contextualIdentities.query({});
  return containers;
}

async function renderContainers() {
  const containers = await getContainers();
  const containerList = document.getElementById("containerList");
  containerList.innerHTML = "";

  containers.forEach((container) => {
    const containerDiv = document.createElement("div");
    const containerName = document.createTextNode(container.name);
    containerDiv.appendChild(containerName);
    containerList.appendChild(containerDiv);
  });
}

async function addDeleteHandler() {
  // Delete existing containers
  document
    .getElementById("delete")
    .addEventListener("click", async function () {
      await removeAllContainers();
    });
}

let currentColorIndex = 0;

function getNextColor() {
    const colors = ["blue", "green", "yellow", "orange", "red", "pink", "purple"];
    const color = colors[currentColorIndex];
    currentColorIndex = (currentColorIndex + 1) % colors.length;
    return color;
}

let currentIconIndex = 0;

function getNextIcon() {
    const icons = ["fingerprint", "briefcase", "dollar", "cart", "vacation", "gift", "food", "fruit", "pet", "tree", "chill", "circle", "fence"];
    const icon = icons[currentIconIndex];
    currentIconIndex = (currentIconIndex + 1) % icons.length;
    return icon;
}

document.addEventListener("DOMContentLoaded", async function () {
  await renderContainers();
  renderAuth();
  await addDeleteHandler();

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

  document
    .getElementById("username")
    .addEventListener("input", async function () {
      const username = document.getElementById("username").value;
      await browser.storage.local.set({
        username,
      });
    });

  document
    .getElementById("password")
    .addEventListener("input", async function () {
      const password = document.getElementById("password").value;
      await browser.storage.local.set({
        password,
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
              color: color || getNextColor(),
              icon: icon || getNextIcon()
            });

            // Open the URL in the newly created container tab
            if (url) {
              if (authUsername && authPassword) {
                await browser.storage.local.set({
                  [identity.cookieStoreId]: { authUsername, authPassword },
                });
              }
              const tab = await browser.tabs.create({
                url,
                cookieStoreId: identity.cookieStoreId,
              });

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
            await renderContainers();
          } catch (e) {
            alert(e);
          }
        }
      }
    });
});
