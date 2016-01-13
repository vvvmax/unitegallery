/**
 * touch thumbs control class
 * addon to strip gallery
 */
function UGZoomSliderControl(){
	
	var g_objSlider, g_objInner, g_parent = new UGSlider(), g_objParent;
	
	var g_functions = new UGFunctions();
	
	var t = this;
	
	var g_options = {
		slider_zoom_step: 1.2,							//the step of zooming with mouse wheel or zoom button
		slider_zoom_max_ratio: 6,						//max zoom ratio
		slider_zoom_return_pan_duration: 400,			//the return from pan animation duration 
		slider_zoom_return_pan_easing: "easeOutCubic"	//the return from pan wasing function
	};
	
	var g_temp = {
		isPanActive:false,
		startMouseX:0,
		startMouseY:0,
		lastMouseX:0,
		lastMouseY:0,
		startImageX:0,
		startImageY:0,
		panXActive:false,
		panYActive:false,
		objImage:null,
		objImageSize:null,
		objParent:null,
		objParentSize:null,
		objSlide:null,
		storeImageLastTime:0,
		
		isZoomActive: false,
		startDistance:0,
		startMiddlePoint:null,
		imageOrientPoint:null,
		objFitImageSize:null,
		isZoomedOnce:false
	};

	
	/**
	 * init the object
	 */
	function initObject(objSlider, customOptions){
		
		g_parent = objSlider;
		g_objParent = jQuery(g_parent);
		g_objects = objSlider.getObjects();
		g_objSlider = g_objects.g_objSlider;
		g_objInner = g_objects.g_objInner;
		
		g_options = jQuery.extend(g_options, customOptions);
				
		initEvents();
	}
	
	
	/**
	 * get fit image to slider scale mode
	 * the fill become fit
	 */
	function getFitScaleMode(){
		
		var scaleMode = g_parent.getScaleMode();
		
		if(scaleMode != "down")
			scaleMode = "fit";
		
		return(scaleMode);
	}
	
	
	/**
	 * cache current slide and image
	 */
	function storeCurrentImage(){		
		
		//prevent continious image storring
		var currentTime = jQuery.now();
		var diff = currentTime - g_temp.storeImageLastTime;
		
		if(diff < 20)
			return(false);
		
		var slides = g_parent.getSlidesReference();
		g_temp.objSlide = slides.objCurrentSlide;
		g_temp.objImage = slides.objCurrentSlide.find("img");
		
		if(g_temp.objImage.length == 0)
			return(false);
			
		g_temp.objImageSize = g_functions.getElementSize(g_temp.objImage);
		g_temp.objParent = g_temp.objImage.parent();
		g_temp.objParentSize = g_functions.getElementSize(g_temp.objParent);
		
		var scaleMode = getFitScaleMode();
		
		objPadding = g_parent.getObjImagePadding();
		
		g_temp.objFitImageSize = g_functions.getImageInsideParentDataByImage(g_temp.objImage, scaleMode, objPadding);
		
		var currentTime = jQuery.now();
		g_temp.storeImageLastTime = currentTime;
		
		return(true);
	}
	
	
	/**
	 * zoom current image
	 * mode: in, out, back
	 */
	function zoomCurrentImage(mode, mousePos){
		
		var slides = g_parent.getSlidesReference();
		var objImage = slides.objCurrentSlide.find("img");
		var scaleMode = getFitScaleMode();
		
		g_objParent.trigger(g_parent.events.ZOOM_START);
		
		//flag if the images zoomed
		var isZoomed = true;
		
		var objPadding = g_parent.getObjImagePadding();
				
		if(mode == "back"){	
			var objOriginalSize = g_functions.getImageOriginalSize(objImage);
			g_functions.scaleImageFitParent(objImage, objOriginalSize.width, objOriginalSize.height, scaleMode, objPadding);
		}
		else{			
			var zoomIn = (mode == "in")?true:false;
			
			isZoomed = g_functions.zoomImageInsideParent(objImage, zoomIn, g_options.slider_zoom_step, mousePos, scaleMode, g_options.slider_zoom_max_ratio, objPadding);
		}
		
		if(isZoomed == true){
			g_objParent.trigger(g_parent.events.ZOOMING);
			g_objParent.trigger(g_parent.events.ZOOM_CHANGE);
			g_objParent.trigger(g_parent.events.ZOOM_END);
		}
		
	}
	
	
	function ____________PAN_____________(){};
	
	
	/**
	 * check if pan is posible for the current image
	 * check if the image is bigger then the parent
	 */
	function isPanPosible(objImage, event, stictTouchesCheck){
		
		//check num touches, strict means that even if 0 - pan not posible
		var arrTouches = g_functions.getArrTouches(event);
		
		if(stictTouchesCheck === true){
			
			if(arrTouches.length != 1)
				return(false);			
		}else{
			if(arrTouches.length > 1)
				return(false);			
		}
		
		if(g_functions.isElementBiggerThenParent(objImage))
			return(true);
		
		return(false);
	}
	
	
	/**
	 * store pan values
	 */
	function storePanInitValues(event){
		
		var mousePos = g_functions.getMousePosition(event);
		
		g_temp.startMouseX = mousePos.pageX;
		g_temp.startMouseY = mousePos.pageY;
		
		g_temp.lastMouseX = g_temp.startMouseX;
		g_temp.lastMouseY = g_temp.startMouseY;
		
		g_temp.startImageX = g_temp.objImageSize.left;
		g_temp.startImageY = g_temp.objImageSize.top;
		
		g_temp.panXActive = (g_temp.objImageSize.width > g_temp.objParentSize.width);
		g_temp.panYActive = (g_temp.objImageSize.height > g_temp.objParentSize.height);
		
	}
	
	
	/**
	 * check pan start, and start if posible
	 */
	function startPan(event){
				
		g_temp.isPanActive = true;
		storePanInitValues(event);
		
	}
	
	
	/**
	 * pan the image
	 */
	function panImage(event){
		
		if(g_temp.objImage == undefined || g_temp.objImage.length == 0)
			return(true);
		
		var mousePos = g_functions.getMousePosition(event);
		
		var diffX = mousePos.pageX - g_temp.startMouseX;
		var diffY = mousePos.pageY - g_temp.startMouseY;
		
		//get active direction
		var diffLastX = mousePos.pageX - g_temp.lastMouseX;
		var diffLastY = mousePos.pageY - g_temp.lastMouseY;
		
		var directionX = (diffLastX < 0) ? "left":"right";
		var directionY = (diffLastY < 0) ? "up":"down";
		
		g_temp.lastMouseX = mousePos.pageX;
		g_temp.lastMouseY = mousePos.pageY;
		
		var posImage = g_functions.getElementSize(g_temp.objImage);
		
		//var imageX = g_temp.startImageX + diffX;
		//var imageY = g_temp.startImageY + diffY;
				
		
		//slow down if no pan available in this point
		//slow down y
		
		if(g_temp.panYActive == false){
			
			diffLastY = 0;
			
		}else{		//zoom enabled
			
			if(directionY == "down" && posImage.top > 0){			
				
				diffLastY = diffLastY / 3;				
				
			}else if(directionY == "up" && posImage.bottom < g_temp.objParentSize.height){
				
				diffLastY = diffLastY / 3;				
				
			}
		}
		
		//slow down x (only if the pan enabled)
		if(g_temp.panXActive == false || g_parent.isInnerInPlace() == false){
			
			diffLastX = 0;
		
		}else{	//zoom enabled
			
			if(directionX == "right" && posImage.left > 0){				
				diffLastX = diffLastX / 3;				
			}
			else if(directionX == "left" && posImage.right < g_temp.objParentSize.width){
				diffLastX = diffLastX / 3;
			}
	    }
		
		var imageX = posImage.left + diffLastX;
		var imageY = posImage.top + diffLastY;
		
		
		g_functions.placeElement(g_temp.objImage, imageX, imageY);
		
	}
	
	
	
	
	/**
	 * return the image to place if it's out of borders
	 */
	function checkReturnAfterPan(){
				
		var isReturnX = false, isReturnY = false, newX = 0, newY = 0;
		var objSize = g_functions.getElementSize(g_temp.objImage);
		var objImagePadding = g_parent.getObjImagePadding();
				
		var objCenterPos = g_functions.getElementCenterPosition(g_temp.objImage, objImagePadding);
		
		g_temp.panXActive = (g_temp.objImageSize.width > g_temp.objParentSize.width);
		g_temp.panYActive = (g_temp.objImageSize.height > g_temp.objParentSize.height);
				
		
		if(g_temp.panYActive == true){
			
			if(objSize.top > 0){		//off limit top
				
				newY = 0;
				isReturnY = true;
				
			}else if(objSize.bottom < g_temp.objParentSize.height){		//off limit bottom
				
				newY = g_temp.objParentSize.height - objSize.height;
				isReturnY = true;
				
			}
			
		}else{		//pan not active y - return to center
			
			if(objSize.top != objCenterPos.top){
				isReturnY = true;
				newY = objCenterPos.top;
			}
			
		}
		
		
		//check return x to place
		if(g_temp.panXActive == true){
			
			if(objSize.left > 0){		//off limit left
				
				newX = 0;
				isReturnX = true;
				
			}else if(objSize.right < g_temp.objParentSize.width){		//off limit right
								
				newX = g_temp.objParentSize.width - objSize.width;
				isReturnX = true;
				
			}
			
		}else{		//pan not active x - return to center
			
		//	debugLine("not active", true);
			
			if(objSize.left != objCenterPos.left){
				isReturnX = true;
				newX = objCenterPos.left;
			}
		}
		
		
		//do the animation
		var objCss = {};
		if(isReturnY == true)
			objCss.top = newY + "px";
		
		if(isReturnX == true)
			objCss.left = newX + "px";
		
		
		if(isReturnY == true || isReturnX == true){
						
			g_temp.objImage.animate(objCss,{
				duration: g_options.slider_zoom_return_pan_duration,
				easing: g_options.slider_zoom_return_pan_easing,
				queue: false
			});

		}
		
	}
	
	/**
	 * check if the image animating or not
	 */
	function isImageAnimating(){
		
		if(g_temp.objImage && g_temp.objImage.is(":animated"))
			return(true);
		
		return(false);
	}
	
	function ____________END_PAN_____________(){};
	
	function ________TOUCH_ZOOM_____________(){};
	
	/**
	 * start touch zoom
	 */
	function startTouchZoom(arrTouches){
				
		g_temp.isZoomActive = true;
		
		//store init diff
		g_temp.startDistance = g_functions.getDistance(arrTouches[0].pageX, arrTouches[0].pageY, arrTouches[1].pageX, arrTouches[1].pageY);
		if(g_temp.startDistance == 0)
			g_temp.startDistance = 1;
		
		
		//store init positions
		g_temp.startMiddlePoint = g_functions.getMiddlePoint(arrTouches[0].pageX, arrTouches[0].pageY, arrTouches[1].pageX, arrTouches[1].pageY);
				
		g_temp.objImageSize = g_functions.getElementSize(g_temp.objImage);
			
		g_temp.startImageX = g_temp.objImageSize.left;
		g_temp.startImageY = g_temp.objImageSize.top;
		
		//set orient point
		g_temp.imageOrientPoint = g_functions.getElementLocalPoint(g_temp.startMiddlePoint, g_temp.objImage);
		
		var isInsideImage = g_functions.isPointInsideElement(g_temp.imageOrientPoint, g_temp.objImageSize);
		if(isInsideImage == false){
			g_temp.imageOrientPoint = g_functions.getElementCenterPoint(g_temp.objImage);
		}
		
		//trigger start zoom event
		g_objParent.trigger(g_parent.events.ZOOM_START);
	}
	
	
	/**
	 * check num touches, if not 2 - end zoom
	 */
	function checkTouchZoomEnd(event){
				
		if(g_temp.isZoomActive == false)
			return(false);
		
		var arrTouches = g_functions.getArrTouches(event);			
		if(arrTouches.length != 2){		//end touch zoom
			
			g_temp.isZoomActive = false;
			
			//trigger end zoom event
			g_objParent.trigger(g_parent.events.ZOOM_END);			
		}	
		
	}
	
	
	/**
	 * check start touch zoom
	 */
	function checkTouchZoomStart(event){
				
		if(g_temp.isZoomActive == true)
			return(true);


		var arrTouches = g_functions.getArrTouches(event);
				
		if(arrTouches.length != 2)
			return(true);
					
		startTouchZoom(arrTouches);		
	}
	
	
	/**
	 * do touch zoom on touch devices
	 */
	function doTouchZoom(event){
				
		var arrTouches = g_functions.getArrTouches(event);
				
		var distance = g_functions.getDistance(arrTouches[0].pageX, arrTouches[0].pageY, arrTouches[1].pageX, arrTouches[1].pageY);		
		var zoomRatio = distance / g_temp.startDistance;
		
		var middlePoint = g_functions.getMiddlePoint(arrTouches[0].pageX, arrTouches[0].pageY, arrTouches[1].pageX, arrTouches[1].pageY);
		
		//set zoom data:
		var newWidth = g_temp.objImageSize.width * zoomRatio;
		var newHeight = g_temp.objImageSize.height * zoomRatio;
		
		//check max zoom ratio:
		var objOriginalSize = g_functions.getImageOriginalSize(g_temp.objImage);
		var expectedZoomRatio = 1;		
		if(objOriginalSize.width > 0)
			expectedZoomRatio = newWidth / objOriginalSize.width;
		
		if(expectedZoomRatio > g_options.slider_zoom_max_ratio)
			return(true);
		
		//set pan data:
		panX = -(g_temp.imageOrientPoint.x * zoomRatio - g_temp.imageOrientPoint.x);
		panY = -(g_temp.imageOrientPoint.y * zoomRatio - g_temp.imageOrientPoint.y);
		
		var diffMiddleX = (middlePoint.x - g_temp.startMiddlePoint.x);
	    var diffMiddleY = (middlePoint.y - g_temp.startMiddlePoint.y);
		
	    var posx = g_temp.startImageX + panX + diffMiddleX;
		var posy = g_temp.startImageY + panY + diffMiddleY;		
				
		
		//resize and place:
		g_functions.setElementSizeAndPosition(g_temp.objImage, posx, posy, newWidth, newHeight);
		
		//trigger zooming event
		g_objParent.trigger(g_parent.events.ZOOMING);			
		g_objParent.trigger(g_parent.events.ZOOM_CHANGE);			

		/*
		debugLine({
			middleStartX: g_temp.startMiddlePoint.x,
			middleX: middlePoint.x,
			diffMiddleX: diffMiddleX
		});
		*/
		
	}
	
	
	/**
	 * check return the image from zoom
	 */
	function checkReturnFromZoom(){
				
		if(g_temp.objImage == undefined || g_temp.objImage.length == 0)
			return(true);
		
		var objSize = g_functions.getElementSize(g_temp.objImage);
		
		if(objSize.width < g_temp.objFitImageSize.imageWidth){
			
			g_temp.objImage.css({
				position:"absolute",
				margin:"none"
			});
			
			var objCss = {
				top: g_temp.objFitImageSize.imageTop + "px",
				left: g_temp.objFitImageSize.imageLeft + "px",
				width: g_temp.objFitImageSize.imageWidth + "px",
				height: g_temp.objFitImageSize.imageHeight + "px"
			};
			
			g_temp.objImage.animate(objCss,{
				duration: g_options.slider_zoom_return_pan_duration,
				easing: g_options.slider_zoom_return_pan_easing,
				queue: false
			});
			
		}else{			
			checkReturnAfterPan();
		}
		
	}
	
	
	function ________END_TOUCH_ZOOM_____________(){};
	
	
	/**
	 * 
	 * touch start event - start pan, remember start pan data
	 */
	function onTouchStart(event){
		
		//if no image type, exit
		if(g_parent.isCurrentSlideType("image") == false)
			return(true);
		
		var isStored = storeCurrentImage();
		
		if(g_temp.objImage == undefined || g_temp.objImage.length == 0)
			return(true);
		
		event.preventDefault();
						
		//stop animation if exists
		if(isImageAnimating() == true){			
			g_temp.objImage.stop(true);
		}
		
		if(g_temp.isZoomActive == true){
			
			checkTouchZoomEnd(event);
			
		}else{
			
			checkTouchZoomStart(event);
			
		}
		
		//if zoom started stop panning, if not, start panning
		if(g_temp.isZoomActive == true){
			
			g_temp.isPanActive = false;
		
		}else if(isPanPosible(g_temp.objImage, event) == true && g_temp.isZoomedOnce == true){
			
			startPan(event);
		}
		
		/*
		debugLine({
				pan: g_temp.isPanActive,
				zoom: g_temp.isZoomActive,
				event: "start"
			}, true);
		*/
		
	}
	
	
	/**
	 * touch end event - bring the image to place
	 */
	function onTouchEnd(event){
		
		if(g_parent.isCurrentSlideType("image") == false)
			return(true);
		
		//check if some gallery button clicked
		var objTarget = jQuery(event.target);
		if(objTarget.data("ug-button") == true){
			//event.preventDefault();
			return(false);
		}
		
		var isStored = storeCurrentImage();

		if(g_temp.objImage == undefined || g_temp.objImage.length == 0)
			return(true);
				
		var panWasActive = g_temp.isPanActive;
		var zoomWasActive = g_temp.isZoomActive;
		
		//if the inner not in place, don't return noting, let the slide change
		if(g_parent.isInnerInPlace() == false){
			g_temp.isZoomActive = false;
			g_temp.isPanActive = false;
			return(true);
		}
		
		//check end zoom
		if(g_temp.isZoomActive == true){
			checkTouchZoomEnd(event);
		}else{
			checkTouchZoomStart(event);
		}
		
		
		if(g_temp.isZoomActive == true){
			
			g_temp.isPanActive = false;
			
		}else{
			
			var panPosible = isPanPosible(g_temp.objImage, event, true);
			
			if(g_temp.isPanActive == true ){
						
				g_temp.isPanActive = false;
				
			}else if(panPosible == true){
				
				startPan(event);
			}
			
		}
		
		/*
		debugLine({
			pan:g_temp.isPanActive,
			zoom: g_temp.isZoomActive
		}, true);
		*/
		
		if((panWasActive || zoomWasActive) && g_temp.isZoomActive == false && g_temp.isPanActive == false){
			checkReturnFromZoom();
		}
		
		
	}
	
	
	/**
	 * 
	 * touch move event - pan
	 */
	function onTouchMove(event){
		
		if(g_parent.isCurrentSlideType("image") == false)
			return(true);
				
		//check touch zoom (pinch gesture)
		if(g_temp.isZoomActive == true){
			
			doTouchZoom(event);
			
		}else if(g_temp.isPanActive == true){
			
			panImage(event);
			
		}
		
		
	}
	
	
	/**
	 * on slider mousewheel event
	 */
	function onSliderMouseWheel(event, delta, deltaX, deltaY){
		
		if(g_options.slider_zoom_mousewheel == false)
			return(true);
		
		if(g_parent.isCurrentSlideType("image") == false)
			return(true);
		
		event.preventDefault();
		
		//prevent default only if needed
		//if(zoomIn == true || zoomIn == false && g_functions.isElementBiggerThenParent(objImage))
		//event.preventDefault();
		
		
		var zoomIn = (delta > 0);
		var mousePos = g_functions.getMousePosition(event);
		var	mode = (zoomIn == true) ? "in":"out";
		
		zoomCurrentImage(mode, mousePos);
	}
	
	
	/**
	 * init touch events
	 */
	function initEvents(){
		
		//debugLine("init");
		g_objSlider.on("mousewheel",onSliderMouseWheel);
		
		//slider mouse down - pan start
		g_objSlider.bind("mousedown touchstart",onTouchStart);
		
		//on body move
		jQuery("body").bind("mousemove touchmove",onTouchMove);
		
		//on body mouse up - pan end
		jQuery(window).add("body").bind("mouseup touchend", onTouchEnd);
		
		//event before image returned to init position
		g_objParent.bind(g_parent.events.BEFORE_RETURN, function(){
			
			checkReturnFromZoom();
		});
				
		//on item change update isZoomedOnce event. Allow panning only if zoomed once
		g_objParent.bind(g_parent.events.ITEM_CHANGED, function(){
			g_temp.isZoomedOnce = false;
		});
		
		g_objParent.bind(g_parent.events.ZOOM_CHANGE, function(){
			g_temp.isZoomedOnce = true;
		});
		
	}
	
	this.________EXTERNAL_____________ = function(){};
	
	/**
	 * check if the image is zoomed, and there is a place for left panning
	 */
	this.isPanEnabled = function(event, direction){
		
		storeCurrentImage();
		
		if(g_temp.objImage == undefined || g_temp.objImage.length == 0)
			return(false);
		
		if(g_temp.isZoomedOnce == false)
			return(false);
		
		if(isPanPosible(g_temp.objImage, event) == false)
			return(false);
		
		if(g_parent.isInnerInPlace() == false)
			return(false);
		
		if(direction == "left"){
			
			if(g_temp.objImageSize.right <= g_temp.objParentSize.width)
				return(false);
			
		}else{	//right direction
			
			if(g_temp.objImageSize.left >= 0)
				return(false);
		}
		
		return(true);
	}
	
	
	/**
	 * init function for avia controls
	 */
	this.init = function(objSlider, customOptions){
		
		initObject(objSlider, customOptions);
	}
	
	/**
	 * zoom in
	 */
	this.zoomIn = function(){		
		zoomCurrentImage("in");	
	}
	
	/**
	 * zoom out
	 */
	this.zoomOut = function(){		
		zoomCurrentImage("out");		
	}
	
	/**
	 * zoom back
	 */
	this.zoomBack = function(){
		
		zoomCurrentImage("back");		
	}
}