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
  const totalDoods = parseInt(
    document.querySelector(".balance-amount").textContent
  );

  if (totalDoods === NaN || totalDoods === 0) {
    alert("No characters found, please reload");
    return;
  }

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
  header.innerHTML = `BONK in SPACE enabled. Running with <b>${totalDoods}</b> characters`;
  document.body.appendChild(header);

  async function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
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
      const tickDate = new Date().toISOString();
      console.log(`======== Tick @ ${tickDate} ========`);

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
      console.log(`======== END Tick @ ${tickDate} ========`);
    } catch (e) {
      console.log(e);
      lock = false;
    }
  }
  // set up ticks
  tick().then(async () => {
    await sleep(15 * 1000);
    setInterval(tick, 60 * 1000);
  });
})();
