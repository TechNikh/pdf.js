var dict;
var dictWiki;
var dictHead;
var dictDesc;
var dictLink;
var dictMeaning;
var dictMeaningHead;
var dictMeaningList;

var viewer;

var xOffset;
var yOffset;

var lastMove = null;

function getSelectedText(){
	if (window.getSelection) {
        return window.getSelection().toString();
    } else if (document.selection) {
        return document.selection.createRange().text;
    }
    return '';
}

function removeSelection(){
	if (window.getSelection) {
	  if (window.getSelection().empty) {  // Chrome
	    window.getSelection().empty();
	  } else if (window.getSelection().removeAllRanges) {  // Firefox
	    window.getSelection().removeAllRanges();
	  }
	} else if (document.selection) {  // IE
	  document.selection.empty();
	}
}

function isOnLeft(e){
 var pWidth = $(window).width(); //use .outerWidth() if you want borders
   var x = e.pageX;
    if(pWidth/2 > x)
        return 1; // left side
    else
        return 0; // right side
}

function isOnUp(e){
 var pHeight = $(window).height(); //use .outerHeight() if you want borders
   var y = e.pageY;
    if(pHeight/2 > y)
        return 1; // up side
    else
        return 0; // down side
}

function setoffsets(event){
	if(isOnLeft(event)){
		xOffset = 0;
	} else {
		xOffset = -1*($(window).width())/2;
	}

	if(isOnUp(event)){
		yOffset = 10;
	} else {
		yOffset = -1*($(window).height())/2.8;
	}
}

function findGetParameter(parameterName) {
    var result = null,
        tmp = [];
    var items = location.search.substr(1).split("&");
    for (var index = 0; index < items.length; index++) {
        tmp = items[index].split("=");
        if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
    }
    return result;
}

function showPopUp(event){
	console.log("Triggered");
	setoffsets(event);
		
		var selectedText = $.trim(getSelectedText());
		var selectedTextLen = selectedText.split(" ").length;
		console.log(selectedTextLen);
		console.log(selectedText.split(" "));
		var posX = event.pageX;
		var posY = event.pageY;
		console.log(posX + " " + posY);
		if(selectedText.localeCompare("") && selectedTextLen <= 2){
			console.log(selectedText);

			dictHead.html("");
			dictDesc.html("");
			dictLink.html("");
			dictMeaningHead.html("");
			dictMeaningList.html("");

			// Handling user supplied lang GET param
			var langParam = "en";
			var userSuppliedParam = findGetParameter("lang");
			if(userSuppliedParam!=null){
				langParam = userSuppliedParam;
			}

			$.ajax({
		        type: "POST",
		        url: "http://"+langParam+".wikipedia.org/w/api.php?action=opensearch&format=json&prop=text&section=0&"+ "&search="+selectedText+"&limit=1" +"&callback=?",
		        contentType: "application/json; charset=utf-8",
		        async: false,
		        dataType: "json",
		        success: function (data, textStatus, jqXHR) {
		            console.log(JSON.stringify(data));
		            var len = data.length;
		            var heading = data[len-3];
		            var description = data[len-2];
		            var link = data[len-1];
		            console.log("Head: " + heading);
		            console.log("Desc: " + description);
		            console.log("link: " + link);
		            console.log(description);
		            
	            	console.log("empty 0");
	            	dict.css({
		           		display:'inline-block',
						top: posY+yOffset,
						left: posX+xOffset
					});

					dictHead.html("Wikipedia: " + heading);
					dictDesc.html(description);
					if(dictDesc.html() == ""){
						dictDesc.html("No description found!");
					}
					dictLink.html('<a target="_blank" href="'+link+'">'+'Wikipedia link'+'</a>');
					dictLink.find('a').css({
						'text-decoration':'none',
						color: '#212121'
					});
	            

		        },
		        error: function (errorMessage) {
		        }
		    });

		    $.get( "http://api.pearson.com/v2/dictionaries/wordwise/entries?headword="+selectedText, function( data ) {
			  console.log(JSON.stringify(data));
			  var results = data.results;

			  var meanings = [];
			  for(var i=0; i<results.length; i++){
			  	try{
			  		meanings.push(results[i].senses[0].definition);
			  	}catch(e){}
			  }

			  var meaningList = "";
			  for(var i=0;i<meanings.length;i++){
			  	console.log(meanings[i]);
			  	if(meanings[i] == "")
			  		continue;
			  	meaningList = meaningList + "<li>"+meanings[i]+"</li>";
			  }

			dict.css({
           		display:'inline-block',
				top: posY+yOffset,
				left: posX+xOffset
			});

			  if(meanings.length!=0){
			  	console.log("empty 0 here");
			  } else {
			  	meaningList = "<li>No dictionary meaning found!</li>";
			  }
			  dictMeaningHead.html("Dictionary");
			  dictMeaningList.html(meaningList);
			});

		}else {
			dict.css('display', 'none');
		}
}

$(document).ready(function() {
	viewer = $('#viewer');
	console.log(viewer[0]);

	// HTML elements
	$('#outerContainer').append(
		'<div id="dict">'+
			'<div id="wiki">'+
				'<div id="dict_heading"><h3></h3></div>'+
				'<div id="dict_description"></div>'+
				'<div id="dict_link"></div>'+
			'</div>'+
			'<div id="dict_meaning">'+
				'<h3></h3>'+
				'<ul>'+
				'</ul>'+
			'</div>'+
		'</div>');
	 dict = $('#dict');
	 dictWiki = $('#wiki');
	 dictHead = $('#dict_heading').find('h3');
	 dictDesc = $('#dict_description');
	 dictLink = $('#dict_link');
	 dictMeaning = $('#dict_meaning');
	 dictMeaningHead = $('#dict_meaning').find('h3');
	 dictMeaningList = $('#dict_meaning').find('ul');
	

	 // Styling starts here
	$('#dict').css({
		background: 'rgb(54, 25, 25)',
		background: 'rgba(54, 25, 25, .00004)',
		color: '#424242',
		position: 'absolute',
		'z': '10',
		height: '30%',
		width: '50%',
		'display': 'none',
		'font-size': '1em'
	});

	dictWiki.css({
		background: '#fafafa',
		padding: '1%',
		width: '47%',
		height: '100%',
		float: 'left',
		'overflow-x': 'scroll',
		'overflow-y': 'scroll'
	});

	dictHead.css({
		'font-size': '1.2em'
	});

	dictDesc.css({
		padding: '10px'
	});

	dictLink.css({
		padding: '10px',
	});

	dictMeaning.css({
		background: '#fafafa',
		padding: '1%',
		width: '47%',
		'margin-left': '2%',
		float: 'right',
		height: '100%',
		'overflow-x': 'scroll',
		'overflow-y': 'scroll'
	});

	dictMeaningHead.css({
		'font-size': '1.2em'
	});

	dictMeaningList.css({
		'margin-left': '10px',
		padding: '10px'
	});

	// Events
	$('#viewer').on('mouseup',function(event){
		showPopUp(event);
	});

	// Mobile touch events starts here

	$('#viewer').on('touchend',function(e){
		var event = lastMove.originalEvent;
		showPopUp(event.touches[0]);
	});

	$('#viewer').on('touchstart',function(event){
		removeSelection(); // Selection text remains. So to prevent again showing pop up
		lastMove = event;
	});
});