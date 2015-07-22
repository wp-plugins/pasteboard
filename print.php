<?php

/*
Plugin Name: PasteBoard
Version: 1.1
Plugin URI: http://imagets.com
Description: You can paste all images from your desktop easily. Paste your snapshots all region from photoshop. No need to upload images, just paste to your editor. You can crop images before paste.
Author: ImageTS
Author URI: http://imagets.com
*/

//Init functions
add_filter('query_vars',            'pasteboard_trigger');
add_action('template_redirect',     'pasteboard_request');
add_action('admin_footer',          'pasteboard_footer');
add_action('admin_enqueue_scripts', 'pasteboard_post');
add_action('admin_print_scripts',   'pasteboard_scripts' );

//Init Variables
$plugin_url = plugins_url() . "/pasteboard/";

function pasteboard_trigger($vars){$vars[] = 'pasteboard';return $vars;}

function pasteboard_scripts(){
	global $post;
	global $plugin_url;

	echo "<script type='text/javascript'>\n";
	echo 'var post_id    = "'.$post->ID .'";';
	echo 'var plugin_url = "'.$plugin_url .'";';
	echo "\n</script>";
}

function pasteboard_request(){
	global $plugin_url;

	if (current_user_can( 'manage_options' )) {
		switch (get_query_var('pasteboard')) {
			case "editor":
				do_action('admin_print_scripts');
			    ?>
				<ul id="tabs">
					<li tab="board" class="active">Board</li>
					<li tab="settings">Settings</li>
				</ul>

				<div class="pasteBoard">
					<div id="pasteboard_board" class="pasteboard_tab">
						<canvas style="display:none" id="cropped"></canvas>
						<div id="board">
							<img id="screenshot_paste" src="">
						</div>

						<form action="javascript:appendText()" method="post" id="footer-menu">
							<input id="pasteTitle" placeholder="Enter title for image">
							<button id="appendButton" class="btn-primary" onclick="appendText();">Add to text</button>
							<button class="btn-danger" onclick="cancelPaste();">Cancel</button>
						</form>
					</div>

					<div id="pasteboard_settings" class="pasteboard_tab">
						<ul>
							<li><field>Image Quality :</field> <input id="pasteboard_quality" value="75" placeholder="0-100" type="number"></li>
						</ul>
					</div>
				</div>
			    <?php
			    exit;
			    break;
			case "paste":

				require_once(ABSPATH . "wp-admin" . '/includes/image.php');
		    	require_once(ABSPATH . "wp-admin" . '/includes/file.php');
		    	require_once(ABSPATH . "wp-admin" . '/includes/media.php');

			    $post_id = @$_GET['post_id'];
			    $img     = @$_POST['imageData'];

				$upload_dir  = wp_upload_dir();
				$upload_path = str_replace( '/', DIRECTORY_SEPARATOR, $upload_dir['path'] ) . DIRECTORY_SEPARATOR;

				$img = str_replace('data:image/jpeg;base64,', '', $img);
				$img = str_replace(' ', '+', $img);
		 
				$decoded          = base64_decode($img) ;
				$filename         = 'print_screen.jpg';
				$hashed_filename  = md5( $filename . microtime() ) . '_' . $filename;
				$image_upload     = file_put_contents( $upload_path . $hashed_filename, $decoded );

				$file             = array();
				$file['tmp_name'] = $upload_path . $hashed_filename;
				$file['name']     = $hashed_filename;
		 
				$image_id = media_handle_sideload( $file, $post_id, @$_POST["title"]);
				add_post_meta($image_id, '_thumbnail_id', $image_id, true);

				ob_clean(); 
				header('HTTP/ 200');
				echo wp_get_attachment_image( $image_id, 'full' ).'<br>';
				exit;
			    break;
		}
	}
}

function pasteboard_post($page){
    if ($page !== 'post-new.php' && $page !== 'post.php') return;

	add_thickbox();
	wp_enqueue_style(  'pasteboard_board_style', plugins_url('css/style.css', __file__));
	wp_enqueue_script( 'pasteboard_paste_popup',  plugins_url('js/paste_popup.js',     __file__) );
	wp_enqueue_script( 'pasteboard_js',   plugins_url('js/pasteboard.js',     __file__), null, null, true );
	wp_enqueue_script( 'pasteboard_crop', plugins_url('js/jcrop.js', __file__), null, null, true );
}

?>