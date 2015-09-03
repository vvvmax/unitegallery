/**f
 * touch thumbs control class
 * addon to strip gallery
 */
function UGTouchSliderControl(){
	
	var g_objSlider, g_objInner, g_parent = new UGSlider();
	var g_objParent, g_options, t=this;
	
	var g_functions = new UGFunctions();
	
	
	var g_options = {
		  slider_transition_continuedrag_speed: 250,				//the duration of continue dragging after drag end
		  slider_transition_continuedrag_easing: "linear",		//easing function of continue dragging animation
		  slider_transition_return_speed: 300,					//the duration of the "return to place" animation
		  slider_transition_return_easing: "easeInOutQuad"		//easing function of the "return to place" animation
	};
	
	var g_temp = {
		touch_active: false,		
		startMouseX: 0,		
		startMouseY: 0,
		lastMouseX: 0,
		lastMouseY: 0,
		startPosx:0, 
		startTime:0,
		isInitDataValid:false,
		slides: null,
		lastNumTouches:0,
		isDragging: false,
		storedEventID: "touchSlider",
		videoStartX: 0,
		isDragVideo: false,
		videoObject: null
	};
	
	
	/**
	 * get diff inner object position from current item pos
	 */
	function getDiffPosFromCurrentItem(slides){
		
		if(!slides)
			var slides = g_parent.getSlidesReference();
		
		var posCurrent = g_functions.getElementSize(slides.objCurrentSlide);
		var inPlaceX = -posCurrent.left;
		var objInnerSize = g_functions.getElementSize(g_objInner);
		var diffPos = inPlaceX - objInnerSize.left;
		
		return(diffPos);
	}
	
	/**
	 * check if the movement that was held is valid for slide change
	 */
	function isMovementValidForChange(){
		
		var slides = g_parent.getSlidesReference();

		//check position, if more then half, move
		var diffPos = getDiffPosFromCurrentItem(slides);
		
		var breakSize = Math.round(slides.objCurrentSlide.width() * 3 / 8);
				
		if(Math.abs(diffPos) >= breakSize)
			return(true);
				
		//check gesture, if vertical mostly then not move
		var diffX = Math.abs(g_temp.lastMouseX - g_temp.startMouseX);
		var diffY = Math.abs(g_temp.lastMouseY - g_temp.startMouseY);
		
		//debugLine("diffx: " + diffX, true, true);
		
		if(diffX < 20)
			return(false);
		
		//if(diffY >= diffX)
			//return(false);
				
		//check time. Short time always move
		var endTime = jQuery.now();
		var diffTime = endTime - g_temp.startTime;
		
		//debugLine("time: " + diffTime, true);
		
		if(diffTime < 500)
			return(true);
		
					
		return(false);
	}

	/**
	 * check tab event occured
	 * invokes on touchend event on the slider object
	 */
	this.isTapEventOccured = function(event){
		
		//validate one touch
		var arrTouches = g_functions.getArrTouches(event);
		var numTouches = arrTouches.length;
			
		if(numTouches != 0 || g_temp.lastNumTouches != 0){
			g_temp.lastNumTouches = numTouches;
			return(false);
		}
			
		g_temp.lastNumTouches = numTouches;
				
		var slides = g_parent.getSlidesReference();

		//check position, if more then half, move
		var diffPos = getDiffPosFromCurrentItem(slides);
		
		//check gesture, if vertical mostly then not move
		var diffX = Math.abs(g_temp.lastMouseX - g_temp.startMouseX);
		var diffY = Math.abs(g_temp.lastMouseY - g_temp.startMouseY);
		
		//check by time
		var endTime = jQuery.now();
		var diffTime = endTime - g_temp.startTime;
		
		//combine move and time
		if(diffX < 20 && diffY < 50 && diffTime < 500)
			return(true);
		
		return(false);
	}
	
	/**
	 * return the item to place
	 */
	function returnToPlace(slides){
		
		if(g_parent.isInnerInPlace() == true)
			return(false);
						
		//trigger before return event
		g_objParent.trigger(g_parent.events.BEFORE_RETURN);
		
		if(!slides)
			var slides = g_parent.getSlidesReference();
		
		var posCurrent = g_functions.getElementSize(slides.objCurrentSlide);
		var destX = -posCurrent.left;
				
		//animate objects		
		g_objInner.animate({left:destX+"px"},{
			duration: g_options.slider_transition_return_speed,
			easing: g_options.slider_transition_continuedrag_easing,
			queue: false,
			progress: function(animation, number, remainingMS){
								
				//check drag video
				if(g_temp.isDragVideo == true){
					var objSize = g_functions.getElementSize(g_objInner);
					var innerX = objSize.left;
					
					var posDiff = innerX - destX;
					
					var videoPosX = g_temp.videoStartX + posDiff;
					g_temp.videoObject.css("left", videoPosX);
				}
				
			},
			complete: function(){
				g_objParent.trigger(g_parent.events.AFTER_RETURN);
			}
		});
		
	}
	
	
	/**
	 * 
	 * change the item to given direction
	 */
	function changeItem(direction){
		
		g_parent.getVideoObject().hide();
		g_parent.switchSlideNums(direction);
		g_parent.placeNabourItems();

	}
	
	/**
	 * continue the dragging by changing the slides to the right place.
	 */
	function continueSlideDragChange(){
		
		//get data
		var slides = g_parent.getSlidesReference();
		
		var diffPos = getDiffPosFromCurrentItem(slides);
		
		if(diffPos == 0)
			return(false);
		
		var direction = (diffPos > 0) ? "left" : "right";
			
		var isReturn = false;
			
		switch(direction){
			case "right":	//change to prev item
				
				if( g_parent.isSlideHasItem(slides.objPrevSlide) ){
					
					var posPrev = g_functions.getElementSize(slides.objPrevSlide);
					var destX = -posPrev.left;
					
				}else	//return current item
					isReturn = true;
				
			break;	
			case "left":		//change to next item
				
				if( g_parent.isSlideHasItem(slides.objNextSlide) ){
					
					var posNext = g_functions.getElementSize(slides.objNextSlide);
					var destX = -posNext.left;
					
				}else					
					isReturn = true;				
			break;
	   }
		
		
		if(isReturn == true){
			returnToPlace(slides);
			
		}else{
						
			//animate objects
			g_objInner.stop().animate({left:destX+"px"},{
				duration: g_options.slider_transition_continuedrag_speed,
				easing: g_options.slider_transition_continuedrag_easing,
				queue: false,
				progress: function(){
					
					//check drag video
					if(g_temp.isDragVideo == true){
						var objSize = g_functions.getElementSize(g_objInner);
						var innerX = objSize.left;
						var posDiff = innerX - g_temp.startPosx;
						var videoPosX = g_temp.videoStartX + posDiff;
						g_temp.videoObject.css("left", videoPosX);
					}
					
				},
				always:function(){
					changeItem(direction);
					g_objParent.trigger(g_parent.events.AFTER_DRAG_CHANGE);
				}
			});
			
		}
				
		
	}

	
	/**
	 * handle slider drag on mouse drag
	 */
	function handleSliderDrag(event){
		
		var diff = g_temp.lastMouseX - g_temp.startMouseX;
		
		if(diff == 0)
			return(true);
		
		var direction = (diff < 0) ? "left":"right";
		
		var objZoomSlider = g_parent.getObjZoom();
		
		//don't drag if the zoom panning enabled
		//store init position after image zoom pan end
		if(objZoomSlider){
			
			var isPanEnabled = objZoomSlider.isPanEnabled(event,direction);
						
			if(isPanEnabled == true){
				g_temp.isInitDataValid = false;
				return(true);				
			}else{
				
				if(g_temp.isInitDataValid == false){
					storeInitTouchData(event);
					return(true);
				}
				
			}
		}
		
		//set inner div position
		var currentPosx = g_temp.startPosx + diff;
		
		//check out of borders and slow down the motion:
		if(diff > 0 && currentPosx > 0)
			currentPosx = currentPosx / 3;		
		
		else if(diff < 0 ){
			
			var innerEnd = currentPosx + g_objInner.width();
			var sliderWidth = g_objSlider.width();
			
			if( innerEnd <  sliderWidth ){
				currentPosx = g_temp.startPosx + diff/3;
			}
		}
		
		if(g_temp.isDragging == false){
			g_temp.isDragging = true;
			g_objParent.trigger(g_parent.events.START_DRAG);
		}
				
		g_objInner.css("left", currentPosx+"px");
		
		//drag video
		if(g_temp.isDragVideo == true){
			var posDiff = currentPosx - g_temp.startPosx;
			var videoPosX = g_temp.videoStartX + posDiff;
			
			g_temp.videoObject.css("left", videoPosX);
		}
		
	}
	
	/**
	 * store init touch position
	 */
	function storeInitTouchData(event){
		
		var mousePos = g_functions.getMousePosition(event);
		
		g_temp.startMouseX = mousePos.pageX;
		
		//debugLine("startx:" + g_temp.startMouseX, true, true);
		
		g_temp.startMouseY = mousePos.pageY;
		
		g_temp.lastMouseX = g_temp.startMouseX;
		g_temp.lastMouseY = g_temp.startMouseY;
		g_temp.startTime = jQuery.now();
		
		var arrTouches = g_functions.getArrTouches(event);		
		g_temp.startArrTouches = g_functions.getArrTouchPositions(arrTouches);
		
		var objPos = g_functions.getElementSize(g_objInner);
		
		g_temp.startPosx = objPos.left;
		
		g_temp.isInitDataValid = true;
		
		//check if video object need to be dragged
		g_temp.isDragVideo = false;
					
		
		g_functions.storeEventData(event, g_temp.storedEventID);
	}
	
	/**
	 * disable touch active
	 */
	function disableTouchActive(who){
		
		g_temp.touch_active = false;
		
		//debugLine("disable: " + who, true, true);
	}
	
	/**
	 * enable the touch active
	 */
	function enableTouchActive(who, event){
		
		g_temp.touch_active = true;
		storeInitTouchData(event);
		
		//debugLine("enable: " + who, true, true);
	}

	
	/**
	 * on touch slide start
	 * 
	 */
	function onTouchStart(event){
		
		event.preventDefault();
		
		g_temp.isDragging = false;
		
		//debugLine("touchstart", true, true);
		
		//check if the slides are changing from another event.
		if(g_parent.isAnimating() == true){
			g_objInner.stop(true, true);
		}
		
		//check num touches
		var arrTouches = g_functions.getArrTouches(event);
		if(arrTouches.length > 1){
			
			if(g_temp.touch_active == true){
				disableTouchActive("1");
			}
			
			return(true);
		}
						
		if(g_temp.touch_active == true){
			return(true);
		}
		
		enableTouchActive("1", event);
		
	}
	

	/**
	 * 
	 * on touch move event
	 */
	function onTouchMove(event){
		
		if(g_temp.touch_active == false)
			return(true);
		
		//detect moving without button press
		if(event.buttons == 0){
			disableTouchActive("2");
			
			continueSlideDragChange();
						
			return(true);
		}

		g_functions.updateStoredEventData(event, g_temp.storedEventID);
				
		event.preventDefault();
		
		var mousePos = g_functions.getMousePosition(event);
		g_temp.lastMouseX = mousePos.pageX;
		g_temp.lastMouseY = mousePos.pageY;
				
		//debugLine("lastX:" + g_temp.lastMouseX, true, true);
		
		var scrollDir = null;
		
		if(g_options.slider_vertical_scroll_ondrag == true)
			scrollDir = g_functions.handleScrollTop(g_temp.storedEventID);
		
		if(scrollDir !== "vert")
			handleSliderDrag(event);
			
	}
	
	/**
	 * on touch end event
	 */
	function onTouchEnd(event){
		
		//debugLine("touchend", true, true);
		
		var arrTouches = g_functions.getArrTouches(event);
		var numTouches = arrTouches.length;
		var isParentInPlace = g_parent.isInnerInPlace();
		
		if(isParentInPlace == true && g_temp.touch_active == false && numTouches == 0){
			
			return(true);
		}
				
		if(numTouches == 0 && g_temp.touch_active == true){
											
			disableTouchActive("3");
			
			var isValid = false;
			
			var wasVerticalScroll = g_functions.wasVerticalScroll(g_temp.storedEventID);
			
			if(wasVerticalScroll == false)
				isValid = isMovementValidForChange();
						
			if(isValid == true)
				continueSlideDragChange();		//change the slide
			else
				returnToPlace();	//return the inner object to place (if not in place)
			
		}else{
			
			if(numTouches == 1 && g_temp.touch_active == false){
								
				enableTouchActive("2",event);				
			}
				
		}
					
	}


	/**
	 * init touch events
	 */
	function initEvents(){
		
		//slider mouse down - drag start
		g_objSlider.bind("mousedown touchstart",onTouchStart);
		
		//on body move
		jQuery("body").bind("mousemove touchmove",onTouchMove);
		
		//on body mouse up - drag end
		jQuery(window).add("body").bind("mouseup touchend", onTouchEnd);
		
	}
	
	
	
	/**
	 * init function for avia controls
	 */
	this.init = function(objSlider, customOptions){
		
		g_parent = objSlider;
		g_objParent = jQuery(g_parent);
		g_objects = objSlider.getObjects();
				
		g_objSlider = g_objects.g_objSlider;
		g_objInner = g_objects.g_objInner;

		g_options = jQuery.extend(g_options, customOptions);
				
		initEvents();
	}
	
	
	/**
	 * get last mouse position
	 */
	this.getLastMousePos = function(){
		var obj = {
			pageX: g_temp.lastMouseX,
			pageY: g_temp.lastMouseY
		};
		
		return(obj);
	}
	
	
	/**
	 * is touch active
	 */
	this.isTouchActive = function(){
		
		return(g_temp.touch_active);
		
	}
	
	
}