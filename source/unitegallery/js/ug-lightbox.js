/**
 * tiles class
 */
function UGLightbox(){

	var t = this, g_objThis = jQuery(this);
	var g_gallery = new UniteGalleryMain(), g_objGallery, g_objWrapper;
	var g_objSlider = new UGSlider(), g_objOverlay, g_objArrowLeft, g_objArrowRight, g_objButtonClose;
	var g_functions = new UGFunctions(), g_objTextPanel = new UGTextPanel(), g_objNumbers;
	var g_objTopPanel;
	
	var g_options = {
			lightbox_type: "wide",							//compact / wide - lightbox type
			
			lightbox_show_textpanel: true,					//show the text panel
			lightbox_textpanel_width: 550,					//the width of the text panel.
			
			lightbox_hide_arrows_onvideoplay: true,			//hide the arrows when video start playing and show when stop
			lightbox_arrows_position: "sides",				//sides, inside: position of the arrows, used on compact type			
			lightbox_arrows_offset: 10,						//The horizontal offset of the arrows
			lightbox_arrows_inside_offset: 10,				//The offset from the image border if the arrows placed inside
			lightbox_arrows_inside_alwayson: false,			//Show the arrows on mouseover, or always on.
			
			lightbox_overlay_color:null,					//the color of the overlay. if null - will take from css
			lightbox_overlay_opacity:1,						//the opacity of the overlay. if null - will take from css
			lightbox_top_panel_opacity: null,				//the opacity of the top panel
			
			lightbox_show_numbers: true,					//show numbers on the right side
			lightbox_numbers_size: null,					//the size of the numbers string
			lightbox_numbers_color: null,					//the color of the numbers
			lightbox_numbers_padding_top:null,				//the top padding of the numbers (used in compact mode)
			lightbox_numbers_padding_right:null,			//the right padding of the numbers (used in compact mode)
			
			lightbox_compact_closebutton_offsetx: 1,		//the offsetx of the close button. Valid only for compact mode
			lightbox_compact_closebutton_offsety: 1			//the offsetx of the close button. Valid only for compact mode
			
	};
	
	this.events = {
			LIGHTBOX_INIT: "lightbox_init"
	};
	
	var g_temp = {
			topPanelHeight: 44,
			initTextPanelHeight: 26,		//init height for compact mode
			isOpened: false, 
			putSlider: true,
			isCompact: false,
			fadeDuration: 300,
			positionFrom: null,
			textPanelTop: null,
			textPanelLeft: null,
			isArrowsInside: false,
			isArrowsOnHoverMode: false,
			lastMouseX: null,
			lastMouseY: null,
			originalOptions: null,
			isSliderChangedOnce:false
	};
	
	var g_defaults = {
			lightbox_slider_controls_always_on: true,
			lightbox_slider_enable_bullets: false,
			lightbox_slider_enable_arrows: false,
			lightbox_slider_enable_progress_indicator: false,
			lightbox_slider_enable_play_button: false,
			lightbox_slider_enable_fullscreen_button: false,
			lightbox_slider_enable_zoom_panel: false,
			lightbox_slider_enable_text_panel: false,
			lightbox_slider_scale_mode_media: "down",
			lightbox_slider_scale_mode: "down",
			lightbox_slider_loader_type: 3,
			lightbox_slider_loader_color: "black",
			lightbox_slider_transition: "fade",
			
			lightbox_slider_image_padding_top: g_temp.topPanelHeight,
			lightbox_slider_image_padding_bottom: 10,
			
			lightbox_slider_video_padding_top: g_temp.topPanelHeight,
			lightbox_slider_video_padding_bottom: 0,
			
			lightbox_textpanel_align: "middle",
			lightbox_textpanel_padding_top: 5,
			lightbox_textpanel_padding_bottom: 5,
			
			slider_video_constantsize: false,
			lightbox_slider_image_border: false,
			
			lightbox_textpanel_enable_title: true,
			lightbox_textpanel_enable_description: false,
			
			lightbox_textpanel_enable_bg:false,
			
			video_enable_closebutton: false,
			lightbox_slider_video_enable_closebutton: false,
			video_youtube_showinfo: false,
			lightbox_slider_enable_links:false
	};
	
	var g_defaultsCompact = {
			lightbox_overlay_opacity:0.6,
			
			lightbox_slider_image_border: true,
			lightbox_slider_image_shadow:true,
			lightbox_slider_image_padding_top: 30,
			lightbox_slider_image_padding_bottom: 30,
			
			slider_video_constantsize: true,
						
			lightbox_textpanel_align: "bottom",
			lightbox_textpanel_title_text_align: "left",
			lightbox_textpanel_desc_text_align: "left",
			lightbox_textpanel_padding_left: 10,			//the padding left of the textpanel
			lightbox_textpanel_padding_right: 10
	};
	
	
	function __________GENERAL_________(){};
	
	
	/**
	 * init the gallery
	 */
	function initLightbox(gallery, customOptions){
		
		g_gallery = gallery;
		g_objGallery = jQuery(gallery);
		
		g_options = jQuery.extend(g_options, g_defaults);
		g_options = jQuery.extend(g_options, customOptions);
	
		g_temp.originalOptions = jQuery.extend({}, g_options);
		
		if(g_options.lightbox_type == "compact"){
			g_temp.isCompact = true;
			g_options = jQuery.extend(g_options, g_defaultsCompact);
			g_options = jQuery.extend(g_options, customOptions);
		}
		
		//modify some options
		modifyOptions();
		
		if(g_temp.putSlider == true){
			
			g_gallery.initSlider(g_options, "lightbox");
			g_objects = gallery.getObjects();
			g_objSlider = g_objects.g_objSlider;			
		
		}else{
			g_objSlider = null;
		}
		
		if(g_options.lightbox_show_textpanel == true){
			g_objTextPanel.init(g_gallery, g_options, "lightbox");
		}
		else
			g_objTextPanel = null;
		
	}
	
	
	/**
	 * modify some options according user options
	 */
	function modifyOptions(){
		
		
		if(g_temp.isCompact == true && g_options.lightbox_show_textpanel == true){
			g_options.lightbox_slider_image_padding_bottom = g_temp.initTextPanelHeight;
		}
		
		if(g_temp.isCompact == true && g_options.lightbox_arrows_position == "inside"){
			g_temp.isArrowsInside = true;
		}

		if(g_temp.isArrowsInside == true && g_options.lightbox_arrows_inside_alwayson == false)
			g_temp.isArrowsOnHoverMode = true;
		
		
	}
	
	
	/**
	 * put the lightbox html
	 */
	function putLightboxHtml(){
		
		var html = "";
		var classAddition = "";
		if(g_temp.isCompact == true){
			classAddition = " ug-lightbox-compact";
		}
		
		html += "<div class='ug-gallery-wrapper ug-lightbox"+classAddition+"'>";
		html += "<div class='ug-lightbox-overlay'></div>";
		
		//set top panel only on wide mode
		if(g_temp.isCompact == false)
			html += "<div class='ug-lightbox-top-panel'>";
				
		html += 	"<div class='ug-lightbox-top-panel-overlay'></div>";
		
		html += 	"<div class='ug-lightbox-button-close'></div>";
		
		if(g_options.lightbox_show_numbers)
			html += 	"<div class='ug-lightbox-numbers'></div>";
		
		if(g_temp.isCompact == false)
			html += "</div>";	//top panel
		
		html += "<div class='ug-lightbox-arrow-left'></div>";		
		html += "<div class='ug-lightbox-arrow-right'></div>";
		
		html += "</div>";
		
		g_objWrapper = jQuery(html);
		
		jQuery("body").append(g_objWrapper);
		
		if(g_objSlider)
			g_objSlider.setHtml(g_objWrapper);
		
		g_objOverlay = g_objWrapper.children(".ug-lightbox-overlay");
		
		if(g_temp.isCompact == false){
			g_objTopPanel = g_objWrapper.children(".ug-lightbox-top-panel");
		}
		
		g_objButtonClose = g_objWrapper.find(".ug-lightbox-button-close");
		
		if(g_options.lightbox_show_numbers)
			g_objNumbers = g_objWrapper.find(".ug-lightbox-numbers");
		
		g_objArrowLeft = g_objWrapper.children(".ug-lightbox-arrow-left");
		g_objArrowRight = g_objWrapper.children(".ug-lightbox-arrow-right");
		
		if(g_objTextPanel){
			if(g_objTopPanel)
				g_objTextPanel.appendHTML(g_objTopPanel);
			else
				g_objTextPanel.appendHTML(g_objWrapper);
		}

	}
	
	
	/**
	 * set lightbox properties
	 */
	function setProperties(){
		
		if(g_options.lightbox_overlay_color !== null)
			g_objOverlay.css("background-color", g_options.lightbox_overlay_color);
		
		if(g_options.lightbox_overlay_opacity !== null)
			g_objOverlay.fadeTo(0, g_options.lightbox_overlay_opacity);
		
		if(g_objTopPanel && g_options.lightbox_top_panel_opacity !== null){
			g_objTopPanel.children(".ug-lightbox-top-panel-overlay").fadeTo(0, g_options.lightbox_top_panel_opacity);
		}
			
		//set numbers properties
		if(g_objNumbers){
			var cssNumbers = {};
			
			if(g_options.lightbox_numbers_size !== null)
				cssNumbers["font-size"] = g_options.lightbox_numbers_size+"px";
			
			if(g_options.lightbox_numbers_color)
				cssNumbers["color"] = g_options.lightbox_numbers_color;
			
			if(g_options.lightbox_numbers_padding_right !== null)
				cssNumbers["padding-right"] = g_options.lightbox_numbers_padding_right + "px";
			
			if(g_options.lightbox_numbers_padding_top !== null)
				cssNumbers["padding-top"] = g_options.lightbox_numbers_padding_top + "px";
			
			
			g_objNumbers.css(cssNumbers);
		}
		
	}
	
	
	/**
	 * refresh slider item with new height
	 */
	function refreshSliderItem(newHeight){
		
		if(!g_objSlider)
			return(true);
		
		//set slider new image position
		var objOptions = {
				slider_image_padding_top: newHeight,
				slider_video_padding_top: newHeight
		};
		
		g_objSlider.setOptions(objOptions);
		g_objSlider.refreshSlideItems();
	
	}
	
	function __________WIDE_ONLY_________(){};
	
	
	/**
	 * handle panel height according text height
	 */
	function handlePanelHeight(){
		
		if(!g_objTopPanel)
			return(false);
			
		if(!g_objTextPanel)
			return(false);
		
		//check text panel size, get the panel bigger then
		var panelHeight = g_objTopPanel.height();
		if(panelHeight == 0)
			return(false);
		
		var newPanelHeight = panelHeight;
		
		var textPanelHeight = g_objTextPanel.getSize().height;
		
		if(panelHeight != g_temp.topPanelHeight)
			newPanelHeight = g_temp.topPanelHeight;
		
		if(textPanelHeight > newPanelHeight)
			newPanelHeight = textPanelHeight;
		
		if(panelHeight != newPanelHeight){
			g_objTopPanel.height(newPanelHeight);
						
			if(g_objSlider && g_objSlider.isAnimating() == false)
				refreshSliderItem(newPanelHeight);
			
		}
				
	}


	/**
	 * position text panel for wide
	 * size - wrapper size
	 */
	function positionTextPanelWide(size){

		var objOptions = {};
		
		var textWidth = g_options.lightbox_textpanel_width;
		var minPaddingLeft = 47;
		var minPaddingRight = 40;
		var maxTextPanelWidth = size.width - minPaddingLeft - minPaddingRight;
		
		if(textWidth > maxTextPanelWidth){		//mobile mode
			
			objOptions.textpanel_padding_left = minPaddingLeft;
			objOptions.textpanel_padding_right = minPaddingRight;
			
			objOptions.textpanel_title_text_align = "center";
			objOptions.textpanel_desc_text_align = "center";			
		}else{
			objOptions.textpanel_padding_left = Math.floor((size.width - textWidth) / 2);
			objOptions.textpanel_padding_right = objOptions.textpanel_padding_left;
			objOptions.textpanel_title_text_align = "left";
			objOptions.textpanel_desc_text_align = "left";
			
			if(g_options.lightbox_textpanel_title_text_align)
					objOptions.textpanel_title_text_align = g_options.lightbox_textpanel_desc_text_align;
			
			if(g_options.lightbox_textpanel_desc_text_align)
				objOptions.textpanel_desc_text_align = g_options.lightbox_textpanel_desc_text_align;
			
		}
				
		g_objTextPanel.setOptions(objOptions);
		
		g_objTextPanel.refresh(true, true);
		
		handlePanelHeight();
		g_objTextPanel.positionPanel();
	}
	
	
	function __________COMPACT_ONLY_________(){};

	/**
	 * handle slider image height according the textpanel height
	 * refresh the slider if the height is not in place
	 */
	function handleCompactHeight(objImageSize){
				
		if(g_temp.isOpened == false)
			return(false);
		
		if(!g_objTextPanel)
			return(false);
		
		if(!g_objSlider)
			return(false);
		
		var wrapperSize = g_functions.getElementSize(g_objWrapper);
		var textPanelSize = g_objTextPanel.getSize();
		
		if(textPanelSize.width == 0 || textPanelSize.height > 120)
			return(false);
		
		if(!objImageSize){
			var objImage = g_objSlider.getSlideImage();
			var objImageSize = g_functions.getElementSize(objImage);
		}
		
		if(objImageSize.height == 0 || objImageSize.width == 0)
			return(false);
		
		//check elements end size
		var totalBottom = objImageSize.bottom + textPanelSize.height;
		
		if(totalBottom < wrapperSize.height)
			return(false);
		
		var sliderOptions = g_objSlider.getOptions();
		
		var imagePaddingBottom = textPanelSize.height;
		
		if(imagePaddingBottom != sliderOptions.slider_image_padding_bottom){
			
			var objOptions = {
					slider_image_padding_bottom: imagePaddingBottom
			};
			
			if(g_objSlider.isAnimating() == false){
				g_objSlider.setOptions(objOptions);
				g_objSlider.refreshSlideItems();
				return(true);
			}
			
		}
		
		return(false);
	}
	
	/**
	 * set text panel top of compact mode
	 */
	function setCompactTextpanelTop(objImageSize, positionPanel){
		
		if(!objImageSize){
			var objImage = g_objSlider.getSlideImage();
			var objImageSize = g_functions.getElementSize(objImage);
		}
		
		g_temp.textPanelTop = objImageSize.bottom;
				
		if(positionPanel === true)
			g_objTextPanel.positionPanel(g_temp.textPanelTop, g_temp.textPanelLeft);
	}
	
	
	/**
	 * handle text panel width on compact mode, 
	 * run when the image is ready. 
	 * Set top position of the panel as well
	 * position numbers as well
	 */
	function handleCompactTextpanelSizes(showTextpanel){
			
		var wrapperSize = g_functions.getElementSize(g_objWrapper);
		var objImage = g_objSlider.getSlideImage();
		var objImageSize = g_functions.getElementSize(objImage);
		
		if(objImageSize.width == 0)
			return(false);
		
		
		g_temp.textPanelLeft = objImageSize.left;
		g_temp.textPanelTop = objImageSize.bottom;

		var textPanelWidth = objImageSize.width;
		
		if(g_objNumbers){
			
			var objNumbersSize = g_functions.getElementSize(g_objNumbers);
			textPanelWidth -= objNumbersSize.width;
			
			//place numbers object
			var numbersLeft = objImageSize.right - objNumbersSize.width;
			g_functions.placeElement(g_objNumbers, numbersLeft, g_temp.textPanelTop);
		}
			
		if(g_objTextPanel){
			g_objTextPanel.show();
			g_objTextPanel.refresh(true, true, textPanelWidth);
			setCompactTextpanelTop(objImageSize);
		}
		
		var isChanged = handleCompactHeight(objImageSize);
		
		if(isChanged == false){
			
			g_temp.positionFrom = "handleCompactTextpanelSizes";
			
			if(g_objTextPanel){
				g_objTextPanel.positionPanel(g_temp.textPanelTop, g_temp.textPanelLeft);
				if(showTextpanel === true){
					showTextpanel();
					showNumbers();
				}
			}
			
		}
		
	}
	
	
	
	/**
	 * return that current slider image is in place
	 */
	function isSliderImageInPlace(){

		if(g_objSlider.isCurrentSlideType("image") == false)
			return(true);
		
		var isImageInPlace = (g_objSlider.isCurrentImageInPlace() == true);
				
		return(isImageInPlace);
	}
	
	
	/**
	 * position the arrows inside mode
	 */
	function positionArrowsInside(toShow, isAnimation){
		
		if(g_temp.isArrowsInside == false)
			return(false);
		
		if(!g_objArrowLeft)
			return(false);
		
		var isImageInPlace = isSliderImageInPlace();
		
		g_objArrowLeft.show();
		g_objArrowRight.show();
		
		g_temp.positionFrom = "positionArrowsInside";
		
		if(g_temp.isArrowsOnHoverMode == true && isImageInPlace == true && isMouseInsideImage() == false)
			hideArrows(true);
		
		if(isImageInPlace == false){
			var leftArrowLeft = g_functions.getElementRelativePos(g_objArrowLeft, "left", g_options.lightbox_arrows_offset);
			var leftArrowTop = g_functions.getElementRelativePos(g_objArrowLeft, "middle");
						
			var rightArrowLeft = g_functions.getElementRelativePos(g_objArrowRight, "right", g_options.lightbox_arrows_offset);
			var rightArrowTop = leftArrowTop;

		}else{
			
			var objImage = g_objSlider.getSlideImage();
			var objImageSize = g_functions.getElementSize(objImage);
			var objSliderSize = g_functions.getElementSize(g_objSlider.getElement());
						
			var leftArrowLeft = g_functions.getElementRelativePos(g_objArrowLeft, "left", 0, objImage) + objImageSize.left + g_options.lightbox_arrows_inside_offset;
			var leftArrowTop = g_functions.getElementRelativePos(g_objArrowLeft, "middle", 0, objImage) + objImageSize.top;
			var rightArrowLeft = g_functions.getElementRelativePos(g_objArrowLeft, "right", 0, objImage) + objImageSize.left - g_options.lightbox_arrows_inside_offset;
			var rightArrowTop = leftArrowTop;
			
		}
		
		
		//place the image with animation or not
		if(isAnimation === true){

			var objCssLeft = {
					left: leftArrowLeft,
					top: leftArrowTop
			};
			
			var objCssRight = {
					left: rightArrowLeft,
					top: rightArrowTop
			};
			
			g_objArrowLeft.stop().animate(objCssLeft,{
				duration: g_temp.fadeDuration
			});
			
			g_objArrowRight.stop().animate(objCssRight,{
				duration: g_temp.fadeDuration
			});
			
			
		}else{
			g_objArrowLeft.stop();
			g_objArrowRight.stop();
			
			g_functions.placeElement(g_objArrowLeft, leftArrowLeft, leftArrowTop);
			g_functions.placeElement(g_objArrowRight, rightArrowLeft, rightArrowTop);
		}
		
		if(toShow == true)
			showArrows(isAnimation);
		
	}
	
	
	
	/**
	 * position close button for compact type
	 */
	function positionCloseButton(toShow, isAnimation){
		
		g_temp.positionFrom = null;
		
		var isImageInPlace = isSliderImageInPlace();
		
		var minButtonTop = 2;
		var maxButtonLeft = g_functions.getElementRelativePos(g_objButtonClose, "right", 2, g_objWrapper);
		
		if(isImageInPlace == false){	//put image to corner
			
			var closeButtonTop = minButtonTop;
			var closeButtonLeft = maxButtonLeft;
			
		}else{
			var objImage = g_objSlider.getSlideImage();
			var objImageSize = g_functions.getElementSize(objImage);
			var objSliderSize = g_functions.getElementSize(g_objSlider.getElement());
			var objButtonSize = g_functions.getElementSize(g_objButtonClose);
			
			//some strange bug
			if(objSliderSize.top == objSliderSize.height)	
				objSliderSize.top = 0;
			
			var closeButtonLeft = objSliderSize.left + objImageSize.right - objButtonSize.width / 2 + g_options.lightbox_compact_closebutton_offsetx;
			var closeButtonTop = objSliderSize.top + objImageSize.top - objButtonSize.height / 2 - g_options.lightbox_compact_closebutton_offsety;
			
			if(closeButtonTop < minButtonTop)
				closeButtonTop = minButtonTop;
			
			if(closeButtonLeft > maxButtonLeft)
				closeButtonLeft = maxButtonLeft;
			
		}
		
		//place the image with animation or not
		if(isAnimation === true){
			var objCss = {
					left: closeButtonLeft,
					top: closeButtonTop
			};
			
			g_objButtonClose.stop().animate(objCss,{
				duration: g_temp.fadeDuration
			});
			
		}else{
			g_objButtonClose.stop();
			g_functions.placeElement(g_objButtonClose, closeButtonLeft, closeButtonTop);
		}
		
		if(toShow === true)
			showCloseButton(isAnimation);
		
	}
	
	
	/**
	 * hide close button
	 */
	function hideCompactElements(){
		
		if(g_objButtonClose)
			g_objButtonClose.stop().fadeTo(g_temp.fadeDuration, 0);
		
		hideTextPanel();
		
		hideNumbers();
		
		g_temp.positionFrom = "hideCompactElements";
		if(g_temp.isArrowsInside == true)
			hideArrows();
	}

	
	/**
	 * actual hide all compact type elements
	 */
	function actualHideCompactElements(){
		
		if(g_objButtonClose)
			g_objButtonClose.hide();
		
		if(g_objArrowLeft && g_temp.isArrowsInside == true){
			g_objArrowLeft.hide();
			g_objArrowRight.hide();
		}
		
		if(g_objNumbers)
			g_objNumbers.hide();
		
		if(g_objTextPanel)
			g_objTextPanel.hide();
		
	}
	
	
	function __________COMMON_________(){};
	
	
	/**
	 * position the elements
	 */
	function positionElements(){
						
		var size = g_functions.getElementSize(g_objWrapper);
		
		//position top panel:
		if(g_objTopPanel)
			g_functions.setElementSizeAndPosition(g_objTopPanel, 0, 0, size.width, g_temp.topPanelHeight);
		
		//position arrows
		if(g_objArrowLeft && g_temp.isArrowsInside == false){
			
			if(g_options.lightbox_hide_arrows_onvideoplay == true){
				g_objArrowLeft.show();
				g_objArrowRight.show();
			}
			
			g_functions.placeElement(g_objArrowLeft, "left", "middle", g_options.lightbox_arrows_offset);
			g_functions.placeElement(g_objArrowRight, "right", "middle", g_options.lightbox_arrows_offset);
		}		
		
		if(g_temp.isCompact == false)
			g_functions.placeElement(g_objButtonClose, "right", "top", 2, 2);
		
		//place text panel
		if(g_objTextPanel){
			
			g_temp.positionFrom = "positionElements";
			
			if(g_temp.isCompact == false)
				positionTextPanelWide(size);
			else{
				showTextPanel();
				showNumbers();
			}
			
		}
		
		var sliderWidth = size.width;
		var sliderHeight = size.height;	
		var sliderTop = 0;
		var sliderLeft = 0;
		
		if(g_objSlider){
			
			if(g_objTopPanel){
				var topPanelHeight = g_objTopPanel.height();
				var objOptions = {
						slider_image_padding_top: topPanelHeight,
						slider_video_padding_top: topPanelHeight
				};
				g_objSlider.setOptions(objOptions);
			}
			
			g_objSlider.setSize(sliderWidth, sliderHeight);
			g_objSlider.setPosition(sliderLeft, sliderTop);
		}
		
	}
	
	
	/**
	 * hide the text panel
	 */
	function hideTextPanel(){
		
		if(g_objTextPanel)
			g_objTextPanel.getElement().stop().fadeTo(g_temp.fadeDuration, 0);
		
	}
	
	
	/**
	 * hide the numbers text
	 */
	function hideNumbers(){
		
		if(g_objNumbers)
			g_objNumbers.stop().fadeTo(g_temp.fadeDuration, 0);
	}
	
	
	/**
	 * is mouse inside image
	 */
	function isMouseInsideImage(){
		if(!g_temp.lastMouseX)
			return(true);
		var obj = {
				pageX: g_temp.lastMouseX, 
				pageY: g_temp.lastMouseY
			};
	
		var isMouseInside = g_objSlider.isMouseInsideSlideImage(obj);
		
		return(isMouseInside);
	}
	
	
	/**
	 * hide the arrows
	 */
	function hideArrows(noAnimation, isForce){
		
		if(!g_objArrowLeft)
			return(false);
				
		//don't hide the arrows if mouse inside image
		if(g_temp.isArrowsOnHoverMode == true && isForce === false){
			if(isMouseInsideImage() == true);
				return(true);
		}
		
		if(noAnimation === true){
			g_objArrowLeft.stop().fadeTo(0, 0);
			g_objArrowRight.stop().fadeTo(0, 0);
		}else{
			g_objArrowLeft.stop().fadeTo(g_temp.fadeDuration, 0);
			g_objArrowRight.stop().fadeTo(g_temp.fadeDuration, 0);
		}
				
	}
	
	/**
	 * get if the arrows are hidden
	 */
	function isArrowsHidden(){
		
		if(!g_objArrowLeft)
			return(true);
		if(g_objArrowLeft.is(":visible") == false)
			return(true);
		
		var opacity = g_objArrowLeft.css("opacity");
		if(opacity != 1)
			return(true);
		
		return(false);
	}
	
	/**
	 * show the arrows
	 */
	function showArrows(noStop, fromHover){
		
		if(!g_objArrowLeft)
			return(false);
		
		//don't show every time on arrowsonhover mode
		if(g_temp.isArrowsOnHoverMode == true && fromHover !== true && isSliderImageInPlace() == true)
			return(true);
		
		//don't show if swiping
		if(g_objSlider.isSwiping() == true)
			return(true);
			
		if(noStop !== true){
			g_objArrowLeft.stop();
			g_objArrowRight.stop();
		}
		
		g_objArrowLeft.fadeTo(g_temp.fadeDuration, 1);
		g_objArrowRight.fadeTo(g_temp.fadeDuration, 1);
		
	}

	
	
	
	
	/**
	 * show close button
	 */
	function showCloseButton(noStop){
		
		if(noStop !== true)
			g_objButtonClose.stop();
		
		g_objButtonClose.fadeTo(g_temp.fadeDuration, 1);
	}
	
	
	/**
	 * update text panel text of the curren item
	 */
	function updateTextPanelText(currentItem){
		
		if(!g_objTextPanel)
			return(false);
		
		if(!currentItem)
			var currentItem = g_objSlider.getCurrentItem();
		
		g_objTextPanel.setTextPlain(currentItem.title, currentItem.description);
	}

	
	/**
	 * update numbers text
	 */
	function updateNumbersText(currentItem){
		
		if(!g_objNumbers)
			return(false);
		
		if(!currentItem)
			var currentItem = g_objSlider.getCurrentItem();
		
		var numItems = g_gallery.getNumItems();
		var numCurrentItem = currentItem.index + 1;
		g_objNumbers.html(numCurrentItem + " / " + numItems);
	}
	
	
	/**
	 * show the text panel
	 */
	function showTextPanel(){
		
		if(!g_objTextPanel)
			return(false);
		
		g_objTextPanel.getElement().show().stop().fadeTo(g_temp.fadeDuration, 1);
		
	}

	
	/**
	 * Show the numbers object
	 */
	function showNumbers(){
		
		if(g_objNumbers)
			g_objNumbers.stop().fadeTo(g_temp.fadeDuration, 1);
	}
	
	
	function __________EVENTS_________(){};
	
	
	/**
	 * on start dragging slider item event. hide the elements
	 */
	function onSliderDragStart(){
		if(g_temp.isCompact == false)
			return(true);
		
		hideCompactElements();
	}

	
	/**
	 * on zoom change
	 * move the assets of compact to their places
	 */
	function onZoomChange(){
		if(g_temp.isCompact == false)
			return(true);
		
		g_temp.positionFrom = "onZoomChange";
	
		positionCloseButton(false, true);
		positionArrowsInside(false, true);
		
		//handle compact text panel mode
		if(g_temp.isCompact == true){
			var isImageInPlace = (g_objSlider.isCurrentSlideType("image") && g_objSlider.isCurrentImageInPlace() == true);
			if(isImageInPlace == false){
				hideTextPanel();
				hideNumbers();
			}
			else{
				g_temp.positionFrom = "onZoomChange";
				showTextPanel();
				showNumbers();
			}
		}
		
	}
	

	/**
	 * after return slider to it's place
	 * show close button
	 */
	function onSliderAfterReturn(){
		
		if(g_temp.isCompact == false)
			return(true);
		
		g_temp.positionFrom = "onSliderAfterReturn";
		
		positionCloseButton(true);
		positionArrowsInside(true);
		
		var isChanged = handleCompactHeight();
		if(isChanged == false)
			handleCompactTextpanelSizes();
		
		showTextPanel();
		showNumbers();
	}
	
	
	/**
	 * after put image to the slide
	 * position compact elements
	 */
	function onSliderAfterPutImage(data, objSlide){
				
		objSlide = jQuery(objSlide);
				
		if(g_temp.isCompact == false)
			return(true);

		if(g_objSlider.isSlideCurrent(objSlide) == false)
			return(true);
				
		g_temp.positionFrom = "onSliderAfterPutImage";
		
		positionCloseButton(true);
		
		positionArrowsInside(true);
		
		
		handleCompactTextpanelSizes();
	}
	
	
	/**
	 * on slider transition end, handle panel height
	 */
	function onSliderTransitionEnd(){
		
		var sliderOptions = g_objSlider.getOptions();
		var imagePaddingTop = sliderOptions.slider_image_padding_top;
		
		//handle wide
		if(g_objTopPanel){
			var panelHeight = g_objTopPanel.height();
			
			if(panelHeight != imagePaddingTop)
				refreshSliderItem(panelHeight);
		}
		
		//handle compact
		if(g_temp.isCompact == true){
			
			updateTextPanelText();
			updateNumbersText();
			
			g_temp.positionFrom = "onSliderTransitionEnd";
			
			positionCloseButton(true);
			positionArrowsInside(true);
			
			if(g_objSlider.isSlideActionActive() == false){
				var isChanged = handleCompactHeight();
				if(isChanged == false)
					handleCompactTextpanelSizes();
				
				showTextPanel();
				showNumbers();
			}
			
		}
		
	}
	
		
	
	/**
	 * on item change
	 * update numbers text and text panel text/position
	 */
	function onItemChange(data, currentItem){
		
		
		if(g_temp.isCompact == false){	//wide mode
			
			if(g_objNumbers)
				updateNumbersText(currentItem);
			
			if(g_objTextPanel){
				updateTextPanelText(currentItem);
				
				g_objTextPanel.positionElements(false);
				handlePanelHeight();
				g_objTextPanel.positionPanel();
			}
			
		}else{
			
			if(g_objSlider.isAnimating() == false){
				
				if(g_objTextPanel)
					updateTextPanelText(currentItem);
				
				if(g_objNumbers)
					updateNumbersText(currentItem);
			}
		
		}
		
		
		//trigger lightbox init event
		if(g_temp.isSliderChangedOnce == false){
			g_temp.isSliderChangedOnce = true;
			g_objThis.trigger(t.events.LIGHTBOX_INIT);
		}
		
	}
	
	
	/**
	 * on slider click
	 */
	function onSliderClick(data, event){
		
		var slideType = g_objSlider.getSlideType();
		if(slideType != "image" && g_temp.isCompact == false && g_objSlider.isSlideActionActive() )
			return(true);
		
		var isPreloading = g_objSlider.isPreloading();
		if(isPreloading == true){
			t.close("slider");
			return(true);
		}
		
		var isInside = g_objSlider.isMouseInsideSlideImage(event);
		
		if(isInside == false)
			t.close("slider_inside");
	}
	
	
	/**
	 * on lightbox resize
	 */
	function onResize(){
		
		positionElements();
	}
	
	
	
	/**
	 * on start play - hide the side buttons
	 */
	function onPlayVideo(){
		
		if(g_objArrowLeft && g_options.lightbox_hide_arrows_onvideoplay == true){
			g_objArrowLeft.hide();			
			g_objArrowRight.hide();			
		}
		
	}
	
	
	/**
	 * on stop video - show the side buttons
	 */
	function onStopVideo(){
		
		if(g_objArrowLeft && g_options.lightbox_hide_arrows_onvideoplay == true){
			g_objArrowLeft.show();
			g_objArrowRight.show();			
		}
		
	}
	
	/**
	 * on gallery keypres, do operations
	 */
	function onKeyPress(data, key){
		
		switch(key){
			case 27:		//escape - close lightbox
				if(g_temp.isOpened == true)
					t.close("keypress");
			break;
		}
		
	}
	
	/**
	 * on image mouse enter event
	 */
	function onImageMouseEnter(){
		
		if(g_temp.isArrowsOnHoverMode == true)
			showArrows(false, true);
		
	}
	
	/**
	 * on image mouse leave
	 */
	function onImageMouseLeave(event){
		
		g_temp.positionFrom = "hideCompactElements";
		
		if(g_temp.isArrowsOnHoverMode == true && isSliderImageInPlace() == true)
			hideArrows(false, true);
		
	}
	
	
	/**
	 * on mouse move event
	 * show arrows if inside image
	 */
	function onMouseMove(event){
		 g_temp.lastMouseX = event.pageX;
		 g_temp.lastMouseY = event.pageY;
		
		 var isHidden = isArrowsHidden()
		 
		 
		 if(isHidden == true && isMouseInsideImage() && g_objSlider.isAnimating() == false){
			 g_temp.positionFrom = "onMouseMove";
			 if(g_objArrowLeft && g_objArrowLeft.is(":animated") == false)
				 showArrows(false, true);
		 }
		 
	}

	
	/**
	 * on mouse wheel
	 */
	function onMouseWheel(event, delta, deltaX, deltaY){
		
		if(g_temp.isOpened == false)
			return(true);
		
		switch(g_options.gallery_mousewheel_role){
			default:
			case "zoom":
				var slideType = g_objSlider.getSlideType();
				if(slideType != "image")
					event.preventDefault();
			break;
			case "none":
				event.preventDefault();
			break;
			case "advance":
				g_gallery.onGalleryMouseWheel(event, delta, deltaX, deltaY);
			break;
		}
		
	}
	
	
	/**
	 * init events
	 */
	function initEvents(){
		
		g_objOverlay.on("touchstart", function(event){
			event.preventDefault();
		});
		
		g_objOverlay.on("touchend", function(event){
			t.close("overlay");
		});
		
		
		g_functions.addClassOnHover(g_objArrowRight, "ug-arrow-hover");
		g_functions.addClassOnHover(g_objArrowLeft, "ug-arrow-hover");
		
		g_functions.addClassOnHover(g_objButtonClose);
		
		g_gallery.setNextButton(g_objArrowRight);
		g_gallery.setPrevButton(g_objArrowLeft);
		
		g_objButtonClose.click(function(){
			t.close("button");
		});
		
		g_objGallery.on(g_gallery.events.ITEM_CHANGE, onItemChange);
		
		if(g_objSlider){
			jQuery(g_objSlider).on(g_objSlider.events.TRANSITION_END, onSliderTransitionEnd);
			
			//on slider click event
			jQuery(g_objSlider).on(g_objSlider.events.CLICK, onSliderClick);
			
			//on slider video 
			var objVideo = g_objSlider.getVideoObject();
					
			jQuery(objVideo).on(objVideo.events.PLAY_START, onPlayVideo);
			jQuery(objVideo).on(objVideo.events.PLAY_STOP, onStopVideo);
			
			//handle close button hide / appear
			jQuery(g_objSlider).on(g_objSlider.events.START_DRAG, onSliderDragStart);
			jQuery(g_objSlider).on(g_objSlider.events.TRANSITION_START, onSliderDragStart);
			
			jQuery(g_objSlider).on(g_objSlider.events.AFTER_DRAG_CHANGE, onSliderAfterReturn);
			jQuery(g_objSlider).on(g_objSlider.events.AFTER_RETURN, onSliderAfterReturn);
			jQuery(g_objSlider).on(g_objSlider.events.AFTER_PUT_IMAGE, onSliderAfterPutImage);
			
			jQuery(g_objSlider).on(g_objSlider.events.ZOOM_CHANGE, onZoomChange);
			
			jQuery(g_objSlider).on(g_objSlider.events.IMAGE_MOUSEENTER, onImageMouseEnter);
			jQuery(g_objSlider).on(g_objSlider.events.IMAGE_MOUSELEAVE, onImageMouseLeave);

		}
		
		//on resize
		 jQuery(window).resize(function(){
			 
			 if(g_temp.isOpened == false)
				 return(true);
			 
			 g_functions.whenContiniousEventOver("lightbox_resize", onResize, 100);
		 });
		 
		 g_objGallery.on(g_gallery.events.GALLERY_KEYPRESS, onKeyPress);
		 
		 //store last mouse x and y
		 if(g_temp.isArrowsOnHoverMode == true){
			 
			 jQuery(document).bind('mousemove', onMouseMove);
		 
		 }
		
		//on mouse wheel - disable functionality if video
		g_objWrapper.on("mousewheel", onMouseWheel);

	}

	
	/**
	 * destroy the lightbox events and the html it created
	 */
	this.destroy = function(){
		
		jQuery(document).unbind("mousemove");
		
		g_objOverlay.off("touchstart");
		g_objOverlay.off("touchend");
		g_objButtonClose.off("click");
		g_objGallery.off(g_gallery.events.ITEM_CHANGE);
		
		if(g_objSlider){
			jQuery(g_objSlider).off(g_objSlider.events.TRANSITION_END);
			jQuery(g_objSlider).off(g_objSlider.events.CLICK);
			jQuery(g_objSlider).off(g_objSlider.events.START_DRAG);
			jQuery(g_objSlider).off(g_objSlider.events.TRANSITION_START);
			jQuery(g_objSlider).off(g_objSlider.events.AFTER_DRAG_CHANGE);
			jQuery(g_objSlider).off(g_objSlider.events.AFTER_RETURN);
			
			var objVideo = g_objSlider.getVideoObject();
			jQuery(objVideo).off(objVideo.events.PLAY_START);
			jQuery(objVideo).off(objVideo.events.PLAY_STOP);

			jQuery(g_objSlider).on(g_objSlider.events.IMAGE_MOUSEENTER, onImageMouseEnter);
			jQuery(g_objSlider).on(g_objSlider.events.IMAGE_MOUSELEAVE, onImageMouseLeave);
			
			g_objSlider.destroy();
		}
		
		jQuery(window).unbind("resize");
		g_objGallery.off(g_gallery.events.GALLERY_KEYPRESS, onKeyPress);
		
		g_objWrapper.off("mousewheel");
		
		//remove the html
		g_objWrapper.remove();
	}
	
	
	/**
	 * open the lightbox with some item index
	 */
	this.open = function(index){
		
		var objItem = g_gallery.getItem(index);
		
		g_temp.isOpened = true;
		
		if(g_objSlider){
			g_objSlider.setItem(objItem, "lightbox_open");
		}
		
		if(g_objTextPanel){
			g_objTextPanel.setTextPlain(objItem.title, objItem.description);
		}
		
		g_objOverlay.stop().fadeTo(0,0);
		g_objWrapper.show();
		g_objWrapper.fadeTo(0,1);
		
		//show the overlay
		g_objOverlay.stop().fadeTo(g_temp.fadeDuration, g_options.lightbox_overlay_opacity);
		
		positionElements();
				
		if(g_temp.isCompact == true){
			
			var isPreloading = g_objSlider.isPreloading();
			if(isPreloading == true){
				
				actualHideCompactElements();
				
			}else{
				
				//hide only arrows if they are inside
				if(g_temp.isArrowsInside == true){
					g_objArrowLeft.hide();
					g_objArrowRight.hide();
				}
				
			}
				
		}
				
		if(g_objSlider)
			g_objSlider.startSlideAction();
		
	}
	
	
	/**
	 * close the lightbox
	 */
	this.close = function(fromWhere){
				
		g_temp.isOpened = false;
		
		if(g_temp.isCompact == true)
			hideCompactElements();
		
		if(g_objSlider)
			g_objSlider.stopSlideAction();
		
		var slideType = g_objSlider.getSlideType();
				
		if(slideType != "image")
			g_objWrapper.hide();
		else{
			g_objWrapper.fadeTo(g_temp.fadeDuration,0,function(){
				g_objWrapper.hide();
			});
		}
		
	}
	
	
	/**
	 * external init function
	 */
	this.init = function(gallery, customOptions){
		
		initLightbox(gallery, customOptions);
	}
	
	
	/**
	 * switch to wide mode from compact mode
	 */
	function switchToWide(){
		g_temp.isCompact = false;
		modifyOptions();
		
		g_options = jQuery.extend({}, g_temp.originalOptions);
		
		trace(g_options);
		
		g_objSlider.setOptions(g_options);
	}
	
	
	/**
	 * external put html function
	 */
	this.putHtml = function(){
		
		//check if switch to wide mode
		var isMobile = g_gallery.isMobileMode();
		if(isMobile && g_temp.isCompact == true)
			switchToWide();
		
		putLightboxHtml();
	}
	
	
	/**
	 * run lightbox elements
	 */
	this.run = function(){
		
		setProperties();
		
		if(g_objSlider)
			g_objSlider.run();
		
		initEvents();
	}
	
	
	
}


