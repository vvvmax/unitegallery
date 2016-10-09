/**
 * slider class
 * addon to strip gallery
 */
function UGSlider(){
	
	var t = this, g_objThis = jQuery(t);
	var g_gallery = new UniteGalleryMain(), g_objGallery, g_objWrapper, g_objThumbs;	
	//the video arrows is independent arrows that is not sitting on the controls
	var g_objSlider, g_objInner, g_objSlide1, g_objSlide2, g_objSlide3, g_objArrowLeft, g_objArrowRight;
	var g_objTouchSlider, g_objZoomSlider, g_objZoomPanel, g_objButtonPlay = null, g_objButtonFullscreen = null, g_objBullets = null;
	var g_objVideoPlayer = new UGVideoPlayer(), g_optionsPrefix;
	var g_functions = new UGFunctions(), g_objProgress = null, g_objTextPanel = null;
	
	
	this.events = {		
		ITEM_CHANGED: "item_changed",				//on item changed
		BEFORE_SWITCH_SLIDES: "before_switch",		//before slides switching
		BEFORE_RETURN: "before_return",				//before return from pan or from zoom
		AFTER_RETURN: "after_return",				//after return from pan or from zoom
		ZOOM_START: "slider_zoom_start",			//on zoom start 
		ZOOM_END: "slider_zoom_end",				//on zoom move 
		ZOOMING: "slider_zooming",					//on zooming
		ZOOM_CHANGE: "slider_zoom_change",			//on slide image image zoom change	
		START_DRAG: "start_drag",					//on slider drag start
		AFTER_DRAG_CHANGE: "after_drag_change",		//after finish drag chagne transition
		ACTION_START: "action_start",				//on slide action start
		ACTION_END: "action_end",					//on slide action stop
		CLICK: "slider_click",						//on click event
		TRANSITION_START:"slider_transition_start",	//before transition start event
		TRANSITION_END:"slider_transition_end",		//on transition end event
		AFTER_PUT_IMAGE: "after_put_image",			//after put slide image
		IMAGE_MOUSEENTER: "slider_image_mouseenter", //on slide image mouseonter
		IMAGE_MOUSELEAVE: "slider_image_mouseleave",	 		//on slide image mouseleave
		CURRENTSLIDE_LOAD_START: "slider_current_loadstart",	//on current slide load image start
		CURRENTSLIDE_LOAD_END: "slider_current_loadend"		//on finish load current slide image
	}
	
	var g_options = {
		  slider_scale_mode: "fill",					//fit: scale down and up the image to always fit the slider
		  												//down: scale down only, smaller images will be shown, don't enlarge images (scale up)
		  												//fill: fill the entire slider space by scaling, cropping and centering the image
		  												//fitvert: make the image always fill the vertical slider area
		  slider_scale_mode_media: "fill",				//fill, fit, down, fitvert - scale mode on media items
		  slider_scale_mode_fullscreen: "down",			//fill, fit, down, fitvert - scale mode on fullscreen.
		  		  
		  slider_item_padding_top: 0,					//padding top of the slider item
		  slider_item_padding_bottom: 0,				//padding bottom of the slider item
		  slider_item_padding_left: 0,					//padding left of the slider item
		  slider_item_padding_right: 0,					//padding right of the slider item
		  
		  slider_background_color: "",					//slider background color, set if you want to change default
		  slider_background_opacity: 1,					//slider background opacity
		  
		  slider_image_padding_top: 0,					//padding top of the image inside the item
		  slider_image_padding_bottom: 0,				//padding bottom of the image inside the item
		  slider_image_padding_left: 0,					//padding left of the image inside the item
		  slider_image_padding_right: 0,				//padding right of the image inside the item

		  slider_image_border: false,					//enable border around the image
		  slider_image_border_width: 10,				//image border width
		  slider_image_border_color: "#ffffff",			//image border color
		  slider_image_border_radius: 0,				//image border radius
		  slider_image_border_maxratio: 0.35,			//max ratio that the border can take from the image
		  slider_image_shadow: false,					//enable border shadow the image
		  
		  slider_video_constantsize: false, 			//constant video size mode for video items
		  slider_video_constantsize_scalemode: "fit", 	//fit,down: constant video size scale mode
		  slider_video_constantsize_width: 854,			//constant video size width
		  slider_video_constantsize_height: 480,		//constant video size height
		  
		  slider_video_padding_top: 0,					//padding top of the video player inside the item
		  slider_video_padding_bottom: 0,				//padding bottom of the video player inside the item
		  slider_video_padding_left: 0,					//padding left of the video player inside the item
		  slider_video_padding_right: 0,				//padding right of the video player inside the item
		  
		  slider_video_enable_closebutton: true,		//enable video close button
		  
		  slider_transition: "slide",					//fade, slide - the transition of the slide change
		  slider_transition_speed:300,				 	//transition duration of slide change
		  slider_transition_easing: "easeInOutQuad",	//transition easing function of slide change
		  
		  slider_control_swipe:true,					//true,false - enable swiping control
		  slider_control_zoom:true,						//true, false - enable zooming control
		  slider_zoom_mousewheel: true,					//enable zoom on mousewheel
		  slider_vertical_scroll_ondrag: false,			//vertical scroll on slider area drag					  
		  slider_loader_type: 1,						//shape of the loader (1-7)
		  slider_loader_color:"white",					//color of the loader: (black , white)
		  slider_enable_links: true,					//enable slide as link functionality
		  slider_links_newpage: false,					//open the slide link in new page
		  
		  slider_enable_bullets: false,					//enable the bullets onslider element
		  slider_bullets_skin: "",						//skin of the bullets, if empty inherit from gallery skin
		  slider_bullets_space_between: -1,				//set the space between bullets. If -1 then will be set default space from the skins
		  slider_bullets_align_hor:"center",			//left, center, right - bullets horizontal align
		  slider_bullets_align_vert:"bottom",			//top, middle, bottom - bullets vertical algin
		  slider_bullets_offset_hor:0,					//bullets horizontal offset 
		  slider_bullets_offset_vert:10,				//bullets vertical offset
		  
		  slider_enable_arrows: true,					//enable arrows onslider element
		  slider_arrows_skin: "",						//skin of the slider arrows, if empty inherit from gallery skin
		  
		  slider_arrow_left_align_hor:"left",	  		//left, center, right - left arrow horizonal align
		  slider_arrow_left_align_vert:"middle", 		//top, middle, bottom - left arrow vertical align
		  slider_arrow_left_offset_hor:20,		  		//left arrow horizontal offset
		  slider_arrow_left_offset_vert:0,		  		//left arrow vertical offset
		  
		  slider_arrow_right_align_hor:"right",   		//left, center, right - right arrow horizontal algin
		  slider_arrow_right_align_vert:"middle", 		//top, middle, bottom - right arrow vertical align
		  slider_arrow_right_offset_hor:20,	   			//right arrow horizontal offset 
		  slider_arrow_right_offset_vert:0,	   			//right arrow vertical offset
		  
		  slider_enable_progress_indicator: true,		 //enable progress indicator element
		  slider_progress_indicator_type: "pie",		 //pie, pie2, bar (if pie not supported, it will switch to bar automatically)
		  slider_progress_indicator_align_hor:"right",   //left, center, right - progress indicator horizontal align
		  slider_progress_indicator_align_vert:"top",    //top, middle, bottom - progress indicator vertical align
		  slider_progress_indicator_offset_hor:10,	     //progress indicator horizontal offset 
		  slider_progress_indicator_offset_vert:10,	     //progress indicator vertical offset
		  
		  slider_enable_play_button: true,				 //true,false - enable play / pause button onslider element
		  slider_play_button_skin: "",					 //skin of the slider play button, if empty inherit from gallery skin
		  slider_play_button_align_hor:"left",    		 //left, center, right - play button horizontal align
		  slider_play_button_align_vert:"top",     		 //top, middle, bottom - play button vertical align
		  slider_play_button_offset_hor:40,	       		 //play button horizontal offset 
		  slider_play_button_offset_vert:8,	   			 //play button vertical offset
		  slider_play_button_mobilehide:false,		 	 //hide the play button on mobile
		  
		  slider_enable_fullscreen_button: true,		 //true,false - enable fullscreen button onslider element
		  slider_fullscreen_button_skin: "",			 //skin of the slider fullscreen button, if empty inherit from gallery skin
		  slider_fullscreen_button_align_hor:"left",     //left, center, right	- fullscreen button horizonatal align
		  slider_fullscreen_button_align_vert:"top",     //top, middle, bottom - fullscreen button vertical align
		  slider_fullscreen_button_offset_hor:11,	     //fullscreen button horizontal offset 
		  slider_fullscreen_button_offset_vert:9,	   	 //fullscreen button vertical offset
		  slider_fullscreen_button_mobilehide:false,	 //hide the button on mobile
		  
		  slider_enable_zoom_panel: true,				 //true,false - enable the zoom buttons, works together with zoom control.
		  slider_zoompanel_skin: "",					 //skin of the slider zoom panel, if empty inherit from gallery skin		  
		  slider_zoompanel_align_hor:"left",    		 //left, center, right - zoom panel horizontal align
		  slider_zoompanel_align_vert:"top",     	 	 //top, middle, bottom - zoom panel vertical align
		  slider_zoompanel_offset_hor:12,	       		 //zoom panel horizontal offset 
		  slider_zoompanel_offset_vert:92,	   			 //zoom panel vertical offset
		  slider_zoompanel_mobilehide:false,		     //hide the zoom panel on mobile
		  
		  slider_controls_always_on: false,				//true,false - controls are always on, false - show only on mouseover
		  slider_controls_appear_ontap: true,			//true,false - appear controls on tap event on touch devices
		  slider_controls_appear_duration: 300,			//the duration of appearing controls
		  
		  slider_enable_text_panel: true,				//true,false - enable the text panel
		  slider_textpanel_always_on: true,				//true,false - text panel are always on, false - show only on mouseover
		  
		  slider_videoplay_button_type: "square"		//square, round - the videoplay button type, square or round	
	};
	
	
	//default options for bar progress incicator
	var g_defaultsProgressBar = {
		  slider_progress_indicator_align_hor:"left",    	//left, center, right
		  slider_progress_indicator_align_vert:"bottom",    //top, middle, bottom
		  slider_progress_indicator_offset_hor:0,	       	//horizontal offset 
		  slider_progress_indicator_offset_vert:0	   		//vertical offset
	};
	
	var g_temp = {
		isRunOnce: false,
		isTextPanelSaparateHover: false,					//if the panel need to be appeared without the controls object on mouseover
		numPrev:1,
		numCurrent:2,
		numNext: 3,
		isControlsVisible: true,
		currentControlsMode: "image"
	};
	
	function __________GENERAL___________(){};
	
	
	/**
	 * init the slider
	 */
	function initSlider(objGallery, objOptions, optionsPrefix){
		g_gallery = objGallery;
				
		//change options by prefix
		if(optionsPrefix){
			g_optionsPrefix = optionsPrefix;
			objOptions = g_functions.convertCustomPrefixOptions(objOptions, g_optionsPrefix, "slider");
		}
		
		g_objGallery = jQuery(objGallery);
		
		var objects = g_gallery.getObjects();		
		g_objWrapper = objects.g_objWrapper;
		g_objThumbs = objects.g_objThumbs;
		
		//set progress indicator bar defaults if type bar
		if(objOptions.hasOwnProperty("slider_progress_indicator_type"))
			g_options.slider_progress_indicator_type = objOptions.slider_progress_indicator_type;
		
		if(g_options.slider_progress_indicator_type == "bar"){
			g_options = jQuery.extend(g_options, g_defaultsProgressBar);
		}
				
		if(objOptions)
			t.setOptions(objOptions);
		
		processOptions();
		
		//init bullets:
		if(g_options.slider_enable_bullets == true){
			g_objBullets = new UGBullets();
			var bulletsOptions = {
					bullets_skin: g_options.slider_bullets_skin,
					bullets_space_between: g_options.slider_bullets_space_between
			}
			g_objBullets.init(g_gallery, bulletsOptions);
		}
		
		//init text panel
		if(g_options.slider_enable_text_panel){
			g_objTextPanel = new UGTextPanel();
			g_objTextPanel.init(g_gallery, g_options, "slider");
		}
		
		if(g_options.slider_enable_zoom_panel){
			g_objZoomPanel = new UGZoomButtonsPanel();
			g_objZoomPanel.init(t, g_options);
		}
		
		var galleryID = g_gallery.getGalleryID();
		
		//init video player
		g_objVideoPlayer.init(g_options, false, galleryID);		
	}
	
	
	/**
	 * run the slider functionality
	 */
	function runSlider(){
		
		if(g_temp.isRunOnce == true)
			return(false);
		
		g_temp.isRunOnce = true;
		
		//set background color
	   if(g_options.slider_background_color){	   		
		   var bgColor = g_options.slider_background_color;
		   
		   if(g_options.slider_background_opacity != 1)
			   bgColor = g_functions.convertHexToRGB(bgColor, g_options.slider_background_opacity);
		   
		   g_objSlider.css("background-color", bgColor);
	   
	   }else if(g_options.slider_background_opacity != 1){	//set opacity with default color
		
		   bgColor = g_functions.convertHexToRGB("#000000", g_options.slider_background_opacity);
		   g_objSlider.css("background-color", bgColor);
	  
	   }
	   
		//init touch slider control
		if(g_options.slider_control_swipe == true){
			g_objTouchSlider = new UGTouchSliderControl();
			g_objTouchSlider.init(t, g_options);
		}

		//init zoom slider control
		if(g_options.slider_control_zoom == true){
			g_objZoomSlider = new UGZoomSliderControl();
			g_objZoomSlider.init(t, g_options);
		}
		
		//run the text panel
		if(g_objTextPanel)
			g_objTextPanel.run();
		
		initEvents();		
	}
	
	
	/**
	 * process the options
	 */
	function processOptions(){
		var galleryOptions = g_gallery.getOptions();
		
		//set skins:
		var globalSkin = galleryOptions.gallery_skin;
		
		if(g_options.slider_bullets_skin == "")
			g_options.slider_bullets_skin = globalSkin;
		
		if(g_options.slider_arrows_skin == "")
			g_options.slider_arrows_skin = globalSkin;
		
		if(g_options.slider_zoompanel_skin == "")
			g_options.slider_zoompanel_skin = globalSkin;
		
		if(g_options.slider_play_button_skin == "")
			g_options.slider_play_button_skin = globalSkin;
		
		if(g_options.slider_fullscreen_button_skin == "")
			g_options.slider_fullscreen_button_skin = globalSkin;
		
		g_options.video_enable_closebutton = g_options.slider_video_enable_closebutton;
		
		//set mousewheel option depends on the gallery option
		if(galleryOptions.gallery_mousewheel_role != "zoom")
			g_options.slider_zoom_mousewheel = false;
	
	}
	
	
	/**
	 * 
	 * get html slide
	 */
	function getHtmlSlide(loaderClass, numSlide){
		
		var classVideoplay = "ug-type-square";
		if(g_options.slider_videoplay_button_type == "round")
			classVideoplay = "ug-type-round";
		
		var html = "";
		html += "<div class='ug-slide-wrapper ug-slide"+numSlide+"'>";
		html += "<div class='ug-item-wrapper'></div>";
		html += "<div class='ug-slider-preloader "+loaderClass+"'></div>";
		html += "<div class='ug-button-videoplay "+classVideoplay+"' style='display:none'></div>";
		html += "</div>";
		
		return(html);
	}
	
	
	/**
	 * set the slider html
	 */
	function setHtmlSlider(objParent){
		
		if(objParent)
			g_objWrapper = objParent;
		
		//get if the slide has controls
		var loaderClass = getLoaderClass();
		var galleryOptions = g_gallery.getOptions();
		
		var html = "<div class='ug-slider-wrapper'>";
		
		html += "<div class='ug-slider-inner'>";
		html += getHtmlSlide(loaderClass,1);
		html += getHtmlSlide(loaderClass,2);
		html += getHtmlSlide(loaderClass,3);
				
		html += "</div>";	//end inner
		
		//----------------
				
		//add arrows
		if(g_options.slider_enable_arrows == true){
			html += "<div class='ug-slider-control ug-arrow-left ug-skin-"+g_options.slider_arrows_skin+"'></div>";
			html += "<div class='ug-slider-control ug-arrow-right ug-skin-"+g_options.slider_arrows_skin+"'></div>";
		}
		
		//add play button
		if(g_options.slider_enable_play_button == true){
			html += "<div class='ug-slider-control ug-button-play ug-skin-"+g_options.slider_play_button_skin+"'></div>";
		}
		
		//add fullscreen button
		if(g_options.slider_enable_fullscreen_button == true){
			html += "<div class='ug-slider-control ug-button-fullscreen ug-skin-"+g_options.slider_fullscreen_button_skin+"'></div>";
		}
		
		
		html +=	"</div>";	//end slider
		
		
		g_objWrapper.append(html);
		
		//----------------
		
		//set objects
		g_objSlider = g_objWrapper.children(".ug-slider-wrapper");
		g_objInner = g_objSlider.children(".ug-slider-inner");
		
		
		g_objSlide1 = g_objInner.children(".ug-slide1");
		g_objSlide2 = g_objInner.children(".ug-slide2");
		g_objSlide3 = g_objInner.children(".ug-slide3");
		
		//set slides data
		g_objSlide1.data("slidenum",1);
		g_objSlide2.data("slidenum",2);
		g_objSlide3.data("slidenum",3);
				
		//add bullets
		if(g_objBullets)
			g_objBullets.appendHTML(g_objSlider);
		
		//----------------
		
		//get arrows object
		if(g_options.slider_enable_arrows == true){
			g_objArrowLeft = g_objSlider.children(".ug-arrow-left");
			g_objArrowRight = g_objSlider.children(".ug-arrow-right");
		}
				
		//get play button
		if(g_options.slider_enable_play_button == true){
			g_objButtonPlay = g_objSlider.children(".ug-button-play");
		}
		
		//get fullscreen button
		if(g_options.slider_enable_fullscreen_button == true){
			g_objButtonFullscreen = g_objSlider.children(".ug-button-fullscreen");
		}
		
		
		//----------------
		
		//add progress indicator
		if(g_options.slider_enable_progress_indicator == true){
			
			g_objProgress = g_functions.initProgressIndicator(g_options.slider_progress_indicator_type, g_options, g_objSlider);
			
			var finalType = g_objProgress.getType();
			
			//change options in case of type change
			if(finalType == "bar" && g_options.slider_progress_indicator_type == "pie"){
				g_options.slider_progress_indicator_type = "bar";
				g_options = jQuery.extend(g_options, g_defaultsProgressBar);
			}	
			
			g_gallery.setProgressIndicator(g_objProgress);
		}
		
		//----------------
		
		//add text panel (hidden)
		if(g_options.slider_enable_text_panel == true){
			
				g_objTextPanel.appendHTML(g_objSlider);
								
				//hide panel saparatelly from the controls object
				if(g_options.slider_textpanel_always_on == false){
					
					//hide the panel
					var panelElement = g_objTextPanel.getElement();
					panelElement.hide().data("isHidden", true);
	
					g_temp.isTextPanelSaparateHover = true;
					
				}
			
		}
			
		//----------------
		
		//add zoom buttons panel:
		if(g_options.slider_enable_zoom_panel == true){
			g_objZoomPanel.appendHTML(g_objSlider);
		}
	
		
		//add video player
		g_objVideoPlayer.setHtml(g_objInner);
	}
	
	
	/**
	 * position elements that related to slide
	 */
	function positionSlideElements(objSlide){
		
		//position preloader
		var objPreloader = getSlidePreloader(objSlide);
		g_functions.placeElementInParentCenter(objPreloader);
		
		//position video play button
		var objVideoPlayButton = getSlideVideoPlayButton(objSlide);
		g_functions.placeElementInParentCenter(objVideoPlayButton);		
	}
	
	
	/**
	 * position elements
	 */
	function positionElements(){
		
		//place bullets
		if(g_objBullets){
			objBullets = g_objBullets.getElement();
			
			//strange bug fix (bullets width: 20) by double placing
			g_functions.placeElement(objBullets, g_options.slider_bullets_align_hor, g_options.slider_bullets_align_vert, g_options.slider_bullets_offset_hor, g_options.slider_bullets_offset_vert);
			g_functions.placeElement(objBullets, g_options.slider_bullets_align_hor, g_options.slider_bullets_align_vert, g_options.slider_bullets_offset_hor, g_options.slider_bullets_offset_vert);
			
		}
		
		//place arrows
		if(g_options.slider_enable_arrows == true){
			g_functions.placeElement(g_objArrowLeft, g_options.slider_arrow_left_align_hor, g_options.slider_arrow_left_align_vert, g_options.slider_arrow_left_offset_hor, g_options.slider_arrow_left_offset_vert);
			g_functions.placeElement(g_objArrowRight, g_options.slider_arrow_right_align_hor, g_options.slider_arrow_left_align_vert, g_options.slider_arrow_right_offset_hor, g_options.slider_arrow_right_offset_vert);
		}
		
		//hide controls
		if(g_options.slider_controls_always_on == false)
			hideControls(true);
		
		//place progress indicator
		if(g_objProgress){
			
			var objProgressElement = g_objProgress.getElement();
			
			if(g_options.slider_progress_indicator_type == "bar"){
				var sliderWidth = g_objSlider.width();				
				g_objProgress.setSize(sliderWidth);
				g_functions.placeElement(objProgressElement, "left", g_options.slider_progress_indicator_align_vert, 0, g_options.slider_progress_indicator_offset_vert);				
				
			}else{
				g_functions.placeElement(objProgressElement, g_options.slider_progress_indicator_align_hor, g_options.slider_progress_indicator_align_vert, g_options.slider_progress_indicator_offset_hor, g_options.slider_progress_indicator_offset_vert);				
				
			}			
		}
				
		//position text panel
		if(g_objTextPanel)
			g_objTextPanel.positionPanel();
		
		//position controls elements
		placeControlsElements();
		
		//place slide elements
		positionSlideElements(g_objSlide1);
		positionSlideElements(g_objSlide2);
		positionSlideElements(g_objSlide3);
		
		checkMobileModify();
		
	}
	
	
	/**
	 * place elements that located on "controls" div
	 */
	function placeControlsElements(){
		
		if(g_objButtonPlay)			
			g_functions.placeElement(g_objButtonPlay, g_options.slider_play_button_align_hor, g_options.slider_play_button_align_vert, g_options.slider_play_button_offset_hor, g_options.slider_play_button_offset_vert);			
		
		//position fullscreen button
		if(g_objButtonFullscreen)			
			g_functions.placeElement(g_objButtonFullscreen, g_options.slider_fullscreen_button_align_hor, g_options.slider_fullscreen_button_align_vert, g_options.slider_fullscreen_button_offset_hor, g_options.slider_fullscreen_button_offset_vert);
		
		//position zoom panel
		if(g_objZoomPanel){
			var zoomPanelElement = g_objZoomPanel.getElement();
			g_functions.placeElement(zoomPanelElement, g_options.slider_zoompanel_align_hor, g_options.slider_zoompanel_align_vert, g_options.slider_zoompanel_offset_hor, g_options.slider_zoompanel_offset_vert);
		}
	}
	
	
		
	/**
	 * position slides by their order
	 */
	function positionSlides(){
		
		var slides = t.getSlidesReference();
		var posX = 0, posY = 0, innerWidth;
		var posXPrev=0, posXCurrent = 0, posXNext, nextHasItem, prevHasItem;
				
		nextHasItem = t.isSlideHasItem(slides.objNextSlide);
		prevHasItem = t.isSlideHasItem(slides.objPrevSlide);
		
		if(prevHasItem){
			posXCurrent = slides.objPrevSlide.outerWidth();
			slides.objPrevSlide.css("z-index",1);
		}else
			slides.objPrevSlide.hide();			
		
		posXNext = posXCurrent + slides.objCurrentSlide.outerWidth();
		
		innerWidth = posXNext;
		if(nextHasItem){
			innerWidth = posXNext + slides.objNextSlide.outerWidth();
			slides.objPrevSlide.css("z-index",2);		
		}else
			slides.objNextSlide.hide();
		
		slides.objCurrentSlide.css("z-index",3);
		
		//set inner size and position
		g_functions.placeElement(slides.objCurrentSlide, posXCurrent, posY);		
		g_objInner.css({"left":-posXCurrent+"px", width:innerWidth+"px"});

		//position prev
		if(prevHasItem){
			g_functions.placeElement(slides.objPrevSlide, posXPrev, posY);
			g_functions.showElement(slides.objPrevSlide);
		}
		
		if(nextHasItem){
			g_functions.showElement(slides.objNextSlide);
			g_functions.placeElement(slides.objNextSlide, posXNext, posY);
		}
		
	}
	
	
	
	/**
	 * resize the slide image inside item
	 */
	function resizeSlideItem(objSlide){
		var index = objSlide.data("index");
		if(index === undefined || index == null)
			return(false);
		
		var objItem = g_gallery.getItem(index);
		
		if(!objItem)
			return(false);
		
		setItemToSlide(objSlide, objItem);
	}
	
	
	/**
	 * show the preloader
	 * show the index, so only the current index load will hide.
	 */	
	function showPreloader(objPreloader){
		
		objPreloader.stop(true).show(100);
	
	}
	
	/**
	 * hide the preloader
	 */
	function hidePreloader(objPreloader){
		
		objPreloader.stop(true).hide(100);
	}
	
	/**
	 * get proper image border width
	 */
	function getImageBorderWidth(objImage, imageData){
		
		var borderWidth = g_options.slider_image_border_width;
		
		if(borderWidth <= 10)
			return(borderWidth);

		//set image size
		var imageSize = g_functions.getElementSize(objImage);
		var imageWidth = imageSize.width;
		var imageHeight = imageSize.height;
		
		if(imageData){
			if(imageData.hasOwnProperty("imageWidth"))
				imageWidth = imageData.imageWidth;
			
			if(imageData.hasOwnProperty("imageHeight"))
				imageHeight = imageData.imageHeight;
			
		}
		
		if(imageWidth <= 0)
			return(borderWidth);
		
		//take the less size
		var totalSize = (imageWidth < imageHeight)?imageWidth:imageHeight;
		var borderSize = borderWidth * 2;
		
		var borderRatio = borderSize / totalSize;
		
		if(borderRatio < g_options.slider_image_border_maxratio)
			return(borderWidth);
		
		//change border width		
		var borderWidth = (totalSize * g_options.slider_image_border_maxratio)/2; 
		
		borderWidth = Math.round(borderWidth);
		
		return(borderWidth);
		
	}
	
	
	/**
	 * set slider image css design according the settings
	 */
	function setImageDesign(objImage, slideType, imageData){
		
		var css = {};
		if(g_options.slider_image_border == true){
			css["border-style"] = "solid";
			
			var borderWidth = getImageBorderWidth(objImage, imageData);
			
			css["border-width"] = borderWidth+"px";
			css["border-color"] = g_options.slider_image_border_color;
			css["border-radius"] = g_options.slider_image_border_radius;
		}
		
		if(slideType != "image" && g_options.slider_video_constantsize == true)
			css["background-color"] = "#000000";
		
		if(g_options.slider_image_shadow == true){
			css["box-shadow"] = "3px 3px 10px 0px #353535";
		}
		
		objImage.css(css);
	}
	
	
	/**
	 * scale image constant size (for video items)
	 */
	function scaleImageConstantSize(objImage, objItem){
		
		var constantWidth = g_options.slider_video_constantsize_width;
		var constantHeight = g_options.slider_video_constantsize_height;
		var scaleMode = g_options.slider_video_constantsize_scalemode;
		
		var objSize = g_functions.scaleImageExactSizeInParent(objImage, objItem.imageWidth, objItem.imageHeight, constantWidth, constantHeight, scaleMode);
		
		
		return(objSize);
	}

	
	/**
	 * 
	 * set item to slide
	 */
	function setImageToSlide(objSlide, objItem, isForce){
		
		var objItemWrapper = objSlide.children(".ug-item-wrapper");
		
		var objPreloader = getSlidePreloader(objSlide);
		
		if(typeof objItem.urlImage == "undefined" || objItem.urlImage == "")
			throw new Error("The slide don't have big image defined ( data-image='imageurl' ). Please check gallery items.", "showbig");
		
		var urlImage = objItem.urlImage;
		
		var currentImage = objSlide.data("urlImage");
				
		objSlide.data("urlImage",urlImage);
		
		var scaleMode = t.getScaleMode(objSlide);
		
		var slideType = t.getSlideType(objSlide);
		
		objPadding = t.getObjImagePadding();
		
		
		if(currentImage == urlImage && isForce !== true){
			
			var objImage = objItemWrapper.children("img");
						
			if(objItem.imageWidth == 0 || objItem.imageHeight == 0){
				g_gallery.checkFillImageSize(objImage, objItem);
			}
			
			var objImageData = {};
			
			if(slideType != "image" && g_options.slider_video_constantsize == true){
				objImageData = scaleImageConstantSize(objImage, objItem);
			}
			else{
				objImageData = g_functions.scaleImageFitParent(objImage, objItem.imageWidth, objItem.imageHeight, scaleMode, objPadding);
			}
			
			setImageDesign(objImage, slideType, objImageData);
			g_objThis.trigger(t.events.AFTER_PUT_IMAGE, objSlide);
			
		}
		else{		//place the image inside parent first time
			
			objImage = g_functions.placeImageInsideParent(urlImage, objItemWrapper, objItem.imageWidth, objItem.imageHeight, scaleMode, objPadding);
			
			//set image loaded on load:
			if(objItem.isBigImageLoaded == true){
				objImage.fadeTo(0,1);
				hidePreloader(objPreloader);
				
				if(slideType != "image" && g_options.slider_video_constantsize == true)
					var objImageData = scaleImageConstantSize(objImage, objItem);
				else
					var objImageData = g_functions.getImageInsideParentData(objItemWrapper, objItem.imageWidth, objItem.imageHeight, scaleMode, objPadding);
				
				//set missing css width
				objImage.css("width",objImageData.imageWidth+"px");
						
				setImageDesign(objImage, slideType, objImageData);
				
				g_objThis.trigger(t.events.AFTER_PUT_IMAGE, objSlide);
			}
			else{		//if the image not loaded, load the image and show it after.
				objImage.fadeTo(0,0);
				showPreloader(objPreloader);
				objSlide.data("isLoading", true);
				
				if(t.isSlideCurrent(objSlide))
					g_objThis.trigger(t.events.CURRENTSLIDE_LOAD_START);
				
				objImage.data("itemIndex", objItem.index);
				objImage.on("load",function(){
					
					//place the image normally with coordinates
					var objImage = jQuery(this);
					var itemIndex = objImage.data("itemIndex");
					
					objImage.fadeTo(0,1);
					
					//get and hide preloader
					var objSlide = objImage.parent().parent();
					var slideType = t.getSlideType(objSlide);
					var objPreloader = getSlidePreloader(objSlide);
					var objPadding = t.getObjImagePadding();
					var scaleMode = t.getScaleMode(objSlide);
					
					hidePreloader(objPreloader);
					objSlide.data("isLoading", false);
					
					if(t.isSlideCurrent(objSlide))
						g_objThis.trigger(t.events.CURRENTSLIDE_LOAD_END);
					
					g_gallery.onItemBigImageLoaded(null, objImage);
					
					var objItem = g_gallery.getItem(itemIndex);
					
					var objImageData = {};
					
					if(slideType != "image" && g_options.slider_video_constantsize == true)
						scaleImageConstantSize(objImage, objItem);
					else{
						objImageData = g_functions.scaleImageFitParent(objImage, objItem.imageWidth, objItem.imageHeight, scaleMode, objPadding);
					}
					
					objImage.fadeTo(0,1);
					
					setImageDesign(objImage, slideType, objImageData);
					
					g_objThis.trigger(t.events.AFTER_PUT_IMAGE, objSlide);
				});
			}
			
		}
		
		
	}
	
		
	
	/**
	 * set slider image by url
	 * if item not set, get current slide item
	 */
	function setItemToSlide(objSlide, objItem){
		
		try{

			var objItemWrapper = objSlide.children(".ug-item-wrapper");
					
			//if the item is empty, remove the image from slide
			if(objItem == null){
				objItemWrapper.html("");
				objSlide.removeData("index");
				objSlide.removeData("type");
				objSlide.removeData("urlImage");
				return(false);
			}
			
			var currentIndex = objSlide.data("index");
			
			objSlide.data("index",objItem.index);
			objSlide.data("type", objItem.type);
			
			//set link class
			if(g_options.slider_enable_links == true && objItem.type == "image"){
				
				if(objItem.link)
					objSlide.addClass("ug-slide-clickable");
				else
					objSlide.removeClass("ug-slide-clickable");
			}
			
			setImageToSlide(objSlide, objItem);
			
			//show type related elements
			var objVideoPlayButton = getSlideVideoPlayButton(objSlide);
			switch(objItem.type){
				case "image":
					objVideoPlayButton.hide();
				break;
				default:		//video
					objVideoPlayButton.show();					
				break;
			}
			
		}catch(error){
			
			if(typeof error.fileName != "undefined" && error.fileName == "showbig")
				g_gallery.showErrorMessageReplaceGallery(error.message);
			
			objItemWrapper.html("");
			throw new Error(error);
			return(true);
		}
		
	}	
	
	
	
	/**
	 * hide the panel
	 */
	function hideTextPanel(){
		
		if(!g_objTextPanel)
			return(false);
		
		if(isTextPanelHidden() == true)
			return(false);
		
		var panelElement = g_objTextPanel.getElement();
	
		var animationTime = 0;
		if(g_temp.isTextPanelSaparateHover == true || g_options.slider_textpanel_always_on == true){
			animationTime = g_options.slider_controls_appear_duration;
		}
		
		panelElement.stop().fadeTo(animationTime, 0);
		
		panelElement.data("isHidden", true);
	}
	
	
	/**
	 * show the text panel
	 */
	function showTextPanel(){
		
		if(!g_objTextPanel)
			return(false);
		
		if(isTextPanelHidden() == false)
			return(false);
		
		var panelElement = g_objTextPanel.getElement();
		
		var animationTime = 0;
		
		if(g_temp.isTextPanelSaparateHover == true || g_options.slider_textpanel_always_on == true){
			
			panelElement.show();
			g_objTextPanel.positionElements();
			
			animationTime = g_options.slider_controls_appear_duration;
		}
		
		panelElement.stop().show().fadeTo(animationTime,1);
		
		panelElement.data("isHidden", false);
				
	}
	
	
	/**
	 * check if the text panel is hidden or not
	 */
	function isTextPanelHidden(){

		var panelElement = g_objTextPanel.getElement();

		var isHidden = panelElement.data("isHidden");
		if(isHidden === false)
			return(false);
		
		return(true);		
	}	
	
	
	/**
	 * validate that the slide is certain type, if not, throw error
	 */
	function validateSlideType(type, objSlide){
		if(objSlide == undefined)
			var objSlide = t.getCurrentSlide();
		
		var slideType = t.getSlideType(objSlide);
				
		if(slideType != type){
			throw new Error("Wrong slide type: "+ slideType +", should be: "+type);
			return(false);
		}
		
		return(true);
	}
	
	function __________VIDEO_PLAYER_______(){};

	
	
	/**
	 * set video player position
	 */
	function setVideoPlayerPosition(){
		
		var objCurrentSlide = t.getCurrentSlide();
		var objImage = t.getSlideImage(objCurrentSlide);
		
		var slideSize = g_functions.getElementSize(objCurrentSlide);
		var left = slideSize.left;
		var top = slideSize.top;
				
		//set by image position
		if(g_options.slider_video_constantsize == true){
			
			var imageSize = g_functions.getElementSize(objImage);
			left += imageSize.left;
			top += imageSize.top;
			
		}else{	//set video padding
			
			left += g_options.slider_video_padding_left;
			top += g_options.slider_video_padding_top;
		
		}
		
		g_objVideoPlayer.setPosition(left, top);
	}
	
	
	/**
	 * set video player constant size
	 */
	function setVideoPlayerConstantSize(){
		
		var videoWidth = g_options.slider_video_constantsize_width;
		var videoHeight = g_options.slider_video_constantsize_height;
		
		g_objVideoPlayer.setSize(videoWidth, videoHeight);
		
		//set video design
		var videoElement = g_objVideoPlayer.getObject();
		
		setImageDesign(videoElement, "video");
	}
	
	
	function __________TRANSITION_______(){};

	
	
	/**
	 * do the transition between the current and the next
	 */
	function doTransition(direction, objItem, forceTransition){
		
		g_objThis.trigger(t.events.TRANSITION_START);
		
		var transition = g_options.slider_transition;
		if(forceTransition)
			transition = forceTransition;

		//stop current slide action
		t.stopSlideAction(null, true);
		
		switch(transition){
			default:
			case "fade":
				transitionFade(objItem);
			break;
			case "slide":				
				transitionSlide(direction, objItem);
			break;
			case "lightbox_open":		//fade transition without animation
				transitionFade(objItem, false, true);
			break;
		}
		
	}

	
	/**
	 * switch slide numbers after transition (by direction)
	 * 
	 */
	this.switchSlideNums = function(direction){
		
		//trigger item changed effect
		g_objThis.trigger(t.events.BEFORE_SWITCH_SLIDES);
		
		switch(direction){
			case "left":
				var currentNum = g_temp.numCurrent;
				g_temp.numCurrent = g_temp.numNext;
				g_temp.numNext = g_temp.numPrev;
				g_temp.numPrev = currentNum;
			break;
			case "right":
				var currentNum = g_temp.numCurrent;
				g_temp.numCurrent = g_temp.numPrev;
				g_temp.numPrev = g_temp.numNext;
				g_temp.numNext = currentNum;				
			break;
			default:
				throw new Error("wrong direction: "+ direction);
			break;
		}
		
		//trace(g_temp.numCurrent);
		
		//trigger item changed effect
		g_objThis.trigger(t.events.ITEM_CHANGED);
	}
	
	
	/**
	 * do slide transition
	 */
	function transitionSlide(direction, objItem){
		
		var animating = t.isAnimating();

		if(animating == true){
			g_temp.itemWaiting = objItem;
			return(true);
		}
		
		//always clear next item on transition start
		// next item can be only in the middle of the transition.
		if(g_temp.itemWaiting != null)
			g_temp.itemWaiting = null;
		
		var slides = t.getSlidesReference();
		
		
		switch(direction){
			case "right":	//change to prev item
				setItemToSlide(slides.objPrevSlide, objItem);
				positionSlides();
				
				var posPrev = g_functions.getElementSize(slides.objPrevSlide);
				var destX = -posPrev.left;
				
				t.switchSlideNums("right");
				
			break;	
			case "left":		//change to next item
				setItemToSlide(slides.objNextSlide, objItem);
				positionSlides();
				
				var posNext = g_functions.getElementSize(slides.objNextSlide);
				var destX = -posNext.left;
				
				t.switchSlideNums("left");
				
			break;
			default:
				throw new Error("wrong direction: "+direction);
			break;
		}
				
		var transSpeed = g_options.slider_transition_speed;
		var transEasing = g_options.slider_transition_easing;

		
		var animateParams = {
				duration: transSpeed,
				easing: transEasing,
				queue: false,
				always:function(){
						
						t.stopSlideAction();
						g_objVideoPlayer.hide();
						
						//transit next item if waiting
						if(g_temp.itemWaiting != null){
							var direction = getSlideDirection(g_temp.itemWaiting);
							transitionSlide(direction, g_temp.itemWaiting);
						}else{
							//if no item waiting, please neighbour items in places
							t.placeNabourItems();
							g_objThis.trigger(t.events.TRANSITION_END);
						}
					
				}
		};
		
		
		g_objInner.animate({left:destX+"px"}, animateParams);
			
	}
	
	
	/**
	 * 
	 * animate opacity in and out
	 */
	function animateOpacity(objItem, opacity, completeFunction){
		
		if(completeFunction)
			objItem.fadeTo(g_options.slider_transition_speed, opacity, completeFunction);
		else
			objItem.fadeTo(g_options.slider_transition_speed, opacity);
	}
	
	
	/**
	 * do fade transition
	 */
	function transitionFade(objItem, noAnimation, noHidePlayer){
		
		if(!noAnimation)
			var noAnimation = false;
		
		var slides = t.getSlidesReference();
		 
		setItemToSlide(slides.objNextSlide, objItem);
		
		var objCurrentPos = g_functions.getElementSize(slides.objCurrentSlide);
				
		g_functions.placeElement(slides.objNextSlide,objCurrentPos.left,objCurrentPos.top);
		
		//switch slide nums
		var currentNum = g_temp.numCurrent;
		g_temp.numCurrent = g_temp.numNext;
		g_temp.numNext = currentNum;
		
		g_objThis.trigger(t.events.ITEM_CHANGED);
		
		slides.objNextSlide.stop(true);		
		slides.objCurrentSlide.stop(true);
		
		if(noAnimation == true){
			
			slides.objCurrentSlide.fadeTo(0, 0);
			slides.objNextSlide.fadeTo(0, 1);	
			t.placeNabourItems();
			g_objThis.trigger(t.events.TRANSITION_END);
			
			if(noHidePlayer !== true)
				g_objVideoPlayer.hide();
		
		}else{
			slides.objNextSlide.fadeTo(0,0);	
			
			animateOpacity(slides.objCurrentSlide,0,function(){
				t.placeNabourItems();
				g_objThis.trigger(t.events.TRANSITION_END);
				if(noHidePlayer !== true)
					g_objVideoPlayer.hide();
			});
			
			if(g_objVideoPlayer.isVisible() == true){
				var videoElement = g_objVideoPlayer.getObject();
				animateOpacity(videoElement, 0);
			}
			
			//animate to next show next
			animateOpacity(slides.objNextSlide,1);			
		}
		
	}
	
	
	
	
	function __________CONTROLS_OBJECT_______(){};
	
	/**
	 * modify the slider for mobile
	 */
	function modifyForMobile(){
		
		if(g_options.slider_fullscreen_button_mobilehide == true && g_objButtonFullscreen)
			g_objButtonFullscreen.hide();
		
		if(g_options.slider_play_button_mobilehide == true && g_objButtonPlay)
			g_objButtonPlay.hide();
		
		if(g_options.slider_zoompanel_mobilehide == true && g_objZoomPanel)
			g_objZoomPanel.getElement().hide();
		
	}
	
	
	/**
	 * modify for no mobile
	 */
	function modifyForDesctop(){
		
		if(g_options.slider_fullscreen_button_mobilehide == true && g_objButtonFullscreen)
			g_objButtonFullscreen.show();

		if(g_options.slider_play_button_mobilehide == true && g_objButtonPlay)
			g_objButtonPlay.show();
		
		if(g_options.slider_zoompanel_mobilehide == true && g_objZoomPanel)
			g_objZoomPanel.getElement().show();
		
	}
	
	
	/**
	 * check and modify for mobile or desctop
	 */
	function checkMobileModify(){
		
		var isMobile = g_gallery.isMobileMode();
		
		if(isMobile)
			modifyForMobile();
		else
			modifyForDesctop();
				
	}
	
	
	/**
	 * get a jquery set of the controls objects
	 */
	function getControlsObjects(){
		
		var objControl = g_objSlider.children(".ug-slider-control");
		
		return(objControl);
	}
	
	
	/**
	 * hide the controls
	 */
	function hideControls(noAnimation){
				
		if(g_functions.isTimePassed("sliderControlsToggle") == false)
			return(false);
		
		if(g_temp.isControlsVisible == false)
			return(false);
				
		if(!noAnimation)
			var noAnimation = false;
		
		var objControls = getControlsObjects();
		
		if(noAnimation === true)
			objControls.stop().fadeTo(0,0).hide();
		else{
			objControls.stop().fadeTo(g_options.slider_controls_appear_duration, 0, function(){objControls.hide()});
		}
		
		g_temp.isControlsVisible = false;
	}
	
	
	/**
	 * show controls only if they meaned to be shown
	 * @param noAnimation
	 */
	function checkAndShowControls(noAnimation){
		
		if(g_options.slider_controls_always_on == true)
			showControls(noAnimation);		
	}
	
	
	/**
	 * hide the controls
	 */
	function showControls(noAnimation){
				
		//validate for short time pass
		if(g_functions.isTimePassed("sliderControlsToggle") == false)
			return(false);
		
		if(g_temp.isControlsVisible == true)
			return(true);
		
		
		if(!noAnimation)
			var noAnimation = false;
		
		var objControls = getControlsObjects();
				
		if(noAnimation === true)
			objControls.stop().show();
		else{
		
			objControls.stop().show().fadeTo(0,0);
			objControls.fadeTo(g_options.slider_controls_appear_duration, 1);
			
		}
		
		g_temp.isControlsVisible = true;
		
	}
	
	
	
	/**
	 * toggle the controls (show, hide)
	 */
	function toggleControls(){
								
		if(g_temp.isControlsVisible == false)
			showControls();
		else
			hideControls();
	}
	
	
	/**
	 * set controls mode
	 * modes: image, video
	 */
	function setControlsMode(mode){
				
		if(mode == g_temp.currentControlsMode)
			return(false);
		
		switch(mode){
			case "image":
				if(g_objZoomPanel)
					g_objZoomPanel.getElement().show();			
			break;
			case "video":
				if(g_objZoomPanel)
					g_objZoomPanel.getElement().hide();	
			break;
			default:
				throw new Error("wrong controld mode: " + mode);
			break;
		}
		
		g_temp.currentControlsMode = mode;
			
	}
	
	
	
	function __________EVENTS___________(){};

	/**
	 * on item change event
	 */
	function onItemChange(data, arg_objItem, role){
		
		//trace("slider on change");
		
		var objItem = g_gallery.getSelectedItem();
				
		t.setItem(objItem, false, role);
		
		var itemIndex = objItem.index;
		
		//set active bullet
		if(g_objBullets)
			g_objBullets.setActive(itemIndex);
		
		//handle text panel
		if(g_objTextPanel){			
			if(g_temp.isTextPanelSaparateHover == false)
				showTextPanel();
		}
				
		if(objItem.type == "image"){
			setControlsMode("image");
			//placeControlsElements();
		}
		else{
			setControlsMode("video");
		}
				
	}
	
	
	/**
	 * on bullet click - change the item to selected
	 */
	function onBulletClick(event, bulletIndex){
		g_gallery.selectItem(bulletIndex);		
	}
	
	
	/**
	 * on touch end
	 * toggle controls
	 */
	function onClick(event){
		
		//double tap action
		if(g_objTouchSlider && g_objTouchSlider.isTapEventOccured(event) == false)
			return(true);
		
		g_objThis.trigger(t.events.CLICK, event);
			
		
	}

	
	/**
	 * on actual click event
	 */
	function onActualClick(){

		//check link
		var currentSlide = t.getCurrentSlide();
		var isClickable = currentSlide.hasClass("ug-slide-clickable");
		var objItem = t.getCurrentItem();
		
		if(isClickable){
			
			//redirect to link
			if(g_options.slider_links_newpage == false){
				location.href = objItem.link;
			}else{
				window.open(objItem.link, '_blank');			
			}
			
			return(true);
		}
		
		//check toggle controls
		if(g_options.slider_controls_always_on == false && 
		   g_options.slider_controls_appear_ontap == true && t.isCurrentSlideType("image") == true){
			
			toggleControls();
			
			//show text panel if hidden
			if(g_objTextPanel && g_options.slider_textpanel_always_on == true && t.isCurrentSlideType("image") && t.isCurrentSlideImageFit())
				showTextPanel();
		}
		
		
	}
	
	
	/**
	 * on zoom start event
	 */
	function onZoomChange(event){
		
		if(g_objTextPanel && t.isCurrentSlideType("image") && t.isCurrentSlideImageFit() == false)
			hideTextPanel();
	}
	
	
	/**
	 * on mouse enter
	 */
	function onMouseEnter(){
		
		showControls();
	
	}
	
	
	/**
	 * on mouse leave
	 */
	function onMouseLeave(){

		hideControls();
		
	}
	
	
	/**
	 * on slide video play button click
	 */
	function objVideoPlayClick(objButton){
		var objSlide = objButton.parent();
		t.startSlideAction(objSlide);
	}

	/**
	 * on video player show event
	 */
	function onVideoPlayerShow(){
		
		if(g_gallery.isPlayMode()){
			g_gallery.pausePlaying();
		}
		
		g_objThis.trigger(t.events.ACTION_START);
	}
	
	
	/**
	 * on video player hide event
	 */
	function onVideoPlayerHide(){
		
		if(g_gallery.isPlayMode()){
			g_gallery.continuePlaying();
		}
		
		g_objThis.trigger(t.events.ACTION_END);		
	}
	
	
	/**
	 * on item image update, update the image inside the slider if relevant
	 */
	function onItemImageUpdate(event, index, urlImage){
				
		if(g_objSlide1.data("index") == index){
			objItem = g_gallery.getItem(index);
			setImageToSlide(g_objSlide1, objItem, true);	//force
		}
		
		if(g_objSlide2.data("index") == index){
			objItem = g_gallery.getItem(index);
			setImageToSlide(g_objSlide2, objItem, true);
		}
		
		if(g_objSlide3.data("index") == index){
			objItem = g_gallery.getItem(index);
			setImageToSlide(g_objSlide3, objItem, true);
		}
		
	}
	
	
	/**
	 * after image loaded. position video play button
	 */
	function onSlideImageLoaded(data, objSlide){
		
		objSlide = jQuery(objSlide);
		var objImage = t.getSlideImage(objSlide);
		var objButtonVideoPlay = getSlideVideoPlayButton(objSlide);
		var objSize = g_functions.getElementSize(objImage);
		
		g_functions.placeElement(objButtonVideoPlay, "center", "middle", objSize.left, objSize.top, objImage);
	}
	
	
	/**
	 * init event of current slide
	 */
	function initSlideEvents(objSlide){
		
		//set video player events
		var objVideoPlayButton = getSlideVideoPlayButton(objSlide);
		g_functions.addClassOnHover(objVideoPlayButton);
		
		g_functions.setButtonOnClick(objVideoPlayButton, objVideoPlayClick);
		
	}
	
	
	/**
	 * init events
	 */
	function initEvents(){
		
		//on item image update, update the image inside the slider if relevant
		g_objGallery.on(g_gallery.events.ITEM_IMAGE_UPDATED, onItemImageUpdate);
		
		
		//on item change, change the item in the slider.
		g_objGallery.on(g_gallery.events.ITEM_CHANGE, onItemChange);
		
		if(g_objBullets)
			jQuery(g_objBullets).on(g_objBullets.events.BULLET_CLICK,onBulletClick);
		
		//arrows events
		if(g_options.slider_enable_arrows == true){
			
			g_functions.addClassOnHover(g_objArrowRight, "ug-arrow-hover");
			g_functions.addClassOnHover(g_objArrowLeft, "ug-arrow-hover");
			
			g_gallery.setNextButton(g_objArrowRight);
			g_gallery.setPrevButton(g_objArrowLeft);
		}
		
		
		//show / hide controls
		if(g_options.slider_controls_always_on == false){
			
			//assign hover evens only if no touch device
			g_objSlider.hover(onMouseEnter, onMouseLeave);
			
		}
		
		//touch events appear on tap event
		g_objSlider.on("touchend click", onClick);
		
		//actual click event
		g_objThis.on(t.events.CLICK, onActualClick);
		
		//show / hide text panel, if it's saparate from controls
		if(g_objTextPanel && g_temp.isTextPanelSaparateHover == true){
			g_objSlider.hover(showTextPanel, hideTextPanel);
		}
		
		//init play / pause button
		if(g_objButtonPlay){
			g_functions.addClassOnHover(g_objButtonPlay, "ug-button-hover");
			g_gallery.setPlayButton(g_objButtonPlay);
		}
		
		//init fullscreen button
		if(g_objButtonFullscreen){
			g_functions.addClassOnHover(g_objButtonFullscreen, "ug-button-hover");
			g_gallery.setFullScreenToggleButton(g_objButtonFullscreen);
		}
		
		//on zoom start / end events
		if(g_objZoomSlider){
			g_objThis.on(t.events.ZOOM_CHANGE, onZoomChange);
		}
		
		if(g_objZoomPanel)
			g_objZoomPanel.initEvents();
				
		//init video player related events
		g_objVideoPlayer.initEvents();
		
		//video API events
		jQuery(g_objVideoPlayer).on(g_objVideoPlayer.events.SHOW, onVideoPlayerShow);		
		jQuery(g_objVideoPlayer).on(g_objVideoPlayer.events.HIDE, onVideoPlayerHide);
		
		//add slide events
		initSlideEvents(g_objSlide1);
		initSlideEvents(g_objSlide2);
		initSlideEvents(g_objSlide3);
		
		//on image loaded
		g_objThis.on(t.events.AFTER_PUT_IMAGE, onSlideImageLoaded);
		
		//image mouseenter / mouseleave event
		
		//set mouseover events on the images
		g_objSlider.delegate(".ug-item-wrapper img","mouseenter",function(event){
			g_objThis.trigger(t.events.IMAGE_MOUSEENTER);
		});

		g_objSlider.delegate(".ug-item-wrapper img","mouseleave",function(event){
			var isMouseOver = t.isMouseInsideSlideImage(event);
			
			if(isMouseOver == false)
				g_objThis.trigger(t.events.IMAGE_MOUSELEAVE);
		});
		
	}
	
	
	/**
	 * destroy slider events
	 */
	this.destroy = function(){
		
		g_objThis.off(t.events.AFTER_PUT_IMAGE);
				
		g_objGallery.off(g_gallery.events.ITEM_IMAGE_UPDATED);
		g_objGallery.off(g_gallery.events.ITEM_CHANGE);
		
		if(g_objBullets)
			jQuery(g_objBullets).on(g_objBullets.events.BULLET_CLICK);
		
		g_objSlider.off("mouseenter");
		g_objSlider.off("mouseleave");
		
		g_objSlider.off("touchend");
		g_objSlider.off("click");
		g_objThis.off(t.events.CLICK);
		
		if(g_objZoomSlider)
			g_objThis.off(t.events.ZOOM_CHANGE);
		
		g_objThis.off(t.events.BEFORE_SWITCH_SLIDES);
		jQuery(g_objVideoPlayer).off(g_objVideoPlayer.events.SHOW);		
		jQuery(g_objVideoPlayer).off(g_objVideoPlayer.events.HIDE);
		
		g_objVideoPlayer.destroy();
		
		g_objSlider.undelegate(".ug-item-wrapper img","mouseenter");
		g_objSlider.undelegate(".ug-item-wrapper img","mouseleave");
	}
	
	
	function __________GETTERS___________(){};
	
	/**
	 * get loader class by loader type
	 */
	function getLoaderClass(){
		var loaderClass;
		switch(g_options.slider_loader_type){
			default:
			case 1: loaderClass = "ug-loader1";break;
			case 2: loaderClass = "ug-loader2";break;
			case 3: loaderClass = "ug-loader3";break;
			case 4: loaderClass = "ug-loader4";break;
			case 5: loaderClass = "ug-loader5";break;
			case 6: loaderClass = "ug-loader6";break;
			case 7: loaderClass = "ug-loader7";break;
			case 8: loaderClass = "ug-loader8";break;
			case 9: loaderClass = "ug-loader9";break;
		}
				
		if(g_options.slider_loader_color == "black")
			loaderClass += " ug-loader-black";
		
		return(loaderClass);
	}
	
	
	
	/**
	 * 
	 * get slide by number
	 */
	function getSlideByNum(num){
				
		switch(num){
			case 1:
				return(g_objSlide1);
			break;
			case 2:
				return(g_objSlide2);
			break;
			case 3:
				return(g_objSlide3);
			break;
			default:
				throw new Error("wrong num: " + num);
			break;
		}
	}
	
	
	/**
	 * 
	 * get slide direction of current item
	 */
	function getSlideDirection(objItem){
		
		var slides = t.getSlidesReference();
		
		//validate if the item is not selected already
		var currentIndex = slides.objCurrentSlide.data("index");
		var nextIndex = objItem.index;
		
		var direction = "left";
		if(currentIndex > nextIndex)
			direction = "right";
				
		return(direction);
	}
	
	
	/**
	 * get slide preloader
	 */
	function getSlidePreloader(objSlide){
		
		if(!objSlide)
			var objSlide = t.getCurrentSlide();
		
		var objPreloader = objSlide.children(".ug-slider-preloader");
		return(objPreloader);
	}
	
	/**
	 * get slide videoplay button
	 */
	function getSlideVideoPlayButton(objSlide){
		var objButton = objSlide.children(".ug-button-videoplay");
		return(objButton);
	}
	
	
	
	/**
	 * get slide item
	 */
	function getSlideItem(objSlide){
		if(!objSlide)
			var objSlide = t.getCurrentSlide();
			
		var index = objSlide.data("index");
		if(index == undefined)
			return(null);
		
		var objItem = g_gallery.getItem(index);
		return(objItem);
	}
	
	
	/**
	 * get slide number
	 */
	function getNumSlide(objSlide){
		var numSlide = objSlide.data("slidenum");
		return(numSlide);
	}
	
	
	
	this.________EXTERNAL_GENERAL___________ = function(){};
	
	
	/**
	 * init function for avia controls
	 * options: width / height
	 */
	this.init = function(objGallery, objOptions, optionsPrefix){
				
		initSlider(objGallery, objOptions, optionsPrefix);
	}

	/**
	 * get slide image
	 */
	this.getSlideImage = function(objSlide){
		
		if(!objSlide)
			var objSlide = t.getCurrentSlide();
		
		var objImage = objSlide.find(".ug-item-wrapper img");
		return(objImage);
	}
	
	
	/**
	 * set slider html
	 */
	this.setHtml = function(objParent){
		
		setHtmlSlider(objParent);
	}
	
	
	/**
	 * run the slider
	 */
	this.run = function(){
		
		runSlider();
	}
	
	
	/**
	 * check if the inner object in place, for panning znd zooming posibility check
	 */
	this.isInnerInPlace = function(){
		
		var slides = t.getSlidesReference();
		
		var posCurrent = g_functions.getElementSize(slides.objCurrentSlide);
		var inPlaceX = -posCurrent.left;
		var objInnerSize = g_functions.getElementSize(g_objInner);
		
		if(inPlaceX == objInnerSize.left)
			return(true);
		else
			return(false);
	}
	
	/**
	 * is animating
	 */
	this.isAnimating = function(){
		
		var isAnimated = g_objInner.is(":animated");
		
		return(isAnimated);
	}
	
	/**
	 * check if the slide is current
	 */
	this.isSlideCurrent = function(objSlide){
		var numSlide = objSlide.data("slidenum");
		if(g_temp.numCurrent == numSlide)
			return(true);
		
		return(false);
	}
	
	
	/**
	 * 
	 * tells if the slide has item
	 */
	this.isSlideHasItem = function(objSlide){
		var index = objSlide.data("index");
		if(index === undefined || index === null)
			return(false);
		
		return(true);
	}
	
	
	/**
	 * get image padding object for scaling the image
	 */
	this.getObjImagePadding = function(){
		
		var objPadding = {
				padding_top: g_options.slider_image_padding_top,
				padding_bottom: g_options.slider_image_padding_bottom,
				padding_left: g_options.slider_image_padding_left,
				padding_right: g_options.slider_image_padding_right
		};
		
		return(objPadding);
	}
			
	
	/**
	 * get items reference by their order
	 */
	this.getSlidesReference = function(){
		
		var obj = {
				objPrevSlide: getSlideByNum(g_temp.numPrev),
				objNextSlide: getSlideByNum(g_temp.numNext),
				objCurrentSlide: getSlideByNum(g_temp.numCurrent)
		};
		
		return(obj);
	}
	
	
	/**
	 * get current slide
	 */
	this.getCurrentSlide = function(){
		
		var slides = t.getSlidesReference();
		
		return(slides.objCurrentSlide);
	}
	
	
	/**
	 * get index of current item
	 */
	this.getCurrentItemIndex = function(){
		
		var slides = t.getSlidesReference();
		
		var currentIndex = slides.objCurrentSlide.data("index");
		if(currentIndex === null || currentIndex === undefined)
			currentIndex = -1;
		
		return(currentIndex);
	}
	
	
	/**
	 * get current slide item
	 */
	this.getCurrentItem = function(){
		var currentIndex = t.getCurrentItemIndex();
		if(currentIndex == -1)
			return(null);
		
		var objItem = g_gallery.getItem(currentIndex);
		
		return(objItem);
	}
		
	
	/**
	 * get type of some slide
	 */
	this.getSlideType = function(objSlide){
		
		if(objSlide == undefined)
			objSlide = t.getCurrentSlide();
			
		var type = objSlide.data("type");
		return(type);		
	}

	
	/**
	 * is mouse inside slide image
	 * get mouse position from event
	 */
	this.isMouseInsideSlideImage = function(event){
		
		var objImage = t.getSlideImage();
		
		var point = g_functions.getMousePosition(event);
		if(point.pageX === undefined)
			point = g_objTouchSlider.getLastMousePos();
		
		var pointImg = g_functions.getMouseElementPoint(point, objImage);
		var objSize = g_functions.getElementSize(objImage);
		isMouseInside = g_functions.isPointInsideElement(pointImg, objSize);
		
		return(isMouseInside);
	}
	
	
	/**
	 * check if current slide type is certain type
	 */
	this.isCurrentSlideType = function(type){
		var currentSlideType = t.getSlideType();
		if(currentSlideType == type)
			return(true);
		
		return(false);
	}
	
	
	/**
	 * check if current slide is loading image
	 */
	this.isCurrentSlideLoadingImage = function(){
		var currentSlide = t.getCurrentSlide();
		var isLoading = currentSlide.data("isLoading");
		if(isLoading === true)
			return(true);
		
		return(false);
	}
	
	
	/**
	 * change the slider to some item content
	 */
	this.setItem = function(objItem, forseTransition, role){
		
		var slides = t.getSlidesReference();
		
		//validate if the item is not selected already
		var currentIndex = slides.objCurrentSlide.data("index");
		var nextIndex = objItem.index;
		
		if(nextIndex == currentIndex){
			return(true);
		}
		
		var isFirstSlide = (currentIndex == undefined);
		
		if(isFirstSlide){			
			setItemToSlide(slides.objCurrentSlide, objItem);
			t.placeNabourItems();
			
		}else{
			
			var direction = "left";		//move foreward
			
			var numItems = g_gallery.getNumItems();
			
			if(role == "next")
				direction = "left";
			else if(role == "prev" || currentIndex > nextIndex)
				direction = "right";
			else if(currentIndex > nextIndex)
					direction = "right";
						
			doTransition(direction, objItem, forseTransition);
		}
					
	}
	
	
	/**
	 * when the transition complete, put the next / prev items at their place
	 */
	this.placeNabourItems = function(){
				
		var slides = t.getSlidesReference();
		var currentIndex = slides.objCurrentSlide.data("index");
				
		var itemPrev = g_gallery.getPrevItem(currentIndex);
		var itemNext = g_gallery.getNextItem(currentIndex);
		
		//trace(itemPrev);
		//trace(itemNext);
		
		//trace("place " + currentIndex, "next: "+);
		
		setItemToSlide(slides.objNextSlide, itemNext);
		setItemToSlide(slides.objPrevSlide, itemPrev);
		
		positionSlides();
	}
	
	
	
	this.________EXTERNAL_API___________ = function(){};
	
	
	/**
	 * stop some slide action if active
	 */
	this.stopSlideAction = function(objSlide, isPause){
		
		if(!objSlide)
			objSlide = t.getCurrentSlide();
		
		if(isPause === true)
			g_objVideoPlayer.pause();
		else
			g_objVideoPlayer.hide();
		
	//	trace("stop action");
		
	}
	
	
	
	/**
	 * start some slide action if exists
	 */
	this.startSlideAction = function(objSlide){
		
	//	trace("start action");
		
		if(!objSlide)
			objSlide = t.getCurrentSlide();
		
		var objItem = getSlideItem(objSlide);
		
		if(objItem.type == "image")
			return(true)
		
		if(g_options.slider_video_constantsize == true)
			setVideoPlayerConstantSize();
		
		setVideoPlayerPosition();
		
		g_objVideoPlayer.show();
		
		switch(objItem.type){
			case "youtube":
				g_objVideoPlayer.playYoutube(objItem.videoid);
			break;
			case "vimeo":
				g_objVideoPlayer.playVimeo(objItem.videoid);
			break;
			case "html5video":
				g_objVideoPlayer.playHtml5Video(objItem.videoogv, objItem.videowebm, objItem.videomp4, objItem.urlImage);
			break;
			case "soundcloud":
				g_objVideoPlayer.playSoundCloud(objItem.trackid);
			break;			
			case "wistia":
				g_objVideoPlayer.playWistia(objItem.videoid);
			break;			
		}
		
	}
	
	
	/**
	 * get the scale mode according the state (normal, fullscreen).
	 */
	this.getScaleMode = function(objSlide){
		
		if(!objSlide)
			var objSlide = t.getCurrentSlide();
		
		var slideType = t.getSlideType(objSlide);
				
		//return media scale mode
		if(slideType != "image")
			return(g_options.slider_scale_mode_media);
		
		if(g_options.slider_scale_mode == g_options.slider_scale_mode_fullscreen)
			return(g_options.slider_scale_mode);
		
		if(g_gallery.isFullScreen() == true)
			return(g_options.slider_scale_mode_fullscreen);
		else
			return(g_options.slider_scale_mode);
		
	}
	
	
	/**
	 * get slider objects
	 */
	this.getObjects = function(){
		
		var obj = {
				g_objSlider: g_objSlider,
				g_objInner: g_objInner,
				g_options: g_options,
				g_objZoomSlider: g_objZoomSlider
		};
				
		return(obj);
	}
	
	
	/**
	 * get zoom object
	 */
	this.getObjZoom = function(){
		
		return(g_objZoomSlider);
	}
	
	
	
	/**
	 * get slider options
	 */
	this.getOptions = function(){
		
		return(g_options);
	}
	
	
	/**
	 * get slider element
	 */
	this.getElement = function(){
		
		return(g_objSlider);
	}
	
	/**
	 * get video object
	 */
	this.getVideoObject = function(){
		return(g_objVideoPlayer);
	}
	
	
	/**
	 * return true if current slider image fit the slider
	 * @returns
	 */
	this.isCurrentSlideImageFit = function(){
		var objSlide = t.getCurrentSlide();

		var slideType = t.getSlideType(objSlide);
		
		validateSlideType("image", objSlide);
		
		var objImage = t.getSlideImage(objSlide);
		
		//if image don't yet added to dom, return false
		if(objImage.length == 0)
			return(false);
		
		var isFit = g_functions.isImageFitParent(objImage);
		
		return(isFit);
	}
	
	
	/**
	 * check if current image in place
	 */
	this.isCurrentImageInPlace = function(){
		
		var objImage = t.getSlideImage();
		if(objImage.length == 0)
			return(false);

		var scaleMode = t.getScaleMode();
		var objPadding = t.getObjImagePadding();
		var objItem = getSlideItem();
		
		var objParent = objImage.parent();
		
		var objFitSize = g_functions.getImageInsideParentData(objParent, objItem.imageWidth, objItem.imageHeight, scaleMode, objPadding);
		var objSize = g_functions.getElementSize(objImage);

		var output = false;
		
		if(objFitSize.imageWidth == objSize.width)
			output = true;
				
		return(output);
	}
	
	
	/**
	 * if slide is bussy in some action
	 */
	this.isSlideActionActive = function(){
		
		return g_objVideoPlayer.isVisible();
	}
	
	/**
	 * return if swipe action active
	 */
	this.isSwiping = function(){
		if(!g_objTouchSlider)
			return(false);
		
		var isActive = g_objTouchSlider.isTouchActive();
		
		return(isActive);
	}
	
	
	/**
	 * if slider preloading image (if preloader visible)
	 */
	this.isPreloading = function(){
		
		var objPreloader = getSlidePreloader();
		if(objPreloader.is(":visible"))
			return(true);
		
		return(false);
	}
	
	/**
	 * set the options
	 */
	this.setOptions = function(objOptions){

		//change options by prefix
		if(g_optionsPrefix)
			objOptions = g_functions.convertCustomPrefixOptions(objOptions, g_optionsPrefix, "slider");
		
		g_options = jQuery.extend(g_options, objOptions);
		
	}
	
	
	/**
	 * set the slider size
	 * works well on resize too.
	 */
	this.setSize = function(width, height){
		
		 if(width < 0 || height < 0)
			 return(true);
		
		 var objCssSlider = {};
		 objCssSlider["width"] = width + "px";
		 objCssSlider["height"] = height + "px";
		 g_objSlider.css(objCssSlider);
		 		 
		 //set inner:
		 var objCssInner = {};
		 objCssInner["height"] = height + "px";
		 objCssInner["top"] = "0px";
		 objCssInner["left"] = "0px";
		 g_objInner.css(objCssInner);
		 
		//set slide wrapper
		 var objCssSlide = {};
		 objCssSlide["height"] = height + "px";
		 objCssSlide["width"] = width + "px";
		 
		 g_objSlide1.css(objCssSlide);
		 g_objSlide2.css(objCssSlide);
		 g_objSlide3.css(objCssSlide);
		 
		 var itemWidth = width - g_options.slider_item_padding_left - g_options.slider_item_padding_right;
		 var itemHeight = height - g_options.slider_item_padding_top - g_options.slider_item_padding_bottom;
		 	
		 //set item wrapper
		 var objCssItemWrapper = {};
		 objCssItemWrapper["width"] = itemWidth + "px";
		 objCssItemWrapper["height"] = itemHeight + "px";
		 objCssItemWrapper["top"] = g_options.slider_item_padding_top + "px";
		 objCssItemWrapper["left"] = g_options.slider_item_padding_left + "px";
		 
		 g_objSlider.find(".ug-item-wrapper").css(objCssItemWrapper);		 
		 
		 
		 //set text panel size
		 if(g_objTextPanel){
			 g_objTextPanel.setSizeByParent();
		 }
		 
		 positionElements();
		 
		 //set image to slides
		 resizeSlideItem(g_objSlide1);
		 resizeSlideItem(g_objSlide2);
		 resizeSlideItem(g_objSlide3);
		 
		 positionSlides();
		 		 
		 //set video player size
		 var currentSlideType = t.getSlideType();
		
		 if(currentSlideType != "image" && g_options.slider_video_constantsize == true){
			 
			 setVideoPlayerConstantSize();
		 }else{	
			 var videoWidth = width - g_options.slider_video_padding_left - g_options.slider_video_padding_right;
			 var videoHeight = height - g_options.slider_video_padding_top - g_options.slider_video_padding_bottom;
			 
			 //set video player size
			 g_objVideoPlayer.setSize(videoWidth, videoHeight);
		 }
		 
		 setVideoPlayerPosition();
		 
	}
	
	
	/**
	 * refresh slide items after options change
	 */
	this.refreshSlideItems = function(){
		 
		if(t.isAnimating() == true)
			return(true);
		
		 resizeSlideItem(g_objSlide1);
		 resizeSlideItem(g_objSlide2);
		 resizeSlideItem(g_objSlide3);
		 positionSlides();
		 
	}
	
	
	/**
	 * is mouse over the slider
	 */
	this.isMouseOver = function(){
		
		return g_objSlider.ismouseover();
	}
	
	/**
	 * set slider position
	 */
	this.setPosition = function(left, top){
		
		g_functions.placeElement(g_objSlider, left, top);
			
	}
	
	
	/**
	 * zoom in
	 */
	this.zoomIn = function(){
		if(!g_objZoomSlider)
			return(true);
		
		g_objZoomSlider.zoomIn();
	}
	
	/**
	 * zoom out
	 */
	this.zoomOut = function(){
		
		if(!g_objZoomSlider)
			return(true);
		
		g_objZoomSlider.zoomOut();
			
	}
	
	/**
	 * zoom back to original
	 */
	this.zoomBack = function(){
		
		if(!g_objZoomSlider)
			return(true);
		
		g_objZoomSlider.zoomBack();	
	}
	
	
}
