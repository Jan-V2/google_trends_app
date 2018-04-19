
let gamediv = $("#game");
let startscreen_html = httpGet("/trends_game/components/start_screen.html");
let gamescreen_html = httpGet("/trends_game/components/game_screen.html");
let comps = new Comps();


function start_screen() {
    gamediv.html(startscreen_html);
    let message_div = $("#message_div");
    let teams_div = $("#teams");
    let add_btn = $("#add_team");

    let team_id_counter = 0;
    let max_teams = 4;

    add_btn.click((event) => {
        if(teams_div.children().length < max_teams){
            teams_div.append(comps.get_add_team_row(team_id_counter));
            team_id_counter++;
        }else{
            message_div.html(comps.get_alert_info("You can only have up to "+max_teams+" teams."))
        }
    });

    teams_div.click((event) => {
        let id = event.originalEvent.target.id;
        let team_del = "team_del_";


        if(id.indexOf(team_del) === 0) {
            let id_num = id.replace(team_del, "");
            $("#team_row_" + id_num).remove();
        }
    });

}

start_screen();