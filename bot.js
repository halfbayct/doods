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

  const authentication = {
    username: "",
    password: "",
  };

  const startTime = new Date();
  let totalRefreshes = 0;
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

  const elements = {
    login: {
      username: () => document.querySelector('.login-container input[type="text"]'),
      password: () => document.querySelector('.login-container input[type="password"]'),
      button: () => document.querySelector(".login-container .input-button"),
    },
    nav: {
      available: () => document.querySelector(".available"),
      inProgress: () => document.querySelector(".current"),
      completed: () => document.querySelector(".completed"),
    },
    doodCount: () => document.querySelector(".balance-amount"),
    toastBody: () => document.querySelector(".Toastify__toast-body"),
    sendAllButton: () => document.querySelector(".send-mission-button"),
    sendMissionGoBack: () => document.querySelector(".send-mission-go-back"),
    missionCompletedButton: () => document.querySelector(".mission-send button"),
    homeButton: () => document.querySelector(".launch-game button"),
    questButton: () => document.querySelectorAll(".mission-send button")[3],
  };

  let captured = null;
  addXMLRequestCallback(function (xhr) {
    captured = captured || xhr;
  });

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

  async function waitForToast(msg) {
    let shouldStop = false;
    let watchDog = setTimeout(() => (shouldStop = true), 30000);
    let toastText = undefined;
    do {
      toastText = elements.toastBody()?.textContent;
      if (toastText) {
        console.log("toastText:", toastText);
      }
      if (
        (toastText && !msg) ||
        (toastText && toastText.toLowerCase() === msg.toLowerCase())
      ) {
        clearTimeout(watchDog);
        shouldStop = true;
        elements.toastBody()?.click();
      }

      await sleep(250);
    } while (shouldStop === false);

    elements.toastBody()?.click();
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
    authentication.username = elements.login.username().value;
    authentication.password = elements.login.password().value;

    console.log(`Credentials captured for ${authentication.username}`);

    elements.login.button()?.click();
    await waitForToast("Successfully logged in");

    totalDoods = parseInt(elements.doodCount().textContent);

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

    const token = (captured.getResponseHeader("authorization") || "").split(
      " "
    )[1];

    if (!token) {
      return;
    }

    const payload = parseJwt(token);
    expires = new Date(payload.exp * 1000);
  }

  async function sendDoods() {
    try {
      elements.sendAllButton().click();
      await waitForToast("All sent successfully!");
      elements.sendMissionGoBack().click();
      await sleep(250);
    } catch (e) {
      console.log(e);
      elements.sendMissionGoBack()?.click();
    }
  }

  async function completeMissions() {
    let missionCompleteBtn;
    do {
      missionCompleteBtn = elements.missionCompletedButton();
      if (!missionCompleteBtn) {
        continue;
      }

      missionCompleteBtn.click();
      await sleep(250);
    } while (missionCompleteBtn);

    await waitForToast();
  }

  function setValue(input, value) {
    var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value").set;
    nativeInputValueSetter.call(input, value);
    var event = new Event('input', { bubbles: true});
    input.dispatchEvent(event);
  }

  async function loginAgain() {
    if (!authentication.username || !authentication.password) {
      console.log("Unable to relog");
      return;
    }
    console.log("Relog cause tokens are short... rip");
    // const internalRoot = Array.from(document.querySelectorAll("*[id]")).find((el) => el?._reactRootContainer?._internalRoot?.current)?._reactRootContainer?._internalRoot?.current;
    // internalRoot.memoizedState.element.props.children.props.store.getState().store.loggedIn;


    // go home
    elements.homeButton().click();
    await sleep(1000);

    // because the redux store does not set the login boolean correct, we need to own redux rq
    const store = getReduxStore();
    const prevGetState = store.getState; 
    store.getState = function() { const state = JSON.parse(JSON.stringify(prevGetState())); state.store.loggedIn = false; console.log(state);  return state; }

    // launch game
    elements.homeButton().click();
    await sleep(1000);
    // recapture token
    // input creds and login
    captured = null;
    setValue(elements.login.username(), authentication.username);
    setValue(elements.login.password(), authentication.password);
    await sleep(150);

    // put redux back nicely, dont mind me...
    store.getState = prevGetState;
    elements.login.button().click();
    await waitForToast("Successfully logged in");

    if (!captured) {
      console.log("relog not captured");
      return;
    }

    const token = (captured.getResponseHeader("authorization") || "").split(
      " "
    )[1];

    console.log("token:", token);

    if (!token) {
      return;
    }

    const payload = parseJwt(token);
    expires = new Date(payload.exp * 1000);
    console.log("expires:", expires);
    await sleep(2000);
  }

  async function tick() {
    if (lock) {
      console.log("Another tick is running");
      return;
    }

    lock = true;

    try {
      // need to re-login
      if (new Date().getTime() > expires.getTime()) {
        await loginAgain();
      }
      tickDate = new Date();
      console.log(`======== Tick @ ${tickDate.toISOString()} ========`);

      console.log(`Total doods: ${totalDoods}`);

      elements.nav.available().click();
      await sleep(250);
      elements.nav.inProgress().click();
      await sleep(250);

      const totalCompleted = parseInt(
        elements.nav
          .completed()
          .textContent.toLowerCase()
          .replace(/\D/g, "")
          .trim()
      );
      console.log(`Completed: ${totalCompleted}`);

      const totalInProgress = parseInt(
        elements.nav
          .inProgress()
          .textContent.toLowerCase()
          .replace(/\D/g, "")
          .trim()
      );
      console.log(`In Progress: ${totalInProgress}`);

      if (totalCompleted > 0) {
        console.log(`Triggering completed quests`);
        elements.nav.completed().click();
        await sleep(250);
        await completeMissions();
      }

      if (totalInProgress < totalDoods) {
        console.log(`Triggering sending doods on quests`);
        elements.nav.available().click();
        await sleep(500);
        elements.questButton().click();
        await sleep(2000);
        await sendDoods();
      }

      elements.nav.inProgress()?.click();

      lock = false;
      console.log(`======== END Tick @ ${tickDate.toISOString()} ========`);
    } catch (e) {
      console.log(e);
      lock = false;
    }
  }

  function getReduxStore() {
    const internalRoot = Array.from(document.querySelectorAll("*[id]")).find((el) => el?._reactRootContainer?._internalRoot?.current)?._reactRootContainer?._internalRoot?.current;
    const store = internalRoot.memoizedState.element.props.children.props.store;
    return store;
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
    const runtime =
      now.getTime() > expires.getTime()
        ? "EXPIRED"
        : timespanText(expires, now);

    let html = `Token Expires: ${runtime}`;
    timerElement.innerHTML = html;

    const tickText = timespanText(now, tickDate);
    let tickHtml = `Last Tick: ${tickText}`;
    lastTickElement.innerHTML = tickHtml;
  }

  setInterval(updateRuntime, 1000);
  // set up ticks
  bootstrap()
    .then(() => sleep(2000))
    .then(() => tick())
    .then(async () => {
      setInterval(tick, 60 * 1000);
    });
})();
