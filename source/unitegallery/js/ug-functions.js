

/**
 * write something to debug line
 */
function debugLine(html,addRandom, addHtml){
	
	if(html === true)
		html = "true";
	
	if(html === false)
		html = "false";		
	
	var output = html;
	
	if(typeof html == "object"){
		output = "";
		for(name in html){
			var value = html[name];
			output += " " + name + ": " + value;
		}
	}
	
	if(addRandom == true && !addHtml)
		output += " " + Math.random();	
	
	if(addHtml == true){
		var objLine = jQuery("#debug_line");
		objLine.width(200);
		
		if(objLine.height() >= 500)
			objLine.html("");
		
		var currentHtml = objLine.html();
		output = currentHtml + "<br> -------------- <br>" + output;		
	}
	
	jQuery("#debug_line").show().html(output);		
		
}

/**
 * 
 * debug side some object
 */
function debugSide(obj){
	
	var html = "";
	for(name in obj){
		var value = obj[name];
		html += name+" : " + value + "<br>";		
	}
	
	jQuery("#debug_side").show().html(html);

}


/**
 * output some string to console
 */
function trace(str){
	
	if(typeof console != "undefined")
		console.log(str);

}




/** -------------- UgFunctions class ---------------------*/

function UGFunctions(){
	
	var g_browserPrefix = null;	
	var t = this;
	var g_temp = {
		starTime:0,
		arrThemes:[],
		isTouchDevice:-1,
		isRgbaSupported: -1,
		timeCache:{},
		dataCache:{},
		lastEventType:"",		//for validate touchstart click
		lastEventTime:0,
		lastTouchStartElement:null,
		touchThreshold:700,
		handle: null			//interval handle
	};
	
	this.debugVar = "";

	this.z__________FULL_SCREEN___________ = function(){}
	
	
	
	/**
	 * move to full screen mode
	 * fullscreen ID - the ID of current fullscreen
	 */
	this.toFullscreen = function(element, fullscreenID) {
		  	  
		  if(element.requestFullscreen) {
		    element.requestFullscreen();
		  } else if(element.mozRequestFullScreen) {
		    element.mozRequestFullScreen();
		  } else if(element.webkitRequestFullscreen) {
		    element.webkitRequestFullscreen(); 
		  } else if(element.msRequestFullscreen) {
			    element.msRequestFullscreen(); 
		  } else{
			  return(false);
		  }
		  
		  return(true);
	}	
	
	
	/**
	 * exit full screen mode
	 * return if operation success (or if fullscreen mode supported)
	 */
	this.exitFullscreen = function() {
		  if(t.isFullScreen() == false)
			  return(false);
			  
		  if(document.exitFullscreen) {
		    document.exitFullscreen();

		  } else if(document.cancelFullScreen) {
			    document.cancelFullScreen();
		    
		  } else if(document.mozCancelFullScreen) {
		    document.mozCancelFullScreen();
		    
		  } else if(document.webkitExitFullscreen) {
		    document.webkitExitFullscreen();
		    
		  } else if(document.msExitFullscreen) {
			    document.msExitFullscreen();
			    
		  }else{
			  return(false);
		  }
		  
		  return(true);
	}	

	/**
	 * cross browser attach even function
	 */
	function addEvent(evnt, elem, func) {
		   if (elem.addEventListener)  // W3C DOM
		      elem.addEventListener(evnt,func,false);
		   else if (elem.attachEvent) { // IE DOM
		      elem.attachEvent("on"+evnt, func);
		   }
		   else { // No much to do
		      elem[evnt] = func;
		   }
	}
	
	
	/**
	 * add fullscreen event to some function
	 */
	this.addFullScreenChangeEvent = function(func){
		
		if(document["webkitCancelFullScreen"])
			addEvent("webkitfullscreenchange",document,func);
		else if(document["msExitFullscreen"])
			addEvent("MSFullscreenChange",document,func);
		else if(document["mozCancelFullScreen"])
			addEvent("mozfullscreenchange",document,func);
		else
			addEvent("fullscreenchange",document,func);
	}
	
	
	/**
	 * destroy the full screen change event
	 */
	this.destroyFullScreenChangeEvent = function(){
		
		jQuery(document).unbind("fullscreenChange");
		jQuery(document).unbind("mozfullscreenchange");
		jQuery(document).unbind("webkitfullscreenchange");
		jQuery(document).unbind("MSFullscreenChange");
	}
	
	
	/**
	 * get the fullscreen element
	 */
	this.getFullScreenElement = function(){
		
		var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
		
		return(fullscreenElement);
	}

	/**
	 * return if fullscreen enabled
	 */
	this.isFullScreen = function(){
		
		var isFullScreen = document.fullscreen || document.mozFullScreen || document.webkitIsFullScreen || document.msFullscreenElement;
		
		if(!isFullScreen)
			isFullScreen = false;
		else
			isFullScreen = true;
		
		return(isFullScreen);
	}
	
	
	
	this.z__________GET_PROPS___________ = function(){}
	
	/**
	 * get browser prefix, can be empty if not detected.
	 */
	this.getBrowserPrefix = function(){
		
	   if(g_browserPrefix !== null)
		   return g_browserPrefix;
				
	   var arrayOfPrefixes = ['webkit','Moz','ms','O'];
	   
	   var div = document.createElement("div");
	   
	   for(var index in arrayOfPrefixes){
		   var prefix = arrayOfPrefixes[index];
		   
		   if(prefix+"Transform" in div.style){
			   prefix = prefix.toLowerCase();
			   g_browserPrefix = prefix;
			   return(prefix);
		   }
	   }
	   
	   g_browserPrefix = "";
	   return "";
	}
	
	/**
	 * get image inside parent data by image (find parent and size)
	 * scaleMode: fit, down, fill, fitvert
	 */
	this.getImageInsideParentDataByImage = function(objImage, scaleMode, objPadding){
		
		var objParent = objImage.parent();
		
		var objOrgSize = t.getImageOriginalSize(objImage);
		
		var objData = t.getImageInsideParentData(objParent, objOrgSize.width, objOrgSize.height, scaleMode, objPadding);
		
		return(objData);
	}
	
	
	/**
	 * get data of image inside parent
	 * scaleMode: fit, down, fill, fitvert
	 */
	this.getImageInsideParentData = function(objParent, originalWidth, originalHeight, scaleMode, objPadding, maxWidth, maxHeight){
		
		if(!objPadding)
			var objPadding = {};
		
		var objOutput = {};
		
		if(typeof maxWidth === "undefined")
			var maxWidth = objParent.width();
		
		if(typeof maxHeight === "undefined")
			var maxHeight = objParent.height();
		
		if(objPadding.padding_left)
			maxWidth -= objPadding.padding_left;
		
		if(objPadding.padding_right)
			maxWidth -= objPadding.padding_right;
		
		if(objPadding.padding_top)
			maxHeight -= objPadding.padding_top;
		
		if(objPadding.padding_bottom)
			maxHeight -= objPadding.padding_bottom;
		
		var imageWidth = null;
		var imageHeight = "100%";
		var imageTop = null;
		var imageLeft = null;		
		var style = "display:block;margin:0px auto;";
		
		if(originalWidth > 0 && originalHeight > 0){
			
			//get image size and position
			
			if(scaleMode == "down" && originalWidth < maxWidth && originalHeight < maxHeight){
			
				imageHeight = originalHeight;
				imageWidth = originalWidth;
				imageLeft = (maxWidth - imageWidth) / 2;
				imageTop = (maxHeight - imageHeight) / 2;
				
			}else if(scaleMode == "fill"){
				var ratio = originalWidth / originalHeight;
				
				imageHeight = maxHeight;
				imageWidth = imageHeight * ratio;
								
				if(imageWidth < maxWidth){
					imageWidth = maxWidth;
					imageHeight = imageWidth / ratio;
					
					//center y position
					imageLeft = 0;
					imageTop = Math.round((imageHeight - maxHeight) / 2 * -1);
				}else{	//center x position
					imageTop = 0;
					imageLeft = Math.round((imageWidth - maxWidth) / 2 * -1);
				}
								
			}
			else{		//fit to borders
				var ratio = originalWidth / originalHeight;
				imageHeight = maxHeight;
				imageWidth = imageHeight * ratio;
				imageTop = 0;
				imageLeft = (maxWidth - imageWidth) / 2;
				
				if(scaleMode != "fitvert" && imageWidth > maxWidth){
					imageWidth = maxWidth;
					imageHeight = imageWidth / ratio;
					imageLeft = 0;
					imageTop = (maxHeight - imageHeight) / 2;
				}
			
			}
			
			imageWidth = Math.floor(imageWidth);
			imageHeight = Math.floor(imageHeight);
			
			imageTop = Math.floor(imageTop);
			imageLeft = Math.floor(imageLeft);
			
			style="position:absolute;";
		}
		
		//set padding
		if(objPadding.padding_top)
			imageTop += objPadding.padding_top;
		
		if(objPadding.padding_left)
			imageLeft += objPadding.padding_left;
		
		objOutput.imageWidth = imageWidth;
		objOutput.imageHeight = imageHeight;
		objOutput.imageTop = imageTop;
		objOutput.imageLeft = imageLeft;
		objOutput.imageRight = imageLeft + imageWidth;
		if(imageTop == 0 || imageHeight == "100%")
			objOutput.imageBottom = null;
		else
			objOutput.imageBottom = imageTop + imageHeight;
		
		objOutput.style = style;
		
		return(objOutput);		
	}
	
	
	/**
	 * get element center position inside parent 
	 * even if the object bigger than the parent
	 */
	this.getElementCenterPosition = function(element, objPadding){
		
		var parent = element.parent();
		var objSize = t.getElementSize(element);
		var objSizeParent = t.getElementSize(parent);
		
		var parentWidth = objSizeParent.width;
		var parentHeight = objSizeParent.height;
		
		if(objPadding && objPadding.padding_top !== undefined)
			parentHeight -= objPadding.padding_top;
		
		if(objPadding && objPadding.padding_bottom !== undefined)
			parentHeight -= objPadding.padding_bottom;
		
		if(objPadding && objPadding.padding_left !== undefined)
			parentWidth -= objPadding.padding_left;
		
		if(objPadding && objPadding.padding_right !== undefined)
			parentWidth -= objPadding.padding_right;
		
		
		var output = {};
		output.left = Math.round((parentWidth - objSize.width) / 2);
		output.top = Math.round((parentHeight - objSize.height) / 2);
		
		if(objPadding && objPadding.padding_top !== undefined)
			output.top += objPadding.padding_top;
		
		if(objPadding && objPadding.padding_left !== undefined)
			output.left += objPadding.padding_left;
		
		
		return(output);
	}
	
	
	/**
	 * get the center of the element 
	 * includeParent - including left / right related to the parent
	 */
	this.getElementCenterPoint = function(element, includeParent){
		
		if(!includeParent)
			var includeParent = false;
		
		var objSize = t.getElementSize(element);
		var output = {};
		
		output.x =  objSize.width / 2;
		output.y =  objSize.height / 2;
		
		if(includeParent == true){
			output.x += objSize.left;
			output.y += objSize.top;
		}
		
		output.x = Math.round(output.x);
		output.y = Math.round(output.y);
		
		return(output);
	}
	
	
	/**
	 * 
	 * get mouse position from the event
	 * optimised to every device
	 */
	this.getMousePosition = function(event, element){
		
		var output = {
			pageX: 	event.pageX,
			pageY: 	event.pageY,
			clientX: 	event.clientX,
			clientY: 	event.clientY
		};
		
		if(event.originalEvent && event.originalEvent.touches && event.originalEvent.touches.length > 0){
			output.pageX = event.originalEvent.touches[0].pageX;
			output.pageY = event.originalEvent.touches[0].pageY;
			output.clientX = event.originalEvent.touches[0].clientX;
			output.clientY = event.originalEvent.touches[0].clientY;
		}
		
		/**
		 * get element's mouse position
		 */
		if(element){
			var elementPos = element.offset();
			output.mouseX = output.pageX - elementPos.left;
			output.mouseY = output.pageY - elementPos.top;
		}
		
		return(output);
	}
	
	/**
	 * get mouse element related point from page related point
	 */
	this.getMouseElementPoint = function(point, element){
		
		//rename the input and output
		var newPoint = {x: point.pageX, y: point.pageY};
		
		var elementPoint = t.getElementLocalPoint(newPoint, element);
		
		return(elementPoint);
	}
	
	
	/**
	 * get element local point from global point position
	 */
	this.getElementLocalPoint = function(point, element){
		
		var elementPoint = {};
		var elementPos = element.offset();
		
		elementPoint.x = Math.round(point.x - elementPos.left);
		elementPoint.y = Math.round(point.y - elementPos.top);
		
		return(elementPoint);
	}

	
	/**
	 * get image oritinal size
	 * if originalWidth, originalHeight is set, just return them.
	 */		
	this.getImageOriginalSize = function(objImage, originalWidth, originalHeight){
		
		if(typeof originalWidth != "undefined" && typeof originalHeight != "undefined")
			return({width:originalWidth, height:originalHeight});
		
		var htmlImage = objImage[0];
		
		if(typeof htmlImage == "undefined")
			throw new Error("getImageOriginalSize error - Image not found");
		
		var output = {};
		
		if(typeof htmlImage.naturalWidth == "undefined"){

			//check from cache
			if(typeof objImage.data("naturalWidth") == "number"){
				var output = {};
				output.width = objImage.data("naturalWidth");
				output.height = objImage.data("naturalHeight");
				return(output);
			}
			
		   //load new image
		   var newImg = new Image();
	       newImg.src = htmlImage.src;
	        
	       if (newImg.complete) {
	        	output.width = newImg.width;
	        	output.height = newImg.height;

	        	//caching
				objImage.data("naturalWidth", output.width);
				objImage.data("naturalHeight", output.height);
	        	return(output);
	        	
	       }
	    
	       return({width:0,height:0});
		        
		}else{
			
			output.width = htmlImage.naturalWidth;
			output.height = htmlImage.naturalHeight;
			
			return(output);
		}
		
	}

	
	/**
	 * get current image ratio from original size
	 */
	this.getimageRatio = function(objImage){
		
		var originalSize = t.getImageOriginalSize(objImage);
		var size = t.getElementSize(objImage);
		var ratio = size.width / originalSize.width;
		
		return(ratio);
	}
	
	/**
	 * tells if the image fit the parent (smaller then the parent)
	 */
	this.isImageFitParent = function(objImage){
		var objParent = objImage.parent();
		var sizeImage = t.getElementSize(objImage);
		var sizeParent = t.getElementSize(objParent);
		
		if(sizeImage.width <= sizeParent.width && sizeImage.height <= sizeParent.height)
			return(true);
		
		return(false);
	}
	
	/**
	 * get size and position of some object
	 */
	this.getElementSize = function(element){

		if(element === undefined){
			throw new Error("Can't get size, empty element");
		}
				
		var obj = element.position();
				
		obj.height = element.outerHeight();
		obj.width = element.outerWidth();
		
		obj.left = Math.round(obj.left);
		obj.top = Math.round(obj.top);
		
		obj.right = obj.left + obj.width;
		obj.bottom = obj.top + obj.height;
		
		return(obj);		
	}
	
	
	
	/**
	 * return true if the element is bigger then it's parent
	 */
	this.isElementBiggerThenParent = function(element){
		
		var objParent = element.parent();
		var objSizeElement = t.getElementSize(element);
		var objSizeParent = t.getElementSize(objParent);
		
		if(objSizeElement.width > objSizeParent.width || objSizeElement.height > objSizeParent.height)
			return(true);
		
		return(false);
	}
	
	
	/**
	 * tells if the mouse point inside image
	 * the mouse point is related to image pos
	 */
	this.isPointInsideElement = function(point, objSize){
		
		var isMouseXInside = (point.x >= 0 && point.x < objSize.width);
		if(isMouseXInside == false)
			return(false);
		
		var isMouseYInside = (point.y >= 0 && point.y < objSize.height);
		if(isMouseYInside == false)
			return(false);
		
		return(true);
	}
	
	
	/**
	 * get element relative position according the parent
	 * if the left / top is offset text (left , center, right / top, middle , bottom)
	 * the element can be number size as well
	 */
	this.getElementRelativePos = function(element, pos, offset, objParent){
		
		if(!objParent)
			var objParent = element.parent();
		
		if(typeof element == "number"){
			var elementSize = {
					width: element,
					height: element
			};
		}else
			var elementSize = t.getElementSize(element);
		
		var parentSize = t.getElementSize(objParent);
		
		
		switch(pos){
			case "top":
			case "left":
				pos = 0;
				if(offset)
					pos += offset;
			break;
			case "center":
				pos = Math.round((parentSize.width - elementSize.width) / 2);
				if(offset)
					pos += offset;
				
			break;
			case "right":
				pos = parentSize.width - elementSize.width;
				if(offset)
					pos -= offset;
			break;
			case "middle":
				pos = Math.round((parentSize.height - elementSize.height) / 2);
				if(offset)
					pos += offset;
			break;
			case "bottom":
				pos = parentSize.height - elementSize.height;
				if(offset)
					pos -= offset;
			break;
		}
		
		return(pos);
	}
	
		
	
	this.z_________SET_ELEMENT_PROPS_______ = function(){}
		
	
	/**
	 * 
	 * zoom image inside parent
	 * the mouse point is page offset position, can be null
	 * return true if zoomed and false if not zoomed
	 */
	this.zoomImageInsideParent = function(objImage, zoomIn, step, point, scaleMode, maxZoomRatio, objPadding){
		
		if(!step)
			var step = 1.2;
		
		if(!scaleMode)
			var scaleMode = "fit";
		
		var zoomRatio = step;
		
		var objParent = objImage.parent();		
		
		var objSize = t.getElementSize(objImage);
		var objOriginalSize = t.getImageOriginalSize(objImage);
		
		
		var isMouseInside = false;
		var newHeight,newWidth, panX = 0, panY = 0, newX, newY,panOrientX = 0, panOrientY = 0;
		
		if(!point){
			isMouseInside = false;
		}else{
			var pointImg = t.getMouseElementPoint(point, objImage);				
			isMouseInside = t.isPointInsideElement(pointImg, objSize);
			
			//if mouse point outside image, set orient to image center
			panOrientX = pointImg.x;
			panOrientY = pointImg.y;
		}
				
		if(isMouseInside == false){
			var imgCenterPoint = t.getElementCenterPoint(objImage);
			panOrientX = imgCenterPoint.x;
			panOrientY = imgCenterPoint.y;
		}
						
		//zoom:
		if(zoomIn == true){		//zoom in
			
			newHeight = objSize.height * zoomRatio;
			newWidth =  objSize.width * zoomRatio;
			
			if(panOrientX != 0)
				panX = -(panOrientX * zoomRatio - panOrientX);
			
			if(panOrientY != 0)
				panY = -(panOrientY * zoomRatio - panOrientY);
			
			
		}else{		//zoom out
			
			newHeight = objSize.height / zoomRatio;
			newWidth =  objSize.width / zoomRatio;
			
			var objScaleData = t.getImageInsideParentData(objParent, objOriginalSize.width, objOriginalSize.height, scaleMode, objPadding);
			
			//go back to original size
			if(newWidth < objScaleData.imageWidth){
				
				t.scaleImageFitParent(objImage, objOriginalSize.width, objOriginalSize.height, scaleMode, objPadding);
				return(true);
			}
			
			if(isMouseInside == true){
				if(panOrientX != 0)
					panX = -(panOrientX / zoomRatio - panOrientX);
				
				if(panOrientY != 0)			
					panY = -(panOrientY / zoomRatio - panOrientY);
			}
			
		}
		
		//check max zoom ratio, ix exeeded, abort
		if(maxZoomRatio){
			var expectedZoomRatio = 1;
			if(objOriginalSize.width != 0)
				expectedZoomRatio = newWidth / objOriginalSize.width;
			
			if(expectedZoomRatio > maxZoomRatio)
				return(false);
		}
		
		//resize the element
		t.setElementSize(objImage, newWidth, newHeight);
		
		//set position:
		
		//if zoom out and mouse point not inside image, 
		//get the image to center
		if(zoomIn == false && isMouseInside == false){
			var posCenter = t.getElementCenterPosition(objImage);
			newX = posCenter.left;
			newY = posCenter.top;
		}else{
			
			newX = objSize.left + panX;
			newY = objSize.top + panY;
		}
		
		t.placeElement(objImage, newX, newY);
		
		return(true);
	}
	

	
	/**
	 * place some element to some position
	 * if the left / top is offset text (left , center, right / top, middle , bottom)
	 * then put it in parent by the offset.
	 */
	this.placeElement = function(element, left, top, offsetLeft, offsetTop, objParent){
		
		
		if(jQuery.isNumeric(left) == false || jQuery.isNumeric(top) == false){
			
			if(!objParent)
				var objParent = element.parent();
			
			var elementSize = t.getElementSize(element);
			var parentSize = t.getElementSize(objParent);
		}
		
		//select left position
		if(jQuery.isNumeric(left) == false){
			
			switch(left){
				case "left":
					left = 0;
					if(offsetLeft)
						left += offsetLeft;
				break;
				case "center":
					left = Math.round((parentSize.width - elementSize.width) / 2);
					if(offsetLeft)
						left += offsetLeft;
				break;
				case "right":
					left = parentSize.width - elementSize.width;
					if(offsetLeft)
						left -= offsetLeft;
				break;
			}
		}
		
		//select top position
		if(jQuery.isNumeric(top) == false){
			
			switch(top){
				case "top":
					top = 0;
					if(offsetTop)
						top += offsetTop;
				break;
				case "middle":
				case "center":
					top = Math.round((parentSize.height - elementSize.height) / 2);
					if(offsetTop)
						top += offsetTop;
				break;
				case "bottom":
					top = parentSize.height - elementSize.height;
					if(offsetTop)
						top -= offsetTop;
				break;
			}
			
		}
		
		
		var objCss = {
				"position":"absolute",
				"margin":"0px"				
		};
		
		if(left !== null)
			objCss.left = left;
		
		if(top !== null)
			objCss.top = top;
				
		element.css(objCss);		
	}
	
	
	/**
	 * place element inside parent center.
	 * the element should be absolute position
	 */
	this.placeElementInParentCenter = function(element){
				
		t.placeElement(element, "center", "middle");
	}
	
	
	/**
	 * set element size and position
	 */
	this.setElementSizeAndPosition = function(element,left,top,width,height){
		
		var objCss = {
			"width":width+"px",
			"height":height+"px",
			"left":left+"px",
			"top":top+"px",
			"position":"absolute",
			"margin":"0px"
		}
		
		element.css(objCss);
	}
	
	/**
	 * set widht and height of the element
	 */
	this.setElementSize = function(element, width, height){
		
	    var objCss = {
			"width":width+"px"
		}
	    
	    if(height !== null && typeof height != "undefined")
	    	objCss["height"] = height+"px"
	    
		element.css(objCss);	
	}
	
	
	/**
	 * clone element size and position
	 */
	this.cloneElementSizeAndPos = function(objSource, objTarget, isOuter, offsetX, offsetY){
		
		var objSize = objSource.position();
		
		if(objSize == undefined){
			throw new Error("Can't get size, empty element");
		}
		
		if(isOuter === true){
			objSize.height = objSource.outerHeight();
			objSize.width = objSource.outerWidth();
		}else{
			objSize.height = objSource.height();
			objSize.width = objSource.width();
		}
		
		objSize.left = Math.round(objSize.left);
		objSize.top = Math.round(objSize.top);
		
		if(offsetX)
			objSize.left += offsetX;
		
		if(offsetY)
			objSize.top += offsetY;
		
		t.setElementSizeAndPosition(objTarget, objSize.left, objSize.top, objSize.width, objSize.height);
	}

	
	/**
	 * place image inside parent, scale it by the options
	 * and scale it to fit the parent.
	 * scaleMode: fit, down, fill
	 */
	this.placeImageInsideParent = function(urlImage, objParent, originalWidth, originalHeight, scaleMode, objPadding){
		var obj = t.getImageInsideParentData(objParent, originalWidth, originalHeight, scaleMode, objPadding);
		
		//set html image:
		var htmlImage = "<img";
		
		if(obj.imageWidth !== null){
			htmlImage += " width = '" + obj.imageWidth + "'";
			obj.style += "width:" + obj.imageWidth + ";";
		}
		
		if(obj.imageHeight != null){
			
			if(obj.imageHeight == "100%"){
				htmlImage += " height = '" + obj.imageHeight+"'";
				obj.style += "height:" + obj.imageHeight+";";				
			}else{
				htmlImage += " height = '" + obj.imageHeight + "'";
				obj.style += "height:" + obj.imageHeight + "px;";				
			}
			
		}
		
		if(obj.imageTop !== null)
			obj.style += "top:"+obj.imageTop+"px;";
		
		if(obj.imageLeft !== null){
			obj.style += "left:"+obj.imageLeft+"px;";
		}
		
		urlImage = t.escapeDoubleSlash(urlImage);
		
		htmlImage += " style='"+obj.style+"'";
		htmlImage += " src=\""+urlImage+"\"";
		htmlImage += ">";
				
		objParent.html(htmlImage);
		
		//return the image just created
		var objImage = objParent.children("img");
		
		return(objImage);
	}
	
	
	/**
	 * scale image to fit parent, and place it into parent
	 * parent can be width , height, or object
	 */	
	this.scaleImageCoverParent = function(objImage, objParent, pHeight){
		
		if(typeof objParent == "number"){
			var parentWidth = objParent;
			var parentHeight = pHeight;
		}else{
			var parentWidth = objParent.outerWidth();
			var parentHeight = objParent.outerHeight();
		}
		
		var objOriginalSize = t.getImageOriginalSize(objImage);

		var imageWidth = objOriginalSize.width;
		var imageHeight = objOriginalSize.height;
		
		var ratio = imageWidth / imageHeight;
		
		var fitHeight = parentHeight;
		var fitWidth = fitHeight * ratio;
		var posy = 0, posx = 0;
		
		if(fitWidth < parentWidth){
			fitWidth = parentWidth;
			fitHeight = fitWidth / ratio;
			
			//center y position
			posx = 0;
			posy = Math.round((fitHeight - parentHeight) / 2 * -1);
		}else{	//center x position
			posy = 0;
			posx = Math.round((fitWidth - parentWidth) / 2 * -1);
		}
		
		fitWidth = Math.round(fitWidth);
		fitHeight = Math.round(fitHeight);
		
		objImage.css({"width":fitWidth+"px",
					  "height":fitHeight+"px",
					  "left":posx+"px",
					  "top":posy+"px"});		
	}


	
	
	/**
	 * resize image to fit the parent, scale it by the options
	 * scaleMode: fit, down, fill
	 */
	this.scaleImageFitParent = function(objImage, originalWidth, originalHeight, scaleMode, objPadding){
		
		var objParent = objImage.parent();
		
		var obj = t.getImageInsideParentData(objParent, originalWidth, originalHeight, scaleMode, objPadding);
		
		var updateCss = false;
		
		var objCss = {};
		
		if(obj.imageWidth !== null){
			updateCss = true
			objImage.removeAttr("width");
			objCss["width"] = obj.imageWidth+"px";
		}
		
		if(obj.imageHeight != null){
			updateCss = true
			objImage.removeAttr("height");
			objCss["height"] = obj.imageHeight+"px";
		}
		
		if(obj.imageTop !== null){
			updateCss = true;			
			objCss.top = obj.imageTop+"px";
		}
		
		if(obj.imageLeft !== null){
			updateCss = true;		
			objCss.left = obj.imageLeft+"px";
		}
			
		if(updateCss == true){
			
			objCss.position = "absolute";
			objCss.margin = "0px 0px";
			
			objImage.css(objCss);			
		}
		
		
		return(obj);
	}
	
	
	/**
	 * scale image by height
	 */
	this.scaleImageByHeight = function(objImage, height, originalWidth, originalHeight){
		
		var objOriginalSize = t.getImageOriginalSize(objImage, originalWidth, originalHeight);
		
		var ratio = objOriginalSize.width / objOriginalSize.height;
		var width = Math.round(height * ratio);
		height = Math.round(height);
		
		t.setElementSize(objImage, width, height);
	}

	
	/**
	 * scale image by height
	 */
	this.scaleImageByWidth = function(objImage, width, originalWidth, originalHeight){
		
		var objOriginalSize = t.getImageOriginalSize(objImage, originalWidth, originalHeight);
		
		var ratio = objOriginalSize.width / objOriginalSize.height;
		
		var height = Math.round(width / ratio);
		width = Math.round(width);
		
		t.setElementSize(objImage, width, height);
		
	}
	
	
	/**
	 * scale image to exact size in parent, by setting image size and padding
	 */
	this.scaleImageExactSizeInParent = function(objImage, originalWidth, originalHeight, exactWidth, exactHeight, scaleMode){
		
		var objParent = objImage.parent();
		var parentSize = t.getElementSize(objParent);
		
		if(parentSize.width < exactWidth)
			exactWidth = parentSize.width;
		
		if(parentSize.height < exactHeight)
			exactHeight = parentSize.height;
		
		var obj = t.getImageInsideParentData(null, originalWidth, originalHeight, scaleMode, null, exactWidth, exactHeight);
		
		var imageWidth = exactWidth;
		var imageHeight = exactHeight;
		
		var paddingLeft = obj.imageLeft;
		var paddingRight = obj.imageLeft;
		var paddingTop = obj.imageTop;
		var paddingBottom = obj.imageTop;
		var imageLeft = Math.round((parentSize.width - exactWidth) / 2);
		var imageTop = Math.round((parentSize.height - exactHeight) / 2);
		
		var totalWidth = obj.imageWidth + paddingLeft + paddingRight;
		var diff = exactWidth - totalWidth;
		if(diff != 0)
			paddingRight += diff;
		
		var totalHeight = obj.imageHeight + paddingTop + paddingBottom;
		
		var diff = exactHeight - totalHeight;
		if(diff != 0)
			paddingBottom += diff;
		
		//update css:
		objImage.removeAttr("width");
		objImage.removeAttr("height");

		var objCss = {
				position: "absolute",
				margin: "0px 0px"
		};
		
		objCss["width"] = imageWidth+"px";
		objCss["height"] = imageHeight+"px";
		objCss["left"] = imageLeft+"px";
		objCss["top"] = imageTop+"px";
		objCss["padding-left"] = paddingLeft+"px";
		objCss["padding-top"] = paddingTop+"px";
		objCss["padding-right"] = paddingRight+"px";
		objCss["padding-bottom"] = paddingBottom+"px";
				
		objImage.css(objCss);
		
		//return size object
		
		var objReturn = {};
		objReturn["imageWidth"] = imageWidth;
		objReturn["imageHeight"] = imageHeight;
		return(objReturn);
	}
	
	
	/**
	 * show some element and make opacity:1
	 */
	this.showElement = function(element, element2, element3){
		
		element.show().fadeTo(0,1);
		
		if(element2)
			element2.show().fadeTo(0,1);
			
		if(element3)
				element3.show().fadeTo(0,1);
			
	}
	
		
	this.z_________GALLERY_RELATED_FUNCTIONS_______ = function(){}
	
	/**
	 * disable button
	 */
	this.disableButton = function(objButton, className){
		if(!className)
			var className = "ug-button-disabled";
		
		if(t.isButtonDisabled(objButton, className) == false)		
			objButton.addClass(className);		
	}

	
	/**
	 * convert custom prefix options
	 * prefix - the prefix.
	 * base - after the prefix text. example lightbox_slider_option (lightbox - prefix, slider - base)
	 */
	this.convertCustomPrefixOptions = function(objOptions, prefix, base){
			
		if(!prefix)
			return(objOptions);
		
		var modifiedOptions = {};
		
		jQuery.each(objOptions, function(key, option){
			
			if(key.indexOf(prefix + "_"+base+"_") === 0){
				var newKey = key.replace(prefix+"_"+base+"_", base+"_");
				modifiedOptions[newKey] = option;
			}else{
				modifiedOptions[key] = option;
			}
			
		});
		
		return(modifiedOptions);
	}
	
	
	/**
	 * enable button
	 */
	this.enableButton = function(objButton, className){
		if(!className)
			var className = "ug-button-disabled";
		
		if(t.isButtonDisabled(objButton, className) == true)		
			objButton.removeClass(className);
	}
	
	
	/**
	 * check if some buggon disabled
	 */
	this.isButtonDisabled = function(objButton, className){
		if(!className)
			var className = "ug-button-disabled";
		
		if(objButton.hasClass(className))
			return(true);
		
		return(false);
	}
	
	

	this.z_________MATH_FUNCTIONS_______ = function(){}
	
	/**
	 * 
	 * normalize the value for readable "human" setting value.
	 */
	this.normalizeSetting = function(realMin, realMax, settingMin, settingMax, value, fixBounds){
		if(!fixBounds)
			var fixBounds = false;
		
		var ratio = (value - settingMin)  / (settingMax - settingMin);
		value = realMin + (realMax - realMin) * ratio;
		
		if(fixBounds == true){
			if(value < realMin)
				value = realMin;
			
			if(value > realMax)
				value = realMax;
		}
		
		return(value);
	}

	
	/**
	 * 
	 * get "real" setting from normalized setting
	 */
	this.getNormalizedValue = function(realMin, realMax, settingMin, settingMax, realValue){
		
		var ratio = (realValue - realMin)  / (realMax - realMin);
		realValue = realMin + (settingMax - settingMin) * ratio;
		
		return(realValue);
	}
	
	
	/**
	 * get distance between 2 points
	 */
	this.getDistance = function(x1,y1,x2,y2) {
		
		var distance = Math.round(Math.sqrt(Math.abs(((x2-x1)*(x2-x1)) + ((y2-y1)*(y2-y1)))));
		
		return distance;
	}
	
	
	/**
	 * get center point of the 2 points
	 */
	this.getMiddlePoint = function(x1,y1,x2,y2){
		var output = {}
		output.x = x1 + Math.round((x2 - x1) / 2);
		output.y = y1 + Math.round((y2 - y1) / 2);
		
		return(output);
	}
	
	
	/**
	 * get number of items in space width gap
	 * even item sizes
	 * by lowest
	 */
	this.getNumItemsInSpace = function(spaceSize, itemsSize, gapSize){
		var numItems = Math.floor((spaceSize + gapSize) / (itemsSize + gapSize));
		return(numItems);
	}

	/**
	 * get number of items in space width gap
	 * even item sizes
	 * by Math.round
	 */
	this.getNumItemsInSpaceRound = function(spaceSize, itemsSize, gapSize){
		var numItems = Math.round((spaceSize + gapSize) / (itemsSize + gapSize));
		return(numItems);
	}

	/**
	 * get space (width in carousel for example) by num items, item size, and gap size
	 */
	this.getSpaceByNumItems = function(numItems, itemSize, gapSize){
		var space = numItems * itemSize + (numItems-1) * gapSize;
		return(space);
	}
	

	/**
	 * get item size by space and gap
	 */
	this.getItemSizeInSpace = function(spaceSize, numItems, gapSize){
		var itemSize = Math.floor((spaceSize - (numItems-1) * gapSize) / numItems);
		
		return(itemSize);
	}
	
	
	/**
	 * get column x pos with even column sizes, start from 0
	 */
	this.getColX = function(col, colWidth, colGap){
		
		var posx = col * (colWidth + colGap);
		
		return posx;
	}
	

	/**
	 * get column number by index
	 */
	this.getColByIndex = function(numCols, index){
		var col = index % numCols;
		return(col);
	}
	
	
	/**
	 * get col and row by index
	 */
	this.getColRowByIndex = function(index, numCols){
		
		var row = Math.floor(index / numCols);
		var col = Math.floor(index % numCols);
		
		return({col:col,row:row});
	}
	
	
	/**
	 * get index by row, col, numcols
	 */
	this.getIndexByRowCol = function(row, col, numCols){
		
		if(row < 0)
			return(-1);
		
		if(col < 0)
			return(-1);
		
		var index = row * numCols + col;
		return(index);
	}
	
	/**
	 * get previous row item in the same column
	 */
	this.getPrevRowSameColIndex = function(index, numCols){
		var obj = t.getColRowByIndex(index, numCols);
		var prevIndex = t.getIndexByRowCol(obj.row-1, obj.col, numCols);
		return(prevIndex);
	}
	
	/**
	 * get next row item in the same column
	 */
	this.getNextRowSameColIndex = function(index, numCols){
		var obj = t.getColRowByIndex(index, numCols);
		var nextIndex = t.getIndexByRowCol(obj.row+1, obj.col, numCols);
		return(nextIndex);
	}
	
	
	this.z_________DATA_FUNCTIONS_______ = function(){}
	
	/**
	 * set data value
	 */
	this.setGlobalData = function(key, value){
		
		jQuery.data(document.body, key, value);
		
	}
	
	/**
	 * get global data
	 */
	this.getGlobalData = function(key){
		
		var value = jQuery.data(document.body, key);
		
		return(value);
	}
	
	this.z_________EVENT_DATA_FUNCTIONS_______ = function(){}

	
	/**
	 * handle scroll top, return if scroll mode or not
	 */
	this.handleScrollTop = function(storedEventID){
		
		if(t.isTouchDevice() == false)
			return(null);
		
		var objData = t.getStoredEventData(storedEventID);
		
		var horPass = 15;
		var vertPass = 15;
		
		//check if need to set some movement
		if(objData.scrollDir === null){
			
			if(Math.abs(objData.diffMouseX) > horPass)
				objData.scrollDir = "hor";
			else
				if(Math.abs(objData.diffMouseY) > vertPass && Math.abs(objData.diffMouseY) > Math.abs(objData.diffMouseX) ){
					objData.scrollDir = "vert";
					objData.scrollStartY = objData.lastMouseClientY;
					objData.scrollOrigin = jQuery(document).scrollTop();
					
					g_temp.dataCache[storedEventID].scrollStartY = objData.lastMouseClientY;
					g_temp.dataCache[storedEventID].scrollOrigin = objData.scrollOrigin;
				}
			
			//update scrollDir
			g_temp.dataCache[storedEventID].scrollDir = objData.scrollDir;
		}
				
		if(objData.scrollDir !== "vert")
			return(objData.scrollDir);
		
		
		var currentScroll = jQuery(document).scrollTop();
		
		var scrollPos = objData.scrollOrigin - (objData.lastMouseClientY - objData.scrollStartY);
		
		if(scrollPos >= 0)
			jQuery(document).scrollTop(scrollPos);
		
		return(objData.scrollDir);
	}

	
	/**
	 * return true / false if was vertical scrolling
	 */
	this.wasVerticalScroll = function(storedEventID){
		var objData = t.getStoredEventData(storedEventID);
		
		if(objData.scrollDir === "vert")
			return(true);
		
		return(false);
	}
	
	
	/**
	 * store event data
	 */
	this.storeEventData = function(event, id, addData){
				
		var mousePos = t.getMousePosition(event);
		var time = jQuery.now();
		
		var obj = {
				startTime: time,
				lastTime: time,
				startMouseX: mousePos.pageX,
				startMouseY: mousePos.pageY,
				lastMouseX: mousePos.pageX,
				lastMouseY: mousePos.pageY,
				
				startMouseClientY: mousePos.clientY,
				lastMouseClientY: mousePos.clientY,
				
				scrollTop: jQuery(document).scrollTop(),
				scrollDir: null
		};
		
		if(addData)
			obj = jQuery.extend(obj, addData);
		
		g_temp.dataCache[id] = obj;
		
	}
	
	
	/**
	 * update event data with last position
	 */
	this.updateStoredEventData = function(event, id, addData){
		
		if(!g_temp.dataCache[id])
			throw new Error("updateEventData error: must have stored cache object");
		
		var obj = g_temp.dataCache[id];
		
		var mousePos = t.getMousePosition(event);
		obj.lastTime = jQuery.now();
		
		if(mousePos.pageX !== undefined){
			obj.lastMouseX = mousePos.pageX;
			obj.lastMouseY = mousePos.pageY;
			obj.lastMouseClientY = mousePos.clientY;
		}
		
		if(addData)
			obj = jQuery.extend(obj, addData);
		
		g_temp.dataCache[id] = obj;
	}
	
	/**
	 * get stored event data
	 */
	this.getStoredEventData = function(id, isVertical){
		if(!g_temp.dataCache[id])
			throw new Error("updateEventData error: must have stored cache object");
		
		var obj = g_temp.dataCache[id];
		
		obj.diffMouseX = obj.lastMouseX - obj.startMouseX;
		obj.diffMouseY = obj.lastMouseY - obj.startMouseY;
		
		obj.diffMouseClientY = obj.lastMouseClientY - obj.startMouseClientY;
		
		obj.diffTime = obj.lastTime - obj.startTime;
		
		//get mouse position according orientation
		if(isVertical === true){
			obj.startMousePos = obj.lastMouseY;
			obj.lastMousePos = obj.lastMouseY;
			obj.diffMousePos = obj.diffMouseY;
		}else{
			obj.startMousePos = obj.lastMouseX;
			obj.lastMousePos = obj.lastMouseX;
			obj.diffMousePos = obj.diffMouseX;			
		}
		
		return(obj);
	}
	
	/**
	 * return if click event approved according the done motion
	 */
	this.isApproveStoredEventClick = function(id, isVertical){
		
		if(!g_temp.dataCache[id])
			return(true);
		
		var objData = t.getStoredEventData(id, isVertical);
		
		var passedDistanceAbs = Math.abs(objData.diffMousePos);
		
		if(objData.diffTime > 400)
			return(false);
		
		if(passedDistanceAbs > 30)
			return(false);
		
		return(true);
		
	}
	
	
	/**
	 * clear stored event data
	 */
	this.clearStoredEventData = function(id){
		g_temp.dataCache[id] = null;
	}

	this.z_________CHECK_SUPPORT_FUNCTIONS_______ = function(){}
	
	
	
	/**
	 * is canvas exists in the browser
	 */
	this.isCanvasExists = function(){
		
		var canvas = jQuery('<canvas width="500" height="500" > </canvas>')[0];
		
		if(typeof canvas.getContext == "function")
			return(true);
		
		return(false);
	}
	
	/**
	 * tells if vertical scrollbar exists
	 */
	this.isScrollbarExists = function(){
		var hasScrollbar = window.innerWidth > document.documentElement.clientWidth;
		return(hasScrollbar);
	}
	
	/**
	 * check if this device are touch enabled
	 */
	this.isTouchDevice = function(){
		
		  //get from cache
		  if(g_temp.isTouchDevice !== -1)
			  return(g_temp.isTouchDevice);
		  
		  try{ 
			  document.createEvent("TouchEvent"); 
			  g_temp.isTouchDevice = true; 
		  }
		  catch(e){ 
			  g_temp.isTouchDevice = false; 
		  }
		  
		  return(g_temp.isTouchDevice);
	}
	
	
	
	/**
	 * check if 
	 */
	this.isRgbaSupported = function(){
		
		if(g_temp.isRgbaSupported !== -1)
			return(g_temp.isRgbaSupported);
		
		var scriptElement = document.getElementsByTagName('script')[0];
		var prevColor = scriptElement.style.color;
		try {
			scriptElement.style.color = 'rgba(1,5,13,0.44)';
		} catch(e) {}
		var result = scriptElement.style.color != prevColor;
		scriptElement.style.color = prevColor;
		
		g_temp.isRgbaSupported = result;
		
		return result;
	}
	
	this.z_________GENERAL_FUNCTIONS_______ = function(){}
	
	
	/**
	 * check if current jquery version is more then minimal version
	 * version can be "1.8.0" for example
	 */
	this.checkMinJqueryVersion = function(version){

	   var arrCurrent = jQuery.fn.jquery.split('.');
       var arrMin = version.split('.');
	  
	  for (var i=0, len=arrCurrent.length; i<len; i++) {
		  
		  var numCurrent = parseInt(arrCurrent[i]);
	      var numMin = parseInt(arrMin[i]);

	      if(typeof arrMin[i] == "undefined")
	    	  return(true);
	      
	      if(numMin > numCurrent)
	    	  return(false);
	      
	      if(numCurrent > numMin)
	    	  return(true);
	  }
	  
	  
	  //if all equal then all ok
	  return true;
	}

	
	/**
	 * get css size parameter, like width. if % given, leave it, if number without px - add px.
	 */
	this.getCssSizeParam = function(sizeParam){
		if(jQuery.isNumeric(sizeParam))
			return(sizeParam + "px");
			
		return(sizeParam);
	}
	
	/**
	 * convert hex color to rgb color
	 */
	this.convertHexToRGB = function(hexInput, opacity){
	    
		var hex = hexInput.replace('#','');
	    if(hex === hexInput)
	    	return(hexInput);
	    
	    r = parseInt(hex.substring(0,2), 16);
	    g = parseInt(hex.substring(2,4), 16);
	    b = parseInt(hex.substring(4,6), 16);
	    result = 'rgba('+r+','+g+','+b+','+opacity+')';
	    return result;
	}	
	
	/**
	 * get timestamp to string
	 */
	this.timestampToString = function(stamp){
		
		var d = new Date(stamp);
		var str = d.getDate() + "/" + d.getMonth();
		str += " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds();
		
		return(str);
	}
	
	/**
	 * get touches array (if exists) from the event
	 */
	this.getArrTouches = function(event){
		
		var arrTouches = [];
				
		if(event.originalEvent && event.originalEvent.touches && event.originalEvent.touches.length > 0){			
			arrTouches = event.originalEvent.touches;
		}
		
		return(arrTouches);
	}
	
	/**
	 * extract touch positions from arrTouches
	 */
	this.getArrTouchPositions = function(arrTouches){
		
		var arrOutput = [];
		
		for(var i=0;i<arrTouches.length;i++){
			
			var point = {
				pageX:arrTouches[i].pageX,
				pageY:arrTouches[i].pageY
			};
			
			arrOutput.push(point);
		}
		
		return(arrOutput);
	}
	
	
	/**
	 * start time debug
	 */
	this.startTimeDebug = function(){
		g_temp.starTime = jQuery.now();
	}
	
	/**
	 * show time debug
	 */
	this.showTimeDebug = function(){
		
		var endTime = jQuery.now();
		var diffTime = endTime - g_temp.starTime;
		
		debugLine({"Time Passed": diffTime},true);
	}
	
		
	/**
	 * put progress indicator to some parent by type
	 * return the progress indicator object
	 */
	this.initProgressIndicator = function(type, options, objParent){
		
		//check canvas compatability
		if(type != "bar" && t.isCanvasExists() == false)
			type = "bar";
		
		//put the progress indicator
		switch(type){
			case "bar":
				var g_objProgress = new UGProgressBar();		
				g_objProgress.putHidden(objParent, options);
			break;
			default:
			case "pie":
				var g_objProgress = new UGProgressPie();		
				g_objProgress.putHidden(objParent, options);
			break;			
			case "pie2":
				options.type_fill = true;
				
				var g_objProgress = new UGProgressPie();				
				g_objProgress.putHidden(objParent, options);
			break;			
		}
		
		return(g_objProgress);
	}
	
	
	/**
	 * add to button ug-nohover class on ipad
	 * need to be processed in css
	 */
	this.setButtonMobileReady = function(objButton){
		
		objButton.on("touchstart",function(event){
			//event.preventDefault();
			jQuery(this).addClass("ug-nohover");
		});
		
		objButton.on("mousedown touchend",function(event){
			
			//debugLine("button touchend",true,true);
			//event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
			
			//debugLine(event.type, true, true);
			
			return(false);
		});
		
	}
	
	
	/**
	 * register gallery theme
	 */
	this.registerTheme = function(themeName){
		
		g_temp.arrThemes.push(themeName);
	}
	
	/**
	 * get themes array
	 */
	this.getArrThemes = function(){
		
		return(g_temp.arrThemes);
	}
	
	
	/**
	 * check if theme exists
	 */
	this.isThemeRegistered = function(theme){
	
		if(jQuery.inArray(theme, g_temp.arrThemes) !== -1)
			return(true);
		
		return(false);
	}
	
	/**
	 * get first registered theme name
	 */
	this.getFirstRegisteredTheme = function(){
		if(g_temp.arrThemes.length == 0)
			return("");
		var themeName = g_temp.arrThemes[0];
		
		return(themeName);
	}

	
	
	
	/**
	 * function checks if enought time passsed between function calls.
	 * good for filtering same time events
	 */
	this.isTimePassed = function(handlerName, timeLimit){
		
		if(!timeLimit)
			var timeLimit = 100;
		
		var currentTime = jQuery.now();
		if(g_temp.timeCache.hasOwnProperty(handlerName) == false)
			lastTime = 0;
		else
			lastTime = g_temp.timeCache[handlerName];
		
		var diffTime = currentTime - lastTime;
		
		g_temp.timeCache[handlerName] = currentTime;
		
		//debugLine(diffTime,true,true);
		
		if(diffTime <= timeLimit)
			return(false);
				
		return(true);
	}
	
	
	/**
	 * check if continious event is over like resize
	 */
	this.whenContiniousEventOver = function(handlerName, onEventOver, timeLimit){
		
		if(!timeLimit)
			var timeLimit = 300;
		
		
		if(g_temp.timeCache.hasOwnProperty(handlerName) == true && g_temp.timeCache[handlerName] != null){
			clearTimeout(g_temp.timeCache[handlerName]);
			g_temp.timeCache[handlerName] = null;			
		}
		
		g_temp.timeCache[handlerName] = setTimeout(onEventOver, timeLimit);
	}
	
	
	/**
	 * validate click and touchstart events. 
	 * if click comes after touchstart, return false.
	 */
	this.validateClickTouchstartEvent = function(eventType){
		
		var returnVal = true;
		
		var diff = jQuery.now() - g_temp.lastEventTime;
		
		//debugLine({lastType:g_temp.lastEventType, diff:diff},true, true);
		
		if(eventType == "click" && g_temp.lastEventType == "touchstart" && diff < 1000)
			returnVal = false;
		
		g_temp.lastEventTime = jQuery.now();
		g_temp.lastEventType = eventType;
		
		return(returnVal);
	}
	
	/**
	 * add some class on hover (hover event)
	 */
	this.addClassOnHover = function(element,className){
		if(!className)
			var className = "ug-button-hover";
		
		element.hover(function(){
			jQuery(this).addClass(className);
		},function(){				
			jQuery(this).removeClass(className);
		});
		
	}
	
	/**
	 * destroy hover effect on elements
	 */
	this.destroyButton = function(element){
		element.off("mouseenter");
		element.off("mouseleave");
		element.off("click");
		element.off("touchstart");
		element.off("touchend");
		element.off("mousedown");
		element.off("tap");
	}
	
	/**
	 * set button on click event, advanced
	 */
	this.setButtonOnClick = function(objButton, onClickFunction){
		
		t.setButtonMobileReady(objButton);
		
		objButton.on("click touchstart", function(event){
			
			objThis = jQuery(this);
						
			event.stopPropagation();
			event.stopImmediatePropagation();
			
			if(t.validateClickTouchstartEvent(event.type) == false)
				return(true);
			
			onClickFunction(objThis, event);
		});
		
	}
	
	
	/**
	 * set button on tap
	 */
	this.setButtonOnTap = function(objButton, onClickFunction){
		
		//set the event
		objButton.on("tap",onClickFunction);
		
		//set tap event trigger
		if(t.isTouchDevice() == false){
			
			objButton.on("click", function(event){
				var objElement = jQuery(this);
				
				if(t.validateClickTouchstartEvent(event.type) == false)
					return(true);
				
				objElement.trigger("tap");
			});
			
		}else{
			
			//set tap event
			objButton.on("touchstart",function(event){
				
				var objElement = jQuery(this);
				
				objElement.addClass("ug-nohover");
							
				g_temp.lastTouchStartElement = jQuery(this);
				g_temp.lastEventTime = jQuery.now();
			});
			
			objButton.on("touchend", function(event){
				var objElement = jQuery(this);
				
				//validate same element
				if(objElement.is(g_temp.lastTouchStartElement) == false)
					return(true);
				
				//validate time passed
				if(!g_temp.lastEventTime)
					return(true);
				
				var timePassed = jQuery.now() - g_temp.lastEventTime;
				if(timePassed > g_temp.touchThreshold)
					return(true);
				
				objElement.trigger("tap");
			});
			
		}
		
		
	}
	
	
	/**
	 * load javascript dynamically
	 */
	this.loadJs = function(url, addProtocol){
		
		if(addProtocol === true)
			url = location.protocol + "//" + url;
		
		var tag = document.createElement('script');
		tag.src = url;
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);		
	}
	
	/**
	 * load css dymanically
	 */
	this.loadCss = function(url, addProtocol){
		if(addProtocol === true)
			url = location.protocol + "//" + url;
		
		var tag=document.createElement("link");
		  tag.setAttribute("rel", "stylesheet");
		  tag.setAttribute("type", "text/css");
		  tag.setAttribute("href", url);
		  
		document.getElementsByTagName("head")[0].appendChild(tag);
	}
	
	/**
	 * add event listener with old browsers fallback
	 */
	 this.addEvent = function(elem, event, func ) {
		 
		 if (typeof (elem.addEventListener) != "undefined") {
			 elem.addEventListener(event, func, false);
		    } else if (elem.attachEvent) {
		    	elem.attachEvent('on' + event, func);
		  }
		 
	  }




	/**
	 * fire event where all images are loaded
	 */
	this.checkImagesLoaded = function(objImages, onComplete, onProgress){
		
		var arrImages = [];
		var counter = 0;
		var numImages = objImages.length;
		
		//if no images - exit
		if(numImages == 0 && onComplete){
			onComplete();
			return(false);
		}
		
		//nested function
		function checkComplete(image, isError){
			counter++;
						
			if(typeof onProgress == "function"){
				
				setTimeout(function(){
					onProgress(image, isError);
				});
			}
			
			if(counter == numImages && typeof onComplete == "function"){
				setTimeout(function(){
					onComplete();
				});
			}
			
		}


		//start a little later
		setTimeout(function(){
			
			//start the function
			for(var index=0;index < numImages; index++){
				var image = objImages[index];
				
				//arrImages.push(jQuery(image));
				if(image.naturalWidth !== undefined && image.naturalWidth !== 0){
					checkComplete(objImages[index], false);
				}
				else{
					var proxyImage = jQuery('<img/>');
					proxyImage.data("index", index);
					
					proxyImage.on("load", function(){
						var index = jQuery(this).data("index");
						checkComplete(objImages[index], false);
					});
					proxyImage.on("error", function(){
						var index = jQuery(this).data("index");
						checkComplete(objImages[index], true);
					});
					proxyImage.attr("src", image.src);			
				}
			}
			
		});
		
		
	}
	
	
	/**
	 * run the function when the element size will be not 0
	 */
	this.waitForWidth = function(element, func){
		var width = element.width();
		if(width != 0){
			func();
			return(false);
		}

		g_temp.handle = setInterval(function(){
			width = element.width();
			if(width != 0){
				clearInterval(g_temp.handle);
				func();				
			}

		}, 300);
		
	}
	
	/**
	 * shuffle (randomise) array
	 */
	this.arrayShuffle = function(arr){
		
		if(typeof arr != "object")
			return(arr);
			
	    for(var j, x, i = arr.length; i; j = parseInt(Math.random() * i), x = arr[--i], arr[i] = arr[j], arr[j] = x);
	    return arr;
	}

	
	/**
	 * get object length
	 */
	this.getObjectLength = function(object){
		var num = 0;
		for(var item in object)
			num++;
		return num;
	}

	/**
	 * normalize the percent, return always between 0 and 1
	 */
	this.normalizePercent = function(percent){
		
		if(percent < 0)
			percent = 0;
		
		if(percent > 1)
			percent = 1;
		
		return(percent);
	}
	
	
	/**
	 * strip tags from string
	 */
	this.stripTags = function(html){
		
		var text = html.replace(/(<([^>]+)>)/ig,"");
		
		return(text);
	}
	
	
	/**
	 * escape double slash
	 */
	this.escapeDoubleSlash = function(str){
		
		return str.replace('"','\"');
	}
	
	
	/**
	 * html entitles
	 */
	this.htmlentitles = function(html){
		var text = jQuery('<div/>').text(html).html();
		return(text);
	}
	
	
	this.z_________END_GENERAL_FUNCTIONS_______ = function(){}
	
}



var g_ugFunctions = new UGFunctions();


/** -------------- END UgFunctions class ---------------------*/

