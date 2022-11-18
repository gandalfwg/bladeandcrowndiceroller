
export class BaCDiceRollerForm extends FormApplication {
    static title = "BaC Dice Roller"
    static initialize() {
        console.log('Initialized BaCDiceRollerForm');
    }

    static get defaultOptions() {
        const defaults = super.defaultOptions;
        const overrides = {
            height: 'auto',
            width: 'auto',
            id: 'bac-dice-roller-form',
            template: 'modules/BladeAndCrown-DiceRoller/templates/form.hbs',
            title: this.title,
            userId: game.userId,
            closeOnSubmit: false,
            submitOnChange: false,
            resizable: true
        };
        const mergedOptions = foundry.utils.mergeObject(defaults, overrides);
        return mergedOptions;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find('button[name="bac-dice-roller-form_btn-roll"]').click(this._onRoll.bind(this));

        //Hooks.once("closeBaCDiceRollerForm", (app, html, data) => {
        //    this._onCloseAppliction(html);
        //});
    }

    async _onRoll(event) {
        event.preventDefault();
        const button = event.currentTarget;
        const form = button.form;
        const doc = button.ownerDocument;

        let dice = form.getElementsByClassName('BaCDiceNumberInput')[0].value;
        let modifier = form.getElementsByClassName('BaCDiceModifierInput')[0].value;
        if(dice > 0) {
            let diceResults = await new Roll(dice + "d10").roll({async: true});
            if (game.dice3d) {
                await game.dice3d.showForRoll(diceResults, game.user, true)
            }
            let arrResults = [0,0];

            for(let i=0; i< diceResults.terms[0].results.length; i++) {
                var dieResult = diceResults.terms[0].results[i].result;
                if(dieResult > arrResults[0]) {
                    arrResults[0] = dieResult;
                    arrResults[1] = 0;
                } else if(dieResult == arrResults[0]) {
                    arrResults[1]++;
                }
            }
            let finalResult = parseInt(arrResults[0]) + parseInt(arrResults[1]);
            if(modifier != 0) {
                finalResult += parseInt(modifier);
            }
            let varianceResult = await new Roll("1d12").roll({async: true});
            //if (game.dice3d) {
            //    await game.dice3d.showForRoll(varianceResult, game.user, true)
            //}

            let rollData = {
                dice: dice,
                modifier: modifier,
                total: finalResult,
                variance: varianceResult._total,
                formula: diceResults.formula + ((modifier != 0) ? " + " + modifier : ''),
                rolls: diceResults.terms[0].results,
                isFail: (finalResult < 8),
                isStalemate: (finalResult == 8),
                isSuccess: (finalResult > 8)
            };

            renderTemplate("modules/BladeAndCrown-DiceRoller/templates/chatmsg.hbs", rollData).then(html => {
                let messageData = {
                    content: html,
                    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                    blind: false
                };
                ChatMessage.create(messageData);
            });

            //let messageData = {
            //    content: "Total: " + finalResult + "<br/>Variance Die: " + varianceResult._total,
            //    type: CONST.CHAT_MESSAGE_TYPES.ROLL,
            //    blind: false
            //}
            //ChatMessage.create(messageData);
        }
    }
}