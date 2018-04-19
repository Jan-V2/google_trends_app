
function Comps() {
    this.get_alert_danger = function (msg) {
        return this.get_alert(msg, "alert-danger")
    };

    this.get_alert_warning = function (msg) {
        return this.get_alert(msg, "alert-warning")
    };

    this.get_alert_info = function (msg) {
        return this.get_alert(msg, "alert-info")
    };

    this.get_alert = function (msg, alert_class) {
        return `<div class="alert ${alert_class} alert-dismissible fade show" role="alert">${msg} 
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">    
                          <span aria-hidden="true">&times;</span>  
                        </button>
                      </div>`
    };

    this.get_add_team_row = function(team_num){
        return `<div class="row" id="team_row_${team_num}" style="height: 25px;margin-bottom: 6px;">
                <div class="col-10" style="padding-right: 0;">
                    <label class="pull-left" style="
                           margin-top: 2px;
                           background-color: slateblue;
                           border-radius:5px;padding-left: 5px;
                           padding-right: 5px;
                           width: 100%;
                           text-align: center;">
                        Team ${+team_num + 1}</label>
                    <input class="clickedit" id="team_name_${team_num}" type="text" />
                </div>
                <div class="col-2" style="padding-right: 30px; padding-left: 0px;">
                    <button type="button" class="btn btn-danger btn-block" id="team_del_${team_num}"
                            style="
                            text-align: center;
                            padding: 0rem  12px;"
                    >X</button>
                </div>
                <script>hide_inputs()</script>            
                </div>`
    };


    this.get_clearfix = function () {
        return `<div class="clearfix"></div>`
    };
}



