/**
 * thumbs class
 * addon to strip gallery
 */
function UGThumbsGrid(){

	var t = this, g_objThis = jQuery(this);
	var g_gallery = new UniteGalleryMain(), g_objGallery, g_objects, g_objWrapper;
	var g_functions = new UGFunctions(), g_arrItems, g_objGrid, g_objInner;
	var g_thumbs = new UGThumbsGeneral(), g_tilesDesign = new UGTileDesign();
	
	var g_options = {
		grid_panes_direction: "left",				//where panes will move -> left, bottom
		grid_num_cols: 2,							//number of grid columns
		grid_num_rows: 2,							//number of grid rows (for horizontal type)
		grid_space_between_cols: 10,				//space between columns
		grid_space_between_rows: 10,				//space between rows
		grid_transition_duration: 300,				//transition of the panes change duration 
		grid_transition_easing: "easeInOutQuad",	//transition of the panes change easing function
		grid_carousel: false,						//next pane goes to first when last
		grid_padding: 0,							//set padding to the grid
		grid_vertical_scroll_ondrag: false			//scroll the gallery on vertical drag
	};
	
	this.events = {
		PANE_CHANGE: "pane_change"
	};
	
	var g_temp = {
			eventSizeChange: "thumb_size_change",
			isHorizontal: false,
			isMaxHeight:false,		//set if the height that set is max height. In that case need a height correction
			isMaxWidth:false,		//set if the height that set is max height. In that case need a height correction
			gridHeight: 0,
			gridWidth: 0,
			innerWidth: 0,
			innerHeight:0,
			numPanes:0,
			arrPanes:0,
			numThumbs:0,
			currentPane:0,
			numThumbsInPane:0,
			isNavigationVertical:false,
			touchActive: false,
			startScrollPos:0,
			isFirstTimeRun:true,
			isTilesMode: false,
			storedEventID: "thumbsgrid"
		};
	
	
	function __________GENERAL_________(){};
	
	/**
	 * init the gallery
	 */
	function init(gallery, customOptions, isTilesMode){
				
		g_objects = gallery.getObjects();
		g_gallery = gallery;
		
		g_gallery.attachThumbsPanel("grid", t);
		
		g_objGallery = jQuery(gallery);
		g_objWrapper = g_objects.g_objWrapper;
		g_arrItems = g_objects.g_arrItems;
				
		if(isTilesMode === true)
			g_temp.isTilesMode = true;
		
		g_temp.numThumbs = g_arrItems.length;
		
		setOptions(customOptions);
		
		//set vertical or horizon
		g_temp.isNavigationVertical = (g_options.grid_panes_direction == "top" || g_options.grid_panes_direction == "bottom")
		
		if(g_temp.isTilesMode == true){
			
			g_tilesDesign.setFixedMode();
			g_tilesDesign.setApproveClickFunction(isApproveTileClick);
			g_tilesDesign.init(gallery, g_options);
			
			g_thumbs = g_tilesDesign.getObjThumbs();
		}else{
			
			//disable the dynamic size in thumbs
			customOptions.thumb_fixed_size = true;
			
			g_thumbs.init(gallery, customOptions);
		}
		
	}
	
	
	/**
	 * set the grid panel html
	 */
	function setHtml(parentContainer){
		
		var objParent = g_objWrapper;
		
		if(parentContainer)
			objParent = parentContainer;
		
		objParent.append("<div class='ug-thumbs-grid'><div class='ug-thumbs-grid-inner'></div></div>");		 
		g_objGrid = objParent.children(".ug-thumbs-grid");
		g_objInner = g_objGrid.children(".ug-thumbs-grid-inner");		
		
		//put the thumbs to inner strip
		
		if(g_temp.isTilesMode == true)
			g_tilesDesign.setHtml(g_objInner);
		else
			g_thumbs.setHtmlThumbs(g_objInner);
		
	}
	
	
	/**
	 * validate before running the grid
	 */
	function validateBeforeRun(){
		
		if(g_temp.isHorizontal == false){	//vertical type			
			if(g_temp.gridHeight == 0)
				throw new Error("You must set height before run.");		
		}else{
			if(g_temp.gridWidth == 0)
				throw new Error("You must set width before run.");					
		}
		
	}
	
	
	/**
	 * run the gallery after init and set html
	 */
	function run(){
		
		var selectedItem = g_gallery.getSelectedItem();
		
		validateBeforeRun();
		
		if(g_temp.isFirstTimeRun == true){
						
			if(g_temp.isTilesMode == true){
				
				initSizeParams();							
				g_tilesDesign.run();
				
			}else{
				g_thumbs.setHtmlProperties();
				initSizeParams();			
				g_thumbs.loadThumbsImages();
			}
			
			initEvents();
		}
				
		positionThumbs();
		
		if(g_temp.isFirstTimeRun == true && g_temp.isTilesMode){
			
			var objTiles = g_thumbs.getThumbs();
			
			//fire size change event
			objTiles.each(function(index, tile){
				
				g_objWrapper.trigger(g_temp.eventSizeChange, jQuery(tile));
			});
			
			objTiles.fadeTo(0,1);
		}
			
		if(selectedItem != null)
			scrollToThumb(selectedItem.index);
		
		//trigger pane change event on the start
		g_objThis.trigger(t.events.PANE_CHANGE, g_temp.currentPane);
		
		g_temp.isFirstTimeRun = false;
	}
	
	
	/**
	 * init grid size horizontal
	 * get height param
	 */
	function initSizeParamsHor(){
		
		var arrThumbs = g_objInner.children(".ug-thumb-wrapper");
		var firstThumb = jQuery(arrThumbs[0]);
		var thumbsRealHeight = firstThumb.outerHeight();

		//set grid size
		var gridWidth = g_temp.gridWidth;
		var gridHeight = g_options.grid_num_rows * thumbsRealHeight + (g_options.grid_num_rows-1) * g_options.grid_space_between_rows + g_options.grid_padding*2;
		
		g_temp.gridHeight = gridHeight;
		
		g_functions.setElementSize(g_objGrid, gridWidth, gridHeight);
	
		//set inner size (as grid size, will be corrected after placing thumbs
		g_functions.setElementSize(g_objInner, gridWidth, gridHeight);
		
		//set initial inner size params
		g_temp.innerWidth = gridWidth;
		g_temp.innerHeight = gridHeight;
	}
	
	
	/**
	 * init size params vertical
	 */
	function initSizeParamsVert(){
		
		//set thumb outer size:
		var arrThumbs = g_objInner.children(".ug-thumb-wrapper");
		var firstThumb = jQuery(arrThumbs[0]);
		var thumbsRealWidth = firstThumb.outerWidth();
		
		//set grid size
		var gridWidth = g_options.grid_num_cols * thumbsRealWidth + (g_options.grid_num_cols-1) * g_options.grid_space_between_cols + g_options.grid_padding*2;
		var gridHeight = g_temp.gridHeight;
		
		g_temp.gridWidth = gridWidth;
		
		g_functions.setElementSize(g_objGrid, gridWidth, gridHeight);
	
		//set inner size (as grid size, will be corrected after placing thumbs
		g_functions.setElementSize(g_objInner, gridWidth, gridHeight);
		
		//set initial inner size params
		g_temp.innerWidth = gridWidth;
		g_temp.innerHeight = gridHeight;
		
	}
	
	/**
	 * init grid size
	 */
	function initSizeParams(){
		
		if(g_temp.isHorizontal == false)
			initSizeParamsVert();
		else
			initSizeParamsHor();
		
	}

	

	/**
	 * goto pane by index
	 */
	function scrollToThumb(thumbIndex){
		
		var paneIndex = getPaneIndexByThumbIndex(thumbIndex);
		if(paneIndex == -1)
			return(false);
				
		t.gotoPane(paneIndex, "scroll");
				
	}
	
	/**
	 * set the options of the strip
	 */
	function setOptions(objOptions){
		
		g_options = jQuery.extend(g_options, objOptions);
		
		g_thumbs.setOptions(objOptions);
	}
	
	
	/**
	 * position the thumbs and init panes horizontally
	 */
	function positionThumb_hor(){
				
		var arrThumbs = g_objInner.children(".ug-thumb-wrapper");
		
		var posx = 0;
		var posy = 0;
		var counter = 0;
		var baseX = 0;
		var maxx = 0, maxy = 0;
		g_temp.innerWidth = 0;
		g_temp.numPanes = 1;
		g_temp.arrPanes = [];
		g_temp.numThumbsInPane = 0;
		
		//set first pane position
		g_temp.arrPanes.push(baseX);	
		
		var numThumbs = arrThumbs.length;
			
		for(i=0;i < numThumbs; i++){
			var objThumb = jQuery(arrThumbs[i]);
			g_functions.placeElement(objThumb, posx, posy);
			
			var thumbWidth = objThumb.outerWidth();
			var thumbHeight = objThumb.outerHeight();
			
			//count maxx
			if(posx > maxx)
				maxx = posx;
			
			//count maxy
			var endY = posy + thumbHeight;
			if(endY > maxy)
				maxy = endY;
			
			//count maxx end
			var endX = maxx + thumbWidth;
			if(endX > g_temp.innerWidth)
				g_temp.innerWidth = endX;
						
			posx += thumbWidth + g_options.grid_space_between_cols;
			
			//next row
			counter++;
			if(counter >= g_options.grid_num_cols){
				posy += thumbHeight + g_options.grid_space_between_rows;
				posx = baseX;
				counter = 0;
			}
			
			//count number thumbs in pane
			if(g_temp.numPanes == 1)
				g_temp.numThumbsInPane++;
			
			//prepare next pane
			if((posy + thumbHeight) > g_temp.gridHeight){
				posy = 0;
				baseX = g_temp.innerWidth + g_options.grid_space_between_cols;
				posx = baseX;
				counter = 0;
								
				//correct max height size (do it once only)
				if(g_temp.isMaxHeight == true && g_temp.numPanes == 1){
					g_temp.gridHeight = maxy;
					g_objGrid.height(g_temp.gridHeight);
				}
				
				//save next pane props (if exists)
				if(i < (numThumbs - 1)){
					g_temp.numPanes++;
					
					//set next pane position
					g_temp.arrPanes.push(baseX);	
										
				}
			}
		}
		
		//set inner strip width and height
		g_objInner.width(g_temp.innerWidth);
		
		//set grid height
		if(g_temp.isMaxHeight == true && g_temp.numPanes == 1){
			g_temp.gridHeight = maxy;
			g_objGrid.height(maxy);
		}
		
	}
	
	
	/**
	 * position the thumbs and init panes vertically
	 */
	function positionThumb_vert(){
		var arrThumbs = g_objInner.children(".ug-thumb-wrapper");
		
		var posx = 0;
		var posy = 0;
		var maxy = 0;
		var counter = 0;
		var baseX = 0;
		var paneStartY = 0;
		
		g_temp.innerWidth = 0;
		g_temp.numPanes = 1;
		g_temp.arrPanes = [];
		g_temp.numThumbsInPane = 0;
		
		//set first pane position
		g_temp.arrPanes.push(baseX);
		
		var numThumbs = arrThumbs.length;
			
		for(i=0;i < numThumbs; i++){
			var objThumb = jQuery(arrThumbs[i]);
			g_functions.placeElement(objThumb, posx, posy);
			
			var thumbWidth = objThumb.outerWidth();
			var thumbHeight = objThumb.outerHeight();
									
			posx += thumbWidth + g_options.grid_space_between_cols;
			
			var endy = (posy + thumbHeight);
			if(endy > maxy)
				maxy = endy;
			
			//next row
			counter++;
			if(counter >= g_options.grid_num_cols){
				posy += thumbHeight + g_options.grid_space_between_rows;
				posx = baseX;
				counter = 0;
			}
			
			//count number thumbs in pane
			if(g_temp.numPanes == 1)
				g_temp.numThumbsInPane++;
						
			//prepare next pane
			endy = (posy + thumbHeight);
			var paneMaxY = paneStartY + g_temp.gridHeight;
			
			//advance next pane
			if(endy > paneMaxY){
				
				//correct max height size (do it once only)
				if(g_temp.isMaxHeight == true && g_temp.numPanes == 1){
					g_temp.gridHeight = maxy;
					g_objGrid.height(g_temp.gridHeight);
					paneMaxY = g_temp.gridHeight;
				}
				
				posy = paneMaxY + g_options.grid_space_between_rows;					
				paneStartY = posy;
				baseX = 0;
				posx = baseX;
				counter = 0;
				
				//save next pane props (if exists)
				if(i < (numThumbs - 1)){
					g_temp.numPanes++;
					
					//set next pane position
					g_temp.arrPanes.push(posy);	
									
				}
			}
			
		}//for
				
		//set inner height 
		g_objInner.height(maxy);
		g_temp.innerHeight = maxy;
		
		//set grid height
		if(g_temp.isMaxHeight == true && g_temp.numPanes == 1){
			g_temp.gridHeight = maxy;
			g_objGrid.height(maxy);
		}
		
	}

	/**
	 * position the thumbs horizontal type
	 */	
	function positionThumb_hortype(){
				
		var arrThumbs = g_objInner.children(".ug-thumb-wrapper");
		
		var baseX = g_options.grid_padding;
		var baseY = g_options.grid_padding;
		var posy = baseY;
		var posx = baseX;
		var maxx = 0, maxy = 0, paneMaxY = 0;
		var rowsCounter = 0;
		
		g_temp.innerWidth = 0;
		g_temp.numPanes = 1;
		g_temp.arrPanes = [];
		g_temp.numThumbsInPane = 0;
		
		//set first pane position
		g_temp.arrPanes.push(baseX-g_options.grid_padding);	
		
		var numThumbs = arrThumbs.length;
				
		for(i=0;i < numThumbs; i++){
			var objThumb = jQuery(arrThumbs[i]);
			
			var thumbWidth = objThumb.outerWidth();
			var thumbHeight = objThumb.outerHeight();
			
			//check end of the size, start a new row
			if((posx - baseX + thumbWidth) > g_temp.gridWidth){
				rowsCounter++;
				posy = 0;
				
				if(rowsCounter >= g_options.grid_num_rows){
					
					//change to a new pane					
					rowsCounter = 0;
					baseX = posx;
					paneMaxY = 0;
					posy = baseY;
					
					//change grid width to max width
					if(g_temp.numPanes == 1){
						g_temp.gridWidth = maxx+g_options.grid_padding;
						g_objGrid.width(g_temp.gridWidth);
					}
					
					g_temp.numPanes++;
					g_temp.arrPanes.push(baseX-g_options.grid_padding);
					
				}else{			//start new line in existing pane
					posx = baseX;
					posy = paneMaxY + g_options.grid_space_between_rows;
				}
			}
			
			//place the thumb
			g_functions.placeElement(objThumb, posx, posy);
			
			//count maxx
			var endX = posx + thumbWidth;
			if(endX > maxx)
				maxx = endX;
			
			//count maxy
			var endY = posy + thumbHeight;
			
			if(endY > paneMaxY)
				paneMaxY = endY;
				
			if(endY > maxy)
				maxy = endY;
			
			//count maxx end
			var endX = maxx + thumbWidth;
			if(endX > g_temp.innerWidth)
				g_temp.innerWidth = endX;
						
			posx += thumbWidth + g_options.grid_space_between_cols;
						
			//count number thumbs in pane
			if(g_temp.numPanes == 1)
				g_temp.numThumbsInPane++;
			
			
		}//end for
		
		//set inner strip width and height
		g_temp.innerWidth = maxx;
		g_temp.innerHeight = paneMaxY;
		
		g_objInner.width(g_temp.innerWidth);
		g_objInner.height(g_temp.innerHeight);
		
		//set grid height
		if(g_temp.numPanes == 1){
			g_temp.gridWidth = maxx + g_options.grid_padding;
			g_temp.gridHeight = maxy + g_options.grid_padding;
			
			g_objGrid.width(g_temp.gridWidth);
			g_objGrid.height(g_temp.gridHeight);
		}
			
	}
	
	
	/**
	 * position the thumbs and init panes related and width related vars
	 */
	function positionThumbs(){
		
		if(g_temp.isHorizontal == false){		//position vertical type
			
			if(g_temp.isNavigationVertical)
				positionThumb_vert();
			else
				positionThumb_hor();
			
		}else{
			positionThumb_hortype();
		}
		
	}
	
	
	/**
	 * validate thumb index
	 */
	function validateThumbIndex(thumbIndex){
		
		if(thumbIndex < 0 || thumbIndex >= g_temp.numThumbs){
			throw new Error("Thumb not exists: " + thumbIndex);
			return(false);
		}
		
		return(true);
	}
	
	
	/**
	 * 
	 * validate that the pane index exists
	 */
	function validatePaneIndex(paneIndex){
		
		if(paneIndex >= g_temp.numPanes || paneIndex < 0){
			throw new Error("Pane " + index + " doesn't exists.");
			return(false);
		}
		
		return(true);
	}
	
	/**
	 * validate inner position
	 */
	function validateInnerPos(pos){
				
		var absPos = Math.abs(pos);
		
		if(g_temp.isNavigationVertical == false){
			
			if(absPos < 0 || absPos >= g_temp.innerWidth){
				throw new Error("wrong inner x position: " + pos);
				return(false);
			}
			
		}else{
			
			if(absPos < 0 || absPos >= g_temp.innerHeight){
				throw new Error("wrong inner y position: " + pos);
				return(false);
			}
			
		}
		
		return(true);
	}
	
	
	
	
	/**
	 * 
	 * set inner strip position
	 */
	function setInnerPos(pos){
		
		var objCss = getInnerPosObj(pos);
		if(objCss == false)
			return(false);
		
		g_objInner.css(objCss);
	}
	
	
	/**
	 * animate inner to some position
	 */
	function animateInnerTo(pos){
		
		var objCss = getInnerPosObj(pos);
		if(objCss == false)
			return(false);
		
		g_objInner.stop(true).animate(objCss ,{
			duration: g_options.grid_transition_duration,
			easing: g_options.grid_transition_easing,
			queue: false
		});
		
	}
	
	/**
	 * animate back to current pane
	 */
	function animateToCurrentPane(){
		
		var innerPos = -g_temp.arrPanes[g_temp.currentPane];
		animateInnerTo(innerPos);
	}
	
		
	
	function __________GETTERS_________(){};
	
	/**
	 * get inner object size according the orientation
	 */
	function getInnerSize(){
		
		if(g_temp.isNavigationVertical == true)
			return(g_temp.innerHeight);
		else
			return(g_temp.innerWidth);
	}
	
	
	/**
	 * get pane width or height according the orientation
	 */
	function getPaneSize(){
		
		if(g_temp.isNavigationVertical == true)
			return(g_temp.gridHeight);
		else
			return(g_temp.gridWidth);
	}
	
	
	/**
	 * get object of iner position move
	 */
	function getInnerPosObj(pos){
				
		var obj = {};
		if(g_temp.isNavigationVertical == true)
			obj.top = pos + "px";
		else
			obj.left = pos + "px";
	
		return(obj);
	}
	
	
	/**
	 * get mouse position according the orientation
	 */
	function getMousePos(event){
		
		var mousePos = g_functions.getMousePosition(event);
		
		if(g_temp.isNavigationVertical == true)
			return(mousePos.pageY);
		else
			return(mousePos.pageX);
		
	}
	
	
	/**
	 * get inner position according the orientation
	 */
	function getInnerPos(){
		
		var objSize = g_functions.getElementSize(g_objInner);
		
		if(g_temp.isNavigationVertical == true)
			return(objSize.top);
		else
			return(objSize.left);
	
	}
	
	/**
	 * get pane by thumb index
	 */
	function getPaneIndexByThumbIndex(thumbIndex){
		
		//validate thumb index
		if(validateThumbIndex(thumbIndex) == false)
			return(-1);
		
		var numPane = Math.floor(thumbIndex / g_temp.numThumbsInPane);
		
		return(numPane);
	}
	
	/**
	 * get position of some pane
	 */
	function getPanePosition(index){
								
		var pos = g_temp.arrPanes[index];
		return(pos);
	}
	
	
	/**
	 * return if passed some significant movement, for thumb click
	 */
	function isSignificantPassed(){
		
		if(g_temp.numPanes == 1)
			return(false);
		
		var objData = g_functions.getStoredEventData(g_temp.storedEventID);
		
		var passedTime = objData.diffTime;
		
		var currentInnerPos = getInnerPos();
		var passedDistanceAbs = Math.abs(currentInnerPos - objData.startInnerPos);
		
		if(passedDistanceAbs > 30)
			return(true);
		
		if(passedDistanceAbs > 5 && passedTime > 300)
			return(true);
				
		return(false);
	}
	
	
	
	/**
	 * check if the movement that was held is valid for pane change
	 */
	function isMovementValidForChange(){
		
		var objData = g_functions.getStoredEventData(g_temp.storedEventID);
		
		//check position, if more then half, move
		var currentInnerPos = getInnerPos();
		diffPos = Math.abs(objData.startInnerPos - currentInnerPos);
				
		var paneSize = getPaneSize();
		var breakSize = Math.round(paneSize * 3 / 8);
		
		if(diffPos >= breakSize)
			return(true);
		
		if(objData.diffTime < 300 && diffPos > 25)
			return(true);
						
		return(false);
	}
	
	
	/**
	 * return if passed some significant movement
	 */
	function isApproveTileClick(){
		
		if(g_temp.numPanes == 1)
			return(true);
			
		var isApprove = g_functions.isApproveStoredEventClick(g_temp.storedEventID, g_temp.isNavigationVertical);
		
		return(isApprove);
	}
	
	
	function __________EVENTS_______(){};
	
	
	/**
	 * on thumb click event
	 */
	function onThumbClick(event){
		
		//event.preventDefault();
		if(isSignificantPassed() == true)
			return(true);
		
		//run select item operation
		var objThumb = jQuery(this);
		var objItem = g_thumbs.getItemByThumb(objThumb);
		
		g_gallery.selectItem(objItem);
	}
	
	
	/**
	 * on touch start
	 */
	function onTouchStart(event){
				
		if(g_temp.numPanes == 1)
			return(true);
		
		if(g_temp.touchActive == true)
			return(true);
		
		if(g_temp.isTilesMode == false)
			event.preventDefault();
		
		g_temp.touchActive = true;
		
		var addData = {
				startInnerPos: getInnerPos()
		};
		
		g_functions.storeEventData(event, g_temp.storedEventID, addData);
		
	}
	
	
	/**
	 * handle scroll top, return if scroll mode or not
	 */
	function handleScrollTop(){
		
		if(g_options.grid_vertical_scroll_ondrag == false)
			return(false);
		
		if(g_temp.isNavigationVertical == true)
			return(false);
		
		var scrollDir = g_functions.handleScrollTop(g_temp.storedEventID);
		
		if(scrollDir === "vert")
			return(true);
		
		return(false);
	}
	
	
	/**
	 * on touch move
	 */
	function onTouchMove(event){
				
		if(g_temp.touchActive == false)
			return(true);
		
		event.preventDefault();
		
		g_functions.updateStoredEventData(event, g_temp.storedEventID);
		
		var objData = g_functions.getStoredEventData(g_temp.storedEventID, g_temp.isNavigationVertical);
		
		//check if was vertical scroll
		var isScroll = handleScrollTop();
		if(isScroll)
			return(true);
		
		
		var diff = objData.diffMousePos;
		var innerPos = objData.startInnerPos + diff;
		var direction = (diff > 0) ? "prev":"next";
		var lastPaneSize = g_temp.arrPanes[g_temp.numPanes-1];
		
		//slow down when off limits
		if(g_options.grid_carousel == false && innerPos > 0 && direction == "prev"){
			innerPos = innerPos / 3;
		}
		
		//debugLine({lastSize:lastPaneSize,innerPos: innerPos});
		
		if(g_options.grid_carousel == false && innerPos < -lastPaneSize && direction == "next"){
			innerPos = objData.startInnerPos + diff / 3;
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
		
		g_functions.updateStoredEventData(event, g_temp.storedEventID);
		var objData = g_functions.getStoredEventData(g_temp.storedEventID, g_temp.isNavigationVertical);
		
		//event.preventDefault();
		g_temp.touchActive = false;
		
		if(isMovementValidForChange() == false){
			animateToCurrentPane();
			return(true);
		}
		
		//move pane or return back
		var innerPos = getInnerPos();
		var diff = innerPos - objData.startInnerPos;
		var direction = (diff > 0) ? "prev":"next";
		
		if(direction == "next"){
						
			if(g_options.grid_carousel == false && t.isLastPane())
				animateToCurrentPane();
			else
				t.nextPane();			
		}
		else{
						
			if(g_options.grid_carousel == false && t.isFirstPane()){
				animateToCurrentPane();
			}
			else
				t.prevPane();
		}
		
	}
	
	
	/**
	 * on item change
	 */
	function onItemChange(){
			
		var objItem = g_gallery.getSelectedItem();
		g_thumbs.setThumbSelected(objItem.objThumbWrapper);
		
		scrollToThumb(objItem.index);
		
	}
	
	
	/**
	 * init panel events
	 */
	function initEvents(){
		
		if(g_temp.isTilesMode == false){
			
			g_thumbs.initEvents();		
			var objThumbs = g_objGrid.find(".ug-thumb-wrapper");
			objThumbs.on("click touchend",onThumbClick);
			
			g_objGallery.on(g_gallery.events.ITEM_CHANGE, onItemChange);
			
		}else{
			g_tilesDesign.initEvents();
		}
		
		//touch drag events
		
		//slider mouse down - drag start
		g_objGrid.bind("mousedown touchstart",onTouchStart);
		
		//on body move
		jQuery("body").bind("mousemove touchmove",onTouchMove);
		
		//on body mouse up - drag end
		jQuery(window).add("body").bind("mouseup touchend", onTouchEnd);
		
	}
	
	
	/**
	 * destroy the events
	 */
	this.destroy = function(){
		
		if(g_temp.isTilesMode == false){
			
			var objThumbs = g_objGrid.find(".ug-thumb-wrapper");
			objThumbs.off("click");
			objThumbs.off("touchend");
			g_objGallery.on(g_gallery.events.ITEM_CHANGE);
			g_thumbs.destroy();		
						
		}else{
			g_tilesDesign.destroy();
		}
		
		g_objGrid.unbind("mousedown");
		g_objGrid.unbind("touchstart");
		jQuery("body").unbind("mousemove");
		jQuery("body").unbind("touchmove");
		
		jQuery(window).add("body").unbind("touchend");
		jQuery(window).add("body").unbind("mouseup");
		
		g_objThis.off(t.events.PANE_CHANGE);
		
	}
	
	
	
	this.__________EXTERNAL_GENERAL_________ = function(){};
	
	/**
	 * set the thumb unselected state
	 */
	this.setThumbUnselected = function(objThumbWrapper){
		
		g_thumbs.setThumbUnselected(objThumbWrapper);
		
	}
	
	/**
	 * check if thmb item visible, means inside the visible part of the inner strip
	 */
	this.isItemThumbVisible = function(objItem){
		var itemIndex = objItem.index;
		var paneIndex = getPaneIndexByThumbIndex(itemIndex);
		
		if(paneIndex == g_temp.currentPane)
			return(true);
		
		return(false);
	}
	
	
	this.__________EXTERNAL_API_________ = function(){};
	
	/**
	 * get estimation of number of panes by the height of the grid.
	 */
	this.getNumPanesEstimationByHeight = function(gridHeight){
		
		if(g_temp.isTilesMode == true){
			
			var thumbHeight = g_options.tile_height;
			
		}else{
			var thumbsOptions = g_thumbs.getOptions();		
			var thumbHeight = thumbsOptions.thumb_height;
		}
		
		var numThumbs = g_thumbs.getNumThumbs();
		var numRows = Math.ceil(numThumbs / g_options.grid_num_cols);
		
		var totalHeight = numRows * thumbHeight + (numRows-1) * g_options.grid_space_between_rows;
			
		var numPanes = Math.ceil(totalHeight / gridHeight);
		
		return(numPanes);
	}
	
	/**
	 * get estimation of number of panes by the width of the grid.
	 */
	this.getNumPanesEstimationByWidth = function(gridWidth){
		
		if(g_temp.isTilesMode){
			var thumbWidth = g_options.tile_width;			
		}else{
			var thumbsOptions = g_thumbs.getOptions();		
			var thumbWidth = thumbsOptions.thumb_width;
		}
		
		var numThumbs = g_thumbs.getNumThumbs();
		var numCols = Math.ceil(numThumbs / g_options.grid_num_rows);
		
		var totalWidth = numCols * thumbWidth + (numCols-1) * g_options.grid_space_between_cols;
		
		var numPanes = Math.ceil(totalWidth / gridWidth);
				
		return(numPanes);
	}
	
	
	/**
	 * get height estimation by width, works only in tiles mode
	 */
	this.getHeightEstimationByWidth = function(width){
		
		if(g_temp.isTilesMode == false)
			throw new Error("This function works only with tiles mode");
		
		var numThumbs = g_thumbs.getNumThumbs();
		var numCols = g_functions.getNumItemsInSpace(width, g_options.tile_width, g_options.grid_space_between_cols);
		var numRows = Math.ceil(numThumbs / numCols);
		
		if(numRows > g_options.grid_num_rows)
			numRows = g_options.grid_num_rows;
		
		var gridHeight = g_functions.getSpaceByNumItems(numRows, g_options.tile_height, g_options.grid_space_between_rows);
		gridHeight += g_options.grid_padding * 2;
		
		return(gridHeight);
	}
	
	/**
	 * get the grid element
	 */
	this.getElement = function(){
		return(g_objGrid);
	}
	
	/**
	 * get element size and position
	 */
	this.getSize = function(){
		
		var objSize = g_functions.getElementSize(g_objGrid);
		return(objSize);
		
	}
	
	/**
	 * get number of panes
	 */
	this.getNumPanes = function(){
		
		return(g_temp.numPanes);
	}
	
	/**
	 * get if the current pane is first
	 */
	this.isFirstPane = function(){
		
		if(g_temp.currentPane == 0)
			return(true);
		
		return(false);
	}
	
	
	/**
	 * get if the current pane is last
	 */
	this.isLastPane = function(){
		
		if(g_temp.currentPane == (g_temp.numPanes -1) )
			return(true);
		
		return(false);
	}
	
	
	/**
	 * get pane number, and num panes
	 */
	this.getPaneInfo = function(){
		
		var obj = {
			pane: g_temp.currentPane,
			total: g_temp.numPanes
		};
		
		return(obj);
	}
	
	
	/**
	 * get current pane
	 */
	this.getPane = function(){
		
		return(g_temp.currentPane);
	}
	
	
	/**
	 * set grid width (horizontal type)
	 */
	this.setWidth = function(gridWidth){
		g_temp.gridWidth = gridWidth;
		g_temp.isHorizontal = true;
	}
	
	/**
	 * set max width, the width will be corrected by the number of items
	 * set vertical type
	 */
	this.setMaxWidth = function(maxWidth){
		g_temp.gridWidth = maxWidth;
		g_temp.isMaxWidth = true;
		g_temp.isHorizontal = true;
	}
	
	
	/**
	 * set grid height (vertical type)
	 */
	this.setHeight = function(gridHeight){
		g_temp.gridHeight = gridHeight;
		g_temp.isHorizontal = false;
		
	}
	
	/**
	 * set max height, the height will be corrected by the number of items
	 * set the vertical type
	 */
	this.setMaxHeight = function(maxHeight){
		g_temp.gridHeight = maxHeight;
		g_temp.isMaxHeight = true;
		g_temp.isHorizontal = false;
	}
	
	
	/**
	 * goto some pane
	 * force skip current pane checks
	 */
	this.gotoPane = function(index, fromWhere){
		
		if(validatePaneIndex(index) == false)
			return(false);
		
		if(index == g_temp.currentPane)
			return(false);
		
		var innerPos = -g_temp.arrPanes[index];
		
		g_temp.currentPane = index;
		animateInnerTo(innerPos);
		
		//trigger pane change event
		g_objThis.trigger(t.events.PANE_CHANGE, index);
	}
	
	
	/**
	 * foreward to the next pane
	 */
	this.nextPane = function(){
				
		var nextPaneIndex = g_temp.currentPane+1;
		
		if(nextPaneIndex >= g_temp.numPanes){
			
			if(g_options.grid_carousel == false)
				return(true);
			
			nextPaneIndex = 0;
		}
		
		t.gotoPane(nextPaneIndex, "next");
	}
	
	
	/**
	 * foreward to the next pane
	 */
	this.prevPane = function(){
		
		var prevPaneIndex = g_temp.currentPane-1;
		if(prevPaneIndex < 0){
			prevPaneIndex = g_temp.numPanes-1;
			
			if(g_options.grid_carousel == false)
				return(false);
		}
		
		t.gotoPane(prevPaneIndex, "prev");
	}
	
	
	/**
	 * set next pane button
	 */
	this.attachNextPaneButton = function(objButton){
		
		g_functions.setButtonOnClick(objButton, t.nextPane);

		if(g_options.grid_carousel == true)		
			return(true);
		
		if(t.isLastPane())
			objButton.addClass("ug-button-disabled");
		
		//set disabled button class if first pane
		g_objThis.on(t.events.PANE_CHANGE, function(){
			
			if(t.isLastPane())
				objButton.addClass("ug-button-disabled");
			else
				objButton.removeClass("ug-button-disabled");
	
		});
		
	}
	
	
	/**
	 * set prev pane button
	 */
	this.attachPrevPaneButton = function(objButton){
				
		g_functions.setButtonOnClick(objButton, t.prevPane);
		
		if(g_options.grid_carousel == true)		
			return(true);
		
		if(t.isFirstPane())
			objButton.addClass("ug-button-disabled");
		
		//set disabled button class if first pane
		g_objThis.on(t.events.PANE_CHANGE, function(){
			
			if(t.isFirstPane())
				objButton.addClass("ug-button-disabled");
			else
				objButton.removeClass("ug-button-disabled");
	
		});
		
	}
	
	
	/**
	 * attach bullets object
	 */
	this.attachBullets = function(objBullets){
		
		objBullets.setActive(g_temp.currentPane);
		
		jQuery(objBullets).on(objBullets.events.BULLET_CLICK, function(data, numBullet){
			t.gotoPane(numBullet, "theme");
			objBullets.setActive(numBullet);				
		});
		
		jQuery(t).on(t.events.PANE_CHANGE, function(data, numPane){
			objBullets.setActive(numPane);
		});
		
	}
	
	
	/**
	 * get tile design object
	 */
	this.getObjTileDesign = function(){
		return g_tilesDesign;
	}
	
	
	/**
	 * init function 
	 */
	this.init = function(gallery, customOptions, isTilesMode){
		
		init(gallery, customOptions, isTilesMode);
	}
	
		
	
	/**
	 * set html and properties
	 */	
	this.run = function(){
		run();
	}

	
	/**
	 * set html 
	 */
	this.setHtml = function(parentContainer){
		
		setHtml(parentContainer);
	}
	
}


