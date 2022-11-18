import {BaCDiceRollerForm} from "./bac-dice-roller-form.js";

Hooks.on("renderSidebarTab", async (app, html) => {
    if (app.options.id == "chat") {
      let icon = html.find('.chat-control-icon');
      icon.click(ev => {
          //console.log('clicked it');
          let options = {};
          new BaCDiceRollerForm(options).render(true, {focus: true});
      });
    }
  });