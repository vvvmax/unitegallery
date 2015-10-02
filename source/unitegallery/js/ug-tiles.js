/**
 * tiles class
 */
function UGTiles(){

	var t = this, g_objThis = jQuery(this);
	var g_gallery = new UniteGalleryMain(), g_objGallery, g_objWrapper, g_objParent;	
	var g_functions = new UGFunctions(), g_arrItems, g_objTileDesign = new UGTileDesign();
	var g_thumbs = new UGThumbsGeneral(), g_vars = {};
	
	var g_options = {
		 tiles_type: "columns",					//columns / justified - tiles layout type
		 tiles_col_width: 250,					//column width - exact or base according the settings
		 tiles_align:"center",					//align of the tiles in the space
		 tiles_exact_width: false,				//exact width of column - disables the min and max columns
		 tiles_space_between_cols: 3,			//space between images
		 tiles_space_between_cols_mobile: 3,    //space between cols for mobile type
		 tiles_include_padding: true,			//include padding at the sides of the columns, equal to current space between cols
		 tiles_min_columns: 2,					//min columns
		 tiles_max_columns: 0,					//max columns (0 for unlimited)
		 tiles_keep_order: false,				//keep order - slower algorytm
		 
		 tiles_justified_row_height: 150,	//base row height of the justified type
		 tiles_justified_space_between: 3,	//space between the tiles justified type

		 tiles_set_initial_height: true,	//set some estimated height before images show
		 tiles_enable_transition: true		//enable transition when screen width change

	};
	
	this.events = {
			THUMB_SIZE_CHANGE: "thumb_size_change",
			TILES_FIRST_PLACED: "tiles_first_placed"		//only in case of justified
	};
	
	var g_temp = {
			isFirstTimeRun:true,   //if run once
			handle:null,		   //interval handle
			isTransActive: false,  //is transition active
			arrWaitList: []	   //waiting list array
	};
	
	
	/* ---------- GENERAL ---------- */
	
	
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
				
		g_objTileDesign.init(gallery, g_options);
		
		g_thumbs = g_objTileDesign.getObjThumbs();
		
		modifyOptions();
	}
	
	
	/**
	 * modify options
	 */
	function modifyOptions(){
		
		if(g_options.tiles_min_columns < 1)
			g_options.tiles_min_columns = 1;
		
		//protection of max columns, can't be more then min columns
		if(g_options.tiles_max_columns != 0 && g_options.tiles_max_columns < g_options.tiles_min_columns){
			g_options.tiles_max_columns = g_options.tiles_min_columns;
		}
		
	}
	
	
	/**
	 * set the grid panel html
	 */
	function setHtml(objParent){
		
		if(!objParent)
			var objParent = g_objWrapper;
		
		g_objParent = objParent;
		
		var tilesType = g_options.tiles_type;
		objParent.addClass("ug-tiletype-"+tilesType);
		
		g_objTileDesign.setHtml(objParent);
		
		objParent.children(".ug-thumb-wrapper").hide();
	}
	
	
	/**
	 * set class that enables transition
	 */
	function setTransition(){
		
		//add css tansition
		if(g_options.tiles_enable_transition == true){
			g_objParent.addClass("ug-tiles-transit");
			
			//add image overlay transition
			var optionsTile = g_objTileDesign.getOptions();
			
			if(optionsTile.tile_enable_image_effect == true && optionsTile.tile_image_effect_reverse == false)
				g_objParent.addClass("ug-tiles-transit-overlays");
		
			g_temp.isTransActive = true;
		}
		
	}
	
	
	/**
	 * get parent width
	 */
	function getParentWidth(){
		return g_functions.getElementSize(g_objParent).width;
	}
	
	
	/**
	 * do some actions before transition
	 */
	function doBeforeTransition(){

		//prepare for transition
		if(g_temp.isTransActive == false)
			return(false);
		
		g_objTileDesign.disableEvents();
	}
	
	
	/**
	 * do some actions after transition
	 */
	function doAfterTransition(){

		if(g_temp.isTransActive == true){
			
			//trigger size change after transition
			setTimeout(function(){
				
				g_objTileDesign.enableEvents();
				g_objTileDesign.triggerSizeChangeEventAllTiles();
				
			}, 800);
			
			//control size change 
			if(g_temp.handle)
				clearTimeout(g_temp.handle);
				
			g_temp.handle = setTimeout(function(){
				
				g_objTileDesign.triggerSizeChangeEventAllTiles();
				g_temp.handle = null;
								
			}, 2000);
			
			
		}else{
			
			g_objTileDesign.triggerSizeChangeEventAllTiles();

		}

	}

	
	/* ---------- COLUMN_TYPE_RELATED ---------- */
	
	/**
	 * count width by number of columns
	 */
	function fillTilesVars_countWidthByCols(){

		g_vars.colWidth = (g_vars.availWidth - g_vars.colGap * (g_vars.numCols-1)) / g_vars.numCols;
		g_vars.colWidth = Math.floor(g_vars.colWidth);

		g_vars.totalWidth = g_functions.getSpaceByNumItems(g_vars.numCols, g_vars.colWidth, g_vars.colGap);
		
	}
	
	
	
	/**
	 * fill common tiles vars
	 */
	function fillTilesVars(){

		g_vars.colWidth = g_options.tiles_col_width;
		g_vars.minCols = g_options.tiles_min_columns;
		
		if(g_gallery.isMobileMode() == false){
			g_vars.colGap = g_options.tiles_space_between_cols;
		} else {
			g_vars.colGap = g_options.tiles_space_between_cols_mobile;
		}
		
		//set gallery width
		g_vars.galleryWidth = getParentWidth();
		
		g_vars.availWidth = g_vars.galleryWidth;
		
		if(g_options.tiles_include_padding == true)
			g_vars.availWidth = g_vars.galleryWidth - g_vars.colGap*2;
		
		//set the column number by exact width
		if(g_options.tiles_exact_width == true){
			
			g_vars.numCols = g_functions.getNumItemsInSpace(g_vars.availWidth, g_vars.colWidth, g_vars.colGap);

			if(g_vars.maxCols > 0 && g_vars.numCols > g_vars.maxCols)
				g_vars.numCols = g_vars.maxCols;

			//if less then min cols count width by cols
			if(g_vars.numCols < g_vars.minCols){
				g_vars.numCols = g_vars.minCols;

				fillTilesVars_countWidthByCols();
				
			}else{
				g_vars.totalWidth = g_vars.numCols * (g_vars.colWidth + g_vars.colGap) - g_vars.colGap;
			}
			
		} else {
			
			//set dynamic column number
			
			var numCols = g_functions.getNumItemsInSpaceRound(g_vars.availWidth, g_vars.colWidth, g_vars.colGap);
						
			if(numCols < g_vars.minCols)
				numCols = g_vars.minCols;
			else
				if(g_vars.maxCols != 0 && numCols > g_vars.maxCols)
					numCols = g_vars.maxCols;

			g_vars.numCols = numCols;
			
			fillTilesVars_countWidthByCols();
			
		}

		switch(g_options.tiles_align){
			case "center":
			default:
				//add x to center point
				g_vars.addX = Math.round( (g_vars.galleryWidth - g_vars.totalWidth) / 2 );
			break;
			case "left":
				g_vars.addX = 0;
			break;
			case "right":
				g_vars.addX = g_vars.galleryWidth - g_vars.totalWidth;
			break;
		}
		
		g_vars.maxColHeight = 0;
		
		//get posx array (constact to all columns)
		g_vars.arrPosx = [];		
		for(col = 0; col < g_vars.numCols; col++){
			var colX = g_functions.getColX(col, g_vars.colWidth, g_vars.colGap);
			
			g_vars.arrPosx[col] = colX + g_vars.addX;
		}
		
		
		//empty heights array
		g_vars.colHeights = [0];

	}
	
	
	
	
	
	/**
	 * get column with minimal height
	 */
	function getTilesMinCol(){
		var numCol = 0;
		
		var minHeight = 999999999;
		
		for(col = 0; col < g_vars.numCols; col++){
			
			if(g_vars.colHeights[col] == undefined || g_vars.colHeights[col] == 0)
				return col;
			
			if(g_vars.colHeights[col] < minHeight){
				numCol = col;
				minHeight = g_vars.colHeights[col];
			}
		
		}
		
		return(numCol);
	}
	
	
	/**
	 * place tile as it loads
	 */
	function placeTile(objTile, toShow, setGalleryHeight, numCol){
		
		if(numCol === null || typeof numCol == "undefined")
			var numCol = getTilesMinCol();
		
		//set posy
		var posy = 0;
		if(g_vars.colHeights[numCol] !== undefined)
			posy = g_vars.colHeights[numCol];
		
		var itemHeight = g_objTileDesign.getTileHeightByWidth(objTile, g_vars.colWidth);
		
		var posx = g_vars.arrPosx[numCol];
		
		g_functions.placeElement(objTile, posx, posy);
		
		var realHeight = posy + itemHeight;
		
		g_vars.colHeights[numCol] = realHeight + g_vars.colGap;
		
		//set max height
		if(g_vars.maxColHeight < realHeight)
			g_vars.maxColHeight = realHeight;
		
		if(toShow == true)
			objTile.show();
		
		if(setGalleryHeight == true){
			g_objParent.height(g_vars.maxColHeight);			
		}
		
	}
	
	
	/**
	 * place the tiles
	 */
	function placeTiles(toShow){

		if(!toShow)
			toShow = false;
		
		fillTilesVars();
		
		var objThumbs = g_thumbs.getThumbs();
		
		//do some operation before the transition
		doBeforeTransition();

		//resize all thumbs
		g_objTileDesign.setAllTilesWidth(g_vars.colWidth);
		
		//place elements
		for(var index = 0; index < objThumbs.length; index++){
			var objTile = jQuery(objThumbs[index]);
			var col = undefined;
			if(g_options.tiles_keep_order == true)
				col = g_functions.getColByIndex(g_vars.numCols, index);
			
			placeTile(objTile, toShow, false, col);
		}
		
		//bring back the state after transition
		doAfterTransition();
		
		//set gallery height, according the transition
		var galleryHeight = g_objParent.height();
		
		if(g_temp.isTransActive == true && galleryHeight > g_vars.maxColHeight)
			setTimeout(function(){
				g_objParent.height(g_vars.maxColHeight);
			},700);
		else
			g_objParent.height(g_vars.maxColHeight);
	}
	
	
	/**
	 * check if alowed to place ordered tile
	 */
	function isOrderedTilePlaceAlowed(objTile){
		
		var index = objTile.index();
		var prevIndex = g_functions.getPrevRowSameColIndex(index, g_vars.numCols);

		if(prevIndex < 0)
			return(true);
		
		//check if previous tile in column is placed
		var objPrevItem = g_gallery.getItem(prevIndex);
		if(objPrevItem.ordered_placed === true)
			return(true);
		
		return(false);
	}
	
	
	/**
	 * place ordered tile
	 */
	function placeOrderedTile(objTile, isForce){
		
		if(isForce !== true){

			var isAlowed = isOrderedTilePlaceAlowed(objTile);
			
			if(isAlowed == false)
				return(false);
			
		}
			
		var index = objTile.index();
				
		var col = g_functions.getColByIndex(g_vars.numCols, index);
		
		placeTile(objTile, true, true, col);
		
		var objItem = g_gallery.getItem(index);
		objItem.ordered_placed = true;
					
		objTile.fadeTo(0,1);
		g_objTileDesign.triggerSizeChangeEvent(objTile);
		
		//check by recursion and place next items in column
		var numItems = g_gallery.getNumItems();
		var nextIndex = g_functions.getNextRowSameColIndex(index, g_vars.numCols);
		if(nextIndex >= numItems)
			return(false);
		
		var nextTile = g_thumbs.getThumbByIndex(nextIndex);
		var nextItem = g_gallery.getItem(nextIndex);
		
		if(g_thumbs.isThumbLoaded(nextTile) && !nextItem.ordered_placed)
			placeOrderedTile(nextTile, true);
	}
	
	
	/**
	 * on single image load
	 */
	function onSingleImageLoad(objImage, isError){
		
		if(isError == true)
			return(false);
		
		objImage = jQuery(objImage);
		var objTile = jQuery(objImage).parent();
		
		g_thumbs.triggerImageLoadedEvent(objTile, objImage);
		
		if(g_options.tiles_keep_order == true){

			placeOrderedTile(objTile);
		
		}else{
			placeTile(objTile, true, true);
			objTile.fadeTo(0,1);
			g_objTileDesign.triggerSizeChangeEvent(objTile);
		}
	
	}
	
	
	
	/**
	 * run columns type
	 */
	function runColumnsType(){

		var objThumbs = g_thumbs.getThumbs();
		
		fillTilesVars();
		
		var diffWidth = Math.abs(g_vars.galleryWidth - g_vars.totalWidth);
		
		//set initial height of the parent by estimation
		if(g_options.tiles_set_initial_height == true && g_functions.isScrollbarExists() == false && diffWidth < 25){
			var numThumbs = objThumbs.length;
			var numRows = Math.ceil(objThumbs.length / g_vars.numCols);
			var estimateHeight = numRows * g_options.tiles_col_width * 0.75;
			g_objParent.height(estimateHeight);
			fillTilesVars();
		}
		
		//resize the thumbs
		objThumbs.css("width",g_vars.colWidth + "px");
		objThumbs.fadeTo(0,0);

		var initNumCols = g_vars.numCols;
		var initWidth = g_vars.galleryWidth;
		var objImages = jQuery(g_objParent).find("img.ug-thumb-image");
		
		var isFirstPlace = false;
		
		//on place the tile as it loads. After all tiles loaded,check position again.
		g_functions.checkImagesLoaded(objImages, function(){
					
			fillTilesVars();
						
			
			if(initNumCols != g_vars.numCols || initWidth != g_vars.galleryWidth)
				placeTiles(false);
			
			setTransition();
			
		} ,function(objImage, isError){
			
			if(isFirstPlace == false)
				g_objThis.trigger(t.events.TILES_FIRST_PLACED);
			
			isFirstPlace = true;
			
			onSingleImageLoad(objImage, isError);
		
		});
	}
	
	
	/* ---------- JUSTIFIED_TYPE_RELATED ---------- */

	/**
	 * ------------ JUSTIFIED TYPE RELATED FUNCTIONS ----------------
	 */
	
	function getJustifiedData(){
		
		var galleryWidth = getParentWidth();
		
		var objTiles = g_thumbs.getThumbs();
		var rowHeightOpt = g_options.tiles_justified_row_height;
		var arrWidths = [];
		var totalWidth = 0;
		var gap = g_options.tiles_justified_space_between;
		var numTiles = objTiles.length;
		
		//get arr widths and total width
		jQuery.each(objTiles, function(index, objTile){
			objTile = jQuery(objTile);
			
			var objImage = g_objTileDesign.getTileImage(objTile);
			var objItem = g_thumbs.getItemByThumb(objTile);
			
			var tileWidth = objItem.thumbWidth;
			var tileHeight = objItem.thumbHeight;
			
			if (tileHeight !== rowHeightOpt) 
				tileWidth = Math.floor(objItem.thumbRatioByWidth * rowHeightOpt);
			
			arrWidths[index] = tileWidth;
			
			totalWidth += tileWidth;
		});

		
		var numRows = Math.ceil(totalWidth / galleryWidth);
		
		if(numRows > numTiles)
			numRows = numTiles;
		
		var finalRowWidth = totalWidth / numRows;
		
		//fill rows array, break tiles to rows
		var arrRows = [], eachRowWidth = 0;
		var rowsWidths = [], rowsTiles = [], row = [];
		var progressWidth = 0, numRow = 0;
		
		jQuery.each(objTiles, function(index, objTile){
			var tileWidth = arrWidths[index];
						
			if( (progressWidth + tileWidth / 2) > (numRow+1) * finalRowWidth){
				
				rowsWidths[arrRows.length] = eachRowWidth;				
				arrRows.push(row);
				row = [];
				eachRowWidth = 0;
				numRow++;
			}
			
			progressWidth += tileWidth;
			eachRowWidth += tileWidth;
			
			row.push(objTile);
		});
		
		rowsWidths[arrRows.length] = eachRowWidth;
		arrRows.push(row);
				
		
		//set heights and position images:	
		var arrRowWidths = [];
		var arrRowHeights = [];
		var totalHeight = 0;
		
		jQuery.each(arrRows, function(index, row){
			
			var numTiles = row.length;
			var rowWidth = rowsWidths[index];
			
			var gapWidth = (row.length-1) * gap;

			var ratio = (galleryWidth - gapWidth) / rowWidth;
			var rowHeight = Math.round(rowHeightOpt * ratio);
			
			//count total height
			totalHeight += rowHeight;
			if(index > 0)
				totalHeight += gap;
			
			arrRowHeights.push(rowHeight);
			
			//ratio between 2 heights for fixing image width:
            var ratioHeights = rowHeight / rowHeightOpt;
			
            //set tiles sizes:
            var arrRowTileWidths = [];
            var actualRowWidth = gapWidth;
            
            jQuery.each(row, function(indexInRow, tile){
            	var objTile = jQuery(tile);
            	var tileIndex = objTile.index();
            	var tileWidth = arrWidths[tileIndex];
            	var newWidth = Math.round(tileWidth * ratioHeights);
            	
            	arrRowTileWidths[indexInRow] = newWidth;
            	actualRowWidth += newWidth;            	
            });
        	
            //fix images widths by adding or reducing 1 pixel
            var diff = actualRowWidth - galleryWidth;
            
            var newTotal = 0;
            jQuery.each(arrRowTileWidths, function(indexInRow, width){
            	
            	if(diff == 0)            		
            		return(false);
            	
            	if(diff < 0){
            		arrRowTileWidths[indexInRow] = width + 1;
            		diff++;
            	}else{
            		arrRowTileWidths[indexInRow] = width - 1;
            		diff--;
            	}
            	
            	//if at last item diff stays, add all diff
            	if(indexInRow == (arrRowTileWidths.length-1) && diff != 0)
            		arrRowTileWidths[indexInRow] -= diff;
            });
            
            arrRowWidths[index] = arrRowTileWidths;
		});
		
		
		var objData = {
				arrRows: arrRows,
				arrRowWidths: arrRowWidths,
				arrRowHeights: arrRowHeights,
				gap: gap,
				totalHeight: totalHeight
		};
		
		return(objData);
	}

	
	/**
	 * put justified images
	 */
	function placeJustified(toShow){
		
		if(!toShow)
			var toShow = false;
		
		var parentWidth = getParentWidth();

		var objData = getJustifiedData();
		
		//if the width changed after height change (because of scrollbar), recalculate
		g_objParent.height(objData.totalHeight);
	
		var parentWidthAfter = getParentWidth();
		if(parentWidthAfter != parentWidth)
			objData = getJustifiedData();
		
		doBeforeTransition();
		
		var posy = 0;
		var totalWidth = 0;		//just count total widht for check / print
		jQuery.each(objData.arrRows, function(index, row){
        	
			var arrRowTileWidths = objData.arrRowWidths[index];
			var rowHeight = objData.arrRowHeights[index];
			
			//resize and place tiles
            var posx = 0;
            jQuery.each(row, function(indexInRow, tile){
            	            	            	
            	var objTile = jQuery(tile);
            	var tileHeight = rowHeight;
            	var tileWidth = arrRowTileWidths[indexInRow];
            	
            	g_objTileDesign.resizeTile(objTile, tileWidth, tileHeight);
            	g_functions.placeElement(objTile, posx, posy);
            	
            	posx += tileWidth;
            	
            	if(posx > totalWidth)
            		totalWidth = posx;
            	
            	posx += objData.gap;
            	
            	if(toShow == true)
            		jQuery(tile).show();
            
            });
            
            posy += (rowHeight + objData.gap);
            
		});
		
		doAfterTransition();
		
	}
	
	
	
	/**
	 * run justified type gallery
	 */
	function runJustifiedType(){
		
		var objImages = jQuery(g_objWrapper).find("img.ug-thumb-image");
		var objTiles = g_thumbs.getThumbs();
		
		objTiles.fadeTo(0,0);				
		
		g_functions.checkImagesLoaded(objImages, function(){
			
			setTimeout(function(){
				placeJustified(true);
				objTiles.fadeTo(0,1);
				g_objThis.trigger(t.events.TILES_FIRST_PLACED);
				setTransition();
			});
			
		}, function(objImage, isError){

			objImage = jQuery(objImage);
			var objTile = jQuery(objImage).parent();
			g_thumbs.triggerImageLoadedEvent(objTile, objImage);
		
		});
				
	}
	

	/**
	 * run the gallery after init and set html
	 */
	function run(){
		
		//show tiles
		g_objWrapper.children(".ug-tile").show();
		
		g_objTileDesign.run();
				
		switch(g_options.tiles_type){
			default:
			case "columns":
				runColumnsType();
			break;
			case "justified":
				runJustifiedType();
			break;
		}
		
		if(g_temp.isFirstTimeRun == true){
			initEvents();
		}
		
		g_temp.isFirstTimeRun = false;
	}
	
		
	
	/* ---------- EVENTS ---------- */
	
	/**
	 * on resize event
	 */
	function onResize(){
		
		if(g_temp.isFirstTimeRun == true)
			return(true);
			
		switch(g_options.tiles_type){
			case "columns":
				placeTiles(false);
			break;
			case "justified":
				placeJustified(false);
			break;
		}
		
	}

	
	/**
	 * init panel events
	 */
	function initEvents(){
		
		g_objGallery.on(g_gallery.events.SIZE_CHANGE, onResize);
		
		g_objTileDesign.initEvents();
				
	}
	
	/**
	 * destroy the events
	 */
	this.destroy = function(){
		
		g_objGallery.off(g_gallery.events.SIZE_CHANGE);
		g_objTileDesign.destroy();
	}
	
	
	/**
	 * init function for avia controls
	 */
	this.init = function(gallery, customOptions){
		
		init(gallery, customOptions);
	}

	
	/**
	 * set html
	 */
	this.setHtml = function(objParent){
		setHtml(objParent);
	}
	
	/**
	 * get tile design object
	 */
	this.getObjTileDesign = function(){
		return(g_objTileDesign);
	}
	
	/**
	 * set html and properties
	 */	
	this.run = function(){
		run();
	}
	
	
}


