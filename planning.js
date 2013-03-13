/*
  planning.js

  Javascript for planning application database
*/

// set up google map ready for initialization when first opened
// (otherwise map is incorrectly located as div is zero wide and high)
var map = null;
var mapMark;

function initMap()
{
  var mapSpot = new google.maps.LatLng(52.309036,0.056769);
  var mapOptions =
  {
    center: mapSpot,
    zoom: 16,
    disableDefaultUI: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  return (new google.maps.Map($('#gmap')[0],mapOptions));
}

var Recommend = { a: "Approval", r: "Refusal", n: "None" };
function getRecommend(code)
{
  return ((code==null)? "": Recommend[code]);
}

var Decision = { a: "Approved", r: "Refused", w: "Withdrawn" };
function getDecision(code)
{
  return ((code==null)? "": Decision[code]);
}

var MonthName = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];

var scdcQuery = "http://plan.scambs.gov.uk/swiftlg/apas/run/WPHAPPDETAIL.DisplayUrl?theTabNo=2&theApnID=";

$(function()
{
  // check cookies
  var loggedin = $.cookie('loggedin')=="yes";

  // == stuff which happens as soon as page is loaded ==
  $('#find').button({ icons: { primary: "ui-icon-search" }});
  $('#new').button({ icons: { primary: "ui-icon-plus" }});
  $('#edit').button({ icons: { primary: "ui-icon-pencil" }, text: false });
  $('#delete').button({ icons: { primary: "ui-icon-close" }, text: false });
  $('#login').button({ icons: { primary: "ui-icon-locked" }});
  if (loggedin)
  {
    $('#login').hide();
  }
  else
  {
    $('#new').hide();
    $('#edit').hide();
    $('#delete').hide();
  }
  $('#date').datepicker({ dateFormat: "yy-mm-dd", changeYear: true, changeMonth: true, minDate: "1997-02-01" });
  $('#mtng').datepicker({ dateFormat: "yy-mm-dd", changeYear: true, changeMonth: true, minDate: "1997-02-01" });
  $('#error').hide();
  $('#list').hide();
  $('#application').hide();

  // edit & new dialogue fields shortcuts
  var ftype = $('#formtype'),
      findx = $('#index'),
      fcode = $('#code'),
      fdate = $('#date'),
      fnmbr = $('#nmbr'),
      fstrt = $('#strt'),
      flabl = $('#labl'),
      fdesc = $('#desc'),
      fwpcr = $('#wpcr'),
      fmtng = $('#mtng'),
      fitem = $('#item'),
      fscdc = $('#scdc'),
      fappl = $('#appeal'),
      allfields = $([]).add(fcode).add(fdate).add(fnmbr).add(fstrt).add(flabl).add(fdesc).add(fwpcr).add(fmtng).add(fitem).add(fscdc).add(fappl);

  var fdindex = $('#delindex');

  // set up dataTables table
  // no initial sorting (without this it sorts on the invisible ID column)
  // no Filter or Filter input
  // paginate with numbers
  // fixed page length
  // at 10 items per page
  // format with jqueryUI
  // layout: jqueryUI header with info and pagination, the table, jqueryUI footer
  // columns: hide column 0 (ID)
  //          right align CSS for column 2
  //          left align CSS for columns 1,3,4,5
  $('#apptable').dataTable({
      "aaSorting": [],
      "bFilter": false,
      "sPaginationType": "full_numbers",
      "bLengthChange": false,
      "iDisplayLength": 10,
      "bJQueryUI": true,
      "sDom": '<"H"ip>t<"F">',
      "aoColumnDefs": [
          { "bSearchable": false, "bVisible": false, "aTargets": [0] },
          { "sClass": "right", "aTargets": [2] },
          { "sClass": "left", "aTargets": [1,3,4,5] }
        ]
    });

  // populate street selection
  $.ajax({
    url: 'api.php',
    data: "func=liststreets",
    dataType: 'json',
    success: function(data)
    {
      for (var r=0; r<data.length; r++)
      {
        $('#street').append($("<option></option>").attr("value",data[r]['id']).text(data[r]['name']));
      }
    },
    error: function(jqXHR,textStatus,errorThrown)
    {
      $('#error').text("Whoops: " + textStatus + " " + errorThrown).slideDown();
    }

  });

  // populate apptype selection
  $.ajax({
    url: 'api.php',
    data: "func=listapptypes",
    dataType: 'json',
    success: function(data)
    {
      for (var r=0; r<data.length; r++)
      {
        $('#type').append($("<option></option>").attr("value",data[r]['id']).text(data[r]['label']));
      }
    },
    error: function(jqXHR,textStatus,errorThrown)
    {
      $('#error').text("Whoops: " + textStatus + " " + errorThrown).slideDown();
    }

  });

  // populate year selections
  var today = new Date();
  for (var y = today.getFullYear(); y>=1999; y--)
  {
    $('#year').append($("<option></option>").attr("value",y).text(y));
    $('#mtngyear').append($("<option></option>").attr("value",y).text(y));
  }

  // == event driven stuff ==

  // update number when street changes
  $('#street').change(function()
  {
    var index = $("#street option:selected").attr("value");

    // reset number selection
    $('#number').html($("<option></option>").attr("value",'*').text('All Numbers'));

    if (index!='*')
    {
      // populate number selection from street index
      $.ajax({
        url: 'api.php',
        data: "func=listlocations&street="+index,
        dataType: 'json',
        success: function(data)
        {
          for (var r=0; r<data.length; r++)
          {
            var num = data[r]['number'];
            if (num=="")
            {
              num = "no number";
            }
            $('#number').append($("<option></option>").attr("value",data[r]['id']).text(num));
          }
        },
        error: function(jqXHR,textStatus,errorThrown)
        {
          $('#error').text("Whoops: " + textStatus + " " + errorThrown).slideDown();
        }
      });
    }
  });

  // update month when year changes
  $('#year').change(function()
  {
    var year = $("#year option:selected").attr("value");

    // reset month selection
    $('#month').html($("<option></option>").attr("value",'*').text('All Months'));

    if (year!='*')
    {
      var lastMonth = (year==today.getFullYear())? today.getMonth(): 11;

      for ( var m = 0; m<=lastMonth; m++)
      {
        $('#month').append($("<option></option>").attr("value",m+1).text(MonthName[m]));
      }
    }
  });

  // update month when year changes
  $('#mtngyear').change(function()
  {
    var year = $("#mtngyear option:selected").attr("value");

    // reset month selection
    $('#mtngmonth').html($("<option></option>").attr("value",'*').text('All Months'));

    if (year!='*')
    {
      var lastMonth = (year==today.getFullYear())? today.getMonth(): 11;

      for ( var m = 0; m<=lastMonth; m++)
      {
        $('#mtngmonth').append($("<option></option>").attr("value",m+1).text(MonthName[m]));
      }
    }
  });

  // dialogue handlers
  $("#appedit").dialog(
  {
    autoOpen: false,
    height: 300,
    width: 550,
    position: { my: "left", at: "left", of: $('#container') },
    modal: true,
    dialogClass: "appedit",
    resizable: false,
    buttons:
    {
      "Save": function()
      {
        var query = "";

        if (ftype.val()=="new")
        {
          query += "func=add";
        }
        else
        {
          query += "func=edit";
          query += "&id="  + findx.val();
        }

        query += "&street="  + fstrt.val();
        query += "&number="  + fnmbr.val();
        query += "&date="    + fdate.val();
        query += "&code="    + fcode.val();
        query += "&apptype=" + flabl.val();
        query += "&appdesc=" + fdesc.val();
        query += "&wpc="     + fwpcr.val();
        query += "&meeting=" + fmtng.val();
        query += "&item="    + fitem.val();
        query += "&scdc="    + fscdc.val();
        query += "&appeal="  + fappl.val();

        // add or update application
        $.ajax({
          url: 'api.php',
          data: query,
          dataType: 'json',
          success: function(data)
          {
            $('#find').trigger('click');
            $('#error').text("Application " + data['result']).slideDown();
          },
          error: function(jqXHR,textStatus,errorThrown)
          {
            $('#error').text("Whoops: " + textStatus + " " + errorThrown).slideDown();
          }
        });

        $(this).dialog("close");
      },
      Cancel: function()
      {
        $('#error').text("Cancelled " + ftype.val()).slideDown();
        $(this).dialog("close");
      }
    }
  });

  $("#appdelete").dialog(
  {
    autoOpen: false,
    width: 400,
    position: { my: "left", at: "left", of: $('#container') },
    modal: true,
    dialogClass: "appdelete",
    resizable: false,
    buttons:
    {
      "Delete": function()
      {
        // delete application
        $.ajax({
          url: 'api.php',
          data: "func=delete&id=" + fdindex.val(),
          dataType: 'json',
          success: function(data)
          {
            $('#find').trigger('click');
            $('#error').text("Application " + data['result']).slideDown();
          },
          error: function(jqXHR,textStatus,errorThrown)
          {
            $('#error').text("Whoops: " + textStatus + " " + errorThrown).slideDown();
          }
        });

        $(this).dialog("close");
      },
      Cancel: function()
      {
        $('#error').text("Delete cancelled").slideDown();
        $(this).dialog("close");
      }
    }
  });

  // login button click handler
  $("#login").click(function()
  {
    document.location.href='secure/login.htm';
  });

  // new button click handler
  $("#new").click(function()
  {
    $('#error').hide();

    allfields.val('');
    ftype.val("new");
    fcode.val('S/');
    $("#appedit").dialog("option", { title: "New Application" }).dialog("open");
  });

  // find button click handler
  $("#find").click(function()
  {
    // tidy up old display items
    $('#application').hide();
    $('#error').hide();

    // clear out old data
    $('#apptable').dataTable().fnClearTable();

    // build ajax query
    var street = $("#street option:selected").attr("value");
    var location = $("#number option:selected").attr("value");
    var apptype = $("#type option:selected").attr("value");
    var year = $("#year option:selected").attr("value");
    var month = $("#month option:selected").attr("value");
    var myear = $("#mtngyear option:selected").attr("value");
    var mmonth = $("#mtngmonth option:selected").attr("value");

    var query = "func=list";

    if (location=='*')
    {
      if (street!='*')
      {
        query += "&street="+street;
      }
    }
    else
    {
      query += "&location="+location;
    }
    if (apptype!='*')
    {
      query += "&apptype="+apptype;
    }

    if (year!='*')
    {
      query += "&year="+year;
      if (month!='*')
      {
        query += "&month="+month;
      }
    }

    if (myear!='*')
    {
      query += "&myear="+myear;
      if (mmonth!='*')
      {
        query += "&mmonth="+mmonth;
      }
    }

    // $('#error').text("Query: " + query).slideDown();

    $.ajax({
      url: 'api.php',
      data: query,
      dataType: 'json',
      success: function(data)
      {
        // fill in new
        for (var r=0; r<data.length; r++)
        {
          var address = data[r]['number'] + " " + data[r]['name'];
          $('#apptable').dataTable().fnAddData([ data[r]['id'], data[r]['code'], address, data[r]['date'], data[r]['label'], getRecommend(data[r]['wpc']) ]);
          $('#apptable').dataTable().$('tr').click(ClickRow);
        }

        $('#list').slideDown();
      },
      error: function(jqXHR,textStatus,errorThrown)
      {
        $('#error').text("Whoops: " + textStatus + " " + errorThrown).slideDown();
      }
    });

  });

  // row click handler
  function ClickRow()
  {
    // tidy up old display items
    $('#error').hide();

    // find row which was clicked
    var rowdata = $('#apptable').dataTable().fnGetData(this);

    // store index in forms for use by dialogue handlers
    findx.val(rowdata[0]);
    fdindex.val(rowdata[0]);

    // force this to happen, not sure why it is different to updating later
    $('#app_wpc').text("");
    $('#app_scdc').text("");
    $('#app_appeal').text("");

    // and use it in ajax query
    $.ajax({
      url: 'api.php',
      data: "func=get&id="+rowdata[0],
      dataType: 'json',
      success: function(data)
      {
        $('#app_link').text(data['code']);
        $('#app_link').attr('href',scdcQuery + data['code']);
        $('#app_date').text(data['date']);
        $('#app_addr').text(data['number'] + " " + data['name']);
        $('#app_label').text(data['label']);
        $('#app_desc').text(data['appdesc']);
        $('#app_wpc').text(getRecommend(data['wpc']));
        if (data['meeting']!="0000-00-00")
        {
          $('#app_meeting').text(data['meeting'] + " " + data['item']);
        }
        else
        {
          $('#app_meeting').text("");
        }
        $('#app_scdc').text(getDecision(data['scdc']));
        $('#app_appeal').text(getDecision(data['appeal']));

        $('#application').show();

        // initialise map after div holding it is made visible
        // otherwise the width and height of (0,0) upset its calculations
        if (!map)
        {
          map = initMap();
          mapMark = new google.maps.Marker({map:map});
        }

        // edit button click handler
        $("#edit").button().click(function()
        {
          ftype.val("edit");
          fcode.val(data['code']);
          fdate.val(data['date']);
          fnmbr.val(data['number']);
          fstrt.val(data['name']);
          flabl.val(data['label']);
          fdesc.val(data['appdesc']);
          fwpcr.val(data['wpc']);
          fmtng.val(data['meeting']);
          fitem.val(data['item']);
          fscdc.val(data['scdc']);
          fappl.val(data['appeal']);
          $("#appedit").dialog("option", { title: "Edit Application" }).dialog("open");
        });

        // delete button click handler
        $("#delete").button().click(function()
        {
          $('#delmessage').text("This will delete " + data['code'] + " for " + data['number'] + " " + data['name']);
          $('#appdelete').dialog("option", { title: "Are you sure?" }).dialog("open");
        });

        // use stored data or look it up and store it 
        if ((data['geolat']!=null) & (data['geolng']!=null))
        {
          var mapSpot = new google.maps.LatLng(data['geolat'],data['geolng']);
          map.setCenter(mapSpot);
          mapMark.setMap(map);
          mapMark.setPosition(mapSpot);
        }
        else
        {
          mapMark.setMap(null);
          var geocoder = new google.maps.Geocoder();
          geocoder.geocode( { 'address': data['number'] + " " + data['name'] + " willingham" }, function(results, status)
          {
            if (status == google.maps.GeocoderStatus.OK)
            {
              map.setCenter(results[0].geometry.location);
              mapMark.setMap(map);
              mapMark.setPosition(results[0].geometry.location);

              var query = "func=geocode&id=" + data['address'];
              query += "&lat=" + results[0].geometry.location.lat();
              query += "&lng=" + results[0].geometry.location.lng();
              $.ajax({
                url: 'api.php',
                data: query,
                dataType: 'json'
              });
            }
          });
        }
      },
      error: function(jqXHR,textStatus,errorThrown)
      {
        $('#error').text("Whoops: " + textStatus + " " + errorThrown).show();
      }
    });

  }

});
