/** -------------- Wistia API ---------------------*/

function UGWistiaAPI(){
	
	this.isAPILoaded = false;
	var t = this, g_objThis = jQuery(this), g_intHandle;
	var g_player, g_isPlayerReady = false;
	
	this.events = {
			START_PLAYING: "start_playing",
			STOP_PLAYING: "stop_playing",
			VIDEO_ENDED: "video_ended"
	};

	
	/**
	 * check if sound cloud active
	 */
	function isWistiaActive(){
		
		return(typeof Wistia != "undefined");	
	}
	
	/**
	 * load vimeo API
	 */
	this.loadAPI = function(){
		
		if(g_ugWistiaAPI.isAPILoaded == true)
			return(true);

		if(isWistiaActive()){
			g_ugWistiaAPI.isAPILoaded = true;
			return(true);
		}
		
		g_ugFunctions.loadJs("fast.wistia.com/assets/external/E-v1.js", true);
		
		g_ugWistiaAPI.isAPILoaded = true;		
	}

	
	/**
	 * actually put the video
	 */
	function putVideoActually(divID, videoID, width, height, isAutoplay){
		
		g_player = null;
		g_isPlayerReady = false;
		
		var htmlID = divID + "_video";
		
		var html = "<div id='"+htmlID+"' class='wistia_embed' style='width:"+width+";height:"+height+";' data-video-width='"+width+"' data-video-height='"+height+"'>&nbsp;</div>";
				
		jQuery("#"+divID).html(html);
		
		g_player = Wistia.embed(videoID, {
			  version: "v1",
			  videoWidth: width,
			  videoHeight: height,
			  container: htmlID,
			  autoPlay: isAutoplay
		});
				
		g_isPlayerReady = true;
				
		initEvents();
	}
	
	
	/**
	 * init events
	 */
	function initEvents(){
		
		//set "play" event
		
		g_player.bind('play', function(){
			g_objThis.trigger(t.events.START_PLAYING);
		});
		
		//set "pause event"
		g_player.bind('pause', function(){
			g_objThis.trigger(t.events.STOP_PLAYING);
		});
		
		g_player.bind('end', function(){
			g_objThis.trigger(t.events.STOP_PLAYING);
			g_objThis.trigger(t.events.VIDEO_ENDED);
		});
		
	}
	
	
	/**
	 * do some command
	 */
	this.doCommand = function(command){
		
		if(g_player == null)
			return(false);
		
		if(g_isPlayerReady == false)
			return(false);
		
		switch(command){
			case "play":
				g_player.play();
			break;
			case "pause":
				g_player.pause();
			break;		
		}
		
	}
	
	/**
	 * do pause command
	 */
	this.pause = function(){
		t.doCommand("pause");
	}
	
	/**
	 * do play command
	 */
	this.play = function(){
		t.doCommand("play");
	}
	
	
	/**
	 * put the vimeo video
	 */
	this.putVideo = function(divID, videoID, width, height, isAutoplay){
		
		if(isWistiaActive()){
			putVideoActually(divID, videoID, width, height, isAutoplay);
			return(true);
		}
		
		
		//if no API present, wait for the API being ready
		this.loadAPI();
		g_intHandle = setInterval(function(){
			
			if(isWistiaActive()){
				putVideoActually(divID, videoID, width, height, isAutoplay);
				clearInterval(g_intHandle);
			}
			
		}, 500);
		
	}
	
	
	/**
	 * get if the player is ready
	 */
	this.isPlayerReady = function(){
				
		if(g_isPlayerReady && g_player)
			return(true);
	
		return(false);
	}	
	
	
}

/** -------------- Sound Cloud API ---------------------*/

function UGSoundCloudAPI(){
	
	this.isAPILoaded = false;
	var t = this, g_objThis = jQuery(this), g_intHandle;
	var g_player, g_lastContainerID;
	
	this.events = {
			START_PLAYING: "start_playing",
			STOP_PLAYING: "stop_playing",
			VIDEO_ENDED: "video_ended"
	};

	/**
	 * check if sound cloud active
	 */
	function isSCActive(){
		
		return(typeof SC != "undefined");	
	}
	
	/**
	 * load vimeo API
	 */
	this.loadAPI = function(){
		
		if(g_ugSoundCloudAPI.isAPILoaded == true)
			return(true);
				
		if(isSCActive()){
			g_ugSoundCloudAPI.isAPILoaded = true;
			return(true);
		}
		
		g_ugFunctions.loadJs("w.soundcloud.com/player/api.js", true);
		
		g_ugSoundCloudAPI.isAPILoaded = true;		
	}
	
	/**
	 * actually put the video
	 */
	function putSoundActually(divID, trackID, width, height, isAutoplay){
		
		g_player = null;
		g_isPlayerReady = false;
		
		var iframeID = divID+"_iframe";
		
		var url = location.protocol+"//w.soundcloud.com/player/?url=http://api.soundcloud.com/tracks/"+trackID;
		url += "&amp;buying=false&amp;liking=false&amp;download=false&amp;sharing=false&amp;show_artwork=true&show_comments=false&amp;show_playcount=true&amp;show_user=false&amp;hide_related=true&amp;visual=true&amp;start_track=0&amp;callback=true";
		
		if(isAutoplay === true)
			url += "&amp;auto_play=true";
		else
			url += "&amp;auto_play=false";
		
		var html = "<iframe id='"+iframeID+"' src="+url+" width='"+width+"' height='"+height+"' frameborder='0' scrolling='no' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
		
		jQuery("#"+divID).html(html);
		
		//get the player object
		g_player = SC.Widget(iframeID);
		
		g_player.bind(SC.Widget.Events.READY, function() {
			
			if(g_player){
				g_isPlayerReady = true;
				initEvents();
			}
			
		});
		
		g_lastContainerID = divID;
	}

	
	/**
	 * init events
	 */
	function initEvents(){
		
		
		//set "play" event
		g_player.bind(SC.Widget.Events.PLAY, function(){
			g_objThis.trigger(t.events.START_PLAYING);
		});
		
		//set "pause event"
		g_player.bind(SC.Widget.Events.PAUSE, function(){
			g_objThis.trigger(t.events.STOP_PLAYING);
		});
		
		g_player.bind(SC.Widget.Events.FINISH, function(){
			g_objThis.trigger(t.events.STOP_PLAYING);
			g_objThis.trigger(t.events.VIDEO_ENDED);
		});
		
	}
		
	
	/**
	 * put the youtube video
	 */
	this.putSound = function(divID, trackID, width, height, isAutoplay){
		
		if(isSCActive()){
			putSoundActually(divID, trackID, width, height, isAutoplay);
			return(true);
		}
		
		
		//if no API present, wait for the API being ready
		this.loadAPI();
		g_intHandle = setInterval(function(){
			
			if(isSCActive()){
				putSoundActually(divID, trackID, width, height, isAutoplay);
				clearInterval(g_intHandle);
			}
			
		}, 500);
		
	}
	

	/**
	 * do some command
	 */
	this.doCommand = function(command){
		
		if(g_player == null)
			return(false);
		
		if(g_isPlayerReady == false)
			return(false);
		
		switch(command){
			case "play":
				g_player.play();
			break;
			case "pause":
				g_player.pause();
			break;
		}
		
	}	
	
	
	/**
	 * pause video
	 */
	this.pause = function(){
		t.doCommand("pause");
	}
	
	
	/**
	 * play video
	 */
	this.play = function(){
		t.doCommand("play");
	}
	
	/**
	 * destroy the player
	 */
	this.destroy = function(){
		
		g_isPlayerReady = false;
		g_player = null;
		
		if(g_lastContainerID){
			jQuery("#" + g_lastContainerID).html("");
			g_lastContainerID = null;
		}
		
	}
	
}

/** -------------- html5 Video API ---------------------*/

function UGHtml5MediaAPI(){
	
	this.isAPILoaded = false;
	var t = this, g_objThis = jQuery(this), g_intHandle;
	var g_player;
	
	this.events = {
			START_PLAYING: "start_playing",
			STOP_PLAYING: "stop_playing",
			VIDEO_ENDED: "video_ended"
	};
	
	/**
	 * load vimeo API
	 */
	this.loadAPI = function(){
		
		if(g_ugHtml5MediaAPI.isAPILoaded == true)
			return(true);
		
		
		if(isMediaElementActive()){
			g_ugHtml5MediaAPI.isAPILoaded = true;
			return(true);
		}
		
		g_ugFunctions.loadJs("cdnjs.cloudflare.com/ajax/libs/mediaelement/2.18.1/mediaelement.min.js", true);
		g_ugFunctions.loadCss("cdnjs.cloudflare.com/ajax/libs/mediaelement/2.18.1/mediaelementplayer.min.css", true);
		
		g_ugHtml5MediaAPI.isAPILoaded = true;		
	}
	
	/**
	 * return true if the mediaelement is active
	 */
	function isMediaElementActive(){
				
		return(typeof mejs != "undefined");
	}
	
	
	/**
	 * actually put the video
	 */
	function putVideoActually(divID, data, width, height, isAutoplay){
		
		g_player = null;
		g_isPlayerReady = false;
		
		var urlFlash = location.protocol + "//cdnjs.cloudflare.com/ajax/libs/mediaelement/2.18.1/flashmediaelement-cdn.swf";
		var urlSilverlight = location.protocol + "//cdnjs.cloudflare.com/ajax/libs/mediaelement/2.18.1/silverlightmediaelement.xap";

		var htmlID = divID + "_video";
		var htmlAutoplay = "";
		if(isAutoplay && isAutoplay === true)
			htmlAutoplay = "autoplay='autoplay'"
		
		var htmlPoster = "";
		if(data.posterImage)
			htmlPoster = "poster='"+data.posterImage+"'";
		
		var html = "<video id='"+htmlID+"' width='"+width+"' height='"+height+"'  controls='controls' preload='none' "+htmlAutoplay+" "+htmlPoster+">";
				
		if(data.mp4 != "")
			html += "<source type='video/mp4' src='"+data.mp4+"' />";
		
		if(data.webm != "")
			html += "<source type='video/webm' src='"+data.webm+"' />";

		if(data.ogv != "")
			html += "<source type='video/ogg' src='"+data.ogv+"' />";
		 
		html +=  "<object width='"+width+"' height='"+height+"' type='application/x-shockwave-flash' data='"+urlFlash+"'>";
		html +=  "<param name='movie' value='"+urlFlash+"' />";
		html +=  "<param name='flashvars' value='controls=true&file="+data.mp4+"' />";
		html +=  "</object>";
		
		html += "</video>";
		
		jQuery("#"+divID).html(html);
		
		new MediaElement(htmlID, {			
		    enablePluginDebug: false,
		    flashName: urlFlash,
		    silverlightName: urlSilverlight,
		    success: function (mediaElement, domObject) { 
		    	g_isPlayerReady = true;
		    	g_player = mediaElement;
		    			    	
		    	if(isAutoplay == false)
		    		g_player.pause();
		    	
		    	initEvents();
		    },
		    error: function (objError) { 
		    	trace(objError);
		    }
		});		
		
	}
	
	
	/**
	 * init player events function
	 */
	function initEvents(){
		
		g_ugFunctions.addEvent(g_player, "play", function(){
			g_objThis.trigger(t.events.START_PLAYING);
		});
		
		g_ugFunctions.addEvent(g_player, "pause", function(){
			g_objThis.trigger(t.events.STOP_PLAYING);
		});
		
		g_ugFunctions.addEvent(g_player, "ended", function(){
			g_objThis.trigger(t.events.STOP_PLAYING);
			g_objThis.trigger(t.events.VIDEO_ENDED);
		});
		
	}
	
	
	/**
	 * put the vimeo video
	 */
	this.putVideo = function(divID, data, width, height, isAutoplay){
		
		if(isMediaElementActive()){
			putVideoActually(divID, data, width, height, isAutoplay);
			return(true);
		}
		
		
		//if no API present, wait for the API being ready
		this.loadAPI();
		g_intHandle = setInterval(function(){
			
			if(isMediaElementActive()){
				putVideoActually(divID, data, width, height, isAutoplay);
				clearInterval(g_intHandle);
			}
			
		}, 500);
		
	}

	/**
	 * do some command
	 */
	this.doCommand = function(command){
				
		if(g_player == null)
			return(false);
		
		if(g_isPlayerReady == false)
			return(false);
		
		switch(command){
			case "play":
				g_player.play();
			break;
			case "pause":
				g_player.pause();
			break;
		}
		
	}	
	
	
	/**
	 * pause video
	 */
	this.pause = function(){
		t.doCommand("pause");
	}
	
	
	/**
	 * play video
	 */
	this.play = function(){
		t.doCommand("play");
	}
	
}


/** -------------- VK API class ------------------------*/

function UGVkAPI(){

	this.isAPILoaded = false;

	var t = this, g_objThis = jQuery(this), g_intHandle;
	var g_player = null, g_isPlayerReady = false, g_lastContainerID;

	this.events = {
			START_PLAYING: "start_playing",
			STOP_PLAYING: "stop_playing",
			VIDEO_ENDED: "video_ended"
	};

	/**
	 * load vk API
	 */
	this.loadAPI = function(){

		if(g_ugVkAPI.isAPILoaded == true)
			return(true);

		g_ugVkAPI.isAPILoaded = true;
	}

	/**
	 * actually put the video
	 */
	function putVideoActually(divID, videoID, width, height, isAutoplay){

		g_player = null;
		g_isPlayerReady = false;

		var url = location.protocol+"//vk.com/video_ext.php?";
		var vid = videoID.split('_');

		var html = '';
		var style = "margin: 0; padding: 0; background-color: transparent;";

		var iframeID = divID + "_iframe";
		var iframe = null;
		var g_document = null;

		url += 'oid=' + encodeURIComponent(vid[0]);
		url += '&amp;id=' + encodeURIComponent(vid[1]);
		url += '&amp;hash=' + encodeURIComponent(vid[2]);

		if(isAutoplay === true)
			url += "&amp;autoplay=1";

		html = "<iframe id='" + iframeID + "' width='" + width + "' height='" + height + "' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";

		jQuery("#"+divID).html(html);

		html  = "<html style='" + style + "'>";
		html += "<head>";
		html += "<script type='text/javascript'>";
		html += "var p_window = null;";
		html += "function onIframeLoad(o){ p_window = o; };";
		html += "</script>";
		html += "</head>";
		html += "<body style='" + style + "'>";
		html += "<iframe onload='onIframeLoad(this)' src='" + url + "' width='" + width + "' height='" + height + "' style='" + style + "' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
		html += "</body>";
		html += "</html>";

		iframe = jQuery('#' + iframeID).get(0);

		if(iframe.contentDocument) {
			g_document = iframe.contentDocument;
		}
		else if (iframe.contentWindow) {
			g_document = iframe.contentWindow.document;
		}
		else {
			g_document = iframe.document;
		};

		if (g_document) {
			g_document.open();
			g_document.writeln(html);
			g_document.close();
			g_player = jQuery("#"+iframeID)[0].contentWindow;
			initEvents();
		};

		g_lastContainerID = divID;
	}

	/**
	 * init player events function
	 */
	function initEvents(){

		/**
		 * this procedure is a stub, while VK makes the API
		 */

		if(!g_player)
			return(false);

		g_isPlayerReady = true;

		g_ugFunctions.addEvent(g_player, "message", function(e){

			//console.log('<' + g_lastContainerID + '> ' + e.data);

		});

	}

	/**
	 * put the vk video
	 */
	this.putVideo = function(divID, data, width, height, isAutoplay){

		putVideoActually(divID, data, width, height, isAutoplay);
		return(true);

	}

	/**
	 * do some command
	 */
	this.doCommand = function(command){

		if((g_player == null) || (!g_player.p_window))
			return(false);

		if(g_isPlayerReady == false)
			return(false);

		switch(command){
			case "play":
				g_player.p_window.contentWindow.postMessage('video_play', '*');
			break;
			case "pause":
				g_player.p_window.contentWindow.postMessage('video_pause', '*');
			break;
		}

	}

	/**
	 * pause video
	 */
	this.pause = function(){
		t.doCommand("pause");
	}

	/**
	 * play video
	 */
	this.play = function(){
		t.doCommand("play");
	}

	/**
	 * destroy the player and empty the div
	 */
	this.destroy = function(){

		g_player = null;
		g_isPlayerReady = false;

		if(g_lastContainerID)
			jQuery("#" + g_lastContainerID).html("");

	}

}

/** -------------- Dailymotion API ---------------------*/

function UGDailymotionAPI(){

	this.isAPILoaded = false;

	var t = this, g_objThis = jQuery(this), g_intHandle;
	var g_player = null, g_isPlayerReady = false, g_lastContainerID;

	this.events = {
			START_PLAYING: "start_playing",
			STOP_PLAYING: "stop_playing",
			VIDEO_ENDED: "video_ended"
	};

	/**
	 * check if dailymotion active
	 */
	function isDailymotionActive(){
		return(typeof DM != "undefined");
	}

	/**
	 * load dailymotion API
	 */
	this.loadAPI = function(){

		if(g_ugDailymotionAPI.isAPILoaded == true)
			return(true);

		if(isDailymotionActive()){
			g_ugDailymotionAPI.isAPILoaded = true;
			return(true);
		}

		g_ugFunctions.loadJs("api.dmcdn.net/all.js", true);

		g_ugDailymotionAPI.isAPILoaded = true;
	}

	/**
	 * actually put the video
	 */
	function putVideoActually(divID, videoID, width, height, isAutoplay){

		g_player = null;
		g_isPlayerReady = false;

		var htmlID = divID + "_video";

		var html = "<div id='"+htmlID+"' class='dailymotion_embed' style='width:"+width+";height:"+height+";' data-video-width='"+width+"' data-video-height='"+height+"'>&nbsp;</div>";

		jQuery("#"+divID).html(html);

		g_player = DM.player(jQuery("#"+divID)[0], {
			  video: videoID,
			  width: width,
			  height: height,
			  params: { autoplay: isAutoplay }
		});

		g_lastContainerID = divID;
		g_isPlayerReady = true;
		initEvents();

	}


	/**
	 * init events
	 */
	function initEvents(){

		g_ugFunctions.addEvent(g_player, "playing", function(){
			g_objThis.trigger(t.events.START_PLAYING);
		});

		g_ugFunctions.addEvent(g_player, "pause", function(){
			g_objThis.trigger(t.events.STOP_PLAYING);
		});

		g_ugFunctions.addEvent(g_player, "end", function(){
			g_objThis.trigger(t.events.STOP_PLAYING);
			g_objThis.trigger(t.events.VIDEO_ENDED);
		});

	}


	/**
	 * do some command
	 */
	this.doCommand = function(command){

		if(g_player == null)
			return(false);

		if(g_isPlayerReady == false)
			return(false);

		switch(command){
			case "play":
				g_player.play();
			break;
			case "pause":
				g_player.pause();
			break;
		}

	}

	/**
	 * do pause command
	 */
	this.pause = function(){
		t.doCommand("pause");
	}

	/**
	 * do play command
	 */
	this.play = function(){
		t.doCommand("play");
	}


	/**
	 * put the dailymotion video
	 */
	this.putVideo = function(divID, videoID, width, height, isAutoplay){

		if(isDailymotionActive()){
			putVideoActually(divID, videoID, width, height, isAutoplay);
			return(true);
		}


		//if no API present, wait for the API being ready
		this.loadAPI();
		g_intHandle = setInterval(function(){

			if(isDailymotionActive()){
				putVideoActually(divID, videoID, width, height, isAutoplay);
				clearInterval(g_intHandle);
			}

		}, 500);

	}


	/**
	 * get if the player is ready
	 */
	this.isPlayerReady = function(){

		if(g_isPlayerReady && g_player)
			return(true);

		return(false);
	}


	/**
	 * destroy the player and empty the div
	 */
	this.destroy = function(){

		g_player = null;
		g_isPlayerReady = false;

		if(g_lastContainerID)
			jQuery("#" + g_lastContainerID).html("");

	}

}

/** -------------- Rutube API class --------------------*/

function UGRutubeAPI(){

	this.isAPILoaded = false;

	var t = this, g_objThis = jQuery(this), g_intHandle;
	var g_player = null, g_isPlayerReady = false, g_lastContainerID;

	this.events = {
			START_PLAYING: "start_playing",
			STOP_PLAYING: "stop_playing",
			VIDEO_ENDED: "video_ended"
	};

	/**
	 * load rutube API
	 */
	this.loadAPI = function(){

		if(g_ugRutubeAPI.isAPILoaded == true)
			return(true);

		g_ugRutubeAPI.isAPILoaded = true;
	}

	/**
	 * actually put the video
	 */
	function putVideoActually(divID, videoID, width, height, isAutoplay){

		g_player = null;
		g_isPlayerReady = false;

		var url = location.protocol+"//rutube.ru/play/embed/";
		var vid = videoID.split('_');

		var iframeID = divID + "_iframe";
		var iframe = null;
		var g_document = null;

		var html = '';
		var style = "margin: 0; padding: 0; background-color: transparent;";

		url += vid[0];
		url += "?sTitle=false&sAuthor=false&autoStart=";

		if(isAutoplay === true) { url += "true"; } else { url += "false"; };

		html = "<iframe id='" + iframeID + "' width='" + width + "' height='" + height + "' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";

		jQuery("#"+divID).html(html);

		html  = "<html style='" + style + "'>";
		html += "<head>";
		html += "<script type='text/javascript'>";
		html += "var p_window = null;";
		html += "function onIframeLoad(o){ p_window = o; };";
		html += "</script>";
		html += "</head>";
		html += "<body style='" + style + "'>";
		html += "<iframe onload='onIframeLoad(this)' src='" + url + "' width='" + width + "' height='" + height + "' style='" + style + "' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
		html += "</body>";
		html += "</html>";

		iframe = jQuery('#' + iframeID).get(0);

		if(iframe.contentDocument) {
			g_document = iframe.contentDocument;
		}
		else if (iframe.contentWindow) {
			g_document = iframe.contentWindow.document;
		}
		else {
			g_document = iframe.document;
		};

		if (g_document) {
			g_document.open();
			g_document.writeln(html);
			g_document.close();
			g_player = jQuery("#"+iframeID)[0].contentWindow;
			initEvents();
		};

		g_lastContainerID = divID;
	}

	/**
	 * init player events function
	 */
	function initEvents(){

		if(!g_player)
			return(false);

		g_ugFunctions.addEvent(g_player, "message", function(e){

			var message = jQuery.parseJSON(e.data);

			//if (message.type != 'player:currentTime') { console.log('<' + g_lastContainerID + '> ' + e.data); };

			if (message.type == 'player:ready') {
				g_isPlayerReady = true;
			}
			else if (message.type == 'player:playComplete') {
			}
			else if ((message.type == 'player:changeState') && (message.data.state == 'playing')){
				g_isPlayerReady = true;
				g_objThis.trigger(t.events.START_PLAYING);
			}
			else if ((message.type == 'player:changeState') && (message.data.state == 'paused')){
				g_isPlayerReady = true;
				g_objThis.trigger(t.events.STOP_PLAYING);
			}
			else if ((message.type == 'player:changeState') && (message.data.state == 'stopped')){
				g_objThis.trigger(t.events.STOP_PLAYING);
				g_objThis.trigger(t.events.VIDEO_ENDED);
			};

		});

	}

	/**
	 * put the rutube video
	 */
	this.putVideo = function(divID, data, width, height, isAutoplay){

		putVideoActually(divID, data, width, height, isAutoplay);
		return(true);

	}

	/**
	 * do some command
	 */
	this.doCommand = function(command){

		if((g_player == null) || (!g_player.p_window))
			return(false);

		if(g_isPlayerReady == false)
			return(false);

		switch(command){
			// https://github.com/rutube/RutubePlayerJSAPI
			case "play":
				g_player.p_window.contentWindow.postMessage(JSON.stringify({ type: 'player:play', data: {} }), '*');
			break;
			case "pause":
				g_player.p_window.contentWindow.postMessage(JSON.stringify({ type: 'player:pause', data: {} }), '*');
			break;
			case "stop":
				g_player.p_window.contentWindow.postMessage(JSON.stringify({ type: 'player:stop', data: {} }), '*');
			break;
		}

	}

	/**
	 * stop video
	 */
	this.pause = function(){
		t.doCommand("stop");
	}

	/**
	 * pause video
	 */
	this.pause = function(){
		t.doCommand("pause");
	}

	/**
	 * play video
	 */
	this.play = function(){
		t.doCommand("play");
	}

	/**
	 * destroy the player and empty the div
	 */
	this.destroy = function(){

		g_player = null;
		g_isPlayerReady = false;

		if(g_lastContainerID)
			jQuery("#" + g_lastContainerID).html("");

	}

}

/** -------------- Vimeo API class ---------------------*/

function UGVimeoAPI(){
	
	this.isAPILoaded = false;
	
	var t = this, g_objThis = jQuery(this), g_intHandle;
	var g_player = null, g_isPlayerReady = false, g_lastContainerID, g_cueChangeAutoplay = false;
	
	
	this.events = {
			START_PLAYING: "start_playing",
			STOP_PLAYING: "stop_playing",
			VIDEO_ENDED: "video_ended"
	};
	
	/**
	 * load vimeo API
	 */
	this.loadAPI = function(){
		
		if(g_ugVimeoAPI.isAPILoaded == true)
			return(true);
		
		if(isFroogaloopActive()){
			g_ugVimeoAPI.isAPILoaded = true;
			return(true);
		}

		g_ugFunctions.loadJs("f.vimeocdn.com/js/froogaloop2.min.js", true);
		
		g_ugVimeoAPI.isAPILoaded = true;		
	}
	
	
	
	/**
	 * tells if the froogaloop library active
	 */
	function isFroogaloopActive(){
		
		return(typeof Froogaloop != "undefined");
	}
	
	
	/**
	 * actually put the video
	 */
	function putVideoActually(divID, videoID, width, height, isAutoplay){
		
		g_player = null;
		g_isPlayerReady = false;
		
		var url = location.protocol+"//player.vimeo.com/video/"+videoID+"?api=1";
		
		if(isAutoplay === true)
		   url += "&amp;byline=0&amp;autoplay=1&amp;title=0&amp;portrait=0";
		
		var html = "<iframe src="+url+" width='"+width+"' height='"+height+"' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>";
		
		jQuery("#"+divID).html(html);
		
		//get the player object
		var iframe = jQuery("#"+divID + " iframe")[0];
		
		g_player = Froogaloop(iframe);

		g_player.addEvent('ready', function(){
			
			if(g_player){
				g_isPlayerReady = true;
				initEvents();
			}
			
		});
		
		g_lastContainerID = divID;
	}
	
	/**
	 * init events
	 */
	function initEvents(){
		
		if(!g_player)
			return(false);
				
		//set "cuechange" event
		g_player.addEvent('cuechange', function(){
			
			if(g_cueChangeAutoplay == true)			
				t.play();
			
		});
		
		//set "play" event
		g_player.addEvent('play', function(){
			g_objThis.trigger(t.events.START_PLAYING);
		});
		
		//set "pause event"
		g_player.addEvent('pause', function(){
			g_objThis.trigger(t.events.STOP_PLAYING);
		});
		
		g_player.addEvent('finish', function(){
			g_objThis.trigger(t.events.STOP_PLAYING);
			g_objThis.trigger(t.events.VIDEO_ENDED);
		});
		
	}
	
	
	/**
	 * do some command
	 */
	this.doCommand = function(command){
		
		if(g_player == null)
			return(false);
		
		if(g_isPlayerReady == false)
			return(false);
		
		switch(command){
			default:
				g_player.api(command);
			break;
		}
		
	}
	
	/**
	 * do pause command
	 */
	this.pause = function(){
		t.doCommand("pause");
	}
	
	/**
	 * do play command
	 */
	this.play = function(){
		t.doCommand("play");
	}
	
	/**
	 * desrtoy the player and empty the div
	 */
	this.destroy = function(){
		
		if(g_player){
			g_player.api("unload");
			g_player = null;
			g_isPlayerReady = false;
		}
		
		if(g_lastContainerID){
			jQuery("#" + g_lastContainerID).html("");
		}
	
	}
	
	/**
	 * put the vimeo video
	 */
	this.putVideo = function(divID, videoID, width, height, isAutoplay){
		
		if(isFroogaloopActive()){
			putVideoActually(divID, videoID, width, height, isAutoplay);
			return(true);
		}
		
		
		//if no API present, wait for the API being ready
		this.loadAPI();
		g_intHandle = setInterval(function(){
			
			if(isFroogaloopActive()){
				putVideoActually(divID, videoID, width, height, isAutoplay);
				clearInterval(g_intHandle);
			}
			
		}, 500);
		
	}
	
	
	/**
	 * get if the player is ready
	 */
	this.isPlayerReady = function(){
		
		if(g_isPlayerReady && g_player)
			return(true);
	
		return(false);
	}	
	
	/**
	 * change the video
	 */
	this.changeVideo = function(videoID, isAutoplay){
		
		if(t.isPlayerReady() == false)
			return(false);
		
		g_cueChangeAutoplay = isAutoplay;
		
		g_player.api("loadVideo", videoID);
	}
	
	
	/**
	 * get video images
	 */
	this.getVideoImages = function(videoID, itemIndex, onSuccessFunction){
		
		var url = location.protocol+"//vimeo.com/api/v2/video/"+videoID+".json";
		jQuery.get(url, {}, function(data){
			var obj = {};
			obj.preview = data[0].thumbnail_large;
			obj.thumb = data[0].thumbnail_medium;
			onSuccessFunction(itemIndex, obj);
		});
	}
	
	
}


/** -------------- Youtube API class ---------------------*/

function UGYoutubeAPI(){
	
	this.isAPILoaded = false;	
	var t = this, g_player = null, g_intHandle, g_isPlayerReady = false;
	var g_objThis = jQuery(this), g_prevState = -1, g_lastContainerID;	//unstarted
	
	var g_options = {
			video_youtube_showinfo: true
	}
	
	this.events = {
		START_PLAYING: "start_playing",
		STOP_PLAYING: "stop_playing",
		VIDEO_ENDED: "video_ended"
	};
	
	
	/**
	 * actually put the video
	 */
	function putVideoActually(divID, videoID, width, height, isAutoplay){
				
		if(g_player && g_isPlayerReady){			
			g_player.destroy();
		}
		
		var playerVars = {
			controls:2,
			showinfo:g_options.video_youtube_showinfo, 
			rel:0
		};
		
		if(isAutoplay === true)
			playerVars.autoplay = 1;
			
		g_isPlayerReady = false;

		g_player = new YT.Player(divID, {
		      height: height,
		      width: width,
		      videoId: videoID,
		      playerVars: playerVars,
		      events: {
		        'onReady': onPlayerReady,
		        'onStateChange': onPlayerStateChange
		      }
		 });
		
		g_lastContainerID = divID;
	}
	
	
	/**
	 * check if YT active
	 */
	function isYTActive(){
		
		if(typeof YT != "undefined" && typeof YT.Player != "undefined")
			return(true);
		
		return(false);
	}
	
	
	/**
	 * set options
	 */
	this.setOptions = function(objOptions){
		g_options = jQuery.extend(g_options, objOptions);
	}
	
	
	/**
	 * put the youtube video
	 */
	this.putVideo = function(divID, videoID, width, height, isAutoplay){
		
		if(isYTActive()){
			putVideoActually(divID, videoID, width, height, isAutoplay);
			return(true);
		}
		
		//if no API present, wait for the API being ready
		this.loadAPI();
		g_intHandle = setInterval(function(){
			
			if(isYTActive()){
				putVideoActually(divID, videoID, width, height, isAutoplay);
				clearInterval(g_intHandle);
			}
			
		}, 500);
		
	}
	
	
	/**
	 * on player ready event
	 */
	function onPlayerReady(){
		g_isPlayerReady = true;
	}
	
	
	/**
	 * on player state change event
	 * trigger events
	 */
	function onPlayerStateChange(){
		
		if(typeof g_player.getPlayerState != "function"){
			trace("Youtube API error: can't get player state");
			return(false);
		}
		
		var state = g_player.getPlayerState();
		
		switch(state){
			case YT.PlayerState.PLAYING:
				g_objThis.trigger(t.events.START_PLAYING);
			break;
			case YT.PlayerState.ENDED:
				g_objThis.trigger(t.events.STOP_PLAYING);					
				g_objThis.trigger(t.events.VIDEO_ENDED);
			break;
			default:
				if(g_prevState == YT.PlayerState.PLAYING)
					g_objThis.trigger(t.events.STOP_PLAYING);					
			break;
		}
		
		g_prevState = state;
	}
	
	
	/**
	 * load youtube API
	 */
	this.loadAPI = function(){
		
		if(g_ugYoutubeAPI.isAPILoaded == true)
			return(true);
		
		if(typeof YT != "undefined"){
			g_ugYoutubeAPI.isAPILoaded = true;
			return(true);
		}
		
		g_ugFunctions.loadJs("https://www.youtube.com/player_api", false);
		
		g_ugYoutubeAPI.isAPILoaded = true;	
		
	}
	
	
	/**
	 * do some command
	 */
	this.doCommand = function(command, opt1){
		
		if(!g_player)
			return(true);
		
		if(g_isPlayerReady == false)
			return(false);
		
		switch(command){
			case "play":
				if(typeof g_player.playVideo != "function")
					return(false);
				
				g_player.playVideo();
			break;
			case "pause":
				if(typeof g_player.pauseVideo != "function")
					return(false);
				
				g_player.pauseVideo();
			break;
			case "seek":
				if(typeof g_player.seekTo != "function")
					return(false);

				g_player.seekTo(opt1);
			break;
			case "stopToBeginning":
				var state = g_player.getPlayerState();
				
				g_player.pauseVideo();
				
				switch(state){
					case YT.PlayerState.PLAYING:
					case YT.PlayerState.ENDED:
					case YT.PlayerState.PAUSED:
						g_player.seekTo(0);
					break;
				}
			break;
		}
	}
	
	/**
	 * play video
	 */
	this.play = function(){
		t.doCommand("play");		
	}
	
	/**
	 * stop the video
	 */
	this.pause = function(){
		t.doCommand("pause");
	}
	
	/**
	 * destroy player
	 */
	this.destroy = function(){
		try{
			
			if(g_player){
				g_isPlayerReady = false;	
				g_player.clearVideo();
				g_player.destroy();
			}
			
		}catch(objError){
			
			jQuery("#"+g_lastContainerID).html("");
			
		}
		
	}
	
	/**
	 * stop the video and seek to start
	 */
	this.stopToBeginning = function(){
		t.doCommand("stopToBeginning");
	}
	
	/**
	 * change the video
	 */
	this.changeVideo = function(videoID, isAutoplay){
		
		if(t.isPlayerReady() == false)
			return(false);
		
		if(isAutoplay && isAutoplay == true)
			g_player.loadVideoById(videoID, 0, "large");
		else
			g_player.cueVideoById(videoID, 0, "large");
	}
	
	
	/**
	 * get if the player is ready
	 */
	this.isPlayerReady = function(){
		
		if(g_isPlayerReady && g_player)
			return(true);
	
		return(false);
	}
	
		
	
	/**
	 * get preview and thumbs images according the ID
	 */
	this.getVideoImages = function(videoID){
		var obj = {};
		obj.preview = "https://i.ytimg.com/vi/"+videoID+"/sddefault.jpg";
		obj.thumb = "https://i.ytimg.com/vi/"+videoID+"/default.jpg";
		return(obj);
	}
	
	
}

/** -------------- Video Player Class ---------------------*/


function UGVideoPlayer(){
	
	var t = this, g_galleryID, g_objThis = jQuery(this), g_functions = new UGFunctions();
	var g_youtubeAPI = new UGYoutubeAPI(), g_vimeoAPI = new UGVimeoAPI(), g_rutubeAPI = new UGRutubeAPI(), g_dailymotionAPI = new UGDailymotionAPI(), g_vkAPI = new UGVkAPI();
	var g_html5API = new UGHtml5MediaAPI(), g_soundCloudAPI = new UGSoundCloudAPI(), g_wistiaAPI = new UGWistiaAPI();
	var g_objPlayer, g_objYoutube, g_objVimeo, g_objRutube, g_objDailymotion, g_objVk, g_objHtml5, g_objButtonClose, g_objSoundCloud, g_objWistia;
	var g_activePlayerType = null;
	
	var g_options = {
			video_enable_closebutton: true
	};
	
	this.events = {
			SHOW: "video_show",
			HIDE: "video_hide",
			PLAY_START: "video_play_start",
			PLAY_STOP: "video_play_stop",
			VIDEO_ENDED: "video_ended"
	};
	
	var g_temp = {
			standAloneMode: false,
			youtubeInnerID:"",
			vimeoPlayerID:"",
			rutubePlayerID:"",
			dailymotionPlayerID:"",
			vkPlayerID:"",
			html5PlayerID:"",
			wistiaPlayerID:"",
			soundCloudPlayerID:""
	};
	
	
	/**
	 * init the object
	 */
	this.init = function(optOptions, isStandAloneMode, galleryID){
		g_galleryID = galleryID;
		
		if(!g_galleryID)
			throw new Error("missing gallery ID for video player, it's a must!");
			
		g_options =  jQuery.extend(g_options, optOptions);
		
		g_youtubeAPI.setOptions(g_options);
		
		if(isStandAloneMode && isStandAloneMode == true)
			g_temp.standAloneMode = true;
		
	}
	
	
	/**
	 * set the player html
	 */
	this.setHtml = function(objParent){
		
		g_temp.youtubeInnerID = g_galleryID + "_youtube_inner";
		g_temp.vimeoPlayerID = g_galleryID + "_videoplayer_vimeo";
		g_temp.rutubePlayerID = g_galleryID + "_videoplayer_rutube";
		g_temp.dailymotionPlayerID = g_galleryID + "_videoplayer_dailymotion";
		g_temp.vkPlayerID = g_galleryID + "_videoplayer_vk";
		g_temp.html5PlayerID = g_galleryID + "_videoplayer_html5";
		g_temp.wistiaPlayerID = g_galleryID + "_videoplayer_wistia";
		g_temp.soundCloudPlayerID = g_galleryID + "_videoplayer_soundcloud";
		
		
		var html = "<div class='ug-videoplayer' style='display:none'>";
		html += "<div class='ug-videoplayer-wrapper ug-videoplayer-youtube' style='display:none'><div id='"+g_temp.youtubeInnerID+"'></div></div>";
		html += "<div id='"+g_temp.vimeoPlayerID+"' class='ug-videoplayer-wrapper ug-videoplayer-vimeo' style='display:none'></div>";
		html += "<div id='"+g_temp.rutubePlayerID+"' class='ug-videoplayer-wrapper ug-videoplayer-rutube' style='display:none'></div>";
		html += "<div id='"+g_temp.dailymotionPlayerID+"' class='ug-videoplayer-wrapper ug-videoplayer-dailymotion' style='display:none'></div>";
		html += "<div id='"+g_temp.vkPlayerID+"' class='ug-videoplayer-wrapper ug-videoplayer-vk' style='display:none'></div>";
		html += "<div id='"+g_temp.html5PlayerID+"' class='ug-videoplayer-wrapper ug-videoplayer-html5'></div>";
		html += "<div id='"+g_temp.soundCloudPlayerID+"' class='ug-videoplayer-wrapper ug-videoplayer-soundcloud'></div>";
		html += "<div id='"+g_temp.wistiaPlayerID+"' class='ug-videoplayer-wrapper ug-videoplayer-wistia'></div>";
		
		if(g_temp.standAloneMode == false && g_options.video_enable_closebutton)
			html += "<div class='ug-videoplayer-button-close ug-skin-"+g_options.slider_video_closebutton_skin+"'></div>";
		
		html += "</div>";
		
		objParent.append(html);
		
		g_objPlayer = objParent.children(".ug-videoplayer");
		g_objYoutube = g_objPlayer.children(".ug-videoplayer-youtube");
		g_objVimeo = g_objPlayer.children(".ug-videoplayer-vimeo");
		g_objRutube = g_objPlayer.children(".ug-videoplayer-rutube");
		g_objDailymotion = g_objPlayer.children(".ug-videoplayer-dailymotion");
		g_objVk = g_objPlayer.children(".ug-videoplayer-vk");
		g_objHtml5 = g_objPlayer.children(".ug-videoplayer-html5");
		g_objSoundCloud = g_objPlayer.children(".ug-videoplayer-soundcloud");
		g_objWistia = g_objPlayer.children(".ug-videoplayer-wistia");
		
		if(g_temp.standAloneMode == false && g_options.video_enable_closebutton)
			g_objButtonClose = g_objPlayer.children(".ug-videoplayer-button-close")
	}

	
	function __________EVENTS___________(){};	
	
	/**
	 * on close button click event
	 */
	function onCloseButtonClick(){
		t.hide();
	}
	
	/**
	 * on some video play start
	 */
	function onPlayStart(){
		
		g_objThis.trigger(t.events.PLAY_START);
		
		if(g_objButtonClose && g_options.slider_video_hide_close_button_on_event_playstart)
			g_objButtonClose.hide();
	}
	
	
	/**
	 * on some video play stop
	 */
	function onPlayStop(){
		
		g_objThis.trigger(t.events.PLAY_STOP);
		
		if(g_objButtonClose && g_options.slider_video_hide_close_button_on_event_playstart)
			g_objButtonClose.show();
	}
	
	/**
	 * on video ended
	 */
	function onVideoEnded(){
		
		g_objThis.trigger(t.events.VIDEO_ENDED);
		
	}

	
	/**
	 * init events
	 */
	function initEvents(){
		
		//close button events
		if(g_objButtonClose){
			g_functions.setButtonMobileReady(g_objButtonClose);		
			g_functions.setButtonOnClick(g_objButtonClose, onCloseButtonClick);					
		}
		
		//youtube events
		jQuery(g_youtubeAPI).on(g_youtubeAPI.events.START_PLAYING, onPlayStart);
		jQuery(g_youtubeAPI).on(g_youtubeAPI.events.STOP_PLAYING, onPlayStop);
		jQuery(g_youtubeAPI).on(g_youtubeAPI.events.VIDEO_ENDED, onVideoEnded);
		
		//vimeo events
		jQuery(g_vimeoAPI).on(g_vimeoAPI.events.START_PLAYING, onPlayStart);
		jQuery(g_vimeoAPI).on(g_vimeoAPI.events.STOP_PLAYING, onPlayStop);
		jQuery(g_vimeoAPI).on(g_vimeoAPI.events.VIDEO_ENDED, onVideoEnded);
		
		//rutube events
		jQuery(g_rutubeAPI).on(g_rutubeAPI.events.START_PLAYING, onPlayStart);
		jQuery(g_rutubeAPI).on(g_rutubeAPI.events.STOP_PLAYING, onPlayStop);
		jQuery(g_rutubeAPI).on(g_rutubeAPI.events.VIDEO_ENDED, onVideoEnded);

		//dailymotion events
		jQuery(g_dailymotionAPI).on(g_dailymotionAPI.events.START_PLAYING, onPlayStart);
		jQuery(g_dailymotionAPI).on(g_dailymotionAPI.events.STOP_PLAYING, onPlayStop);
		jQuery(g_dailymotionAPI).on(g_dailymotionAPI.events.VIDEO_ENDED, onVideoEnded);

		//vk events
		jQuery(g_vkAPI).on(g_vkAPI.events.START_PLAYING, onPlayStart);
		jQuery(g_vkAPI).on(g_vkAPI.events.STOP_PLAYING, onPlayStop);
		jQuery(g_vkAPI).on(g_vkAPI.events.VIDEO_ENDED, onVideoEnded);

		//html5 video events
		jQuery(g_html5API).on(g_html5API.events.START_PLAYING, onPlayStart);
		jQuery(g_html5API).on(g_html5API.events.STOP_PLAYING, onPlayStop);
		jQuery(g_html5API).on(g_html5API.events.VIDEO_ENDED, onVideoEnded);
		
		jQuery(g_soundCloudAPI).on(g_soundCloudAPI.events.START_PLAYING, onPlayStart);
		jQuery(g_soundCloudAPI).on(g_soundCloudAPI.events.STOP_PLAYING, onPlayStop);
		jQuery(g_soundCloudAPI).on(g_soundCloudAPI.events.VIDEO_ENDED, onVideoEnded);
		
		jQuery(g_wistiaAPI).on(g_wistiaAPI.events.START_PLAYING, onPlayStart);
		jQuery(g_wistiaAPI).on(g_wistiaAPI.events.STOP_PLAYING, onPlayStop);
		jQuery(g_wistiaAPI).on(g_wistiaAPI.events.VIDEO_ENDED, onVideoEnded);
		
	}
	
	
	/**
	 * destroy the video player events
	 */
	this.destroy = function(){
		
		if(g_objButtonClose){
			g_objButtonClose.off("click");
			g_objButtonClose.off("touchend");
		}
		
		//youtube events
		jQuery(g_youtubeAPI).off(g_youtubeAPI.events.START_PLAYING);
		jQuery(g_youtubeAPI).off(g_youtubeAPI.events.STOP_PLAYING);
		
		//vimeo events
		jQuery(g_vimeoAPI).off(g_vimeoAPI.events.START_PLAYING);
		jQuery(g_vimeoAPI).off(g_vimeoAPI.events.STOP_PLAYING);
		
		//rutube events
		jQuery(g_rutubeAPI).off(g_rutubeAPI.events.START_PLAYING);
		jQuery(g_rutubeAPI).off(g_rutubeAPI.events.STOP_PLAYING);

		//dailymotion events
		jQuery(g_dailymotionAPI).off(g_dailymotionAPI.events.START_PLAYING);
		jQuery(g_dailymotionAPI).off(g_dailymotionAPI.events.STOP_PLAYING);

		//vk events
		jQuery(g_vkAPI).off(g_vkAPI.events.START_PLAYING);
		jQuery(g_vkAPI).off(g_vkAPI.events.STOP_PLAYING);

		//html5 video events
		jQuery(g_html5API).off(g_html5API.events.START_PLAYING);
		jQuery(g_html5API).off(g_html5API.events.STOP_PLAYING);
		
		jQuery(g_soundCloudAPI).off(g_soundCloudAPI.events.START_PLAYING, onPlayStart);
		jQuery(g_soundCloudAPI).off(g_soundCloudAPI.events.STOP_PLAYING, onPlayStop);
		
		jQuery(g_wistiaAPI).off(g_wistiaAPI.events.START_PLAYING, onPlayStart);
		jQuery(g_wistiaAPI).off(g_wistiaAPI.events.STOP_PLAYING, onPlayStop);
		
		g_activePlayerType = null;
	}
	
	
	/**
	 * init events
	 */
	this.initEvents = function(){
		
		initEvents();
	}
	
	
	/**
	 * set element size and position the button
	 */
	this.setSize = function(width, height){
		
		g_functions.setElementSize(g_objPlayer, width, height);
		
		if(g_objButtonClose)
			g_functions.placeElement(g_objButtonClose, g_options.slider_video_closebutton_align_hor, g_options.slider_video_closebutton_align_vert, g_options.slider_video_closebutton_offset_hor, g_options.slider_video_closebutton_offset_vert);
		
	}
	
	
	/**
	 * set video player position
	 */
	this.setPosition = function(left, top){
		g_functions.placeElement(g_objPlayer, left, top);
	}
	
	/**
	 * get video player object for placing
	 */
	this.getObject = function(){
		return(g_objPlayer);
	}
	
	
	/**
	 * show the player
	 */
	this.show = function(){		
		
		if(t.isVisible() == true)
			return(true);
		
		g_objPlayer.show();
		
		g_objPlayer.fadeTo(0,1);
		
		if(g_objButtonClose)
			g_objButtonClose.show();
				
		g_objThis.trigger(t.events.SHOW);
	}
		
	
	/**
	 * hide the player
	 */
	this.hide = function(){
		
		if(t.isVisible() == false)
			return(true);
		
		//pause all players
		stopAndHidePlayers();
		
		g_activePlayerType = null;
		
		g_objPlayer.hide();
		
		g_objThis.trigger(t.events.HIDE);
	}
	
	
	/**
	 * get active player
	 */
	this.getActiveAPI = function(){
		
		switch(g_activePlayerType){
			case "youtube":
				return g_youtubeAPI;
			break;
			case "vimeo":
				return g_vimeoAPI;
			break;
			case "rutube":
				return g_rutubeAPI;
			break;
			case "dailymotion":
				return g_dailymotionAPI;
			break;
			case "vk":
				return g_vkAPI;
			break;
			case "wistia":
				return g_wistiaAPI;
			break;
			case "soundcloud":
				return g_soundCloudAPI;
			break;
			case "html5":
				return g_html5API;
			break;
			default:
				return null;
			break;
		}
	}
	
	
	/**
	 * pause active player if playing
	 */
	this.pause = function(){
		
		var activeAPI = t.getActiveAPI();
		if(activeAPI == null)
			return(false);
		
		if(typeof activeAPI.pause == "function")
			activeAPI.pause();
			
	}
	
	
	/**
	 * return if the player is visible
	 */
	this.isVisible = function(){
		
		return g_objPlayer.is(":visible");
	}
	
	
	/**
	 * stop and hide other elements except some
	 */
	function stopAndHidePlayers(except){
		
		var arrPlayers = ["youtube", "vimeo", "rutube", "dailymotion", "vk", "html5", "soundcloud", "wistia"];
		for(var index in arrPlayers){
			var player = arrPlayers[index];
			if(player == except)
				continue;
			switch(player){
				case "youtube":		
					g_youtubeAPI.pause();
					g_youtubeAPI.destroy();	
					g_objYoutube.hide();
				break;
				case "vimeo":
					g_vimeoAPI.pause();
					g_vimeoAPI.destroy();
					g_objVimeo.hide();
				break;
				case "rutube":
					g_rutubeAPI.pause();
					g_rutubeAPI.destroy();
					g_objRutube.hide();
				break;
				case "dailymotion":
					g_dailymotionAPI.pause();
					g_dailymotionAPI.destroy();
					g_objDailymotion.hide();
				break;
				case "vk":
					g_vkAPI.pause();
					g_vkAPI.destroy();
					g_objVk.hide();
				break;
				case "html5":
					g_html5API.pause();
					g_objHtml5.hide();
				break;
				case "soundcloud":
					g_soundCloudAPI.pause();
					g_soundCloudAPI.destroy();
					g_objSoundCloud.hide();
				break;
				case "wistia":
					g_wistiaAPI.pause();
					g_objWistia.hide();
				break;
			}
		}
		
	}
	
	
	/**
	 * play youtube inside the video, isAutoplay - true by default
	 */
	this.playYoutube = function(videoID, isAutoplay){
				
		if(typeof isAutoplay == "undefined")
			var isAutoplay = true;
		
		stopAndHidePlayers("youtube");
		
		g_objYoutube.show();
		
		var objYoutubeInner = g_objYoutube.children("#"+g_temp.youtubeInnerID);
		if(objYoutubeInner.length == 0)
			g_objYoutube.append("<div id='"+g_temp.youtubeInnerID+"'></div>");
			
		
		if(g_youtubeAPI.isPlayerReady() == true && g_temp.standAloneMode == true)
			g_youtubeAPI.changeVideo(videoID, isAutoplay);
		else{
			g_youtubeAPI.putVideo(g_temp.youtubeInnerID, videoID, "100%", "100%", isAutoplay);
		}
		
		g_activePlayerType = "youtube";
	}
	
	
	/**
	 * play vimeo
	 */
	this.playVimeo = function(videoID, isAutoplay){
		
		if(typeof isAutoplay == "undefined")
			var isAutoplay = true;
		
		stopAndHidePlayers("vimeo");
		
		g_objVimeo.show();

		g_vimeoAPI.putVideo(g_temp.vimeoPlayerID, videoID, "100%", "100%", isAutoplay);
		
		/*
		if(g_vimeoAPI.isPlayerReady() && g_temp.standAloneMode == true){
			g_vimeoAPI.changeVideo(videoID, isAutoplay);
		}
		else
			g_vimeoAPI.putVideo(g_temp.vimeoPlayerID, videoID, "100%", "100%", isAutoplay);
		 */
		
		g_activePlayerType = "vimeo";

	}
	
	
	/**
	 * play rutube
	 */
	this.playRutube = function(videoID, isAutoplay){

		if(typeof isAutoplay == "undefined")
			var isAutoplay = true;

		stopAndHidePlayers("rutube");

		g_objRutube.show();

		g_rutubeAPI.putVideo(g_temp.rutubePlayerID, videoID, "100%", "100%", isAutoplay);

		g_activePlayerType = "rutube";

	}


	/**
	 * play dailymotion
	 */
	this.playDailymotion = function(videoID, isAutoplay){

		if(typeof isAutoplay == "undefined")
			var isAutoplay = true;

		stopAndHidePlayers("dailymotion");

		g_objDailymotion.show();

		g_dailymotionAPI.putVideo(g_temp.dailymotionPlayerID, videoID, "100%", "100%", isAutoplay);

		g_activePlayerType = "dailymotion";

	}


	/**
	 * play vk
	 */
	this.playVk = function(videoID, isAutoplay){

		if(typeof isAutoplay == "undefined")
			var isAutoplay = true;

		stopAndHidePlayers("vk");

		g_objVk.show();

		g_vkAPI.putVideo(g_temp.vkPlayerID, videoID, "100%", "100%", isAutoplay);

		g_activePlayerType = "vk";

	}


	/**
	 * play html5 video
	 */
	this.playHtml5Video = function(ogv, webm, mp4, posterImage, isAutoplay){
		
		if(typeof isAutoplay == "undefined")
			var isAutoplay = true;
				
		stopAndHidePlayers("html5");
		
		g_objHtml5.show();
		
		//trace(posterImage);
		
		var data = {
				ogv: ogv, 
				webm: webm, 
				mp4: mp4, 
				posterImage: posterImage 
			};
		
		g_html5API.putVideo(g_temp.html5PlayerID, data, "100%", "100%", isAutoplay);
		
		g_activePlayerType = "html5";

	}

	/**
	 * play sound cloud
	 */
	this.playSoundCloud = function(trackID, isAutoplay){
		
		if(typeof isAutoplay == "undefined")
			var isAutoplay = true;
		
		stopAndHidePlayers("soundcloud");
		
		g_objSoundCloud.show();
		
		g_soundCloudAPI.putSound(g_temp.soundCloudPlayerID, trackID, "100%", "100%", isAutoplay);

		g_activePlayerType = "soundcloud";
	
	}
	
	
	/**
	 * play sound cloud
	 */
	this.playWistia = function(videoID, isAutoplay){
		
		if(typeof isAutoplay == "undefined")
			var isAutoplay = true;
		
		stopAndHidePlayers("wistia");
		
		g_objWistia.show();
		
		g_wistiaAPI.putVideo(g_temp.wistiaPlayerID, videoID, "100%", "100%", isAutoplay);
	
		g_activePlayerType = "wistia";

	}
	
}


var g_ugYoutubeAPI = new UGYoutubeAPI();
var g_ugVimeoAPI = new UGVimeoAPI();
var g_ugRutubeAPI = new UGRutubeAPI();
var g_ugDailymotionAPI = new UGDailymotionAPI();
var g_ugVkAPI = new UGVkAPI();
var g_ugHtml5MediaAPI = new UGHtml5MediaAPI();
var g_ugSoundCloudAPI = new UGSoundCloudAPI();
var g_ugWistiaAPI = new UGWistiaAPI();
