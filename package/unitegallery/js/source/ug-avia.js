
/**
 * avia control class
 * addon to strip gallery
 */
function UGAviaControl(){

	var g_parent, g_gallery, g_objects, g_objStrip, g_objStripInner, g_options;
	var g_isVertical;
	
	var g_temp = {
		touchEnabled:false,			//variable that tells if touch event was before move event
		isMouseInsideStrip: false,
		strip_finalPos:0,
		handle_timeout:"",
		isStripMoving:false,
		isControlEnabled: true
	};
	
	
	/**
	 * enable the control
	 */
	this.enable = function(){
		g_temp.isControlEnabled = true;
	}
	
	/**
	 * disable the control
	 */
	this.disable = function(){
		g_temp.isControlEnabled = false;		
	}
	
	/**
	 * init function for avia controls
	 */
	this.init = function(objParent){
		g_parent = objParent;
		
		g_objects = objParent.getObjects();
				
		g_gallery = g_objects.g_gallery;
		
		g_objStrip = g_objects.g_objStrip;
		g_objStripInner = g_objects.g_objStripInner;
		g_options = g_objects.g_options;
		g_isVertical = g_objects.isVertical;		
				
		initEvents();
	}
	
	/**
	 * get mouse position from event according the orientation
	 */
	function getMousePos(event){
		
		if(g_isVertical == false)
			return(event.pageX);
		
		return(event.pageY);
	}
	
	/**
	 * handle avia strip control event on body mouse move
	 */
	function initEvents(event){
		
		//make sure that the avia control will not work on touch devices
		jQuery("body").on("touchstart", function(event){
			
			if(g_temp.isControlEnabled == false)
				return(true);
			
			g_temp.touchEnabled = true;
			
		});
		
		//on body move
		jQuery("body").mousemove(function(event){
			
			if(g_temp.isControlEnabled == false)
				return(true);
									
			//protection for touch devices, disable the avia events
			if(g_temp.touchEnabled == true){
				jQuery("body").off("mousemove");
				return(true);
			}
			
			g_temp.isMouseInsideStrip = g_objStrip.ismouseover();
			var strip_touch_active = g_parent.isTouchMotionActive();
			
			if(g_temp.isMouseInsideStrip == true && strip_touch_active == false){
				
				var mousePos = getMousePos(event);
				
				moveStripToMousePosition(mousePos);
			}else{
				stopStripMovingLoop();
			}
			
		});
						
	}
	
	
	/**
	 * destroy the avia control events
	 */
	this.destroy = function(){
		
		jQuery("body").off("touchstart");
		jQuery("body").off("mousemove");

	}
	
	
	/**
	 * get inner y position according mouse y position on the strip
	 */
	function getInnerPosY(mouseY){
		
		var stripHeight = g_objStrip.height();
		var innerHeight = g_objStripInner.height();		
		
		
		//if all thumbs visible, no need to move
		if(stripHeight > innerHeight)
			return(false);
		
		//find y position inside the strip
		var stripOffset = g_objStrip.offset();		
		var offsetY = stripOffset.top;
		var posy = mouseY - offsetY;
		
		//set measure line parameters
		var mlineStart = g_options.thumb_height;
		var mlineEnd = stripHeight - g_options.thumb_height;
		var mLineSize = mlineEnd - mlineStart;
				
		//fix position borders on the measure line
		if(posy < mlineStart)
			posy = mlineStart;
		
		if(posy > mlineEnd)
			posy = mlineEnd;
		
		//count the ratio of the position on the measure line
		var ratio = (posy - mlineStart) / mLineSize;
		var innerPosY = (innerHeight - stripHeight) * ratio;
		innerPosY = Math.round(innerPosY);
		innerPosY = innerPosY * -1;
				
		return(innerPosY);
	}

	
	/**
	 * get inner x position according mouse x position on the strip
	 */
	function getInnerPosX(mouseX){
		
		var stripWidth = g_objStrip.width();
		var innerWidth = g_objStripInner.width();		
		
		//if all thumbs visible, no need to move
		if(stripWidth > innerWidth)
			return(false);
		
		var stripOffset = g_objStrip.offset();
		var offsetX = stripOffset.left;
		var posx = mouseX - offsetX;
		
		//set measure line parameters
		var mlineStart = g_options.thumb_width;
		var mlineEnd = stripWidth - g_options.thumb_width;
		var mLineSize = mlineEnd - mlineStart;
				
		//fix position borders on the measure line
		if(posx < mlineStart)
			posx = mlineStart;
		
		if(posx > mlineEnd)
			posx = mlineEnd;
		
		//count the ratio of the position on the measure line
		var ratio = (posx - mlineStart) / mLineSize;
		var innerPosX = (innerWidth - stripWidth) * ratio;
		innerPosX = Math.round(innerPosX);
				
		innerPosX = innerPosX * -1;
		
		return(innerPosX);
	}
		
		
	/**
	 * move strip stap to final position
	 */
	function moveStripStep(){
		
		if(g_temp.is_strip_moving == false){
			return(false);
		}
		
		var innerPos = g_parent.getInnerStripPos();
		
		if(Math.floor(innerPos) == Math.floor(g_temp.strip_finalPos)){
			stopStripMovingLoop();
		}
		
		//calc step
		var diff = Math.abs(Math.abs(g_temp.strip_finalPos) - Math.abs(innerPos));
		
		var dpos;
		if(diff < 1){
			dpos = diff;
		}
		else{
		
			dpos = diff / 4;
			if(dpos > 0 && dpos < 1)
				dpos = 1;
		}		
		
		if(g_temp.strip_finalPos < innerPos)
			dpos = dpos * -1;
			
		var newPos = innerPos + dpos;
		
		g_parent.positionInnerStrip(newPos);
		
	}
	
	
	/**
	 * start loop of strip moving
	 */
	function startStripMovingLoop(){
		
		if(g_temp.isStripMoving == true)
			return(false);
			
		g_temp.isStripMoving = true;
		g_temp.handle_timeout = setInterval(moveStripStep,10);
	}
	
	/**
	 * stop loop of strip moving
	 */
	function stopStripMovingLoop(){
		
		if(g_temp.isStripMoving == false)
			return(false);
			
		g_temp.isStripMoving = false;
		g_temp.handle_timeout = clearInterval(g_temp.handle_timeout);
	}

	/**
	 * get inner position according the orientation
	 * taken by the mouse position
	 */
	function getInnerPos(mousePos){
		
		if(g_isVertical == false)
			return getInnerPosX(mousePos);
		else
			return getInnerPosY(mousePos);
		
	}
	
	
	/**
	 * move the strip to mouse position on it
	 * mousex - mouse position relative to the document
	 */
	function moveStripToMousePosition(mousePos){		
		
		var innerPos = getInnerPos(mousePos);
		g_temp.is_strip_moving = true;
		g_temp.strip_finalPos = innerPos;
				
		startStripMovingLoop();
	}
	
}
