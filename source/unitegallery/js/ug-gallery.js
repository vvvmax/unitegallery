
	/**
	 * prototype gallery funciton
	 */
	jQuery.fn.unitegallery = function(options){
		var element = jQuery(this);
		var galleryID = "#" + element.attr("id");
		
		if(!options)
			var options = {};
				
		var objGallery = new UniteGalleryMain();
		objGallery.run(galleryID, options);
		
		var api = new UG_API(objGallery);
		
		return(api);
	}

	
	/**
	 * check for min jquery version
	 */
	function ugCheckForMinJQueryVersion(){
		
		var isMinJQuery = g_ugFunctions.checkMinJqueryVersion("1.8.0");
		
		if(isMinJQuery == false)
			throw new Error("The gallery can run from jquery 1.8 You have jQuery "+jQuery.fn.jquery+" Please update your jQuery library.");
	}
	
	
	/**
	 * check for errors function
	 */
	function ugCheckForErrors(galleryID, type){

		/**
		 * check for jquery presents
		 */
		function checkForJqueryPresents(){
			if(typeof jQuery == "undefined")
				throw new Error("jQuery library not included");
		}
		
		/**
		 * check for double jquery error
		 */
		function checkForDoubleJQuery(){

			if(typeof jQuery.fn.unitegallery == "function")
				return(true);
			
			var errorMessage = "You have some jquery.js library include that comes after the gallery files js include.";
			errorMessage += "<br> This include eliminates the gallery libraries, and make it not work.";
			
			if(type == "cms"){
				errorMessage += "<br><br> To fix it you can:<br>&nbsp;&nbsp;&nbsp; 1. In the Gallery Settings -> Troubleshooting set option:  <strong><b>Put JS Includes To Body</b></strong> option to true.";
				errorMessage += "<br>&nbsp;&nbsp;&nbsp; 2. Find the double jquery.js include and remove it.";
			}else{
				errorMessage += "<br><br> Please find and remove this jquery.js include and the gallery will work. <br> * There should be only one jquery.js include before all other js includes in the page.";			
			}
			
			
			throw new Error(errorMessage);
		}
		
		try{
			if(type == "jquery"){
				checkForJqueryPresents();
				ugCheckForMinJQueryVersion();
			}else{
				ugCheckForMinJQueryVersion();
				checkForDoubleJQuery();
			}
			
		}catch(objError){
			
			var message = objError.message;
			message = "Unite Gallery Error: "+ message;
			message = "<div style='font-size:16px;color:#BC0C06;max-width:900px;border:1px solid red;padding:10px;'>" + message + "</div>"
			
			if(type == "jquery"){
				var objGallery = document.getElementById(galleryID);
				objGallery.innerHTML = message;
				objGallery.style.display = "block";
			}
			else
				jQuery(galleryID).show().html(message);
			
			return(false);
		}
		
		return(true);
	}

	
function UniteGalleryMain(){
	
	var t = this;
	var g_galleryID;
	var g_objGallery = jQuery(t), g_objWrapper, g_objParent;
	var g_objThumbs, g_objSlider, g_functions = new UGFunctions(), g_objTabs;
	var g_arrItems = [], g_numItems, g_selectedItem = null, g_selectedItemIndex = -1;
	var g_objTheme, g_objCache = {};
	
	this.events = {
			ITEM_CHANGE: "item_change",
			SIZE_CHANGE: "size_change",
			ENTER_FULLSCREEN: "enter_fullscreen",
			EXIT_FULLSCREEN: "exit_fullscreen",
			START_PLAY: "start_play",
			STOP_PLAY: "stop_play",
			PAUSE_PLAYING: "pause_playing",
			CONTINUE_PLAYING: "continue_playing",
			SLIDER_ACTION_START: "slider_action_start",
			SLIDER_ACTION_END: "slider_action_end",
			ITEM_IMAGE_UPDATED: "item_image_updated",
			GALLERY_KEYPRESS: "gallery_keypress",
			GALLERY_BEFORE_REQUEST_ITEMS: "gallery_before_request_items",	//before ajax load items
			OPEN_LIGHTBOX:"open_lightbox",
			CLOSE_LIGHTBOX:"close_lightbox"			
	};
	
	
	//set the default gallery options
	var g_options = {				
			gallery_width:900,							//gallery width		
			gallery_height:500,							//gallery height
			
			gallery_min_width: 150,						//gallery minimal width when resizing
			gallery_min_height: 100,					//gallery minimal height when resizing
			
			gallery_theme:"default",					//default,compact,grid,slider - select your desired theme from the list of themes.
			gallery_skin:"default",						//default, alexis etc... - the global skin of the gallery. Will change all gallery items by default.
			
			gallery_images_preload_type:"minimal",		//all , minimal , visible - preload type of the images.
														//minimal - only image nabours will be loaded each time.
														//visible - visible thumbs images will be loaded each time.
														//all - load all the images first time.
			
			gallery_autoplay:false,						//true / false - begin slideshow autoplay on start
			gallery_play_interval: 3000,				//play interval of the slideshow
			gallery_pause_on_mouseover: true,			//true,false - pause on mouseover when playing slideshow true/false
			
			gallery_mousewheel_role:"zoom",				//none, zoom, advance
			gallery_control_keyboard: true,				//true,false - enable / disble keyboard controls
			gallery_carousel:true,						//true,false - next button on last image goes to first image.
			
			gallery_preserve_ratio: true,				//true, false - preserver ratio when on window resize
			gallery_background_color: "",				//set custom background color. If not set it will be taken from css.
			gallery_debug_errors:false,					//show error message when there is some error on the gallery area.
			gallery_shuffle:false,						//randomise position of items at start.
			gallery_urlajax:null,						//ajax url for requesting new items etc.
			gallery_enable_tabs: false,					//enable/disable category tabs
			gallery_enable_cache: true,					//enable caching items
			gallery_initial_catid: ""					//initial category id (for caching)
	};
	
	//gallery_control_thumbs_mousewheel
	
	var g_temp = {					//temp variables
		objCustomOptions:{},
		isAllItemsPreloaded:false,	//flag that tells that all items started preloading
		isFreestyleMode:false,		//no special html additions
		lastWidth:0,
		lastHeigh:0,
		handleResize: null,
		isInited: false,
		isPlayMode: false,
		isPlayModePaused: false,
		playTimePassed: 0,
		playTimeLastStep: 0,
		playHandle: "",
		playStepInterval: 33,
		objProgress: null,
		isFakeFullscreen: false,
		thumbsType:null,
		isYoutubePresent:false,			//flag if present youtube items
		isVimeoPresent:false,			//flag if present vimeo items
		isHtml5VideoPresent:false,		//flag if present html5 video items
		isSoundCloudPresent:false,		//flag if present soundcloud items
		isWistiaPresent: false,			//flag if some wistia movie present
		resizeDelay: 100,
		isRunFirstTime: true,
		originalOptions: {},
		funcCustomHeight: null			//custom height function, set by the theme if needed
	};
	
	
	
	function __________INIT_GALLERY_______(){};
	
	/**
	 * get theme function from theme name
	 */
	function getThemeFunction(themeName){
		 var themeFunction = themeName;
		if(themeFunction.indexOf("UGTheme_") == -1)
			 themeFunction = "UGTheme_" + themeFunction;
		
		return(themeFunction);
	}

	/**
	 * init the theme
	 */
	function initTheme(objCustomOptions){
		 
		//set theme function:
		 if(objCustomOptions.hasOwnProperty("gallery_theme"))
			 g_options.gallery_theme = objCustomOptions.gallery_theme;
		 else{
			 var defaultTheme = g_options.gallery_theme;
			 if(g_ugFunctions.isThemeRegistered(defaultTheme) == false)
				 g_options.gallery_theme = g_ugFunctions.getFirstRegisteredTheme();
		 }
		 
		 var themeFunction = getThemeFunction(g_options.gallery_theme);
		 
		 try{
			 g_options.gallery_theme = eval(themeFunction);
		 }catch(e){
			 //check registered themes
		 };
		 
		 g_options.gallery_theme = eval(themeFunction);
		 
		 //init the theme
		 g_objTheme = new g_options.gallery_theme();
		 g_objTheme.init(t, objCustomOptions);
	}
	
	
	/**
	 * reset all the options for the second time run
	 */
	function resetOptions(){
	   	 
		 g_options = jQuery.extend({}, g_temp.originalOptions);
		 
		 g_selectedItemIndex = -1;
		 g_selectedItem = null;
		 g_objSlider = undefined;
		 g_objThumbs = undefined;
		 g_objSlider = undefined; 
	}
	
	
	/**
	 * check for some errors and fire error if needed
	 */
	function checkForStartupErrors(){
		
		//protection agains old jquery version
		try{
			ugCheckForMinJQueryVersion();
		}catch(e){
			throwErrorShowMessage(e.message);
		}
		
		//protection against some jquery ui function change
	     if(typeof g_objWrapper.outerWidth() == "object")
	    	 throwErrorShowMessage("You have some buggy script. most chances jquery-ui.js that destroy jquery outerWidth, outerHeight functions. The gallery can't run. Please update jquery-ui.js to latest version.");
	     
	     //check for late jquery include
	     setTimeout(function(){ugCheckForErrors(g_galleryID, "cms")} , 5000);
	     
	}
	
	
	
	/**
	 *  the gallery
	 */
	function runGallery(galleryID, objCustomOptions, htmlItems, cacheID){
			
			var isCustomOptions = (typeof objCustomOptions == "object");
			
			if(isCustomOptions)
		      g_temp.objCustomOptions = objCustomOptions;
			 			 
		     if(g_temp.isRunFirstTime == true){
				
		    	 g_galleryID = galleryID;
				 g_objWrapper = jQuery(g_galleryID);
				 if(g_objWrapper.length == 0){
					 trace("div with id: "+g_galleryID+" not found");
					 return(false);
				 }

				 g_objParent = g_objWrapper.parent();
				 
				 checkForStartupErrors();
				 
				 g_temp.originalOptions = jQuery.extend({}, g_options);
				 
				 //merge options
				 if(isCustomOptions)
					 g_options = jQuery.extend(g_options, objCustomOptions);
				 
				 //cache items
				 if(g_options.gallery_enable_cache == true && g_options.gallery_initial_catid)
					 cacheItems(g_options.gallery_initial_catid);
				
				 //set size class
				 t.setSizeClass();
				 
				 //fill arrItems
				 var objItems = g_objWrapper.children();
				 
				 fillItemsArray(objItems);
				 loadAPIs();
				 
				 //hide images:
				 g_objWrapper.find("img").fadeTo(0,0).hide();
				 g_objWrapper.show();
		
				 clearInitData();
		    	 
		     }else{		//reset options - not first time run
		    	 
		    	 t.destroy();
		    	 
		    	 resetOptions();

		    	 g_options = jQuery.extend(g_options, g_temp.objCustomOptions);
	    		 
		    	 if(htmlItems){
		    		 
		    		 //cache items
		    		 if(cacheID && g_options.gallery_enable_cache == true)
		    			 cacheItems(cacheID, htmlItems);
		    		 
		    		 if(htmlItems == "noitems"){
		    			 showErrorMessage("No items in this category","");
		    			 return(false);
			    	 }
		    		 
		    		 g_objWrapper.html(htmlItems);
		    		 
		    		 var objItems = g_objWrapper.children();
		    		 fillItemsArray(objItems);
					 
		    		 loadAPIs();
					 
					 g_objWrapper.children().fadeTo(0,0).hide();
					 
					 g_objWrapper.show();
					 clearInitData();
		    	 }
		     
		     }
		     
			 //init tabs
			 if(g_temp.isRunFirstTime == true && g_options.gallery_enable_tabs == true){
				 g_objTabs = new UGTabs();
				 g_objTabs.init(t, g_options);
			 }
			 
			 //modify and verify the params
			 if(isCustomOptions)
				 modifyInitParams(g_temp.objCustomOptions);
			 			 
			 validateParams();
			 
			 //shuffle items
			 if(g_options.gallery_shuffle == true)
				 t.shuffleItems();
			 			 
			 //init the theme
			 initTheme(g_temp.objCustomOptions);
			 			 				 
			 //set gallery html elements
			 setGalleryHtml();

			 //set html properties to all elements
			 setHtmlObjectsProperties();
			 
			 var galleryWidth = g_objWrapper.width();
			 
			 if(galleryWidth == 0){
				 g_functions.waitForWidth(g_objWrapper, runGalleryActually);
			 }else
				 runGalleryActually();
			 
	}
	
	
	/**
	 * actually run the gallery
	 */
	function runGalleryActually(){
		 
		t.setSizeClass();
		
		if(g_temp.isFreestyleMode == false){
			 	
			 if(g_options.gallery_preserve_ratio == true)
				 setHeightByOriginalRatio();
		 }
		 
		 g_objTheme.run();
		 
		 if(g_objTabs && g_temp.isRunFirstTime)
			 g_objTabs.run();
		 
		 preloadBigImages();
		 
		 initEvents();
		 
		 //select first item
		 if(g_numItems > 0) 
			 t.selectItem(0);
		 
		 
		 //set autoplay
		 if(g_options.gallery_autoplay == true)
			 t.startPlayMode();
		 
		 g_temp.isRunFirstTime = false;
		
	}
	
	
	/**
	 * 
	 * show error message
	 */
	function showErrorMessage(message, prefix){

		if(typeof prefix == "undefined")
			var prefix = "<b>Unite Gallery Error: </b>";
				
		message = prefix + message;
		
		var html = "<div class='ug-error-message-wrapper'><div class='ug-error-message'>" + message + "</div></div>";
		
		g_objWrapper.children().remove();
		
		g_objWrapper.html(html);
		g_objWrapper.show();		
	}
	
	/**
	 * show error message and throw error
	 */
	function throwErrorShowMessage(message){
		showErrorMessage(message);
		throw new Error(message);
	}
	
	
	/**
	 * 
	 * @param objParams
	 */
	 function modifyInitParams(){
		 
		 //set default for preloading
		 if(!g_options.gallery_images_preload_type)
			 g_options.gallery_images_preload_type = "minimal";
		 
		 //normalize gallery min height and width
		 if(g_options.gallery_min_height == undefined || g_options.gallery_height < g_options.gallery_min_height){
			 g_options.gallery_min_height = 0;
		 }
		 
		 if(g_options.gallery_min_width == undefined || g_options.gallery_width < g_options.gallery_min_width){
			 g_options.gallery_min_width = 0;
		 }
		 
	 }

	
	/**
	 * validate the init parameters
	 */
	 function validateParams(){
		 
		 //validate theme:
		 if(!g_options.gallery_theme)
			 throw new Error("The gallery can't run without theme");
		 		 
		 //if(typeof g_options.theme != "function")
			 //throw new Error("Wrong theme function: " + g_options.theme.toString());
		 
		 //validate height and width
		 if(jQuery.isNumeric(g_options.gallery_height) && g_options.gallery_height < g_options.gallery_min_height)
			 throw new Error("The <b>gallery_height</b> option must be bigger then <b>gallery_min_height option</b>");
		 
		 if(g_options.gallery_width < g_options.gallery_min_width)
			 throw new Error("The <b>gallery_width</b> option must be bigger then <b>gallery_min_width option</b>");
		 
		 
	 }
	 
	 
	 /**
	 * set gallery html
	 */
	function setGalleryHtml(){
		
		 //add classes and divs
		 g_objWrapper.addClass("ug-gallery-wrapper");
		 
		 g_objWrapper.append("<div class='ug-overlay-disabled' style='display:none'></div>");
		 
		 t.setSizeClass();
	}
	
	
	/**
	 * if the thumbs panel don't exists, delete initial images from dom
	 */
	function clearInitData(){
		
		var objItems = g_objWrapper.children().remove();
	}
	
	
	/**
	 * store last gallery size
	 */
	function storeLastSize(){
		var objSize = t.getSize();
		
		g_temp.lastWidth = objSize.width;
		g_temp.lastHeight = objSize.height;
	}
	
	
	/**
	 * set gallery height by original ratio
	 */
	function setHeightByOriginalRatio(){
		
		var objSize = t.getSize();
				
		var ratio = objSize.width / objSize.height;
		
		if(ratio != objSize.orig_ratio){
			
			var newHeight = objSize.width / objSize.orig_ratio;
			newHeight = Math.round(newHeight);
			
			if(newHeight < g_options.gallery_min_height)
				newHeight = g_options.gallery_min_height;
			
			g_objWrapper.height(newHeight);
		}
	
	}

	
	/**
	 * set properties of the html objects
	 */
	function setHtmlObjectsProperties(){
		   
			var optionWidth = g_functions.getCssSizeParam(g_options.gallery_width);
			
		   //set size		
		   var objCss = {
				    //"width":optionWidth,		//make it work within tabs
				    "max-width":optionWidth,
					"min-width":g_functions.getCssSizeParam(g_options.gallery_min_width)
			};
		   
		   if(g_temp.isFreestyleMode == false){
			   
			   var galleryHeight = g_functions.getCssSizeParam(g_options.gallery_height);
			   objCss["height"] = galleryHeight;
		   
		   }else{
			   objCss["overflow"] = "visible";			   
		   }
		   
		   //set background color
		   if(g_options.gallery_background_color)
			   objCss["background-color"] = g_options.gallery_background_color;
		   
		   
		   g_objWrapper.css(objCss);
		   
	}

	
	/**
	 * fill items array from images object
	 */
	function fillItemsArray(arrChildren){
		
		g_arrItems = [];
		
		var isMobile = t.isMobileMode();
		
		 var numIndex = 0;
		 
		 for(var i=0;i<arrChildren.length;i++){
			 var objChild = jQuery(arrChildren[i]);
			 
			 var tagname = objChild.prop("tagName").toLowerCase();
			 
			 //handle link wrapper
			 var itemLink = "";
			 if(tagname == "a"){
				 itemLink = objChild.attr("href");
				 objChild = objChild.children();
				 var tagname = objChild.prop("tagName").toLowerCase();				 
			 }
			 
			 var itemType = objChild.data("type");
			 if(itemType == undefined)
				 itemType = "image";
			 
			 var objItem = {};
			 objItem.type = itemType;
			 
			 if(tagname == "img"){
				 
				 //protection agains lasy load
				 var lasyLoadSrc = objChild.data("lazyload-src");
				 if(lasyLoadSrc && lasyLoadSrc != ""){
					 objChild.attr("src", lasyLoadSrc);
					 jQuery.removeData(objChild, "lazyload-src");
				 }
				 
				 //src is thumb
				 var urlImage = objChild.data("image");
				 var urlThumb = objChild.data("thumb");
				 
				 if(typeof(urlImage) == "undefined")
					 urlImage = null;
				 
				 if(typeof(urlThumb) == "undefined")
					 urlThumb = null;
				 
				 var imageSrc = objChild.attr("src");
				 
				 if(!urlImage)
					 urlImage = imageSrc;
					 
				 if(!urlThumb)
					 urlThumb = imageSrc;
				 
				 if(!urlThumb)
					 urlThumb = urlImage;
				 
				 if(!urlImage)
					 urlImage = urlThumb;
				 
				 
				 objItem.urlThumb = urlThumb;
				 objItem.urlImage = urlImage;
				 				 
				 objItem.title = objChild.attr("alt");
				 
				 //always set thumb image to object
				 objItem.objThumbImage = objChild;
				 
				 objItem.objThumbImage.attr("src", objItem.urlThumb);
				 
			 }else{
				 
				 if(itemType == "image"){
					 trace("Problematic gallery item found:");
					 trace(objChild);
					 trace("Please look for some third party js script that could add this item to the gallery");
					 throw new Error("The item should not be image type");
				 }
				 
				 objItem.urlThumb = objChild.data("thumb");
				 objItem.title = objChild.data("title");
				 objItem.objThumbImage = null;
				 objItem.urlImage = objChild.data("image");
			 }
			 
			 
			 //check mobile version images
			 if(isMobile == true){
				 
				 var urlThumbMobile = objChild.data("thumb-mobile");
				 if(typeof urlThumbMobile != "undefined" && urlThumbMobile != ""){
					 objItem.urlThumb = urlThumbMobile;
	 			 	 
					 if(tagname == "img")
	 					 objChild.attr("src",objItem.urlThumb);
				 }
				 
				 var urlImageMobile = objChild.data("image-mobile");
				 if(typeof urlImageMobile != "undefined" && urlImageMobile != "")
					 objItem.urlImage = urlImageMobile;
			 }
			 
			 objItem.link = itemLink;
			 
			 //get description:
			 objItem.description = objChild.attr("title");
			 if(!objItem.description)				 
				 objItem.description = objChild.data("description");
			 
			 if(!objItem.description)
				 objItem.description = "";
			 
			 objItem.isLoaded = false;
			 objItem.isThumbImageLoaded = false;	//if the image loaded or error load
			 objItem.objPreloadImage = null;
			 objItem.isBigImageLoadStarted = false;
			 objItem.isBigImageLoaded = false;
			 objItem.isBigImageLoadError = false;			 
			 objItem.imageWidth = 0;
			 objItem.imageHeight = 0;
			 
			 //set thumb size
			 objItem.thumbWidth = 0;
			 objItem.thumbHeight = 0;
			 objItem.thumbRatioByWidth = 0;
			 objItem.thumbRatioByHeight = 0;
			 
			 var dataWidth = objChild.data("width");
			 var dataHeight = objChild.data("height");
			 if(dataWidth && typeof dataWidth == "number" && dataHeight && typeof dataHeight == "number"){
				 objItem.thumbWidth = dataWidth;
				 objItem.thumbHeight = dataHeight;
				 objItem.thumbRatioByWidth = dataWidth / dataHeight;
				 objItem.thumbRatioByHeight = dataHeight / dataWidth;
			 }
			 
			 objItem.addHtml = null;
			 
			 var isImageMissing = (objItem.urlImage == undefined || objItem.urlImage == "");
			 var isThumbMissing = (objItem.urlThumb == undefined || objItem.urlThumb == "");
			 
			 switch(objItem.type){
			 	case "youtube":			 		
					 objItem.videoid = objChild.data("videoid");
			 		 
					 if(isImageMissing || isThumbMissing){
						 
						 var objImages = g_ugYoutubeAPI.getVideoImages(objItem.videoid);
					 		
				 		 //set preview image
				 		 if(isImageMissing)
				 			objItem.urlImage = objImages.preview;
				 		
				 		 //set thumb image
				 		 if(isThumbMissing){
				 			 	objItem.urlThumb = objImages.thumb;
				 				
				 			 	 if(tagname == "img")
				 					 objChild.attr("src",objItem.urlThumb);
				 		 }
						 
					 }
					 
					 g_temp.isYoutubePresent = true;
				break;
			 	case "vimeo":
			 		
					objItem.videoid = objChild.data("videoid");
										
					g_temp.isVimeoPresent = true;
			 	break;
			 	case "html5video":
			 		objItem.videoogv = objChild.data("videoogv");
			 		objItem.videowebm = objChild.data("videowebm");
			 		objItem.videomp4 = objChild.data("videomp4");
			 		
			 		g_temp.isHtml5VideoPresent = true;
			 	break;
			 	case "soundcloud":
			 		objItem.trackid = objChild.data("trackid");
			 		g_temp.isSoundCloudPresent = true;
			 	break;
			 	case "wistia":
					 objItem.videoid = objChild.data("videoid");
					 g_temp.isWistiaPresent = true;
			 	break;
			 	case "custom":
					var objChildImage = objChild.children("img");
			 		
					if(objChildImage.length){
						objChildImage = jQuery(objChildImage[0]);
						
					    objItem.urlThumb = objChildImage.attr("src");
					    objItem.title = objChildImage.attr("alt");
					    objItem.objThumbImage = objChildImage;
			 		}
			 		
					//add additional html
					var objChildren = objChild.children().not("img:first-child");
			 		
					if(objChildren.length)
						objItem.addHtml = objChildren.clone();
			 		
			 	break;
			 }
			
			 //clear not needed attributes
			 if(objItem.objThumbImage){
				 objItem.objThumbImage.removeAttr("data-description", "");
				 objItem.objThumbImage.removeAttr("data-image", "");				 
				 objItem.objThumbImage.removeAttr("data-thumb", "");				 
				 objItem.objThumbImage.removeAttr("title", "");				 
			 }
			 
			 objItem.index = numIndex;
			 g_arrItems.push(objItem);
			 numIndex++;
			 
		 }
		 
		 
		 g_numItems = g_arrItems.length;
		 
	}
	
	
	/**
	 * load api's according presented item types
	 */
	function loadAPIs(){
		
		//load youtube api
		if(g_temp.isYoutubePresent)
			g_ugYoutubeAPI.loadAPI();
		
		if(g_temp.isVimeoPresent)
			g_ugVimeoAPI.loadAPI();
		
		if(g_temp.isHtml5VideoPresent)
			g_ugHtml5MediaAPI.loadAPI();
		
		if(g_temp.isSoundCloudPresent)
			g_ugSoundCloudAPI.loadAPI();
		
		if(g_temp.isWistiaPresent)
			g_ugWistiaAPI.loadAPI();
		
	}
	
	
	/**
	 * preload big images
	 */
	function preloadBigImages(){
		
		//check and fix preload type
		if(g_options.gallery_images_preload_type == "visible" && !g_objThumbs)
			g_options.gallery_images_preload_type = "minimal";
		
		if(g_temp.isAllItemsPreloaded == true)
			return(true);
		
		switch(g_options.gallery_images_preload_type){
			default:
			case "minimal":
			break;
			case "all":
				
				jQuery(g_arrItems).each(function(){	
					preloadItemImage(this);			
				});			
				
			break;
			case "visible":
				jQuery(g_arrItems).each(function(){		
					var objItem = this;
					var isVisible = g_objThumbs.isItemThumbVisible(objItem);
					
					if(isVisible == true)
						preloadItemImage(objItem);
				});
				
			break;
		}
				
	}
	
	/**
	 * check if item needed to preload and preload it
	 */
	function checkPreloadItemImage(objItem){
		
		if(objItem.isBigImageLoadStarted == true ||
				   objItem.isBigImageLoaded == true || 
				   objItem.isBigImageLoadError == true){
					return(false);			
		}
		
		switch(g_options.gallery_images_preload_type){
			default:
			case "minimal":
			break;
			case "all":			
					preloadItemImage(objItem);							
			break;
			case "visible":
				var isVisible = g_objThumbs.isItemThumbVisible(objItem);					
					if(isVisible == true)
						preloadItemImage(objItem);				
			break;
		}
		
	}
	
	/**
	 * preload item image
	 */
	function preloadItemImage(objItem){
		
		if(objItem.isBigImageLoadStarted == true ||
		   objItem.isBigImageLoaded == true || 
		   objItem.isBigImageLoadError == true){
			return(true);			
		}
		
		var imageUrl = objItem.urlImage;
		if(imageUrl == "" || imageUrl == undefined){
			objItem.isBigImageLoadError = true;
			return(false);
		}
		
		objItem.isBigImageLoadStarted = true;
				
		objItem.objPreloadImage = jQuery('<img/>').attr("src", imageUrl);
		objItem.objPreloadImage.data("itemIndex", objItem.index);
		
		//set image load event (not that reliable)
		objItem.objPreloadImage.on("load", t.onItemBigImageLoaded);
		
		//set load error event
		objItem.objPreloadImage.on( "error", function(){
			var objImage = jQuery(this);
			var itemIndex = objImage.data("itemIndex");
			var objItem = g_arrItems[itemIndex];
			
			//update error:
			objItem.isBigImageLoadError = true;
			objItem.isBigImageLoaded = false;
			
			//print error
			var imageUrl = jQuery(this).attr("src");
			console.log("Can't load image: "+ imageUrl);
			
			//try to load the image again
			g_objGallery.trigger(t.events.ITEM_IMAGE_UPDATED, [itemIndex, objItem.urlImage]);
			objItem.objThumbImage.attr("src", objItem.urlThumb);
			
		});
		
		//check the all items started preloading flag
		checkAllItemsStartedPreloading();
		
	}
	
	
	/**
	 * on item big image loaded event function. 
	 * Update image size and that the image has been preloaded
	 * can be called from another objects like the slider
	 */
	this.onItemBigImageLoaded = function(event, objImage){
				
		if(!objImage)
			var objImage = jQuery(this);
		
		var itemIndex = objImage.data("itemIndex");
		
		var objItem = g_arrItems[itemIndex];
		
		objItem.isBigImageLoaded = true;
		
		//get size with fallback function
		var objSize = g_functions.getImageOriginalSize(objImage);
		
		objItem.imageWidth = objSize.width;
		objItem.imageHeight = objSize.height;		
	}
	
	/**
	 * check and fill image size in item object
	 */
	this.checkFillImageSize = function(objImage, objItem){
		
		if(!objItem){
			var itemIndex = objImage.data("itemIndex");
			if(itemIndex === undefined)
				throw new Error("Wrong image given to gallery.checkFillImageSize");
			
			var objItem = g_arrItems[itemIndex];
		}
		
		var objSize = g_functions.getImageOriginalSize(objImage);
		
		objItem.imageWidth = objSize.width;
		objItem.imageHeight = objSize.height;		
	}
	
	
	/**
	 * preload next images near current item
	 */
	function preloadNearBigImages(objItem){
		
		if(g_temp.isAllItemsPreloaded == true)
			return(false);
		
		if(!objItem)
			var objItem = g_selectedItem;
		
		if(!objItem)
			return(true);
			
		var currentIndex = objItem.index;
		var lastItemIndex = currentIndex - 1;
		var nextItemIndex = currentIndex + 1;
		
		if(lastItemIndex > 0)
			preloadItemImage(g_arrItems[lastItemIndex]);
		
		if(nextItemIndex < g_numItems)
			preloadItemImage(g_arrItems[nextItemIndex]);
			
	}
	
	
	/**
	 * check that all items started preloading, if do, set 
	 * flag g_temp.isAllItemsPreloaded to true
	 */
	function checkAllItemsStartedPreloading(){
		
		if(g_temp.isAllItemsPreloaded == true)
			return(false);
		
		//if some of the items not started, exit function:
		for(var index in g_arrItems){
			if(g_arrItems[index].isBigImageLoadStarted == false)
				return(false);
		}
		
		//if all started, set flag to true
		g_temp.isAllItemsPreloaded = true;	
	}
	
	
	/**
	 * set freestyle mode
	 */
	this.setFreestyleMode = function(){
		
		g_temp.isFreestyleMode = true;
	
	}
	
	
	/**
	 * attach thumbs panel to the gallery
	 */
	this.attachThumbsPanel = function(type, objThumbs){
		g_temp.thumbsType = type;
		g_objThumbs = objThumbs;
	}
	
	
	/**
	 * init the slider
	 */	
	this.initSlider = function(customOptions, optionsPrefix){
		 
		 //mix options with user options
		 if(!customOptions)
			 var customOptions = {};
		 		 
		 customOptions = jQuery.extend(g_temp.objCustomOptions, customOptions);
		 
		 g_objSlider = new UGSlider();		 
		 g_objSlider.init(t, customOptions, optionsPrefix);
	}
	
	
	function __________END_INIT_GALLERY_______(){};
	
	function __________EVENTS_____________(){};

	
	/**
	 * on gallery mousewheel event handler, advance the thumbs
	 */
	this.onGalleryMouseWheel = function(event, delta, deltaX, deltaY){
		
		event.preventDefault();
		
		if(delta > 0)
			t.prevItem();
		else
			t.nextItem();
	}
	
	
	/**
	 * on mouse enter event
	 */
	function onSliderMouseEnter(event){
		
		if(g_options.gallery_pause_on_mouseover == true && t.isFullScreen() == false && g_temp.isPlayMode == true && g_objSlider && g_objSlider.isSlideActionActive() == false)
			t.pausePlaying();
	}
	
	
	/**
	 * on mouse move event
	 */
	function onSliderMouseLeave(event){
		
		if(g_options.gallery_pause_on_mouseover == true && g_temp.isPlayMode == true && g_objSlider && g_objSlider.isSlideActionActive() == false){
			
			var isStillLoading = g_objSlider.isCurrentSlideLoadingImage();
			
			if(isStillLoading == false)
				t.continuePlaying();
		}
		
	}
	
	
	/**
	 * on keypress - keyboard control
	 */
	function onKeyPress(event){
		 
		var obj = jQuery(event.target);
		if(obj.is("textarea") || obj.is("select") || obj.is("input"))
			return(true);
						
		 var keyCode = (event.charCode) ? event.charCode :((event.keyCode) ? event.keyCode :((event.which) ? event.which : 0));
		 
		 var wasAction = true;
		 
		 switch(keyCode){
			 case 39:	//right key
				 t.nextItem();
			 break;
			 case 37:	//left key
				 t.prevItem();
			 break;
			 default:
				 wasAction = false;
			 break; 
		 }
		 
		 //only first page gallery affected
		 
		 if(wasAction == true){
			 event.preventDefault();
			 event.stopPropagation();
			 event.stopImmediatePropagation();
		 }
		 
		g_objGallery.trigger(t.events.GALLERY_KEYPRESS, [keyCode,event]);
	}
	
	
	/**
	 * check that the gallery resized, if do, trigger onresize event
	 */
	function onGalleryResized(){
		
		var objSize = t.getSize();
		
		if(objSize.width == 0)	//fix hidden gallery change
			return(true);
		
		t.setSizeClass();
		
		var objSize = t.getSize();
				
		if(objSize.width != g_temp.lastWidth || objSize.height != g_temp.lastHeight){
			
			var heightWasSet = false;
			
			//set height with custom function (if exists)
			if(g_temp.funcCustomHeight){
				var newHeight = g_temp.funcCustomHeight(objSize);
				if(newHeight){
					g_objWrapper.height(newHeight);
					heightWasSet = true;
				}
			}
			
			if(heightWasSet == false && g_options.gallery_preserve_ratio == true && g_temp.isFreestyleMode == false)
				setHeightByOriginalRatio();
			
			storeLastSize();
			g_objGallery.trigger(t.events.SIZE_CHANGE);
			
		}
		
	}

	
	/**
	 * on strip move event
	 * preload visible images if that option selected
	 */
	function onThumbsChange(event){
		
		//preload visible images 
		if(g_options.gallery_images_preload_type == "visible" && g_temp.isAllItemsPreloaded == false){
			preloadBigImages();
		}
		
	}
	
	
	/**
	 * on full screen change event
	 */
	function onFullScreenChange(){
		
		
		var isFullscreen = g_functions.isFullScreen();
		var event = isFullscreen ? t.events.ENTER_FULLSCREEN:t.events.EXIT_FULLSCREEN; 

		 var fullscreenID = g_functions.getGlobalData("fullscreenID");
		 
		 //check if this gallery was affected
		 if(g_galleryID !== fullscreenID)
			 return(true);
		 		 
		 //add classes for the gallery
		 if(isFullscreen){
			 g_objWrapper.addClass("ug-fullscreen");
		 }else{
			 g_objWrapper.removeClass("ug-fullscreen");
		 }

		 g_objGallery.trigger(event);
		 
		 onGalleryResized();
	}
	
	/**
	 * on big image updated, if needed - preload this item image
	 */
	function onItemImageUpdated(event, index){
		
		var objItem = t.getItem(index);		
		checkPreloadItemImage(objItem);		
	}
	
	/**
	 * on current slide image load end. If playing mode, begin playing again
	 */
	function onCurrentSlideImageLoadEnd(){
		
		if(t.isPlayMode() == true)
			t.continuePlaying();
	}
	
	
	/**
	 * init all events
	 */
	function initEvents(){
		
		//avoid annoyong firefox image dragging
		g_objWrapper.on("dragstart",function(event){
			event.preventDefault();
		});
		
		//on big image updated, if needed - preload this item image
		g_objGallery.on(t.events.ITEM_IMAGE_UPDATED, onItemImageUpdated);
		
		//init custom event on strip moving
		if(g_objThumbs){
			switch(g_temp.thumbsType){
				case "strip":
					jQuery(g_objThumbs).on(g_objThumbs.events.STRIP_MOVE, onThumbsChange);
				break;
				case "grid":
					jQuery(g_objThumbs).on(g_objThumbs.events.PANE_CHANGE, onThumbsChange);
				break;
			}
		}
		
		//init mouse wheel
		if(g_options.gallery_mousewheel_role == "advance" && g_temp.isFreestyleMode == false)
			g_objWrapper.on("mousewheel", t.onGalleryMouseWheel);
		
		 //on resize event
		 storeLastSize();
		 
		 jQuery(window).resize(function(){
			 g_objWrapper.css("width","auto");
			 g_functions.whenContiniousEventOver("gallery_resize", onGalleryResized, g_temp.resizeDelay);
		 });
		 
		 //check resize once in a time, start from 10 seconds
		 setTimeout(function(){
			 setInterval(onGalleryResized, 2000);			 
		 }, 10000);
		 
		 
		 //fullscreen:
		 g_functions.addFullScreenChangeEvent(onFullScreenChange);
		 
		 //on slider item changed event
		 if(g_objSlider){
			 
			 jQuery(g_objSlider).on(g_objSlider.events.ITEM_CHANGED, function(){
				 var sliderIndex = g_objSlider.getCurrentItemIndex();
				 				 
				 if(sliderIndex != -1)
					 t.selectItem(sliderIndex);
			 });
			 
			 //add slider onmousemove event
			 if(g_options.gallery_pause_on_mouseover == true){
				 var sliderElement = g_objSlider.getElement();
				 sliderElement.hover(onSliderMouseEnter, onSliderMouseLeave);
				 
				 //on full screen, run on mouse leave
				 g_objGallery.on(t.events.ENTER_FULLSCREEN, function(){
						 onSliderMouseLeave();
				 });
				 
			 }
			 
			 //retrigger slider events
			 retriggerEvent(g_objSlider, g_objSlider.events.ACTION_START, t.events.SLIDER_ACTION_START);
			 retriggerEvent(g_objSlider, g_objSlider.events.ACTION_END, t.events.SLIDER_ACTION_END);
			 
			 jQuery(g_objSlider).on(g_objSlider.events.CURRENTSLIDE_LOAD_END, onCurrentSlideImageLoadEnd);
		 
		 }
		  
		 //add keyboard events
		 if(g_options.gallery_control_keyboard == true)
			 jQuery(document).keydown(onKeyPress);
		 		 
	}
	
	
	/**
	 * destroy all gallery events
	 */
	this.destroy = function(){
		
		g_objWrapper.off("dragstart");
		g_objGallery.off(t.events.ITEM_IMAGE_UPDATED);
		
		//init custom event on strip moving
		if(g_objThumbs){
			switch(g_temp.thumbsType){
				case "strip":
					jQuery(g_objThumbs).off(g_objThumbs.events.STRIP_MOVE);
				break;
				case "grid":
					jQuery(g_objThumbs).off(g_objThumbs.events.PANE_CHANGE);
				break;
			}
		}
		
		 g_objWrapper.off("mousewheel");
		
		 jQuery(window).off("resize");
		 
		 //fullscreen:
		 g_functions.destroyFullScreenChangeEvent();
		 
		 //on slider item changed event
		 if(g_objSlider){
			 
			 jQuery(g_objSlider).off(g_objSlider.events.ITEM_CHANGED);
			 
			 //add slider onmousemove event
			 var sliderElement = g_objSlider.getElement();
			 sliderElement.off("mouseenter");
			 sliderElement.off("mouseleave");
			 
			 g_objGallery.off(t.events.ENTER_FULLSCREEN);
			 jQuery(g_objSlider).off(g_objSlider.events.ACTION_START);
			 jQuery(g_objSlider).off(g_objSlider.events.ACTION_END);
			 jQuery(g_objSlider).off(g_objSlider.events.CURRENTSLIDE_LOAD_END);
		 }
		 		 
		 //add keyboard events
		 if(g_options.gallery_control_keyboard == true)
			 jQuery(document).off("keydown");
		
		 //destroy theme
		 if(g_objTheme && typeof g_objTheme.destroy == "function"){
			 g_objTheme.destroy();
		 }

		 g_objWrapper.html("");
	}
	
	
	function __________GENERAL_______(){};
	
	/**
	 * get items array
	 */
	this.getArrItems = function(){
		return g_arrItems;
	}
	
	/**
	 * get gallery objects
	 */
	this.getObjects = function(){
			
		var objects = {
			g_galleryID:g_galleryID,
			g_objWrapper:g_objWrapper,
			g_objThumbs:g_objThumbs,
			g_objSlider:g_objSlider,
			g_options:g_options,
			g_arrItems:g_arrItems,
			g_numItems:g_numItems
		};
		
		return(objects);
	}
	
	/**
	 * get slider object
	 */
	this.getObjSlider = function(){
		
		return(g_objSlider);
	}
	
	
	/**
	 * 
	 * get item by index, if the index don't fit, trace error
	 */
	this.getItem = function(index){
		if(index < 0){
			throw new Error("item with index: " + index + " not found");
			return(null);
		}
		if(index >= g_numItems){
			throw new Error("item with index: " + index + " not found");
			return(null);			
		}
		
		return(g_arrItems[index]);
	}
	
	
	/**
	 * get gallery width
	 */
	this.getWidth = function(){
		
		var objSize = t.getSize();
				
		return(objSize.width);
	}
	
	/**
	 * get gallery height
	 */
	this.getHeight = function(){
		
		var objSize = t.getSize();
		
		return(objSize.height);
	}
	
	
	/**
	 * get gallery size
	 */
	this.getSize = function(){
		
		var objSize = g_functions.getElementSize(g_objWrapper);
		
		objSize.orig_width = g_options.gallery_width;
		objSize.orig_height = g_options.gallery_height;
		objSize.orig_ratio = objSize.orig_width / objSize.orig_height;
		
		return(objSize);
	}
	
	/**
	 * get gallery ID
	 */
	this.getGalleryID = function(){
		
		var id = g_galleryID.replace("#","");
			
		return(id);
	}
	
	/**
	 * get next item by current index (or current object)
	 */
	this.getNextItem = function(index, forceCarousel){
		
		if(typeof index == "object")
			index = index.index;
		
		var nextIndex = index + 1;
		
		if(forceCarousel !== true && g_numItems == 1)
			return(null);
		
		if(nextIndex >= g_numItems){
			
			if(g_options.gallery_carousel == true || forceCarousel === true)
				nextIndex = 0;
			else
				return(null);
		}
		
		var objItem = g_arrItems[nextIndex];
		
		return(objItem);			
	}
	
	
	/**
	 * get previous item by index (or item object)
	 */
	this.getPrevItem = function(index){
		
		if(typeof index == "object")
			index = index.index;
		
		var prevIndex = index - 1;
		
		if(prevIndex < 0){
			if(g_options.gallery_carousel == true || forceCarousel === true)
				prevIndex = g_numItems - 1;
			else
				return(null);
		}
		
		var objItem = g_arrItems[prevIndex];
		
		return(objItem);
	}
	
	
	
	/**
	 * get selected item
	 */
	this.getSelectedItem = function(){
		
		return(g_selectedItem);
	}
	
	/**
	 * get selected item index
	 */
	this.getSelectedItemIndex = function(){
		
		return(g_selectedItemIndex);
	}
	
	
	/**
	 * get number of items
	 */
	this.getNumItems = function(){
		return g_numItems;
	}
	
	/**
	 * get true if the current item is last
	 */
	this.isLastItem = function(){
		if(g_selectedItemIndex == g_numItems - 1)
			return(true);
		
		return(false);
	}
	
	
	/**
	 * get true if the current item is first
	 */
	this.isFirstItem = function(){
		if(g_selectedItemIndex == 0)
			return(true);
		return(false);
	}
	
	
	/**
	 * get gallery options
	 */
	this.getOptions = function(){
		return g_options;
	}
	
	
	/**
	 * get the gallery wrapper element
	 */
	this.getElement = function(){
		return(g_objWrapper);
	}
	
	
	this.___________SET_CONTROLS___________ = function(){}
	
	/**
	 * set next button element
	 * set onclick event
	 */
	this.setNextButton = function(objButton){
		
		//register button as a unite gallery belong
		objButton.data("ug-button", true);
		
		g_functions.setButtonOnClick(objButton, t.nextItem);
		
	}
	
	
	/**
	 * set prev button element
	 * set onclick event
	 */
	this.setPrevButton = function(objButton){
		
		//register button as a unite gallery belong
		objButton.data("ug-button", true);
		
		g_functions.setButtonOnClick(objButton, t.prevItem);
				
	}
	
	
	/**
	 * set fullscreen button to enter / exit fullscreen.
	 * on fullscreen mode ug-fullscreenmode class wil be added
	 */
	this.setFullScreenToggleButton = function(objButton){
		
		//register button as a unite gallery belong
		objButton.data("ug-button", true);

		g_functions.setButtonOnClick(objButton, t.toggleFullscreen);
		
		g_objGallery.on(t.events.ENTER_FULLSCREEN,function(){
			objButton.addClass("ug-fullscreenmode");
		});
		
		g_objGallery.on(t.events.EXIT_FULLSCREEN,function(){
			objButton.removeClass("ug-fullscreenmode");
		});
				
	}
	
	
	/**
	 * destroy full screen button
	 */
	this.destroyFullscreenButton = function(objButton){
		
		g_functions.destroyButton(objButton);
		
		g_objGallery.off(t.events.ENTER_FULLSCREEN);
		g_objGallery.off(t.events.EXIT_FULLSCREEN);
	}
	
	
	/**
	 * set play button event
	 */
	this.setPlayButton = function(objButton){
		
		//register button as a unite gallery belong
		objButton.data("ug-button", true);
		
		g_functions.setButtonOnClick(objButton, t.togglePlayMode);
		
		g_objGallery.on(t.events.START_PLAY,function(){
			objButton.addClass("ug-stop-mode");
		});
		
		g_objGallery.on(t.events.STOP_PLAY, function(){
			objButton.removeClass("ug-stop-mode");
		});
		
	}
	
	/**
	 * destroy the play button
	 */
	this.destroyPlayButton = function(objButton){
		g_functions.destroyButton(objButton);
		g_objGallery.off(t.events.START_PLAY);
		g_objGallery.off(t.events.STOP_PLAY);
	}
	
	/**
	 * set playing progress indicator
	 */
	this.setProgressIndicator = function(objProgress){
		
		g_temp.objProgress = objProgress;		
	}
	
	
	/**
	 * set title and descreiption containers
	 */
	this.setTextContainers = function(objTitle, objDescription){
		
		g_objGallery.on(t.events.ITEM_CHANGE, function(){
			
			var objItem = t.getSelectedItem();			
			objTitle.html(objItem.title);
			objDescription.html(objItem.description);
			
		});
		
	}
	
	/**
	 * show overlay disabled
	 */
	this.showDisabledOverlay = function(){
		g_objWrapper.children(".ug-overlay-disabled").show();
	}

	/**
	 * show overlay disabled
	 */
	this.hideDisabledOverlay = function(){
		g_objWrapper.children(".ug-overlay-disabled").hide();
	}
	
	this.___________END_SET_CONTROLS___________ = function(){}

	
	/**
	 * cache items, put to cache array by id
	 * the items must be unprocessed yet
	 */
	function cacheItems(cacheID, htmlItemsArg){
			
		if(htmlItemsArg){
			var htmlItems = htmlItemsArg;
			if(htmlItems != "noitems")
				htmlItems = jQuery(htmlItemsArg).clone();
		}else{
			var htmlItems = g_objWrapper.children().clone();
		}
		
		g_objCache[cacheID] = htmlItems;
	}
	
	
	/**
	 * remove all size classes
	 */
	function removeAllSizeClasses(objWrapper){
		
		if(!objWrapper)
			objWrapper = g_objWrapper;
		
		objWrapper.removeClass("ug-under-480");
		objWrapper.removeClass("ug-under-780");
		objWrapper.removeClass("ug-under-960");
	}
	
	
	
	
	/**
	 * retrigger event from another objects
	 * the second parameter will be the second object
	 */
	function retriggerEvent(object, originalEvent, newEvent){
		
		jQuery(object).on(originalEvent, function(event){
			g_objGallery.trigger(newEvent, [this]);
		});
	
	}
	
	
	/**
	 * advance next play step
	 */
	function advanceNextStep(){
				
		var timeNow = jQuery.now();
		var timeDiff = timeNow - g_temp.playTimeLastStep;
		g_temp.playTimePassed += timeDiff;
		g_temp.playTimeLastStep = timeNow;
		
		//set the progress
		if(g_temp.objProgress){
			var percent = g_temp.playTimePassed / g_options.gallery_play_interval;
			g_temp.objProgress.setProgress(percent);
		}
		
		//if interval passed - proceed to next item
		if(g_temp.playTimePassed >= g_options.gallery_play_interval){
			
			t.nextItem();
			g_temp.playTimePassed = 0;			
		}
		
		
	}
	
	this.___________PLAY_MODE___________ = function(){}
	
	
	/**
	 * start play mode
	 */
	this.startPlayMode = function(){
		
		g_temp.isPlayMode = true;
		g_temp.isPlayModePaused = false;
		
		g_temp.playTimePassed = 0;
		g_temp.playTimeLastStep = jQuery.now();
		
		g_temp.playHandle = setInterval(advanceNextStep, g_temp.playStepInterval);
		
		//show and reset progress indicator
		if(g_temp.objProgress){
			var objElement = g_temp.objProgress.getElement();
			g_temp.objProgress.setProgress(0);
			objElement.show();
		}
		
		g_objGallery.trigger(t.events.START_PLAY);
		
		//check if there is a need to pause
		if(g_objSlider && g_objSlider.isCurrentSlideLoadingImage() == true){
			t.pausePlaying();
		}
		
	}
	
	
	/**
	 * reset playing - set the timer to 0
	 */
	this.resetPlaying = function(){
		
		if(g_temp.isPlayMode == false)
			return(true);
		
		g_temp.playTimePassed = 0;
		g_temp.playTimeLastStep = jQuery.now();
	}
	
	
	/**
	 * pause playing slideshow
	 */
	this.pausePlaying = function(){
		
		if(g_temp.isPlayModePaused == true)
			return(true);
		
		g_temp.isPlayModePaused = true;
		clearInterval(g_temp.playHandle);
		
		g_objGallery.trigger(t.events.PAUSE_PLAYING);
	}
	
	
	/**
	 * continue playing slideshow
	 */
	this.continuePlaying = function(){
		
		if(g_temp.isPlayModePaused == false)
			return(true);
		
		g_temp.isPlayModePaused = false;
		g_temp.playTimeLastStep = jQuery.now();
		g_temp.playHandle = setInterval(advanceNextStep, g_temp.playStepInterval);
		
	}
	
	
	/**
	 * stop play mode
	 */
	this.stopPlayMode = function(){
		g_temp.isPlayMode = false;
		clearInterval(g_temp.playHandle);
			
		g_temp.playTimePassed = 0;
		
		//hide progress indicator
		if(g_temp.objProgress){
			var objElement = g_temp.objProgress.getElement();
			objElement.hide();
		}
		
		g_objGallery.trigger(t.events.STOP_PLAY);
	}
	
	
	/**
	 * tells if the play mode are active
	 */
	this.isPlayMode = function(){
		
		return(g_temp.isPlayMode);
	}
	
	
	/**
	 * start / stop play mode
	 */
	this.togglePlayMode = function(){
		
		if(t.isPlayMode() == false)
			t.startPlayMode();
		else
			t.stopPlayMode();
	}

	
	/**
	 * unselect all items
	 */
	function unselectSeletedItem(){
		
		if(g_selectedItem == null)
			return(true);
		
		if(g_objThumbs)
			g_objThumbs.setThumbUnselected(g_selectedItem.objThumbWrapper);
		
		g_selectedItem = null;
		g_selectedItemIndex = -1;
	}	
	
	
	this.___________GENERAL_EXTERNAL___________ = function(){}
	
	/**
	 * shuffle items - usually before theme start
	 */
	this.shuffleItems = function(){

		g_arrItems = g_functions.arrayShuffle(g_arrItems);
		
		for(var index in g_arrItems)		//fix index
			g_arrItems[index].index = parseInt(index);
		
	}
	
	/**
	 * set main gallery params, extend current params
	 */
	this.setOptions = function(customOptions){
				
		g_options = jQuery.extend(g_options, customOptions);		
	}
	
	
	/**
	 * select some item
	 * the input can be index or object
	 * role - the role of the object who selected the item
	 */
	this.selectItem = function(objItem, role){
		
		if(typeof objItem == "number")
			objItem = t.getItem(objItem);
		
		var itemIndex = objItem.index;
		if(itemIndex == g_selectedItemIndex)
			return(true);
				
		unselectSeletedItem();
				
		//set selected item
		g_selectedItem = objItem;		
		g_selectedItemIndex = itemIndex;
		
		g_objGallery.trigger(t.events.ITEM_CHANGE, [objItem,role]);
		
		//reset playback, if playing
		if(g_temp.isPlayMode == true){
				t.resetPlaying();
			
			var stillLoading = g_objSlider.isCurrentSlideLoadingImage();
			if(stillLoading == true)
				t.pausePlaying();
		}
				
	}
	
	
	/**
	 * go to next item
	 */
	this.nextItem = function(){
		
		var newItemIndex = g_selectedItemIndex + 1;
		
		if(g_numItems == 0)
			return(true);		
		
		if(g_options.gallery_carousel == false && newItemIndex >= g_numItems)
			return(true);
		
		if(newItemIndex >= g_numItems)
			newItemIndex = 0;
		
		//debugLine(newItemIndex,true);
		
		t.selectItem(newItemIndex, "next");
	}
	
	
	/**
	 * go to previous item
	 */
	this.prevItem = function(){
		
		var newItemIndex = g_selectedItemIndex - 1;
		
		if(g_selectedItemIndex == -1)
			newItemIndex = 0;
		
		if(g_numItems == 0)
			return(true);
		
		if(g_options.gallery_carousel == false && newItemIndex < 0)
			return(true);
		
		if(newItemIndex < 0)
			newItemIndex = g_numItems - 1;
		
		t.selectItem(newItemIndex, "prev");
		
	}
	
	
	/**
	 * expand gallery to body size
	 */
	function toFakeFullScreen(){
		
		jQuery("body").addClass("ug-body-fullscreen");
		g_objWrapper.addClass("ug-fake-fullscreen");
		
		g_temp.isFakeFullscreen = true;
		
		g_objGallery.trigger(t.events.ENTER_FULLSCREEN);
		g_objGallery.trigger(t.events.SIZE_CHANGE);
	}
	
	
	/**
	 * exit fake fullscreen
	 */
	function exitFakeFullscreen(){
		
		jQuery("body").removeClass("ug-body-fullscreen");
		g_objWrapper.removeClass("ug-fake-fullscreen");
		
		g_temp.isFakeFullscreen = false;
		
		g_objGallery.trigger(t.events.EXIT_FULLSCREEN);
		g_objGallery.trigger(t.events.SIZE_CHANGE);
		
	}
	
	/**
	 * return if the fullscreen mode is available
	 */
	this.isFullScreen = function(){
		
		if(g_temp.isFakeFullscreen == true)
			return(true);
		
		if(g_functions.isFullScreen() == true)
			return(true);
		
		return(false);		
	}
	
	
	/**
	 * tells if it's fake fullscreen
	 */
	this.isFakeFullscreen = function(){
		
		return(g_temp.isFakeFullscreen);
	}
	
	
	/**
	 * go to fullscreen mode
	 */
	this.toFullScreen = function(){
		
		g_functions.setGlobalData("fullscreenID", g_galleryID);
		
		var divGallery = g_objWrapper.get(0);
		
		var isSupported = g_functions.toFullscreen(divGallery);
				
		if(isSupported == false)
			toFakeFullScreen();
		
	}
	
	
	/**
	 * exit full screen
	 */
	this.exitFullScreen = function(){
		
		if(g_temp.isFakeFullscreen == true)
			exitFakeFullscreen();
		else
			g_functions.exitFullscreen();
						
	}
	
	/**
	 * toggle fullscreen
	 */
	this.toggleFullscreen = function(){
		
		if(t.isFullScreen() == false){
			t.toFullScreen();
		}else{
			t.exitFullScreen();
		}
		
	}
	
	/**
	 * resize the gallery
	 * noevent - initally false
	 */
	this.resize = function(newWidth, newHeight, noevent){
		
		g_objWrapper.css("width", "auto");
		g_objWrapper.css("max-width",newWidth+"px");
		
		if(newHeight)
			g_objWrapper.height(newHeight);
		
		if(!noevent && noevent !== true)
			onGalleryResized();
		
	}

	
	/**
	 * set size class to the wrapper
	 * this can work to any other wrapper too
	 */
	this.setSizeClass = function(objWrapper, width){
		
		if(!objWrapper)
			var objWrapper = g_objWrapper;
		
		if(!width){
			var objSize = t.getSize();
			var width = objSize.width;			
		}
		
		if(width == 0)
			var width = jQuery(window).width();
		
		var addClass = "";
		
		if(width <= 480){
			addClass = "ug-under-480";			
		}else
		if(width <= 780){
			addClass = "ug-under-780";			
		}else
		if(width < 960){
			addClass = "ug-under-960";
		}
		
		if(objWrapper.hasClass(addClass) == true)
			return(true);
		
		removeAllSizeClasses(objWrapper);
		if(addClass != "")
			objWrapper.addClass(addClass);
	}
	
	
	/**
	 * return if the size is suited for mobile
	 */
	this.isMobileMode = function(){
		
		if(g_objWrapper.hasClass("ug-under-480"))
			return(true);
		
		return(false);
	}
	
	
	/**
	 * get if small screen
	 */
	this.isSmallWindow = function(){
		
		var windowWidth = jQuery(window).width();
		
		
		if(!windowWidth)
			return(true);
		
		if(windowWidth <= 480)
			return(true);
		
		return(false);
	}
	
	
	/**
	 * change gallery items
	 */
	this.changeItems = function(itemsContent, cacheID){
		
		if(!itemsContent)
			var itemsContent = "noitems";
		
		runGallery(g_galleryID, "nochange", itemsContent, cacheID);
	}
	
	/**
	 * show error message, replace whole gallery div
	 */
	this.showErrorMessageReplaceGallery = function(message){
		showErrorMessage(message);
	}
	
	/**
	 * set custom height function by width
	 */
	this.setFuncCustomHeight = function(func){
		g_temp.funcCustomHeight = func;
	}
	
	this.__________AJAX_REQUEST_______ = function(){};
	
	
	/**
	 * ajax request
	 */
	this.ajaxRequest = function(action, data, isJSON, successFunction){
		
		var dataType = "html";
		if(isJSON == true)
			dataType = "json";
				
		if(!successFunction || typeof successFunction != "function")
			throw new Error("ajaxRequest error: success function should be passed");

		var urlAjax = g_options.gallery_urlajax;
		if(urlAjax == "")
			throw new Error("ajaxRequest error: Ajax url don't passed");
		
		if(typeof data == "undefined")
			var data = {};

		//add galleryID to data
		var objData = {
				action:"unitegallery_ajax_action",
				client_action:action,
				galleryID: g_galleryID,
				data:data
		};
		
		jQuery.ajax({
			type:"post",
			url:g_options.gallery_urlajax,
			dataType: 'json',
			data:objData,
			success:function(response){
				
				if(!response){
					showErrorMessage("Empty ajax response!", "Ajax Error");
					return(false);					
				}

				if(response == -1 || response === 0){
					showErrorMessage("ajax error!!!");
					return(false);
				}

				if(typeof response.success == "undefined"){
					showErrorMessage("The 'success' param is a must!");
					return(false);
				}
				
				if(response.success == false){
					showErrorMessage(response.message);
					return(false);
				}
				
				successFunction(response);
			},		 	
			error:function(jqXHR, textStatus, errorThrown){
				console.log("Ajax Error!!! " + textStatus);
			}
		});
		
	}
	
	
	/**
	 * request new items
	 * isForce - don't take from cache
	 */
	this.requestNewItems = function(catID, isForce, cacheID){
		
		var checkCache = g_options.gallery_enable_cache;
		
		if(!cacheID)
			cacheID = catID;
		
		if(isForce == true)
			checkCache = false;
		
		//get items from cache
		if(checkCache == true && g_objCache.hasOwnProperty(cacheID)){
			
			var htmlItems = g_objCache[cacheID];
			
			t.changeItems(htmlItems, cacheID);
			
		}else{
			
			g_objGallery.trigger(t.events.GALLERY_BEFORE_REQUEST_ITEMS);
			
			t.ajaxRequest("front_get_cat_items",{catid:catID}, true, function(response){
				
				var htmlItems = response.html;
								
				t.changeItems(htmlItems, cacheID);
				
			});
			
		}
		
	}
	
	
	/**
	 * run the gallery
	 */
	 this.run = function(galleryID, objParams){
		 
		 
		 var debug_errors = g_options.gallery_debug_errors;
		 if(objParams && objParams.hasOwnProperty("gallery_debug_errors"))
			 g_options.gallery_debug_errors = objParams.gallery_debug_errors;

		 
		 if(g_options.gallery_debug_errors == true){
			 
			 try{
				 
				 runGallery(galleryID, objParams);
				 
				 
			 }catch(objError){
				 if(typeof objError == "object"){
					 
					 var message = objError.message;
					 var lineNumber = objError.lineNumber;
					 var fileName = objError.fileName;
					 var stack = objError.stack;
					 
					 message += " <br><br> in file: "+fileName;
					 message += " <b> line " + lineNumber + "</b>";
					 
					 trace(objError);
					 
				 }else{
					 var message = objError;
				 }
				 
				 //remove double "error:" text
				 message = message.replace("Error:","");
				 
				 showErrorMessage(message);
			 }
			 
		 }else{
			 runGallery(galleryID, objParams);
		 }
		 
		 		 
		 
	 }
	 	 	 
}	//unitegallery object end

