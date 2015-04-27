
/**
 * thumbs class
 * addon to strip gallery
 */
function UGThumbsStrip(){

	var t = this;
	var g_gallery = new UniteGalleryMain(), g_objGallery, g_objects, g_objWrapper; 
	var g_arrItems, g_objStrip, g_objStripInner;
	var g_aviaControl, g_touchThumbsControl, g_functions = new UGFunctions();	
	var g_isVertical = false, g_thumbs = new UGThumbsGeneral();
	var g_functions = new UGFunctions();
	
	var g_options = {
		strip_vertical_type: false,
		strip_thumbs_align: "left",					//left, center, right, top, middle, bottom - the align of the thumbs when they smaller then the strip size.
		strip_space_between_thumbs:6,				//space between thumbs
		strip_thumb_touch_sensetivity:15,  			//from 1-100, 1 - most sensetive, 100 - most unsensetive
		strip_scroll_to_thumb_duration:500,			//duration of scrolling to thumb
		strip_scroll_to_thumb_easing:"easeOutCubic",		//easing of scrolling to thumb animation
		strip_control_avia:true,					//avia control - move the strip according strip moseover position
		strip_control_touch:true					//touch control - move the strip by dragging it
	}
	
	var g_temp = {
		isRunOnce:false,
		is_placed:false
	};
	
	var g_sizes = {
		stripSize:0,		//set after position thumbs
		stripInnerSize:0,	
		thumbSize:0,
		thumbSecondSize:0,	//size of the height and width of the strip			
	}
	
	this.events = {		//events variables
			STRIP_MOVE:"stripmove"
	}	
	
	//the defaults for vertical align
	var g_defaultsVertical = {
		strip_thumbs_align: "top"
	}
	
	
	/**
	 * set the thumbs strip html
	 */	
	this.setHtml = function(objParent){
		
		if(!objParent){
			var objParent = g_objWrapper;
			if(g_options.parent_container != null)
				objParent = g_options.parent_container;			
		}
				
		objParent.append("<div class='ug-thumbs-strip'><div class='ug-thumbs-strip-inner'></div></div>");		 
		g_objStrip = objParent.children(".ug-thumbs-strip");
		
		g_objStripInner = g_objStrip.children(".ug-thumbs-strip-inner");		
				
		//put the thumbs to inner strip
		g_thumbs.setHtmlThumbs(g_objStripInner);
		
	}

	function ___________GENERAL___________(){};
	
	/**
	 * init the strip
	 */
	function initStrip(gallery, customOptions){
		
		g_objects = gallery.getObjects();
		g_gallery = gallery;
		g_objGallery = jQuery(gallery);
		g_objWrapper = g_objects.g_objWrapper;
		g_arrItems = g_objects.g_arrItems;
		
		g_options = jQuery.extend(g_options, customOptions);
		
		g_isVertical = g_options.strip_vertical_type;
		
		//set vertical defaults
		if(g_isVertical == true){
			g_options = jQuery.extend(g_options, g_defaultsVertical);
			g_options = jQuery.extend(g_options, customOptions);
		}
		
		g_thumbs.init(gallery, customOptions);
		
	}
	
	
	/**
	 * run the strip
	 */
	function runStrip(){
				
		g_thumbs.setHtmlProperties();
		
		initSizeParams();
		
		fixSize();
		
		positionThumbs();
		
		//run only once
		if(g_temp.isRunOnce == false){
			
			//init thumbs strip touch 
			if(g_options.strip_control_touch == true){
				g_touchThumbsControl = new UGTouchThumbsControl();
				g_touchThumbsControl.init(t);
			}
			
			//init thumbs strip avia control
			if(g_options.strip_control_avia == true){
				g_aviaControl = new UGAviaControl();
				g_aviaControl.init(t);
			}
		
			checkControlsEnableDisable();
			
			g_thumbs.loadThumbsImages();
			
			initEvents();
		}
		
						
		g_temp.isRunOnce = true;
		
	}
	
	
	/**
	 * init some size parameters, before size init and after position thumbs
	 */
	function initSizeParams(){
		
		//set thumb outer size:
		var arrThumbs = g_objStripInner.children(".ug-thumb-wrapper");
		var firstThumb = jQuery(arrThumbs[0]);
		var thumbsRealWidth = firstThumb.outerWidth();
		var thumbsRealHeight = firstThumb.outerHeight();
		
		if(g_isVertical == false){			//horizontal
			g_sizes.thumbSize = thumbsRealWidth;
			g_sizes.thumbSecondSize = thumbsRealHeight;
			g_sizes.stripSize = g_objStrip.width();
			g_sizes.stripInnerSize = g_objStripInner.width();
		}else{		//vertical
			g_sizes.thumbSize = thumbsRealHeight;
			g_sizes.thumbSecondSize = thumbsRealWidth;
			g_sizes.stripSize = g_objStrip.height();;
			g_sizes.stripInnerSize = g_objStripInner.height();			
		}
		
	}
	
	
	
	/**
	 * position thumbnails in the thumbs panel horizontally
	 */
	function positionThumbs_horizontal(){
		var arrThumbs = g_objStripInner.children(".ug-thumb-wrapper");
		
		var posx = 0;
		var posy = 0;
		
		for(i=0;i<arrThumbs.length;i++){
			var objThumb = jQuery(arrThumbs[i]);
			g_functions.placeElement(objThumb, posx, posy);
			
			posx += objThumb.outerWidth() + g_options.strip_space_between_thumbs;
		}
		
		//set inner strip width
		var innerStripWidth = posx - g_options.strip_space_between_thumbs;
		
		g_objStripInner.width(innerStripWidth);
		
		g_sizes.stripInnerSize = innerStripWidth;
	}
	
	
	/**
	 * position the thumbnails vertically
	 */
	function positionThumbs_vertical(){
				
		var arrThumbs = g_objStripInner.children(".ug-thumb-wrapper");
		
		var posy = 0;
		var posx = 0;
			
		for(i=0;i<arrThumbs.length;i++){
			var objThumb = jQuery(arrThumbs[i]);
			g_functions.placeElement(objThumb, posx, posy);
			
			posy += objThumb.outerHeight() + g_options.strip_space_between_thumbs;
		}
		
		//set inner strip width
		var innerStripHeight = posy - g_options.strip_space_between_thumbs;
		
		g_objStripInner.height(innerStripHeight);
		
		g_sizes.stripInnerSize = innerStripHeight;		
	}
	
	
	/**
	 * position thumbnails in the thumbs panel
	 */
	function positionThumbs(){
		
		if(g_isVertical == false)
			positionThumbs_horizontal();
		else
			positionThumbs_vertical();	
				 		
	}
	
	
	/**
	 * fix strip and inner size
	 */
	function fixSize(){
		
		if(g_isVertical == false){		//fix horizontal
			
			var height = g_sizes.thumbSecondSize;
			
			 var objCssStrip = {};
			 objCssStrip["height"] = height+"px";		 
			 		 
			 //set inner strip params
			 var objCssInner = {};
			 objCssInner["height"] = height+"px";		
			 
		}else{	//fix vertical
			
			var width = g_sizes.thumbSecondSize;
			
			 var objCssStrip = {};
			 objCssStrip["width"] = width+"px";		 
			 		 
			 //set inner strip params
			 var objCssInner = {};
			 objCssInner["width"] = width+"px";
			 
		}		
		 
		g_objStrip.css(objCssStrip);
		g_objStripInner.css(objCssInner);				
	}
	
	
	
	/**
	 * scroll by some number
	 * .
	 */
	function scrollBy(scrollStep){
		
		var innerPos = t.getInnerStripPos();
		var finalPos = innerPos + scrollStep;
		
		finalPos = t.fixInnerStripLimits(finalPos);
		
		t.positionInnerStrip(finalPos, true);		
	}
	

	/**
	 * scroll to thumb from min. (left or top) position
	 */
	function scrollToThumbMin(objThumb){
		
		var objThumbPos = getThumbPos(objThumb);		
		
		var scrollPos = objThumbPos.min * -1;
		scrollPos = t.fixInnerStripLimits(scrollPos);
		
		t.positionInnerStrip(scrollPos, true);
	}
	
	
	/**
	 * scroll to thumb from max. (right or bottom) position
	 */
	function scrollToThumbMax(objThumb){
		
		var objThumbPos = getThumbPos(objThumb);		
		
		var scrollPos = objThumbPos.max * -1 + g_sizes.stripSize;
		scrollPos = t.fixInnerStripLimits(scrollPos);
		
		t.positionInnerStrip(scrollPos, true);
	}

	
	/**
	 * scroll to some thumbnail
	 */
	function scrollToThumb(objThumb){
		
		if(isStripMovingEnabled() == false)
			return(false);
		
		var objBounds = getThumbsInsideBounds();
		var objThumbPos = getThumbPos(objThumb);
		
		if(objThumbPos.min < objBounds.minPosThumbs){			
			
			var prevThumb = objThumb.prev();
			if(prevThumb.length)
				scrollToThumbMin(prevThumb);
			else 
				scrollToThumbMin(objThumb);				
			
		}else if(objThumbPos.max > objBounds.maxPosThumbs){			
			
			var nextThumb = objThumb.next();
			if(nextThumb.length)
				scrollToThumbMax(nextThumb);
			else
				scrollToThumbMax(objThumb);
				
		}
		
	}
	
	/**
	 * scroll to selected thumb
	 */
	function scrollToSelectedThumb(){
		
		var selectedItem = g_gallery.getSelectedItem();
		if(selectedItem == null)
			return(true);
		
		var objThumb = selectedItem.objThumbWrapper;
		if(objThumb)
			scrollToThumb(objThumb);
		
	}
	
	
	
	/**
	 * check that the inner strip off the limits position, and reposition it if there is a need
	 */
	function checkAndRepositionInnerStrip(){
		
		if(isStripMovingEnabled() == false)
			return(false);
		
		var pos = t.getInnerStripPos();
		
		var posFixed = t.fixInnerStripLimits(pos);
				
		if(pos != posFixed)
			t.positionInnerStrip(posFixed, true);
	}
	
	
	/**
	 * enable / disable controls according inner width (move enabled).
	 */
	function checkControlsEnableDisable(){
		
		if(isStripMovingEnabled() == true){
			
			if(g_aviaControl)
				g_aviaControl.enable();
			
			if(g_touchThumbsControl)
				g_touchThumbsControl.enable();
			
		}else{
			
			if(g_aviaControl)
				g_aviaControl.disable();
			
			if(g_touchThumbsControl)
				g_touchThumbsControl.disable();
			
		}
		
	}
	
	/**
	 * align inner strip according the options
	 */
	function alignInnerStrip(){
		
		if(isStripMovingEnabled())
			return(false);
		
		if(g_isVertical == false)
			g_functions.placeElement(g_objStripInner, g_options.strip_thumbs_align, 0);
		else
			g_functions.placeElement(g_objStripInner, 0, g_options.strip_thumbs_align);
			
	}
	
	
	function ___________EVENTS___________(){};
	
	/**
	 * on thumb click event. Select the thumb
	 */
	function onThumbClick(objThumb){
				
		//cancel click event only if passed significant movement
		if(t.isTouchMotionActive()){
			
			var isSignificantPassed = g_touchThumbsControl.isSignificantPassed();
			if(isSignificantPassed == true)
				return(true);
		}
				
		//run select item operation
		var objItem = g_thumbs.getItemByThumb(objThumb);
		
		g_gallery.selectItem(objItem);		
	}
	
	
	/**
	 * init panel events
	 */
	function initEvents(){
		
		g_thumbs.initEvents();
		
		var objThumbs = g_objStrip.find(".ug-thumb-wrapper");
				
		objThumbs.on("click touchend", function(event){
			
			var clickedThumb = jQuery(this);
			onThumbClick(clickedThumb);
		});
		
		//on item change, make the thumb selected
		g_objGallery.on(g_gallery.events.ITEM_CHANGE, function(){
			var objItem = g_gallery.getSelectedItem();
			g_thumbs.setThumbSelected(objItem.objThumbWrapper);
			scrollToThumb(objItem.objThumbWrapper);
		});
		
	}
	
	/**
	 * destroy the strip panel events
	 */
	this.destroy = function(){
		
		var objThumbs = g_objStrip.find(".ug-thumb-wrapper");
		
		objThumbs.off("click");
		objThumbs.off("touchend");
		g_objGallery.off(g_gallery.events.ITEM_CHANGE);
		
		if(g_touchThumbsControl)
			g_touchThumbsControl.destroy();
		
		if(g_aviaControl)
			g_aviaControl.destroy();
		
		g_thumbs.destroy();
	}
	
	
	function ____________GETTERS___________(){};
		

	/**
	 * check if the inner width is more then strip width
	 */
	function isStripMovingEnabled(){
			
		if(g_isVertical == false){		//for horizontal
			
			if(g_objStripInner.width() > g_objStrip.width())
				return(true);		
			return(false);
			
		}else{		//for vertical
			
			if(g_objStripInner.height() > g_objStrip.height())
				return(true);		
			return(false);
			
		}	
		
	}
	
	
	/**
	 * get bounds, if the thumb not in them, it need to be scrolled
	 * minPosThumbs, maxPosThumbs - the min and max position that the thumbs should be located to be visible
	 */
	function getThumbsInsideBounds(){
		var obj = {};
		var innerPos = t.getInnerStripPos();
		
		//the 1 is gap that avoid exact bounds
		obj.minPosThumbs = innerPos * -1 + 1;				
		obj.maxPosThumbs = innerPos * -1 + g_sizes.stripSize - 1;		
		
		return(obj);
	}
	
	
	/**
	 * get thumb position according the orientation in the inner strip
	 */
	function getThumbPos(objThumb){
		var objReturn = {};
		
		var objPos = objThumb.position();
		
		if(g_isVertical == false){
			objReturn.min = objPos.left;
			objReturn.max = objPos.left + g_sizes.thumbSize;
		}else{
			objReturn.min = objPos.top;
			objReturn.max = objPos.top + g_sizes.thumbSize;
		}
				
		return(objReturn);
	}
	
	
	
	
	this.________EXTERNAL_GENERAL___________ = function(){};

	/**
	 * init function for avia controls
	 */
	this.init = function(gallery, customOptions){
		
		initStrip(gallery, customOptions);
	}
	
	
	/**
	 * set html and properties
	 */	
	this.run = function(){
		runStrip();
	}
	
	
	/**
	 * fix inner position by check boundaries limit
	 */
	this.fixInnerStripLimits = function(distPos){
		
		var maxPos = 0, minPos;
		if(g_isVertical == false)
			minPos = -(g_objStripInner.width() - g_objStrip.width());
		else
			minPos = -(g_objStripInner.height() - g_objStrip.height());	
		
		if(distPos > maxPos)
			distPos = maxPos;
		
		if(distPos < minPos)
			distPos = minPos;
		
		return(distPos);
	}
	
	
	/**
	* position inner strip on some pos according the orientation
	*/
	this.positionInnerStrip = function(pos, isAnimate){
				
		if(isAnimate === undefined)
			var isAnimate = false;
		
		if(g_isVertical == false)
			var objPosition = {"left": pos + "px"};
		else
			var objPosition = {"top": pos + "px"};
		
		if(isAnimate == false){		//normal position
			
			g_objStripInner.css(objPosition);
			t.triggerStripMoveEvent();
		}
		else{		//position with animation
			
			t.triggerStripMoveEvent();
			
			g_objStripInner.stop(true).animate(objPosition ,{
				duration: g_options.strip_scroll_to_thumb_duration,
				easing: g_options.strip_scroll_to_thumb_easing,
				queue: false,
				progress:function(){t.triggerStripMoveEvent()},
				always: function(){t.triggerStripMoveEvent()}
			});					
			
		}
		
	}
	
	
	/**
	 * trigger event - on strip move
	 */
	this.triggerStripMoveEvent = function(){
		
		//trigger onstripmove event
		jQuery(t).trigger(t.events.STRIP_MOVE);
		
	}
	
		
	
	/**
	 * return true if the touch animation or dragging is active
	 */
	this.isTouchMotionActive = function(){
		if(!g_touchThumbsControl)
			return(false);
		
		var isActive = g_touchThumbsControl.isTouchActive();
		
		return(isActive);
	}
	
	
	/**
	 * check if thmb item visible, means inside the visible part of the inner strip
	 */
	this.isItemThumbVisible = function(objItem){
		
		var objThumb = objItem.objThumbWrapper;
		var thumbPos = objThumb.position();
		
		var posMin = t.getInnerStripPos() * -1;
		
		if(g_isVertical == false){
			var posMax = posMin + g_objStrip.width();
			var thumbPosMin = thumbPos.left;
			var thumbPosMax = thumbPos.left + objThumb.width();			
		}else{
			var posMax = posMin + g_objStrip.height();
			var thumbPosMin = thumbPos.top;
			var thumbPosMax = thumbPos.top + objThumb.height();			
		}
				
		var isVisible = false;
		if(thumbPosMax >= posMin && thumbPosMin <= posMax)
			isVisible = true;
		
		return(isVisible);
	}
	
	/**
	 * get inner strip position according the orientation
	 */
	this.getInnerStripPos = function(){
		
		if(g_isVertical == false)			
			return g_objStripInner.position().left;
		else
			return g_objStripInner.position().top;
	}
	
	
	/**
	 * get inner strip limits
	 */
	this.getInnerStripLimits = function(){
		
		var output = {};
		output.maxPos = 0;
		
		if(g_isVertical == false)
			output.minPos = -(g_objStripInner.width() - g_objStrip.width());
		else
			output.minPos = -(g_objStripInner.height() - g_objStrip.height());
		
		return(output);
	}
	
	
	/**
	 * scroll left or down
	 */
	this.scrollForeward = function(){
				
		scrollBy(-g_sizes.stripSize);
	}
	
	
	/**
	 * scroll left or down
	 */
	this.scrollBack = function(){
				
		scrollBy(g_sizes.stripSize);
	}
	
	
	this.________EXTERNAL_SETTERS___________ = function(){};

	
	/**
	 * set the options of the strip
	 */
	this.setOptions = function(objOptions){
		
		g_options = jQuery.extend(g_options, objOptions);
		
		g_thumbs.setOptions(objOptions);
	}
	
	
	/**
	 * set size of the strip
	 * the height size is set automatically from options
	 */
	this.setSizeVertical = function(height){
		
		 if(g_isVertical == false){
			 throw new Error("setSizeVertical error, the strip size is not vertical");
			 return(false);
		 }
		
		 var width = g_sizes.thumbSecondSize;
		
		 var objCssStrip = {};
		 objCssStrip["width"] = width+"px";
		 objCssStrip["height"] = height+"px";
		 
		 g_objStrip.css(objCssStrip);
		 
		 //set inner strip params
		 var objCssInner = {};
		 objCssInner["width"] = width+"px";
		 objCssInner["left"] = "0px";
		 objCssInner["top"] = "0px";
		 
		 g_objStripInner.css(objCssInner);
		 
		 g_temp.is_placed = true;
		 
		 checkControlsEnableDisable();
	}

	
	/**
	 * set size of the strip
	 * the height size is set automatically from options
	 */
	this.setSizeHorizontal = function(width){
		
		 if(g_isVertical == false){
			 throw new Error("setSizeHorizontal error, the strip size is not horizontal");
			 return(false);
		 }
		
		var height = g_sizes.thumbSecondSize;
		
		 var objCssStrip = {};
		 objCssStrip["width"] = width+"px";
		 objCssStrip["height"] = height+"px";
		 
		 g_objStrip.css(objCssStrip);
		 		 
		 //set inner strip params
		 var objCssInner = {};
		 objCssInner["height"] = height+"px";
		 objCssInner["left"] = "0px";
		 objCssInner["top"] = "0px";
		 
		 g_objStripInner.css(objCssInner);
		 
		 g_temp.is_placed = true;
		
		 checkControlsEnableDisable();
	}
	
	
	/**
	 * set position of the strip
	 */
	this.setPosition = function(left, top, offsetLeft, offsetTop){
		g_functions.placeElement(g_objStrip, left, top, offsetLeft, offsetTop);		
	}
	
	
	/**
	 * resize the panel according the orientation
	 */
	this.resize = function(newSize){
		
		if(g_isVertical == false){
			
			g_objStrip.width(newSize);
			
		}else{
			
			g_objStrip.height(newSize);
		}
		
		g_sizes.stripSize = newSize;
		
		checkControlsEnableDisable();
		
		checkAndRepositionInnerStrip();
		
		alignInnerStrip();
		
		scrollToSelectedThumb();
	}
	
	
	/**
	 * set the thumb unselected state
	 */
	this.setThumbUnselected = function(objThumbWrapper){
		
		g_thumbs.setThumbUnselected(objThumbWrapper);
		
	}
	
	
	/**
	 * set custom thumbs
	 */
	this.setCustomThumbs = function(funcSetHtml){
		
		g_thumbs.setCustomThumbs(funcSetHtml);
		
	}
	
	
	this.________EXTERNAL_GETTERS___________ = function(){};
	
	/**
	 * get objects
	 */	
	this.getObjects = function(){
		
		var thumbsOptions = g_thumbs.getOptions();
		var commonOpitions = jQuery.extend(g_options, thumbsOptions);
		
		var obj = {
			g_gallery: g_gallery,
			g_objGallery: g_objGallery,
			g_objWrapper:g_objWrapper,
			g_arrItems:g_arrItems,
			g_objStrip : g_objStrip,
			g_objStripInner : g_objStripInner,
			g_aviaControl:g_aviaControl,
			g_touchThumbsControl:g_touchThumbsControl,
			isVertical: g_isVertical,
			g_options: commonOpitions
		};
		
		return(obj);
	}
	
	
	
	/**
	 * get strip size and position object
	 */
	this.getSizeAndPosition = function(){
		
		var obj = g_functions.getElementSize(g_objStrip);
		
		return(obj);
	}
	
	/**
	 * get thumbs strip height
	 */
	this.getHeight = function(){
		
		var stripHeight = g_objStrip.outerHeight();
		
		return(stripHeight)
	}
	
	
	/**
	 * get thumbs strip width
	 */
	this.getWidth = function(){
		
		var stripWidth = g_objStrip.outerWidth();
		
		return(stripWidth);
	}
	
	
	
	/**
	 * get all stored sizes object
	 */
	this.getSizes = function(){
		
		return(g_sizes);
	}
	
	
	/**
	 * return if vertical orientation or not
	 */
	this.isVertical = function(){
		return(g_isVertical);
	}
	
	
	/**
	 * return if the strip is placed or not
	 */
	this.isPlaced = function(){
		
		return(g_temp.is_placed);
	}
	
	/**
	 * return if the strip moving enabled or not
	 */
	this.isMoveEnabled = function(){
		var isEnabled = isStripMovingEnabled();
		return(isEnabled);
	}
	
}
