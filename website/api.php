<?php
// =======================================================================
// == API for communicating with planning database
// =======================================================================

// =======================================================================
// == Utility Functions
// =======================================================================

// -----------------------------------------------------------------------
// get_query_param
// _______________________________________________________________________
// Return URL parameter regardless of method (GET or POST)
// .......................................................................
// Params:
//  $p_key     - string containing key
//  $p_default - optional value to return if key not found
// .......................................................................
// Returns: string containing value
// -----------------------------------------------------------------------
function get_query_param($p_key,$p_default = "")
{
  if (array_key_exists($p_key,$_GET))
  {
    $result = $_GET[$p_key];
  }
  else if (array_key_exists($p_key,$_POST))
  {
    $result = $_POST[$p_key];
  }
  else
  {
    $result = $p_default;
  }

  return ( $result );
}

// -----------------------------------------------------------------------
// get_street
// _______________________________________________________________________
// Returns index of given name in street table.
// Inserts it if not already there.
// .......................................................................
// Params:
//  $p_db      - mysqli database object
//  $p_name    - string containing name of street
// .......................................................................
// Returns: { id: <value> }
// -----------------------------------------------------------------------
function get_street($p_db,$p_name)
{
  $return = -1;
  if ($p_name!="")
  {
    $res = $p_db->query("SELECT id FROM street WHERE name='$p_name'");
    if ($res->num_rows==1)
    {
      // street found
      $return = $res->fetch_assoc();
    }
    else
    {
      $res = $p_db->query("INSERT INTO street (name) VALUES ('$p_name')");
      if ($res)
      {
        $res = $p_db->query("SELECT id FROM street WHERE name='$p_name'");
        if ($res->num_rows==1)
        {
          $return = $res->fetch_assoc();
        }
      }
    }
  }
  return($return);
}

// -----------------------------------------------------------------------
// get_location
// _______________________________________________________________________
// Returns index of given street:number in location table.
// Inserts it if not already there.
// .......................................................................
// Params:
//  $p_db      - mysqli database object
//  $p_street  - index of street (from street table)
//  $p_number  - string containing value of number (not a number)
// .......................................................................
// Returns: { id: <value>, geolat: <value>, geolng: <value> }
// -----------------------------------------------------------------------
function get_location($p_db,$p_street,$p_number)
{
  $return = -1;
  $res = $p_db->query("SELECT id, geolat, geolng FROM location WHERE street=$p_street AND number='$p_number'");
  if ($res->num_rows==1)
  {
    // location found
    $return = $res->fetch_assoc();
  }
  else
  {
    $res = $p_db->query("INSERT INTO location (street,number) VALUES ($p_street,'$p_number')");
    if ($res)
    {
      $res = $p_db->query("SELECT id, geolat, geolng FROM location WHERE street=$p_street AND number='$p_number'");
      if ($res->num_rows==1)
      {
        $return = $res->fetch_assoc();
      }
    }
  }
  return($return);
}

// -----------------------------------------------------------------------
// get_apptype
// _______________________________________________________________________
// Returns index of given apptype in apptype table.
// Inserts it if not already there.
// .......................................................................
// Params:
//  $p_db      - mysqli database object
//  $p_apptype - string containing apptype
// .......................................................................
// Returns: { id: <value> }
// -----------------------------------------------------------------------
function get_apptype($p_db,$p_apptype)
{
  $return = -1;
  $res = $p_db->query("SELECT id FROM apptype WHERE label='$p_apptype'");
  if ($res->num_rows==1)
  {
    // apptype found
    $return = $res->fetch_assoc();
  }
  else
  {
    $res = $p_db->query("INSERT INTO apptype (label) VALUES ('$p_apptype')");
    if ($res)
    {
      $res = $p_db->query("SELECT id FROM apptype WHERE label='$p_apptype'");
      if ($res->num_rows==1)
      {
        $return = $res->fetch_assoc();
      }
    }
  }
  return($return);
}

// -----------------------------------------------------------------------
// add_application
// _______________________________________________________________________
// Adds application entry, if not already there (based on date + code).
// If adding, also adds street, location and apptype entries as required.
// .......................................................................
// Params:
//  $p_db      - mysqli database object
//  $p_street  - string containing name of street
//  $p_number  - string containing value of number (not a number)
//  $p_date    - string containg date
//  $p_code    - string containing code
//  $p_apptype - string containing apptype
//  $p_appdesc - string containg description
//  $p_wpc     - string containing WPC status
//  $p_meeting - string containing date of WPC meeting
//  $p_item    - string containing WPC agenda item number
//  $p_scdc    - string containing SCDC status
//  $p_appeal  - string containing Appeal status
// .......................................................................
// Returns: array containing result (found, added or failed)
//          if found, also return id of match
// -----------------------------------------------------------------------
function add_application($p_db,$p_street,$p_number,$p_date,$p_code,$p_apptype,$p_appdesc,$p_wpc,$p_meeting,$p_item,$p_scdc,$p_appeal)
{
  // check for code before inserting
  $res = $p_db->query("SELECT id FROM application WHERE code='$p_code' AND date='$p_date'");
  if ($res->num_rows==1)
  {
    // location found
    $row = $res->fetch_assoc();
    $result = array("result"=>"found", "id"=>$row['id']);
  }
  else
  {
    $streetrow = get_street($p_db,$p_street);
    $locationrow = get_location($p_db,$streetrow['id'],$p_number);
    $apptyperow = get_apptype($p_db,$p_apptype);

    // prepare version - inserts NULLs for empty strings
    $stmt = $p_db->stmt_init();
    if ($stmt->prepare("INSERT INTO application (address,date,code,apptype,appdesc,wpc,meeting,item,scdc,appeal) VALUES (?,?,?,?,?,?,?,?,?,?)"))
    {
      $stmt->bind_param("ississssss",$f_address,$p_date,$p_code,$f_apptype,$p_appdesc,$f_wpc,$p_meeting,$p_item,$f_scdc,$f_appeal);
      $f_address = $locationrow['id'];
      $f_apptype = $apptyperow['id'];
      $f_wpc     = ($p_wpc=="")? NULL: $p_wpc;
      $f_scdc    = ($p_scdc=="")? NULL: $p_scdc;
      $f_appeal  = ($p_appeal=="")? NULL: $p_appeal;
      $stmt->execute();
      $result = array("result"=>(($stmt->affected_rows==1)? "added": "failed"));
      $stmt->close();
    }

/*
    $res = $p_db->query("INSERT INTO application (address,date,code,apptype,appdesc,wpc,meeting,item,scdc,appeal) VALUES (".$locationrow['id'].",'$p_date','$p_code','".$apptyperow['id']."','$p_appdesc','$p_wpc','$p_meeting','$p_item','$p_scdc','$p_appeal')");
    if ($res)
    {
      $result = array("result"=>"added");
    }
    else
    {
      $result = array("result"=>"failed");
    }
*/
  }

  return ($result);
}
// -----------------------------------------------------------------------
// tidy_tables
// _______________________________________________________________________
// Remove orphaned entries in location, street and apptype tables.
// .......................................................................
// Params:
//  $p_db      - mysqli database object
// .......................................................................
// Returns: nothing (yet)
// -----------------------------------------------------------------------
function tidy_tables($p_db)
{
  $res = $p_db->query("DELETE FROM location WHERE id NOT IN (SELECT address FROM application)");
  $res = $p_db->query("DELETE FROM street WHERE id NOT IN (SELECT street FROM location)");
  $res = $p_db->query("DELETE FROM apptype WHERE id NOT IN (SELECT apptype FROM application)");
}

// =======================================================================
// == Entry Point
// =======================================================================

include 'secure/db.php';

$db = new mysqli($host,$user,$pass,$databaseName);
if ($db->connect_errno != 0)
{
  echo "Failed to connect to MySQL:".$db->connect_error;
}
else
{
  // === choose appropriate API function ===
  $func = get_query_param('func','default');

  switch($func)
  {
  case 'list':
    $query = "SELECT application.id, application.code, location.number, street.name, application.date, apptype.label, application.wpc, application.scdc FROM application ";
    $query .= "JOIN location ON location.id=application.address ";
    $query .= "JOIN street ON street.id=location.street ";
    $query .= "JOIN apptype ON apptype.id=application.apptype ";

    $where = false;
    $street = get_query_param('street');
    if ($street!="")
    {
      $query .= "WHERE location.street=$street ";
      $where = true;
    }
    else
    {
      $location = get_query_param('location');
      if ($location!="")
      {
        $query .= "WHERE application.address=$location ";
        $where = true;
      }
    }

    $apptype = get_query_param('apptype');
    if ($apptype!="")
    {
      $query .= ($where? "AND": "WHERE")." apptype=$apptype ";
      $where = true;
    }

    $year = get_query_param('year');
    if ($year!="")
    {
      $query .= ($where? "AND": "WHERE")." extract(year from application.date)=$year ";

      $month = get_query_param('month');
      if ($month!="")
      {
        $query .= "AND extract(month from application.date)=$month ";
      }

      $where = true;
    }

    $myear = get_query_param('myear');
    if ($myear!="")
    {
      $query .= ($where? "AND": "WHERE")." extract(year from application.meeting)=$myear ";

      $mmonth = get_query_param('mmonth');
      if ($mmonth!="")
      {
        $query .= "AND extract(month from application.meeting)=$mmonth ";
      }

      $where = true;
    }

    $res = $db->query($query);
    $rows = array();

    while ($row = $res->fetch_assoc())
    {
      $rows[] = $row;
    }

    echo json_encode($rows);
    break;

  case 'count':
    $query = "SELECT COUNT(*) AS NumberOfRecords FROM application ";
    $query .= "JOIN location ON location.id=application.address ";

    $where = false;
    $street = get_query_param('street');
    if ($street!="")
    {
      $query .= "WHERE location.street=$street ";
      $where = true;
    }

    $number = get_query_param('number');
    if ($number!="")
    {
      $query .= ($where? "AND": "WHERE")." location.number=$number ";
      $where = true;
    }

    $apptype = get_query_param('apptype');
    if ($apptype!="")
    {
      $query .= ($where? "AND": "WHERE")." apptype=$apptype ";
    }

    $res = $db->query($query);

    echo json_encode($res->fetch_assoc());
    break;

  case 'liststreets':
    $apptype = get_query_param('apptype','all');

    $query = "SELECT street.id, street.name FROM street ";

    if ($apptype!='all')
    {
      $query .= "JOIN location ON location.street=street.id ";
      $query .= "JOIN application ON application.address=location.id ";
      $query .= "WHERE application.apptype=$apptype ";
    }

    $query .= "GROUP BY street.name ORDER BY street.name";

    $res = $db->query($query);
    $rows = array();
    while ($row = $res->fetch_assoc())
    {
      $rows[] = $row;
    }

    echo json_encode($rows);
    break;

  case 'listnumbers':
    $street = get_query_param('street');
    $apptype = get_query_param('apptype','all');

    $where = false;
    $query = "SELECT location.id, location.number FROM location ";

    if ($apptype!='all')
    {
      $query .= "JOIN application ON application.address=location.id WHERE application.apptype=$apptype ";
      $where = true;
    }

    $query .= ($where? "AND": "WHERE")." location.street=$street GROUP BY location.number ORDER BY CAST(location.number AS DECIMAL)";

    $res = $db->query($query);
    $rows = array();
    while ($row = $res->fetch_assoc())
    {
      $rows[] = $row;
    }

    echo json_encode($rows);
    break;

  case 'listlocations':
    // deprecated
    $street = get_query_param('street','all');

    if ($street=='all')
    {
      $query = "SELECT location.id, street.name, location.number FROM location JOIN street ON street.id=location.street";
    }
    else
    {
      $query = "SELECT id, number FROM location ";
      if ($street!="")
      {
         $query .= "WHERE street=$street ";
      }
      $query .= "ORDER BY CAST(number AS DECIMAL)";
    }

    $res = $db->query($query);
    $rows = array();
    while ($row = $res->fetch_assoc())
    {
      $rows[] = $row;
    }

    echo json_encode($rows);
    break;

  case 'listapptypes':
    $street = get_query_param('street',all);

    if ($street=='all')
    {
      $query = "SELECT id,label FROM apptype ORDER BY label";
    }
    else
    {
      $query = "SELECT apptype.id, apptype.label FROM apptype ";
      $query .= "JOIN application ON application.apptype=apptype.id ";
      $query .= "JOIN location ON location.id=application.address ";
      $query .= "WHERE location.street=$street ";
      $query .= "GROUP BY apptype.label ORDER BY apptype.label";
    }

    $res = $db->query($query);
    $rows = array();
    while ($row = $res->fetch_assoc())
    {
      $rows[] = $row;
    }

    echo json_encode($rows);
    break;

  case 'getstreet':
    $name = get_query_param('name');
    echo json_encode(get_street($db,$name));
    break;

  case 'getlocation':
    $street = get_query_param('street');
    $number = get_query_param('number');
    echo json_encode(get_location($db,$street,$number));
    break;

  case 'getapptype':
    $apptype = get_query_param('apptype');
    echo json_encode(get_apptype($db,$apptype));
    break;

  case 'get':
    $id = get_query_param('id');

    $query = "SELECT application.code, application.date, application.address, location.number, street.name, location.geolat, location.geolng, apptype.label, application.appdesc, application.wpc, application.meeting, application.item, application.scdc FROM application ";
    $query .= "JOIN location ON location.id=application.address ";
    $query .= "JOIN street ON street.id=location.street ";
    $query .= "JOIN apptype ON apptype.id=application.apptype ";
    $query .= "WHERE application.id=$id";

    $res = $db->query($query);
    if ($res->num_rows==1)
    {
      echo json_encode($res->fetch_assoc());
    }
    else
    {
      echo json_encode(array('result'=>"No record found"));
    }
    break;

  case 'add':
    // add a new application to the database
    // e.g. api.php?func=add&street=Berrycroft&number=27&date=2007-10-01&code=S/1830/07/L&apptype=Alteration&appdesc=Alterations to LB&wpc=a&meeting=2007-10-29&item=7i&scdc=a&appeal=r
    $street = get_query_param('street');
    $number = get_query_param('number');
    $date = get_query_param('date');
    $code = strtoupper(get_query_param('code'));
    $apptype = get_query_param('apptype');
    $appdesc = get_query_param('appdesc');
    $wpc = get_query_param('wpc');
    $meeting = get_query_param('meeting');
    $item = get_query_param('item');
    $scdc = get_query_param('scdc');
    $appeal = get_query_param('appeal');

    echo json_encode(add_application($db,$street,$number,$date,$code,$apptype,$appdesc,$wpc,$meeting,$item,$scdc,$appeal));
    break;

  case 'edit':
    // edit an existing application
    // e.g. api.php?func=edit&id=28&street=Berrycroft&number=27&date=2007-10-01&code=S/1830/07/L&apptype=Alteration&appdesc=Alterations to LB&wpc=a&meeting=2007-10-29&item=7i&scdc=a&appeal=r
    $id = get_query_param('id');
    $street = get_query_param('street');
    $number = get_query_param('number');
    $date = get_query_param('date');
    $code = strtoupper(get_query_param('code'));
    $apptype = get_query_param('apptype');
    $appdesc = get_query_param('appdesc');
    $wpc = get_query_param('wpc');
    $meeting = get_query_param('meeting','DEFAULT');
    $item = get_query_param('item','DEFAULT');
    $scdc = get_query_param('scdc','DEFAULT');
    $appeal = get_query_param('appeal','DEFAULT');

    $streetrow = get_street($db,$street);
    $locationrow = get_location($db,$streetrow['id'],$number);
    $apptyperow = get_apptype($db,$apptype);

    // prepare version - inserts NULLs for empty strings
    $stmt = $db->stmt_init();
    if ($stmt->prepare("UPDATE application SET address=?,date=?,code=?,apptype=?,appdesc=?,wpc=?,meeting=?,item=?,scdc=?,appeal=? WHERE id=?"))
    {
      $stmt->bind_param("ississssssi",$f_address,$date,$code,$f_apptype,$appdesc,$f_wpc,$meeting,$item,$f_scdc,$f_appeal,$id);
      $f_address = $locationrow['id'];
      $f_apptype = $apptyperow['id'];
      $f_wpc     = ($wpc=="")? NULL: $wpc;
      $f_scdc    = ($scdc=="")? NULL: $scdc;
      $f_appeal  = ($appeal=="")? NULL: $appeal;
      $stmt->execute();
      $result = array("result"=>(($stmt->affected_rows==1)? "updated": "failed"));
      $stmt->close();
    }

/*
    $res = $db->query("UPDATE application SET address='".$locationrow['id']."',date='$date',code='$code',apptype='".$apptyperow['id']."',appdesc='$appdesc',wpc='$wpc',meeting='$meeting',item='$item',scdc='$scdc',appeal='$appeal' WHERE id=$id");
    if ($res)
    {
      $result = array("result"=>"updated");
      // tidy up location, street and apptype tables
      tidy_tables($db);
    }
    else
    {
      $result = array("result"=>"failed");
    }
*/

    echo json_encode($result);
    break;

  case 'delete':
    // delete existing application
    $id = get_query_param('id');

    if ($id!="")
    {
      $res = $db->query("DELETE FROM application WHERE id=$id");
      if ($res)
      {
        $result = array("result"=>"deleted");
        // tidy up location, street and apptype tables
        tidy_tables($db);
      }
      else
      {
        $result = array("result"=>"failed");
      }
    }
    else
    {
      $result = array('result'=>"No index given");
    }

    echo json_encode($result);
    break;

  case 'readcsv':
    // File Format [0] street, [1] number, [2]date, [3] code, [4] apptype, [5] appdesc, [6] wpc, [7] meeting, [8] item, [9] scdc
    // e.g. "Berrycroft,27,01/10/2007,S/1830/07/L,Alteration,Alterations to LB,a,29/10/2007,7i,a"
    $filename = get_query_param('file');
    $handle = fopen($filename,'r');
    if ($handle)
    {
      $read = 0;
      $found = 0;
      $added = 0;
      $failed = 0;
      while (($data = fgetcsv($handle)))
      {
        $read++;

        // echo "<p>".$data[0].",".$data[1].",".$data[2].",".$data[3].",".$data[4].",".$data[5].",".$data[6].",".$data[7].",".$data[8].",".$data[9].".</p>";
        $res = add_application($db,$data[0],$data[1],$data[2],$data[3],$data[4],$data[5],$data[6],$data[7],$data[8],$data[9]);
        switch ($res['result'])
        {
        case 'found':
          $found++;
          echo "<p>" . $data[3] . " found at id:" . $res['id'] . "</p>\n";
          break;
        case 'added':
          $added++;
          break;
        case 'failed':
          $failed++;
          break;
        }
      }
      fclose($handle);
      echo json_encode(array("read"=>$read, "found"=>$found, "added"=>$added, "failed"=>$failed));
    }
    else
    {
      echo "<p>Error opening \"" . $filename . "\"<p>\n";
    }
    break;

  case 'writecsv':
    // e.g. "Berrycroft,27,01/10/2007,S/1830/07/L,Alteration,Alterations to LB,a,29/10/2007,7i,a,a[,lat,lng]"
    $filename = get_query_param('file');
    $geocode = get_query_param('geocode','false');

    $handle = fopen($filename,'w');
    if ($handle)
    {
      $columns = array('Street', 'Number', 'Date', 'Code', 'Type', 'Description', 'WPC', 'Meeting', 'Item', 'SCDC', 'Appeal');

      $query = "SELECT street.name, location.number, application.date, application.code, apptype.label, application.appdesc, application.wpc, application.meeting, application.item, application.scdc, application.appeal";
      if ($geocode=='true')
      {
        $query .= ", location.geolat, location.geolng";
        $columns[] = 'Latitude';
        $columns[] = 'Longitude';
      }
      $query .= " FROM application ";
      $query .= "JOIN location ON location.id=application.address ";
      $query .= "JOIN street ON street.id=location.street ";
      $query .= "JOIN apptype ON apptype.id=application.apptype ";
      $query .= "ORDER BY street.name, CAST(location.number AS SIGNED), application.date";

      fputcsv($handle,$columns);

      $res = $db->query($query);
      while ($row = $res->fetch_assoc())
      {
        fputcsv($handle,$row);
      }

      fclose($handle);
      echo "<p>\"" . $filename . "\" written.<p>\n";
    }
    else
    {
      echo "<p>Error opening \"" . $filename . "\"<p>\n";
    }
    break;

  case 'geocode':
    // add lat and lng to location
    $id = get_query_param('id');
    $lat = get_query_param('lat');
    $lng = get_query_param('lng');

    $res = $db->query("UPDATE location SET geolat=$lat, geolng=$lng WHERE id=$id");
    echo json_encode(array("result"=> ($res? "updated": "failed")));
    break;

  default:
    echo "<p>Error: unknown function $func</p>";
    echo "<p>Valid functions are:<ul>";
    echo "<li>list([street|location],[apptype],[year,[month]],[myear,[mmonth]])</li>";
    echo "<li>liststreets([apptype])</li>";
    echo "<li>listlocations([street])</li>";
    echo "<li>listnumbers(street,[apptype])</li>";
    echo "<li>listapptypes([street])</li>";
    echo "<li>getstreet(name)</li>";
    echo "<li>getlocation(name,number)</li>";
    echo "<li>getapptype(apptype)</li>";
    echo "<li>get(id)</li>";
    echo "<li>add(street,number,date,code,apptype,appdesc,wpc,meeting,item,scdc,appeal)</li>";
    echo "<li>edit(id,street,number,date,code,apptype,appdesc,wpc,meeting,item,scdc,appeal)</li>";
    echo "<li>delete(id)</li>";
    echo "<li>readcsv(file)</li>";
    echo "<li>writecsv(file,[geocode])</li>";
    echo "<li>geocode(id,lat,lng)</li>";
    echo "<li>count([street],[number],[apptype])</li>";
    echo "</ul></p>";
    break;
  }

  $db->close();
}

/*
   SQL for finding duplicate entries:
   SELECT id, application.code FROM application INNER JOIN (SELECT code FROM application GROUP BY code HAVING count(code)>1) dup ON application.code=dup.code
*/

?>