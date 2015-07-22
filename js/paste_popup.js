var coords = [0,0,0,0];

function onPasteProcess(){
	try {
		jQuery("#screenshot_paste").attr("src", paste);

		try {
	    	jQuery('#screenshot_paste').Jcrop({onSelect: updateCoords});
		}catch(err) {
			
		}

		jQuery("#tabs li").each(function(){
			jQuery(this).click(function(){
				pasteboard_Tab(jQuery(this).attr("tab"));
			});
		});

		if(parseInt(readCookie('pasteboard_quality'))>0){
			jQuery("#pasteboard_quality").val(readCookie('pasteboard_quality'));
		}
	}catch(rootError) {
		alert(rootError);
	}
}

function updateCoords(c){
		coords[0] = c.x;
		coords[1] = c.y;
		coords[2] = c.w;
		coords[3] = c.h;
};

function createCookie(name,value,days) {
	if (days) {
		var date = new Date();
		date.setTime(date.getTime()+(days*24*60*60*1000));
		var expires = "; expires="+date.toGMTString();
	}
	else var expires = "";
	document.cookie = name+"="+value+expires+"; path=/";
}

function readCookie(name) {
	var nameEQ = name + "=";
	var ca = document.cookie.split(';');
	for(var i=0;i < ca.length;i++) {
		var c = ca[i];
		while (c.charAt(0)==' ') c = c.substring(1,c.length);
		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
	}
	return null;
}

function addImages(data){

	if( ! tinyMCE.activeEditor || tinyMCE.activeEditor.isHidden()) {
		jQuery('textarea#content').val(jQuery('textarea#content').val() + data);
	} else {
		tinyMCE.execCommand('mceInsertRawHTML', false, data);
	}

	tb_remove();
}

function appendText(){
	try {
		var imageData = getCrop(coords[0],coords[1],coords[2],coords[3]);
		jQuery("button").prop('disabled', true);
		jQuery("#appendButton").text("Please Wait");
		jQuery.post( "../?pasteboard=paste", { post_id: post_id, title : jQuery("#pasteTitle").val(), x:coords[0],y:coords[1],w:coords[2],h:coords[3], imageData: imageData }, function(data){
			addImages(data);
		});
	}catch(rootError) {
		alert(rootError);
	}
}

function getCrop(x,y,w,h){
	var pasteboard_quality = jQuery("#pasteboard_quality").val();

		if(parseInt(pasteboard_quality)>0){
			createCookie('pasteboard_quality', pasteboard_quality);
		}

	var image  = document.getElementById("screenshot_paste");
	var paste_width = image.naturalWidth/753;
	var paste_height = image.naturalHeight/427;

	if(!x || !y){
		var canvas = jQuery("#cropped");
			canvas.prop("width",  image.naturalWidth);
			canvas.prop("height", image.naturalHeight);

		var canvas = canvas[0];
		var c_cont = canvas.getContext("2d");

		c_cont.drawImage(image, 0, 0);
	}else{
		var canvas = jQuery("#cropped");
			canvas.prop("width",  w*paste_width);
			canvas.prop("height", h*paste_height);

		var canvas = canvas[0];
		var c_cont = canvas.getContext("2d");

		c_cont.drawImage(image, (-1)*x*paste_width, (-1)*y*paste_height);
	}

	return canvas.toDataURL("image/jpeg", parseInt(pasteboard_quality)/100);
}

function pasteboard_Tab(val){
	jQuery(".pasteboard_tab").hide();
	jQuery("#pasteboard_" + val).show();
	jQuery("#tabs li").removeClass("active");
	jQuery("#tabs li[tab='" + val + "']").addClass("active");
}

function cancelPaste(){
	tb_remove();
}