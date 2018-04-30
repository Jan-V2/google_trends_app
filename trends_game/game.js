
const gamediv = $("#game");

let startscreen_html;
let startscreen_templ;
let gamescreen_html;
r_async.parallel([
    () => {startscreen_html = httpGet("/trends_game/components/start_screen.html")},
    () => {startscreen_templ = httpGet("/trends_game/components/start_screen.vueable")},
    () => {gamescreen_html = httpGet("/trends_game/components/game_screen.html")}
]);
let parser = new Vueable();

const startscreen_consts = {
    default_teamname: "Click to edit teamname"
};

// console.log(startscreen_templ);
let parsed = parser.parse(startscreen_templ);
// console.log(parsed);

Vue.component('start_screen', {
    template: parsed,
    data: function () {
        return {
            teams: [],
            default_teamname: startscreen_consts.default_teamname,
            t_input_id: "t_input_",
            max_teams: 4,
            team_id_counter: 0,
            active: true,
            alert_templ: new Global_Comps()

        }
    },
    mounted: function(){
        this.add_team();
    },
    methods: {
        add_team: function (){
            if (this.teams.length >= this.max_teams){
                this.show_msg(this.alert_templ.get_alert_info("You can only have up to "+this.max_teams+" teams."))
            }else{
                this.teams.push(this.team_id_counter);
                this.team_id_counter++;
            }
        },
        start_game: function() {
            //todo refactor this
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
                game_screen(teams);
                this.active = false;
            }else{
                this.show_msg(this.alert_templ.get_alert_warning("All teams must set their name before starting the game."));
            }
        },
        update_teamname: _.debounce(function(event){
            let id;
            try{
                id = + event.target.id.replace(this.t_input_id, "")
            }catch{
                this.show_msg(this.template.global.get_alert_danger("could not update team name. id parse failed."));
                return;
            }
            let get_team_num = (team) => {return team.num};
            let did_update = false;
            this.teams.forEach((t) => {
                if (!did_update && get_team_num(t) === +id){
                    t.name = event.target.textContent;
                    did_update = true;
                }
            });
            if (!did_update){
                this.show_msg(this.alert_templ.get_alert_danger("could not update team name. could not find team with id "+id+"."));
            }
        }, 200),
        delete_team: function(team_num){
            let _t = this.teams;
            let team_idx = _t.indexOf(+ team_num);
            if (team_idx > -1){
                _t.splice(_t.splice(team_idx, 1))
            }else{
                this.show_msg(this.alert_templ.get_alert_warning("Can't delete team, doesn't seem to exist."))
            }
        },
        show_msg: function(msg_html) {
            $("#message_div").html(msg_html)
        },
        get_new_team: function(team_num) {
            return {
                num: team_num,
                name: this.default_teamname
            }
        }
    }
});

// bootstrap the demo
let demo = new Vue({
    el: '#demo'
});

const gamescreen_consts = {

};

function game_screen(teams){
    gamediv.html(gamescreen_html);
    let global_comps
    let comps = new Global_Comps();
    let message_div = $("#message_div");
    //let search_btn = $("#search");
    let search_term = $("#term");
    let search_output = $("#output");

    /*    search_btn.click(() => {
            console.log("test");
            query_trends();
        });*/
    $("#query_form_div").append(comps.game.query_form(teams.length));


    teams.forEach((team) => {
        gamediv.append(`<span>${team.num} ${team.name}</span>`);
        gamediv.append(comps.get_clearfix());
    });

    $("#queries_form").submit(function( event ) {
        console.log("query form");
        event.preventDefault();
    });


    async function query_trends() {
        let terms = [$("#term1").val(), $("#term2").val()];
        console.log(terms.toString());
        if (terms.indexOf("") !== -1){
            message_div.html(comps.get_alert_warning("The search term can't be blank"))
        }else{
            let server_url = "http://18.197.12.243:5000/";
            server_url += "?";
            let q_str = "q=";
            server_url += q_str + terms[0];
            if (terms.length > 1){
                for(let i in _.range(1, terms.length)){
                    console.log(+i+1);
                    server_url += "&" + q_str + terms[+i+1]
                }
            }
            console.log(server_url);
            let result = JSON.parse(httpGet(server_url));// see jquery cors bug in notes
            result.forEach((e) => {
                gamediv.append(`<span>${e.toString()}</span>`);
                gamediv.append(comps.get_clearfix());
            })
        }
    }
}

