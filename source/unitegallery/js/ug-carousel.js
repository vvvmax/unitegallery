/**
 * carousel class
 */
function UGCarousel(){

	var t = this, g_objThis = jQuery(this);
	var g_gallery = new UniteGalleryMain(), g_objGallery, g_objWrapper;	
	var g_functions = new UGFunctions(), g_arrItems, g_objTileDesign = new UGTileDesign();
	var g_thumbs = new UGThumbsGeneral(), g_objCarouselWrapper, g_objInner, arrOrigTiles = [];
	
	var g_options = {
			carousel_padding: 8,							//padding at the sides of the carousel
			carousel_space_between_tiles: 20,				//space between tiles
			carousel_navigation_numtiles:3,					//number of tiles to scroll when user clicks on next/prev button
			carousel_scroll_duration:500,					//duration of scrolling to tile
			carousel_scroll_easing:"easeOutCubic",			//easing of scrolling to tile animation
			
			carousel_autoplay: true,						//true,false - autoplay of the carousel on start
			carousel_autoplay_timeout: 3000,				//autoplay timeout
			carousel_autoplay_direction: "right",			//left,right - autoplay direction
			carousel_autoplay_pause_onhover: true,			//pause the autoplay on mouse over
			carousel_vertical_scroll_ondrag: false			//vertical screen scroll on carousel drag
	};
	
	this.events = {
			START_PLAY: "carousel_start_play",
			PAUSE_PLAY: "carousel_pause_play",
			STOP_PLAY: "carousel_stop_play"
	};
	
	var g_temp = {
			eventSizeChange: "thumb_size_change",
			isFirstTimeRun:true,  //if run once
			carouselMaxWidth: null,
			tileWidth:0,
			initTileWidth:0,
			initTileHeight:0,
			sideSpace:1500,				//the space that must be filled with items
			spaceActionSize:500,
			numCurrent:0,
			touchActive: false,
			startInnerPos: 0,
			lastTime:0,
			startTime:0,
			startMousePos:0,
			lastMousePos:0,
			scrollShortDuration: 200,
			scrollShortEasing: "easeOutQuad",
			handle:null,
			isPlayMode: false,
			isPaused: false,
			storedEventID: "carousel"
	};

	
	function __________GENERAL_________(){};
	
	/**
	 * init the gallery
	 */
	function init(gallery, customOptions){
		
		g_objects = gallery.getObjects();
		g_gallery = gallery;
		g_objGallery = jQuery(gallery);
		g_objWrapper = g_objects.g_objWrapper;
		g_arrItems = g_objects.g_arrItems;
		
		g_options = jQuery.extend(g_options, customOptions);
		
		g_objTileDesign.setFixedMode();		
		g_objTileDesign.setApproveClickFunction(isApproveTileClick);
		g_objTileDesign.init(gallery, g_options);
		
		g_thumbs = g_objTileDesign.getObjThumbs();
		g_options = g_objTileDesign.getOptions();
		
		g_temp.initTileWidth = g_options.tile_width;
		g_temp.initTileHeight = g_options.tile_height;
		
		g_temp.tileWidth = g_options.tile_width;
	}
	
	
	/**
	 * set the grid panel html
	 */
	function setHtml(objParent){
		
		if(!objParent)
			var objParent = g_objWrapper;
		
		var html = "<div class='ug-carousel-wrapper'><div class='ug-carousel-inner'></div></div>";
		g_objWrapper.append(html);
		
		g_objCarouselWrapper = g_objWrapper.children(".ug-carousel-wrapper");
		g_objInner = g_objCarouselWrapper.children(".ug-carousel-inner");
		
		g_objTileDesign.setHtml(g_objInner);
		
		g_thumbs.getThumbs().fadeTo(0,1);
		
	}
	
	
	/**
	 * resize tiles to new width / height
	 */
	function resizeTiles(newTileWidth, newTileHeight){
		
		if(!newTileHeight){
			
			var newTileHeight = g_temp.initTileHeight / g_temp.initTileWidth * newTileWidth;
			
		}
		
		g_temp.tileWidth = newTileWidth;
		
		//update all options
		var optUpdate = {
				tile_width: newTileWidth, 
				tile_height: newTileHeight
		};
		
		g_objTileDesign.setOptions(optUpdate);
		
		g_options.tile_width = newTileWidth;
		g_options.tile_height = newTileHeight;
		
		//resize all tiles
		g_objTileDesign.resizeAllTiles(newTileWidth);
		
		//reposition tiles
		positionTiles(true);		//must to position tiles right after size change, for inner size change
	}
	
	/**
	 * run the gallery after init and set html
	 */
	function run(){
		
		//validation
		if(g_temp.carouselMaxWidth === null){
			throw new Error("The carousel width not set");
			return(false);
		}
		
		//if the size changed, change it anyway
		if(g_temp.tileWidth < g_temp.initTileWidth){
						
			var newTileWidth = g_temp.carouselMaxWidth - g_options.carousel_padding * 2;
			if(newTileWidth > g_temp.initTileWidth)
				newTileWidth = g_temp.initTileWidth;
			
			resizeTiles(newTileWidth);
			
			var numTiles = g_functions.getNumItemsInSpace(g_temp.carouselMaxWidth, newTileWidth, g_options.carousel_space_between_tiles);
			
		}else{
			
			//check if need to lower tiles size
			var numTiles = g_functions.getNumItemsInSpace(g_temp.carouselMaxWidth, g_temp.tileWidth, g_options.carousel_space_between_tiles);
			
			//if no tiles fit, resize the tiles
			if(numTiles <= 0){
				numTiles = 1;
				
				var newTileWidth = g_temp.carouselMaxWidth - g_options.carousel_padding * 2;
				
				resizeTiles(newTileWidth);
			}
			
		}
				
		//set wrapper width
		var realWidth = g_functions.getSpaceByNumItems(numTiles, g_temp.tileWidth, g_options.carousel_space_between_tiles);
		realWidth += g_options.carousel_padding * 2;
		
		g_objCarouselWrapper.width(realWidth);
		
		if(g_temp.isFirstTimeRun == true){
			
			initEvents();
			
			g_objTileDesign.run();
			
			//set data indexes to tiles
			jQuery.each(g_arrItems, function(index, item){
				item.objThumbWrapper.data("index", index);

				g_objWrapper.trigger(g_temp.eventSizeChange, [item.objThumbWrapper,true]);
				item.objTileOriginal = item.objThumbWrapper.clone(true, true);
			});
						
			positionTiles(true);		//set heights at first time
			
			if(g_options.carousel_autoplay == true)
				t.startAutoplay();
		}else{
			
			if(g_options.carousel_autoplay == true)
				t.pauseAutoplay();
			
			scrollToTile(0, false);
			
			if(g_options.carousel_autoplay == true)
				t.startAutoplay();
		}
		
		positionElements();
		
		g_temp.isFirstTimeRun = false;
	}
	
	
	
	function __________GETTERS_______(){};
	
	/**
	 * get inner position
	 */
	function getInnerPos(){
		return g_functions.getElementSize(g_objInner).left;
	}
	
	/**
	 * get mouse position
	 */
	function getMousePos(event){
		return g_functions.getMousePosition(event).pageX;
	}
	
	
	/**
	 * get all tiles
	 */
	function getTiles(){
		
		var objTiles = g_objInner.children(".ug-thumb-wrapper");
		
		return(objTiles);
	}
	
	
	/**
	 * get num tiles in some space
	 */
	function getNumTilesInSpace(space){
		
		var numItems = g_functions.getNumItemsInSpace(space, g_temp.tileWidth, g_options.carousel_space_between_tiles)
				
		return(numItems);
	}
	
	
	/**
	 * get num tiles
	 */
	function getNumTiles(){
		return getTiles().length;
	}
	
	
	/**
	 * get tile
	 */
	function getTile(numTile){
		validateTileNum(numTile);
		var objTiles = getTiles();
		var objTile = jQuery(objTiles[numTile]);
		
		return(objTile);
	}
	
	
	/**
	 * get first tile in the inner object
	 */
	function getFirstTile(){
				
		return g_objInner.children(".ug-thumb-wrapper").first();
	}
	
	/**
	 * get last tile in the inner object
	 */
	function getLastTile(){
		
		return g_objInner.children(".ug-thumb-wrapper").last();		
	}
	
	
	
	/**
	 * get clone of the time next or prev the given
	 */
	function getTileClones(objTile, numClones, dir){
		
		var index = objTile.data("index");
		if(index == undefined){
			throw new Error("every tile should have index!");			
		}
		
		var arrClonedItems = [];
		
		for(var i=0;i<numClones;i++){			
			
			if(dir == "prev")
				var itemToAdd = g_gallery.getPrevItem(index, true);
			else
				var itemToAdd = g_gallery.getNextItem(index, true);
			
			if(!itemToAdd){
				throw new Error("the item to add is empty");
			}
			
			var clonedTile = itemToAdd.objTileOriginal.clone(true, true);
			
			
			index = itemToAdd.index;	
			
			clonedTile.addClass("cloned");
			arrClonedItems.push(clonedTile);
		}
		
		return(arrClonedItems);
	}
	
	
	/**
	 * get space left from the right
	 */
	function getRemainSpaceRight(){
		var wrapperSize = g_functions.getElementSize(g_objCarouselWrapper);
		var innerSize = g_functions.getElementSize(g_objInner);
		
		var spaceTaken = innerSize.width - wrapperSize.width + innerSize.left;
		var spaceRemain = g_temp.sideSpace - spaceTaken;
				
		return(spaceRemain);
	}
	
	
	/**
	 * get remain space on the left
	 */
	function getRemainSpaceLeft(){
		var spaceTaken = -getInnerPos();
		var spaceRemain = g_temp.sideSpace - spaceTaken;
		return(spaceRemain);
	}
	
	/**
	 * get carousel width
	 */
	function getCarouselWidth(){
		
		var objSize = g_functions.getElementSize(g_objCarouselWrapper);
		return(objSize.width);
	}
	
	/**
	 * get num tiles in the carousel
	 */
	function getNumTilesInCarousel(){
		
		var width = getCarouselWidth();
		
		var numTiles = getNumTilesInSpace(width);
		
		return(numTiles);
	}
	
	
	function __________OTHER_METHODS_______(){};
	
	
	/**
	 * position existing tiles
	 */
	function positionTiles(setHeight){
		
		if(!setHeight)
			var setHeight = false;
		
		var objTiles = getTiles();
				
		var posx = 0;
		var maxHeight = 0, totalWidth;
		
		jQuery.each(objTiles, function(index, objTile){
			objTile = jQuery(objTile);
			g_functions.placeElement(objTile, posx, 0);
			var tileSize = g_functions.getElementSize(objTile);
			posx += tileSize.width + g_options.carousel_space_between_tiles;
			maxHeight = Math.max(maxHeight, tileSize.height);
			if(index == (objTiles.length-1))
				totalWidth = tileSize.right;
		});
		
		//set heights and widths
		g_objInner.width(totalWidth);
				
		maxHeight += g_options.carousel_padding * 2;
		
		if(setHeight === true){
			g_objInner.height(maxHeight);
			g_objCarouselWrapper.height(maxHeight);
		}
				
		scrollToTile(g_temp.numCurrent, false);

		return(totalWidth);
	}
	
	
	/**
	 * validate that the num not more then num tiles
	 */
	function validateTileNum(numTile){

		if(numTile > (getTiles().length-1))
			throw new Error("Wrogn tile number: " + numTile);
	}
	
	
	/**
	 * add tile to left
	 */
	function addTiles(numTiles, dir){
		
		if(dir == "left")
			var anchorTile = getFirstTile();
		else
			var anchorTile = getLastTile();
		
		var clonesType = (dir == "left")?"prev":"next";
		
		var arrNewTiles = getTileClones(anchorTile, numTiles, clonesType);
				
		jQuery.each(arrNewTiles, function(index, objTile){		
			
			if(dir == "left")
				g_objInner.prepend(objTile);
			else
				g_objInner.append(objTile);
			
			g_objWrapper.trigger(g_temp.eventSizeChange, objTile);
			g_objTileDesign.loadTileImage(objTile);
			
		});
		
		
	}
	
	/**
	 * remove some tiles
	 */
	function removeTiles(numTilesToRemove, direction){
		
		validateTileNum(numTiles);
		
		var arrTiles = getTiles();
		var numTiles = arrTiles.length;
		
		for(var i=0; i<numTilesToRemove; i++){
			
			if(direction == "left")
				jQuery(arrTiles[i]).remove();
			else{
				jQuery(arrTiles[numTiles-1-i]).remove();
			}
		}
	}

	
	/**
	 * set inner strip position
	 */
	function setInnerPos(pos){
		var objCss = {
				"left":pos+"px"
		};
		
		g_objInner.css(objCss);
	}
	
	
	/**
	 * scroll to tile by number
	 */
	function scrollToTile(numTile, isAnimation, isShort){
		
		if(isAnimation === undefined){
			var isAnimation = true;
			if(g_objInner.is(":animated"))
				return(true);
		}
				
		var objTile = getTile(numTile);
		var objSize = g_functions.getElementSize(objTile);
		var posScroll = -objSize.left + g_options.carousel_padding;
		
		var objCss = {
				"left":posScroll+"px"
		};
						
		if(isAnimation === true){
			
			var duration = g_options.carousel_scroll_duration;
			var easing = g_options.carousel_scroll_easing;
			
			if(isShort === true){
				duration = g_temp.scrollShortDuration;
				easing = g_temp.scrollShortEasing;
			}
			
			g_objInner.stop(true).animate(objCss ,{
				duration: duration,
				easing: easing,
				queue: false,
				//progress:function(){t.triggerStripMoveEvent()},
				complete: function(){
					g_temp.numCurrent = numTile;
					
					fillSidesWithTiles(true);
				}
			});					
			
		}else{
			g_temp.numCurrent = numTile;
						
			g_objInner.css(objCss);
		}
		
	}
	
	
	/**
	 * get number of neerest tile
	 */
	function getNeerestTileNum(){
		var innerPos = -getInnerPos();
		var numTiles = getNumTilesInSpace(innerPos);
		var tile1Pos = g_functions.getElementSize(getTile(numTiles)).left;
		var tile2Pos = g_functions.getElementSize(getTile(numTiles+1)).left;
				
		if(Math.abs(tile1Pos - innerPos) < Math.abs(tile2Pos - innerPos))
			return(numTiles);
		else			
			return(numTiles+1);
	}
	
	
	/**
	 * get neerest tile to inner position
	 */
	function scrollToNeerestTile(){
		
		var tileNum = getNeerestTileNum();
		scrollToTile(tileNum, true, true);
	}
	
	
	/**
	 * fill the sides with tiles till it fil the sideSpace
	 */
	function fillSidesWithTiles(){
				
		var spaceLeft = getRemainSpaceLeft();
		var spaceRight = getRemainSpaceRight();
		
		var numItemsLeft = 0, numItemsRight = 0, numItemsRemoveLeft = 0, numItemsRemoveRight = 0;
		
		//trace("left: " + spaceLeft+ " right: " + spaceRight);
		
		var numTiles = getNumTiles();
		
		//add tiles to left
		if(spaceLeft > g_temp.spaceActionSize){
			numItemsLeft = getNumTilesInSpace(spaceLeft);		
			addTiles(numItemsLeft, "left");
			
			g_temp.numCurrent += numItemsLeft;
			
		}else if(spaceLeft < -g_temp.spaceActionSize){
			var numItemsRemoveLeft = getNumTilesInSpace(Math.abs(spaceLeft));
			removeTiles(numItemsRemoveLeft, "left");
			g_temp.numCurrent -= numItemsRemoveLeft;
		}
		
		//add tiles to right
		if(spaceRight > g_temp.spaceActionSize){
			numItemsRight = getNumTilesInSpace(spaceRight);
			addTiles(numItemsRight, "right");			
		}else if(spaceRight < -g_temp.spaceActionSize){
			numItemsRemoveRight = getNumTilesInSpace(Math.abs(spaceRight));
			removeTiles(numItemsRemoveRight, "right");			
		}
		
		
		//small validation
		if(numItemsRemoveRight > numTiles){
			
			throw new Error("Can't remove more then num tiles");
		}
			
		//trace(numItemsRemoveRight);
		//trace("numItems: " + getNumTiles());
		
		//scroll to tile and position inner object
		var isPositioned = false;
		if(numItemsLeft || numItemsRight || numItemsRemoveLeft || numItemsRemoveRight){
			
			/*
			debugLine({
				numItemsLeft:numItemsLeft,
				numItemsRight:numItemsRight,
				numItemsRemoveLeft:numItemsRemoveLeft,
				numItemsRemoveRight: numItemsRemoveRight
			});
			*/
			//trace("do something");
			
			positionTiles();			
			isPositioned = true
		}
		
		return(isPositioned);
	}
	
	
	/**
	 * position tiles
	 */
	function positionElements(isFirstTime){
				
		//position inner strip
		g_functions.placeElement(g_objInner, 0, g_options.carousel_padding);
		
		//position sides
		fillSidesWithTiles();
		
	}
	
	
	
	function __________AUTOPLAY_______(){};

	/**
	 * start autoplay
	 */
	this.startAutoplay = function(){
		
		g_temp.isPlayMode = true;
		g_temp.isPaused = false;
		
		g_objThis.trigger(t.events.START_PLAY);
		
		if(g_temp.handle)
			clearInterval(g_temp.handle);
		
		g_temp.handle = setInterval(autoplayStep, g_options.carousel_autoplay_timeout);
		
	}
	
	
	/**
	 * unpause autoplay after pause
	 */
	this.unpauseAutoplay = function(){
		
		if(g_temp.isPlayMode == false)
			return(true);
		
		if(g_temp.isPaused == false)
			return(true);
		
		t.startAutoplay();
	}
	
	
	/**
	 * pause the autoplay
	 */
	this.pauseAutoplay = function(){

		if(g_temp.isPlayMode == false)
			return(true);
		
		g_temp.isPaused = true;
		
		if(g_temp.handle)
			clearInterval(g_temp.handle);
		
		g_objThis.trigger(t.events.PAUSE_PLAY);
		
	}

	
	/**
	 * stop autoplay
	 */
	this.stopAutoplay = function(){
		
		if(g_temp.isPlayMode == false)
			return(true);
		
		g_temp.isPaused = false;
		g_temp.isPlayMode = false;
		
		if(g_temp.handle)
			clearInterval(g_temp.handle);
		
		g_objThis.trigger(t.events.STOP_PLAY);
	}
	
	
	/**
	 * autoplay step, advance the carousel by 1
	 */
	function autoplayStep(){
		
		if(g_options.carousel_autoplay_direction == "left"){
			t.scrollRight(1);
		}else{
			t.scrollLeft(1);
		}
		
	}
	
	function __________EVENTS_______(){};
		
	
	/**
	 * on touch start
	 */
	function onTouchStart(event){
		
		if(g_temp.touchActive == true)
			return(true);
		
		g_temp.touchActive = true;
		
		t.pauseAutoplay();
		
		g_temp.startTime = jQuery.now();	
		g_temp.startMousePos = getMousePos(event);
		g_temp.startInnerPos = getInnerPos();
		g_temp.lastTime = g_temp.startTime;
		g_temp.lastMousePos = g_temp.startMousePos;
		
		g_functions.storeEventData(event, g_temp.storedEventID);
	}

	
	/**
	 * on touch move
	 */
	function onTouchMove(event){
				
		if(g_temp.touchActive == false)
			return(true);
		
		g_functions.updateStoredEventData(event, g_temp.storedEventID);
		
		event.preventDefault();
		
		var scrollDir = null;
		
		if(g_options.carousel_vertical_scroll_ondrag == true)
			scrollDir = g_functions.handleScrollTop(g_temp.storedEventID);
		
		if(scrollDir === "vert")
			return(true);
		
		g_temp.lastMousePos = getMousePos(event);
		
		var diff = g_temp.lastMousePos - g_temp.startMousePos;
		var innerPos = g_temp.startInnerPos + diff;
		var direction = (diff > 0) ? "prev":"next";
		var innerSize = g_functions.getElementSize(g_objInner).width;
		
		//slow down when off limits
		if(innerPos > 0 && direction == "prev"){
			innerPos = innerPos / 3;
		}
		
		if(innerPos < -innerSize && direction == "next"){
			innerPos = g_temp.startInnerPos + diff / 3;
		}
		
		setInnerPos(innerPos);
	}
	
	
	/**
	 * on touch end
	 * change panes or return to current pane
	 */
	function onTouchEnd(event){
		
		if(g_temp.touchActive == false)
			return(true);
		
		//event.preventDefault();
		g_temp.touchActive = false;
		
		scrollToNeerestTile();
		
		t.unpauseAutoplay();
	}
	
	/**
	 * pause the playing
	 */
	function onMouseEnter(event){
		
		if(g_options.carousel_autoplay_pause_onhover == false)
			return(true);
		
		if(g_temp.isPlayMode == true && g_temp.isPaused == false)
			t.pauseAutoplay();
	}
	
	/**
	 * start the playing again
	 */
	function onMouseLeave(event){
		
		if(g_options.carousel_autoplay_pause_onhover == false)
			return(true);
		
		t.unpauseAutoplay();
	}
	
	
	/**
	 * init panel events
	 */
	function initEvents(){
				
		g_objTileDesign.initEvents();
		
		//touch drag events
		//slider mouse down - drag start
		g_objCarouselWrapper.bind("mousedown touchstart",onTouchStart);
		
		//on body move
		jQuery("body").bind("mousemove touchmove",onTouchMove);
		
		//on body mouse up - drag end
		jQuery(window).add("body").bind("mouseup touchend", onTouchEnd);
		
		g_objCarouselWrapper.hover(onMouseEnter, onMouseLeave);
		
	}
	
	
	/**
	 * destroy the carousel events
	 */
	this.destroy = function(){
		
		if(g_temp.handle)
			clearInterval(g_temp.handle);
		
		g_objThis.off(t.events.START_PLAY);		
		g_objThis.off(t.events.STOP_PLAY);		
		
		//touch drag events
		//slider mouse down - drag start
		g_objCarouselWrapper.unbind("mousedown");
		g_objCarouselWrapper.unbind("touchstart");
		
		//on body move
		jQuery("body").unbind("mousemove");
		jQuery("body").unbind("touchmove");
		
		//on body mouse up - drag end
		jQuery(window).add("body").unbind("mouseup").unbind("touchend");
		
		g_objCarouselWrapper.off("mouseenter").off("mouseleave");
		
		g_objTileDesign.destroy();
	}

	
	/**
	 * init function for avia controls
	 */
	this.init = function(gallery, customOptions, width){
		if(width)
			this.setMaxWidth(width);
		
		init(gallery, customOptions);
	}

	
	/**
	 * set the width
	 */
	this.setMaxWidth = function(width){
		
		g_temp.carouselMaxWidth = width;
	}
	
	
	/**
	 * set html
	 */
	this.setHtml = function(objParent){
		setHtml(objParent);
	}
	
	/**
	 * get the carousel element
	 */
	this.getElement = function(){
		return g_objCarouselWrapper;
	}
	
	/**
	 * get tile design object
	 */
	this.getObjTileDesign = function(){
		return(g_objTileDesign);
	}
	
	
	/**
	 * get estimated height
	 */
	this.getEstimatedHeight = function(){
		var height = g_options.tile_height + g_options.carousel_padding * 2;
		return(height);
	}
	
	
	/**
	 * set html and properties
	 */	
	this.run = function(){
		run();
	}
	
	
	/**
	 * scroll to right
	 */
	this.scrollRight = function(tilesToScroll){
		
		if(!tilesToScroll || typeof tilesToScroll == "object")
			var tilesToScroll = g_options.carousel_navigation_numtiles;

		var numTilesInCarousel = getNumTilesInCarousel();
		if(tilesToScroll > numTilesInCarousel)
			tilesToScroll = numTilesInCarousel;
		
		var numPrev = g_temp.numCurrent - tilesToScroll;
		if(numPrev <=0)
			numPrev = 0;
		
		scrollToTile(numPrev);
	}
	
	
	/**
	 * scroll to left
	 */
	this.scrollLeft = function(tilesToScroll){
				
		if(!tilesToScroll || typeof tilesToScroll == "object")
			var tilesToScroll = g_options.carousel_navigation_numtiles;
		
		var numTilesInCarousel = getNumTilesInCarousel();
		if(tilesToScroll > numTilesInCarousel)
			tilesToScroll = numTilesInCarousel;
		
		var numTiles = getNumTiles();
		
		var numNext = g_temp.numCurrent + tilesToScroll;
		if(numNext >= numTiles)
			numNext = numTiles-1;
	
		scrollToTile(numNext);
	}
	
	/**
	 * set scroll left button
	 */
	this.setScrollLeftButton = function(objButton){
		g_functions.setButtonMobileReady(objButton);
		g_functions.setButtonOnClick(objButton, t.scrollLeft);
	}
	
	
	/**
	 * set scroll right button
	 */
	this.setScrollRightButton = function(objButton){
		g_functions.setButtonMobileReady(objButton);
		g_functions.setButtonOnClick(objButton, t.scrollRight);
	}
	
	
	/**
	 * set scroll right button
	 */
	this.setPlayPauseButton = function(objButton){
		g_functions.setButtonMobileReady(objButton);
		
		if(g_temp.isPlayMode == true && g_temp.isPaused == false){
			objButton.addClass("ug-pause-icon");			
		}
		
		g_objThis.on(t.events.START_PLAY, function(){
			objButton.addClass("ug-pause-icon");
		});
		
		g_objThis.on(t.events.STOP_PLAY, function(){
			objButton.removeClass("ug-pause-icon");
		});
		
		g_functions.setButtonOnClick(objButton, function(){
				
				if(g_temp.isPlayMode == false || g_temp.isPaused == true)					
					t.startAutoplay();
				else
					t.stopAutoplay();
				
		});
	}
	
	
	/**
	 * return if passed some significant movement
	 */
	function isApproveTileClick(){
		
		var passedTime = g_temp.lastTime - g_temp.startTime;		
		var passedDistanceAbs = Math.abs(g_temp.lastMousePos - g_temp.startMousePos);
		
		if(passedTime > 300)
			return(false);
		
		if(passedDistanceAbs > 30)
			return(false);
		
		return(true);
	}
	
	
}


