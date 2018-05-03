vue_templates = {
    start_screen:`
<div>
    % v-if="active" =>
    <div style="width: 700px; margin: auto; padding-top: 32px;">
        <!--this minwidth means this won't work on mobile phones-->
        <div id="message_div"  style="width: 100%;" ></div>
        <div class="row">
            <div class="col-md-3" >
                % @click="add_team()" =>
                <button type="button" class="btn btn-info btn-lg"  style="height: 50px;margin-left: 30px;">Add team</button>
            </div>
            <div class="col-md-7" style="padding-right: 0;" >
                % v-for="team in teams" v-bind:id="'team_row_' + team.num " =>
                <div class="row"  style="height: 25px;margin-bottom: 6px;">
                    <div class="col-10" style="padding-right: 0;">
                        % contenteditable="true" @input="update_teamname" v-bind:id="t_input_id + team.num"=>
                        <div style="
                           background-color: slateblue;
                           border-radius:5px;padding-left: 5px;
                           padding-right: 5px;
                           width: 100%;
                           text-align: center;" >{{team.name}}</div>

                    </div>
                    <div class="col-2" style="padding-right: 30px; padding-left: 0px;">
                        % @click="delete_team(team.num)" =>
                        <button type="button" class="btn btn-danger btn-block"
                        style="
                        text-align: center;
                        padding: 0rem  12px;"
                        >X</button>
                    </div>
                </div>
            </div>
            <div class="col-md-2" >
                % @click="start_game()" =>
                <button type="button" class="btn btn-success" style="height: 50px;">Start game</button>
            </div>
        </div>
    </div>
</div>

    `,
    game_screen:`
    <div>
    % v-if="active" =>
    <div style="text-align: center; margin: auto">
        <h1>gamescreen</h1>
        <div id="message_div"  style="width: 100%;" ></div>
        <div class="row no-gutters" style="max-width: 700px; margin: auto">
            <table  style="margin: auto;">
                <thead>
                % v-for="team in teams" v-bind:width="min_col_width" =>
                <th style="text-align: center" >{{team.name}}</th>
                <th>links</th>
                </thead>
                <tbody>
                % v-for="row in queries" =>
                <tr>
                    % v-for="query in row" v-bind:width="min_col_width" =>
                    <td>
                  <span>
                      % v-bind:width="points_span_width" v-bind:font="points_span_font" =>
                      <span>{{query.points_txt}}</span>
                      <span>{{query.term}}</span>
                  </span>
                    </td>
                    <td>
                        % v-bind:href="get_url(row)" @click="open_link_in_tab" =>
                        <button class="btn btn-success" id="form_btn" style="width: 100%;">Link</button>
                    </td>
                </tr>
                <tr>
                    % v-for="total in points_total" v-bind:width="min_col_width" =>
                    <td>
                        Total: {{total}}
                    </td>
                    <td></td>
                </tr>
                </tbody>
            </table>
        </div>

        <div class="clearfix" style="padding-top: 24px;"></div>
        % @submit.prevent="submit_query" =>
        <form style="max-width: 800px;margin: auto" >
            <div class="row">
                % v-for="team in teams" v-bind:class="input_field_row_class"  =>
                <span>
                    <span>{{team.name}}</span>
                    <div class="clearfix" style="padding-top: 4px;"></div>
                    % v-model="query_form[team.num]" =>
                    <input type="text"/>
                </span>
            </div>
            <div class="clearfix"></div>
            <button type="submit">submit</button>
        </form>
    </div>
</div>


    `
};