
const gamediv = $("#game");
const startscreen_html = httpGet("/trends_game/components/start_screen.html");
const gamescreen_html = httpGet("/trends_game/components/game_screen.html");
const comps = new Startscreen_components();

const startscreen_consts = {
    default_teamname: "Click to edit teamname"
};

function start_screen() {
    gamediv.html(startscreen_html);
    let message_div = $("#message_div");
    let teams_div = $("#teams");
    let add_team_btn = $("#add_team");
    let start_game_btn = $("#start_game");
    let team_id_counter = 0;
    let max_teams = 4;

    //todo team colors

    function add_team(){
        if(teams_div.children().length < max_teams){
            teams_div.append(comps.get_add_team_row(team_id_counter));
            team_id_counter++;
        }else{
            message_div.html(comps.get_alert_info("You can only have up to "+max_teams+" teams."))
        }
    }

    add_team_btn.click((event) => {add_team()});
    add_team();

    teams_div.click((event) => {
        let id = event.originalEvent.target.id;
        let team_del = "team_del_";

        if(id.indexOf(team_del) === 0) {
            let id_num = id.replace(team_del, "");
            $("#team_row_" + id_num).remove();
        }
    });


    start_game_btn.click((event) => {
        let teams = [];
        let team_names_labels = $("label.team_name_label").toArray();

        function Team(num, name){
            this.num = num;
            this.name = name
        }

        let _continue = true;
        team_names_labels.forEach((label) => {
            if (_continue){
                let team_num = label.parentElement.parentElement.id.replace("team_row_", "");
                let team_name = label.textContent;
                if (team_name === startscreen_consts.default_teamname ){
                    _continue = false;
                }else{
                    teams.push(new Team(team_num, team_name))
                }
            }
        });
        // right now 2 teams can have the same name since they're identified by their number
        if (_continue){
            game_screen(teams)
        }else{
            message_div.html(comps.get_alert_warning("All teams must set their name before starting the game."));
        }
    });

}

const gamescreen_consts = {

};

function game_screen(teams){
    gamediv.html(gamescreen_html);
    let search_btn = $("#search");
    let search_term = $("#term");
    let search_output = $("#output");

    search_btn.click(() => {

    });

    teams.forEach((team) => {
        gamediv.append(`<span>${team.num} ${team.name}</span>`);
        gamediv.append(comps.get_clearfix());
    });
}

start_screen();