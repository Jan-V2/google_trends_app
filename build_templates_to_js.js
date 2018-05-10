let fs = require("fs");
let vueable = require("./trends_game/libs/vueable.js");
let parser = new vueable.Vueable();
let templates = {
    start_screen: parser.parse(fs.readFileSync("./trends_game/components/start_screen.vueable", "utf8")),
    game_screen: parser.parse(fs.readFileSync("./trends_game/components/game_screen.vueable", "utf8")),
    end_screen:  parser.parse(fs.readFileSync("./trends_game/components/end_screen.vueable", "utf8"))
};

let text = "vue_templates = " + JSON.stringify(templates);

fs.writeFileSync("./trends_game/components/templates_as_js.js", text);
