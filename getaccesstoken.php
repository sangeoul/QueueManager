<?php

include $_SERVER['DOCUMENT_ROOT']."/PublicESI/phplib.php";

dbset();
logincheck(1,1);
session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

if(!isset($_GET["id"])){
    $_GET["id"]=$_SESSION['PublicESI_characterid'];
}
refresh_token($_GET["id"],"QueueManager");
$qr="select access_token from PublicESI_keys where characterid=".$_GET["id"]." and userid=".getMainId($_SESSION['PublicESI_userid'])." and service_type='QueueManager' and active=1;";

$userdata=$dbcon->query($qr)->fetch_array();

echo("{\"access_token\":\"".$userdata[0]."\"}");
?>