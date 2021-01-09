var CHARACTERS_PER_ROW = 5;
var user_list = new Array();
var jobs_list = new Array();
var orderby = new Array("owner", "asc");
var User = /** @class */ (function () {
    function User(uid) {
        this.userid = uid;
        this.jobs = new Array();
        this.selected = true;
        this.username = uid + "";
        this.access_token = "";
        this.getUserData();
    }
    User.prototype.getUserData = function () {
        var _this = this;
        var ESIdata = new XMLHttpRequest();
        ESIdata.onreadystatechange = function () {
            if (ESIdata.readyState == XMLHttpRequest.DONE) {
                var name = JSON.parse(ESIdata.responseText);
                _this.username = name["name"];
                _this.expire_date = new Date(name["expire_date"]);
                _this.span_character_name = document.createElement("span");
                _this.span_character_name.innerHTML = _this.username;
                _this.getAccessToken();
            }
        };
        ESIdata.open("GET", "https://" + location.hostname + "/PublicESI/QueueManager/getuserdata.php?id=" + this.userid, true);
        ESIdata.send();
    };
    User.prototype.getAccessToken = function () {
        var _this = this;
        var ESIdata = new XMLHttpRequest();
        ESIdata.onreadystatechange = function () {
            if (ESIdata.readyState == XMLHttpRequest.DONE) {
                var token = JSON.parse(ESIdata.responseText);
                _this.access_token = token["access_token"];
                show_character();
                var nowdate = new Date();
                if (_this.expire_date > nowdate) {
                    _this.Load_jobs();
                }
            }
        };
        ESIdata.open("GET", "https://" + location.hostname + "/PublicESI/QueueManager/getaccesstoken.php?id=" + this.userid, true);
        ESIdata.send();
    };
    User.prototype.Load_jobs = function () {
        var _this = this;
        var ESIdata = new XMLHttpRequest();
        ESIdata.onreadystatechange = function () {
            if (ESIdata.readyState == XMLHttpRequest.DONE) {
                //alert(this.responseText);
                var jobs = JSON.parse(ESIdata.responseText);
                for (var i = 0; i < jobs.length; i++) {
                    _this.add_jobs(jobs[i]["job_id"], jobs[i]["activity_id"], jobs[i]["blueprint_type_id"], jobs[i]["product_type_id"], jobs[i]["runs"], jobs[i]["station_id"], new Date(jobs[i]["start_date"]), new Date(jobs[i]["end_date"]));
                }
                if (_this.jobs.length == 0) {
                    _this.selected = false;
                    _this.div_character_slot.className = "user_disabled";
                    _this.img_checkbox.className = "user_disabled";
                    _this.img_checkbox.src = "./images/checkbox_disabled.png";
                    _this.span_character_name.className = "user_disabled";
                }
                else {
                    create_job_list();
                }
            }
        };
        ESIdata.open("GET", "https://esi.evetech.net/latest/characters/" + this.userid + "/industry/jobs/?datasource=tranquility", true);
        ESIdata.setRequestHeader("Content-Type", "application/json");
        ESIdata.setRequestHeader("Authorization", "Bearer " + this.access_token);
        ESIdata.send();
    };
    User.prototype.add_jobs = function (_jobid, _activity_id, _blueprint_typeid, _typeid, _runs, _location, _starttime, _endtime) {
        var jndex = 0;
        for (jndex = 0; jndex < this.jobs.length; jndex++) {
            if (this.jobs[jndex].jobid == _jobid) {
                return this.jobs[jndex];
            }
        }
        this.jobs[jndex] = new Job(_jobid, _activity_id, this, _blueprint_typeid, _typeid, _runs, _location, _starttime, _endtime);
        return this.jobs[jndex];
    };
    User.prototype.Character_slot = function () {
        var _this = this;
        this.div_character_slot = document.createElement("div");
        this.div_character_slot.onclick = function () {
            _this.Toggle_select();
            display_job_list();
        };
        this.img_checkbox = document.createElement("img");
        this.span_character_name = document.createElement("span");
        this.span_character_name.innerHTML = this.username;
        this.span_expire_date = document.createElement("span");
        this.span_expire_date.innerHTML = this.expire_time();
        this.span_expire_date.className = "expire_date";
        this.div_character_slot.appendChild(this.img_checkbox);
        this.div_character_slot.appendChild(this.span_character_name);
        this.div_character_slot.appendChild(document.createElement("br"));
        this.div_character_slot.appendChild(this.span_expire_date);
        if (this.selected) {
            this.div_character_slot.className = "user_checked";
            this.img_checkbox.className = "user_checked";
            this.img_checkbox.src = "./images/checkbox_checked.png";
            this.span_character_name.className = "user_checked";
        }
        else if (this.jobs.length > 0) {
            this.div_character_slot.className = "user_unchecked";
            this.img_checkbox.className = "user_unchecked";
            this.img_checkbox.src = "./images/checkbox_unchecked.png";
            this.span_character_name.className = "user_unchecked";
        }
        else if (this.jobs.length == 0) {
            this.selected = false;
            this.div_character_slot.className = "user_disabled";
            this.img_checkbox.className = "user_disabled";
            this.img_checkbox.src = "./images/checkbox_disabled.png";
            this.span_character_name.className = "user_disabled";
        }
        return this.div_character_slot;
    };
    User.prototype.Toggle_select = function () {
        if (this.jobs.length > 0) {
            if (this.selected) {
                this.selected = false;
                this.div_character_slot.className = "user_unchecked";
                this.img_checkbox.className = "user_unchecked";
                this.img_checkbox.src = "./images/checkbox_unchecked.png";
                this.span_character_name.className = "user_unchecked";
            }
            else {
                this.selected = true;
                this.div_character_slot.className = "user_checked";
                this.img_checkbox.className = "user_checked";
                this.img_checkbox.src = "./images/checkbox_checked.png";
                this.span_character_name.className = "user_checked";
            }
        }
    };
    User.prototype.expire_time = function () {
        var nowdate = new Date();
        var left = Math.ceil((this.expire_date.getTime() - nowdate.getTime()) / 1000);
        if (left < 0) {
            this.span_expire_date.style.color = "red";
            return "expired";
        }
        else if (left < 60) {
            this.span_expire_date.style.color = "red";
            return left + " s";
        }
        else if (left < 3600) {
            this.span_expire_date.style.color = "red";
            return Math.ceil(left / 60) + " m";
        }
        else if (left < 86400) {
            this.span_expire_date.style.color = "orange";
            return Math.ceil(left / 3600) + " h";
        }
        else {
            this.span_expire_date.style.color = "black";
            return Math.ceil(left / 86400) + " days";
        }
    };
    return User;
}());
var Job = /** @class */ (function () {
    function Job(jid, aid, user, bptid, tid, runnum, loca, startdate, enddate) {
        this.jobid = jid;
        this.activity = aid;
        this.owner = user;
        this.bptypeid = bptid;
        this.typeid = tid;
        this.runs = runnum;
        this.location = loca;
        this.starttime = startdate;
        this.endtime = enddate;
        this.span_bptname = document.createElement("span");
        this.span_tname = document.createElement("span");
        this.span_lname = document.createElement("span");
        this.complete = true;
        this.getNames();
    }
    Job.prototype.getNames = function () {
        var _this = this;
        var ESIdata = new XMLHttpRequest();
        ESIdata.onreadystatechange = function () {
            if (ESIdata.readyState == XMLHttpRequest.DONE) {
                //alert(this.responseText);
                var name = JSON.parse(ESIdata.responseText);
                //console.log(this.location+ " : " +ESIdata.responseText);
                _this.span_lname.innerHTML = name["name"];
                _this.getbptname();
            }
        };
        ESIdata.open("GET", "https://" + location.hostname + "/PublicESI/getname.php?type=structure&id=" + this.location, true);
        ESIdata.setRequestHeader("Content-Type", "application/json");
        ESIdata.send();
    };
    Job.prototype.getbptname = function () {
        var _this = this;
        var ESIdata = new XMLHttpRequest();
        ESIdata.onreadystatechange = function () {
            if (ESIdata.readyState == XMLHttpRequest.DONE) {
                //alert(this.responseText);
                var name = JSON.parse(ESIdata.responseText);
                _this.span_bptname.innerHTML = name["name"];
                _this.gettname();
            }
        };
        ESIdata.open("GET", "https://" + location.hostname + "/PublicESI/getname.php?type=item&id=" + this.bptypeid, true);
        ESIdata.setRequestHeader("Content-Type", "application/json");
        ESIdata.send();
    };
    Job.prototype.gettname = function () {
        var _this = this;
        var ESIdata = new XMLHttpRequest();
        ESIdata.onreadystatechange = function () {
            if (ESIdata.readyState == XMLHttpRequest.DONE) {
                //alert(this.responseText);
                var name = JSON.parse(ESIdata.responseText);
                _this.span_tname = name["name"];
            }
        };
        ESIdata.open("GET", "https://" + location.hostname + "/PublicESI/getname.php?type=item&id=" + this.typeid, true);
        ESIdata.setRequestHeader("Content-Type", "application/json");
        ESIdata.send();
    };
    Job.prototype.List_Row = function () {
        this.listrow = document.createElement("tr");
        for (var i = 0; i < 8; i++) {
            this.listrow.insertCell(-1);
        }
        var img_port = document.createElement("img");
        img_port.src = "https://images.evetech.net/characters/" + this.owner.userid + "/portrait?size=64";
        img_port.className = "portrait";
        var span_username = document.createElement("span");
        span_username.innerHTML = this.owner.username;
        span_username.className = "username";
        var img_industry_type = document.createElement("img");
        img_industry_type.src = "./images/itype" + this.activity + ".png";
        img_industry_type.className = "industry_type";
        /*
                //디버그용 넘버=======================
                var img_industry_type=document.createElement("span");
                img_industry_type.innerHTML=this.activity+"";
                img_industry_type.className="industry_type";
                //====================================
        */
        var span_runs = document.createElement("span");
        span_runs.innerHTML = "x " + this.runs;
        span_runs.className = "runs";
        var img_blueprint = document.createElement("img");
        img_blueprint.src = "https://image.eveonline.com/Type/" + this.bptypeid + "_64.png";
        img_blueprint.className = "blueprint_icon";
        this.div_jobtimer = document.createElement("div");
        this.renew_jobtimer();
        this.listrow.cells[0].appendChild(img_port);
        this.listrow.cells[1].appendChild(span_username);
        this.listrow.cells[2].appendChild(img_industry_type);
        this.listrow.cells[3].appendChild(span_runs);
        this.listrow.cells[4].appendChild(img_blueprint);
        this.listrow.cells[5].appendChild(this.span_bptname);
        //this.listrow.cells[5].appendChild(document.createElement("br"));
        this.listrow.cells[5].appendChild(this.div_jobtimer);
        this.listrow.cells[6].appendChild(this.span_lname);
        this.listrow.cells[7].innerHTML = Display_UTC_Time(this.endtime);
        return this.listrow;
    };
    Job.prototype.lefttime = function (timetype) {
        if (timetype === undefined) {
            timetype = "second";
        }
        if (timetype == "second") {
            return Math.ceil((this.endtime.getTime() - new Date().getTime()) / 1000);
        }
        if (timetype == "timestamp") {
            var dd, hh, mm, ss, tt = Math.ceil((this.endtime.getTime() - new Date().getTime()) / 1000);
            ss = tt % 60;
            mm = Math.floor(tt / 60) % 60;
            hh = Math.floor(tt / 3600) % 24;
            dd = Math.floor(tt / 86400);
            if (tt < 60) {
                return _2digit(ss) + " s";
            }
            if (60 <= tt && tt < 3600) {
                return _2digit(mm) + ":" + _2digit(ss);
            }
            if (3600 <= tt && tt < 86400) {
                return _2digit(hh) + ":" + _2digit(mm) + ":" + _2digit(ss);
            }
            if (86400 <= tt) {
                return dd + "D " + _2digit(hh) + ":" + _2digit(mm) + ":" + _2digit(ss);
            }
        }
    };
    Job.prototype.renew_jobtimer = function () {
        var _this = this;
        if (this.lefttime("second") > 0) {
            this.div_jobtimer.className = "jobtimer";
            this.div_jobtimer.innerHTML = "" + this.lefttime("timestamp");
            this.complete = false;
            setTimeout(function () { _this.renew_jobtimer(); }, 500);
        }
        else {
            if (this.complete == false) {
                this.complete = true;
                Turn_Alarm_On();
            }
            this.div_jobtimer.className = "jobtimer_complete";
            this.div_jobtimer.innerHTML = "Complete";
        }
    };
    return Job;
}());
function Read_Character(userid, username, token) {
    var i;
    for (i = 0; i < user_list.length; i++) {
        if (user_list[i].userid == userid) {
            return i;
        }
    }
    //console.log(username);
    user_list[i] = new User(userid);
    return i;
}
function EVE_Clock() {
    var div_clock = document.getElementById("evetime_clock");
    var nowdate = new Date();
    div_clock.innerHTML = nowdate.getUTCFullYear() + "." + (nowdate.getUTCMonth() + 1) + "." + nowdate.getUTCDate() + " ";
    div_clock.innerHTML += _2digit(nowdate.getUTCHours()) + ":" + _2digit(nowdate.getUTCMinutes()) + ":" + _2digit(nowdate.getUTCSeconds());
}
function show_character() {
    var character_table = document.createElement("table");
    character_table.className = "character_slot";
    var i = 0;
    var j = 0;
    for (i = 0; i < user_list.length; i++) {
        if (i % CHARACTERS_PER_ROW == 0) {
            character_table.insertRow(character_table.rows.length);
        }
        character_table.rows[Math.floor(i / CHARACTERS_PER_ROW)].insertCell(character_table.rows[Math.floor(i / CHARACTERS_PER_ROW)].cells.length);
        character_table.rows[Math.floor(i / CHARACTERS_PER_ROW)].cells[i % CHARACTERS_PER_ROW].appendChild(user_list[i].Character_slot());
        character_table.rows[Math.floor(i / CHARACTERS_PER_ROW)].cells[i % CHARACTERS_PER_ROW].className = "character_slot";
    }
    for (; i % CHARACTERS_PER_ROW > 0; i++) {
        character_table.rows[Math.floor(i / CHARACTERS_PER_ROW)].insertCell(character_table.rows[Math.floor(i / CHARACTERS_PER_ROW)].cells.length);
    }
    var div_characters_table = document.getElementById("characters_table");
    while (div_characters_table.lastElementChild) {
        div_characters_table.removeChild(div_characters_table.lastElementChild);
    }
    div_characters_table.appendChild(character_table);
}
function create_job_list() {
    jobs_list = new Array();
    for (var i = 0, t = 0; i < user_list.length; i++) {
        for (var j = 0; j < user_list[i].jobs.length; j++) {
            jobs_list[t] = user_list[i].jobs[j];
            t++;
        }
    }
    display_job_list();
}
function Display_UTC_Time(d) {
    var s = "";
    s += d.getUTCFullYear() + "." + (d.getUTCMonth() + 1) + "." + d.getUTCDate() + " " + _2digit(d.getUTCHours()) + ":" + _2digit(d.getUTCMinutes()) + ":" + _2digit(d.getUTCSeconds());
    return s;
}
function _2digit(n) {
    var s = n + "";
    while (s.length < 2) {
        s = "0" + s;
    }
    return s;
}
function sort_joblist(column, order) {
    if (order === undefined) {
        if (column == orderby[0]) {
            if (orderby[1] == "asc") {
                orderby[1] = "desc";
            }
            else {
                orderby[1] = "asc";
            }
        }
        else {
            orderby[0] = column;
            orderby[1] = "asc";
        }
        order = orderby[1];
    }
    for (var i = 1; i < jobs_list.length; i++) {
        for (var j = i - 1; j >= 0; j--) {
            if (column == "owner") {
                if ((jobs_list[j + 1].owner.username < jobs_list[j].owner.username && order == "asc") || (jobs_list[j + 1].owner.username > jobs_list[j].owner.username && order == "desc")) {
                    var tempjob = jobs_list[j];
                    jobs_list[j] = jobs_list[j + 1];
                    jobs_list[j + 1] = tempjob;
                }
            }
            else if (column == "activity") {
                if ((jobs_list[j + 1].activity < jobs_list[j].activity && order == "asc") || (jobs_list[j + 1].activity > jobs_list[j].activity && order == "desc")) {
                    var tempjob = jobs_list[j];
                    jobs_list[j] = jobs_list[j + 1];
                    jobs_list[j + 1] = tempjob;
                }
            }
            else if (column == "blueprint") {
                if ((jobs_list[j + 1].span_bptname.innerHTML < jobs_list[j].span_bptname.innerHTML && order == "asc") || (jobs_list[j + 1].span_bptname.innerHTML > jobs_list[j].span_bptname.innerHTML && order == "desc")) {
                    var tempjob = jobs_list[j];
                    jobs_list[j] = jobs_list[j + 1];
                    jobs_list[j + 1] = tempjob;
                }
            }
            else if (column == "time") {
                if ((jobs_list[j + 1].endtime < jobs_list[j].endtime && order == "asc") || (jobs_list[j + 1].endtime > jobs_list[j].endtime && order == "desc")) {
                    var tempjob = jobs_list[j];
                    jobs_list[j] = jobs_list[j + 1];
                    jobs_list[j + 1] = tempjob;
                }
            }
            else if (column == "location") {
                if ((jobs_list[j + 1].span_lname.innerHTML < jobs_list[j].span_lname.innerHTML && order == "asc") || (jobs_list[j + 1].span_lname.innerHTML > jobs_list[j].span_lname.innerHTML && order == "desc")) {
                    var tempjob = jobs_list[j];
                    jobs_list[j] = jobs_list[j + 1];
                    jobs_list[j + 1] = tempjob;
                }
            }
        }
    }
    display_job_list();
}
function display_job_list() {
    var list_table = document.createElement("table");
    list_table.insertRow(-1);
    for (var i = 0; i < 6; i++) {
        list_table.rows[0].insertCell(-1);
    }
    var columnhead = new Array();
    columnhead[0] = document.createElement("span");
    columnhead[0].innerHTML = "Owner▽";
    columnhead[0].className = "tablehead";
    columnhead[0].onclick = function () { sort_joblist("owner"); };
    columnhead[1] = document.createElement("span");
    columnhead[1].innerHTML = "Type▽";
    columnhead[1].className = "tablehead";
    columnhead[1].onclick = function () { sort_joblist("activity"); };
    columnhead[2] = document.createElement("span");
    columnhead[2].innerHTML = "Runs";
    columnhead[2].className = "tablehead";
    columnhead[3] = document.createElement("span");
    columnhead[3].innerHTML = "Blueprint▽ ";
    columnhead[3].className = "tablehead";
    columnhead[3].onclick = function () { sort_joblist("blueprint"); };
    columnhead[4] = document.createElement("span");
    columnhead[4].innerHTML = "Status▽";
    columnhead[4].className = "tablehead";
    columnhead[4].onclick = function () { sort_joblist("time"); };
    columnhead[5] = document.createElement("span");
    columnhead[5].innerHTML = "Location▽";
    columnhead[5].className = "tablehead";
    columnhead[5].onclick = function () { sort_joblist("location"); };
    columnhead[6] = document.createElement("span");
    columnhead[6].innerHTML = "End Date";
    columnhead[6].className = "tablehead";
    columnhead[6].onclick = function () { sort_joblist("time"); };
    list_table.rows[0].cells[0].colSpan = 2;
    list_table.rows[0].cells[0].appendChild(columnhead[0]);
    list_table.rows[0].cells[1].appendChild(columnhead[1]);
    list_table.rows[0].cells[2].appendChild(columnhead[2]);
    list_table.rows[0].cells[3].colSpan = 2;
    list_table.rows[0].cells[3].appendChild(columnhead[3]);
    list_table.rows[0].cells[3].appendChild(columnhead[4]);
    list_table.rows[0].cells[4].appendChild(columnhead[5]);
    list_table.rows[0].cells[5].appendChild(columnhead[6]);
    for (var i = 0; i < jobs_list.length; i++) {
        if (jobs_list[i].owner.selected) {
            list_table.appendChild(jobs_list[i].List_Row());
        }
    }
    var joblist = document.getElementById("joblist_table");
    while (joblist.lastElementChild) {
        joblist.removeChild(joblist.lastElementChild);
    }
    joblist.appendChild(list_table);
}
function Turn_Alarm_On() {
    var alarmsound = new Audio("alarm.mp3");
    var alarm_checkbox = document.getElementById("clockcheck");
    if (alarm_checkbox.checked) {
        alarmsound.play();
    }
}
