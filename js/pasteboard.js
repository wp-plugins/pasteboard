var paste = '';

function pasteBoard(event){
	var items     = (event.clipboardData || event.originalEvent.clipboardData).items;
	var blob      = items[0].getAsFile();
	if(blob){
		var reader    = new FileReader();

		reader.onload = function(event){
		  	paste = event.target.result;
			tb_show("PasteBoard", "../?pasteboard=editor&width=753&height=550");

			setTimeout(function(){
				onPasteProcess();
			},500);
		}

		reader.readAsDataURL(blob);
	}
}

function onPasteBoardInit(){
    tinyMCE.activeEditor.getDoc().onpaste = function(event){
		pasteBoard(event);
	};
}

jQuery( document ).ready(function() {

	document.onpaste = function(event){
		pasteBoard(event);
	}

	setTimeout(function(){
		onPasteBoardInit();
	},500);

});