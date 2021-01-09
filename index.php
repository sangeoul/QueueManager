<?php
session_start();


include $_SERVER['DOCUMENT_ROOT']."/PublicESI/phplib.php";
dbset();
$_SESSION["service"]="QueueManager";
logincheck();

?>

<?php


$character_list=array();

$qr="select characterid from PublicESI_keys where userid=".$_SESSION['PublicESI_userid']." and service_type=\"QueueManager\" and active=1 order by charactername asc";
$result= $dbcon->query($qr);
for($i=0;$i<$result->num_rows;$i++){
    $data=$result->fetch_row();
    $character_list[$i]=$data[0];

}

?>


<html>
<head>
<?=$analytics?>
<link type="text/css" rel="stylesheet" href="https://lindows.kr/materialize/css/materialize.css">
<link type="text/css" rel="stylesheet" href="../indexcss.css">
<link rel="stylesheet" type="text/css" href="./queuemanager.css">
<script src="https://lindows.kr/materialize/js/materialize.js"></script>
<script src="../indexjs.js"></script>
<script src="queuemanager.js"></script>
<script>
 var characters_id=new Array();

<?php
for($i=0;$i<sizeof($character_list);$i++){
    echo("characters_id[".$i."]=".$character_list[$i].";\n");
}
?>

function bodyload(){
    var left_banner=new MenuBanner(<?=$_SESSION["PublicESI_userid"]?>);
    document.body.appendChild(left_banner.div_body);

    var clock=setInterval(function(){EVE_Clock();},250);
    for(var i=0;i<characters_id.length;i++){
        Read_Character(characters_id[i]);
    }
    
}

</script>
<script data-ad-client="ca-pub-7625490600882004" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
</head>
<body onload="javascript:bodyload();">


<div id="topbar" class="topbar">
<span id="evetime_clock" class="clock"></span>
<span><input type=checkbox id="clockcheck" class="clockcheck" onclick="javascript:Turn_Alarm_On();"><label id="clockcheck" class="clockcheck"> Alarm On/Off</label></span>
<span style="margin-left:20px;">Fee : 10 Mil / 30days* charcter</span> <a href="https://lindows.kr/PublicESI/charactersheet.php" style="color:rgb(200,200,255)">Manage Character</a></div>

<div id="characters_table" class="characterlist"></div><br><br>
<div id="jobtype_table"></div>
<div id="joblist_table" class="joblist_table"></div>

</body>
</html>