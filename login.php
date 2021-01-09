

<?php

include $_SERVER['DOCUMENT_ROOT']."/PublicESI/phplib.php";
dbset();

if($dbcon->connect_error){
	die("Connection Failed<br>".$dbcon->connect_error);
}
unset($_SESSSION["PublicESI_addchar"]);
//else echo "Connected MariaDB Successfully.<br><br>";


$esiurl="https://login.eveonline.com/oauth/authorize?response_type=code&redirect_uri=https://".$serveraddr."/PublicESI/QueueManager/getesi.php&scope=".$ESI_scope["QueueManager"]."&client_id=".$client_id["QueueManager"];

if(isset($_GET["redirect"]) && $_GET["redirect"]==1){

	echo("<script >\n");
	echo "window.location.replace('".$esiurl."');\n";

	echo ("</script>\n");

}
else{
	
	echo("<div >");
	echo "<a href='".$esiurl."'><img style=\"margin-left:80px;margin-top:50px;\" src='https://lindows.kr/PublicESI/images/loginbutton.jpg'></a><br>\n";

	echo ("</div>");
}


?>