<?php

include $_SERVER['DOCUMENT_ROOT']."/PublicESI/phplib.php";
dbset();
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

$qr= "select charactername,DATE_FORMAT(permission_date,\"%Y-%m-%dT%TZ\") from PublicESI_keys where service_type=\"QueueManager\" and characterid=".$_GET["id"]." and active>=1";
$result=$dbcon->query($qr);
$data=$result->fetch_array();

echo("{\"name\":\"".$data[0]."\",\n\"expire_date\":\"".$data[1]."\"}");

?>