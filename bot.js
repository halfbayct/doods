/*
Steps to use: 
1) Login to game manually
2) Create a bookmarklet with this url:
   javascript:(() => { var s = document.createElement('script');s.setAttribute('src','https://halfbayct.github.io/pd-bot/bot.js');document.head.appendChild(s); })();

3) Be on the quests page
4) click bookmarklet
5) profit mad star coin
*/

(function bot() {
  // Lock to prevent loop from executing if its taking a long time
  let lock = false;

  // only need to load count once
  let totalDoods = 0;

  const startTime = new Date();
  let tickDate = new Date();
  let expires = new Date(new Date() + 12 * 60 * 60 * 1000);

  const header = document.createElement("div");
  const styles = [
    "position:absolute",
    "top:0",
    "left:0",
    "background:#47b1c0",
    "color:#FFF",
    "padding:0.5em",
    `font-family: "PressStart2P"`,
  ];
  header.style = styles.join(";");
  const timerElement = document.createElement("p");
  const lastTickElement = document.createElement("p");
  

  function addXMLRequestCallback(callback) {
    var oldSend, i;
    if (XMLHttpRequest.callbacks) {
      XMLHttpRequest.callbacks.push(callback);
    } else {
      XMLHttpRequest.callbacks = [callback];
      oldSend = XMLHttpRequest.prototype.send;
      XMLHttpRequest.prototype.send = function () {
        for (i = 0; i < XMLHttpRequest.callbacks.length; i++) {
          XMLHttpRequest.callbacks[i](this);
        }
        oldSend.apply(this, arguments);
      };
    }
  }

  async function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  function parseJwt(token) {
    var base64Url = token.split(".")[1];
    var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    var jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  }

  async function bootstrap() {
    let captured = null;
    addXMLRequestCallback(function (xhr) {
      captured = captured || xhr;
    });

    document.querySelector(".input-button")?.click();
    await sleep(2500);

    totalDoods = parseInt(
      document.querySelector(".balance-amount").textContent
    );

    header.innerHTML = `<p>BONK in SPACE enabled. Running with <b>${totalDoods}</b> characters</p>`;
    header.append(timerElement);
    header.append(lastTickElement);
    document.body.appendChild(header);

    if (totalDoods === NaN || totalDoods === 0) {
      alert("No characters found, please reload");
      return;
    }

    if (!captured) {
      return;
    }

    const token = (captured.getResponseHeader('authorization') || "").split(' ')[1];

    if (!token) {
      return;
    }

    const payload = parseJwt(token);
    console.log(payload);
    expires = new Date(payload.exp * 1000);
    console.log(expires);
  }

  async function sendDoods() {
    try {
      while (true) {
        const autoEquip = document.querySelector(
          "div.item-autoequip-box button"
        );
        autoEquip.click();
        await sleep(250);

        const charselectBtn = document.querySelector(
          ".send-mission-right-char-select img"
        );
        charselectBtn.click();
        await sleep(500);

        const dood = document.querySelector(".item-left.selectable");
        if (!dood) {
          console.log("No more doods found");
          document.querySelector(".MuiBackdrop-root")?.click();
          document.querySelector(".send-mission-title button")?.click();
          break;
        }

        dood.click();
        await sleep(100);

        document.querySelector(".bit-button img").click();
        console.log("Send 1 dood on a mission");
        await sleep(1500);
      }
    } catch (e) {
      console.log(e);
      document.querySelector(".MuiBackdrop-root")?.click();
      document.querySelector(".send-mission-title button")?.click();
    }
  }

  async function completeMissions() {
    let missionCompleteBtn;
    do {
      missionCompleteBtn = document.querySelector(".mission-send button");
      if (!missionCompleteBtn) {
        continue;
      }

      missionCompleteBtn.click();
      await sleep(150);
    } while (missionCompleteBtn);
  }

  async function tick() {
    if (lock) {
      console.log("Another tick is running");
      return;
    }
    lock = true;

    try {
      tickDate = new Date();
      console.log(`======== Tick @ ${tickDate.toISOString()} ========`);

      const availableButton = document.querySelector(
        ".mission-nav-button.available"
      );
      const completedButton = document.querySelector(
        ".mission-nav-button.completed"
      );
      const inProgressButton = document.querySelector(
        ".mission-nav-button.current"
      );

      console.log(`Total doods: ${totalDoods}`);

      availableButton.click();
      await sleep(250);
      inProgressButton.click();
      await sleep(250);

      const totalCompleted = parseInt(
        completedButton.textContent.toLowerCase().replace(/\D/g, "").trim()
      );
      console.log(`Completed: ${totalCompleted}`);

      const totalInProgress = parseInt(
        inProgressButton.textContent.toLowerCase().replace(/\D/g, "").trim()
      );
      console.log(`In Progress: ${totalInProgress}`);

      if (totalCompleted > 0) {
        console.log(`Triggering completed quests`);
        completedButton.click();
        await sleep(250);
        await completeMissions();
      }

      if (totalInProgress < totalDoods) {
        console.log(`Triggering sending doods on quests`);
        availableButton.click();
        await sleep(500);
        document.querySelectorAll(".mission-send button")[5].click();
        await sleep(1000);
        await sendDoods();
      }

      document.querySelector(".mission-nav-button.current")?.click();

      lock = false;
      console.log(`======== END Tick @ ${tickDate.toISOString()} ========`);
    } catch (e) {
      console.log(e);
      lock = false;
    }
  }

  function timespanText(date1, date2) {
    var diff = date1.getTime() - date2.getTime();

    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    diff -= days * (1000 * 60 * 60 * 24);

    var hours = Math.floor(diff / (1000 * 60 * 60));
    diff -= hours * (1000 * 60 * 60);

    var mins = Math.floor(diff / (1000 * 60));
    diff -= mins * (1000 * 60);

    var seconds = Math.floor(diff / 1000);
    diff -= seconds * 1000;
    let result = "";
    result += days > 0 ? `${days} days ` : "";
    result += hours > 0 ? `${hours} hours ` : "";
    result += mins > 0 ? `${mins} mins ` : "";
    result += seconds > 0 ? `${seconds} sec ` : "";
    return result;
  }

  function updateRuntime() {
    const now = new Date();
    const runtime = now.getTime() > expires.getTime() ? 'EXPIRED' : timespanText(expires, now);

    let html = `Token Expires: ${runtime}`;
    timerElement.innerHTML = html;

    const tickText = timespanText(now, tickDate);
    let tickHtml = `Last Tick: ${tickText}`;
    lastTickElement.innerHTML = tickHtml;
  }

  setInterval(updateRuntime, 1000);
  // set up ticks
  bootstrap()
    .then(() => tick())
    .then(async () => {
      await sleep(15 * 1000);
      setInterval(tick, 60 * 1000);
    });
})();
