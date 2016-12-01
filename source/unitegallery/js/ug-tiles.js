/**
 * tiles class
 */
function UGTiles(){

	var t = this, g_objThis = jQuery(this);
	var g_gallery = new UniteGalleryMain(), g_objGallery, g_objWrapper, g_objParent;	
	var g_functions = new UGFunctions(), g_arrItems, g_objTileDesign = new UGTileDesign();
	var g_thumbs = new UGThumbsGeneral(), g_vars = {};
    var g_arrNestedGridRow, g_arrNestedItems;
	
	
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
		 tiles_set_initial_height: true,		//set some estimated height before images show
		 
		 tiles_justified_row_height: 150,		//base row height of the justified type
		 tiles_justified_space_between: 3,		//space between the tiles justified type

		 tiles_nested_optimal_tile_width: 250,	// tiles optimal width
	     tiles_nested_col_width: null,			// nested tiles column width
	     tiles_nested_debug: false,
	     
		 tiles_enable_transition: true			//enable transition when screen width change
	};
	
	this.events = {
			THUMB_SIZE_CHANGE: "thumb_size_change",
			TILES_FIRST_PLACED: "tiles_first_placed",		//only in case of justified
			ALL_TILES_LOADED: "all_tiles_loaded"
	};
	
	var g_temp = {
			isFixedMode: false,   //is tiles is custom sized, not related to the images that inside
			isFirstTimeRun:true,   //if run once
			handle:null,		   //interval handle
			isTransActive: false,  //is transition active
			isTransInited: false,  //if the transition function is set
			isAllLoaded: false
	};
	
    var g_nestedWork = {
    		colWidth: null,
            nestedOptimalCols: 5,
            gridY: 0,
            maxColumns: 0,						 //maxColumns
            columnsValueToEnableHeightResize: 3, //columns Value To Enable Height Resize
            resizeLeftRightToColumn: true,
            currentItem: 0,
	        currentGap: null,
	        optimalTileWidth: null,
	        maxGridY:0
    }
	
	
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

		modifyOptions();
		
		g_objTileDesign.init(gallery, g_options);
		
		g_thumbs = g_objTileDesign.getObjThumbs();
		
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
		
		//set the tiles in resting mode, to activate their own transitions
		g_objParent.addClass("ug-tiles-rest-mode");
		
		g_temp.isTransInited = true;
		
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
		
		if(g_temp.isTransInited == false)
			return(false);
			
		g_objParent.addClass("ug-tiles-transition-active");
		g_objParent.removeClass("ug-tiles-rest-mode");
		
		//prepare for transition
		if(g_temp.isTransActive == false)
			return(false);
				
		g_objTileDesign.disableEvents();
	}
	
	
	/**
	 * set after transition classes
	 */
	function doAfterTransition_setClasses(){
		
		if(g_temp.isTransInited == false)
			return(false);
		
		g_objParent.removeClass("ug-tiles-transition-active");
		g_objParent.addClass("ug-tiles-rest-mode");
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
				
				doAfterTransition_setClasses();
				

			}, 800);
			
			//control size change 
			if(g_temp.handle)
				clearTimeout(g_temp.handle);
				
			g_temp.handle = setTimeout(function(){
				
				doAfterTransition_setClasses();
				
				g_objTileDesign.triggerSizeChangeEventAllTiles();
				g_temp.handle = null;
								
			}, 2000);
			
			
		}else{
						
			g_objTileDesign.triggerSizeChangeEventAllTiles();

			doAfterTransition_setClasses();

		}

	}

	
	function __________COLUMN_TYPE_RELATED_________(){};
	
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
		g_vars.maxCols = g_options.tiles_max_columns;
		
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
		
		var itemHeight = g_objTileDesign.getTileHeightByWidth(g_vars.colWidth, objTile, "placeTile");
		
		if(itemHeight === null){	//for custom html tile
			if(g_options.tiles_enable_transition == true)
				throw new Error("Can't know tile height, please turn off transition");
			
			var itemSize = g_functions.getElementSize(objTile);
			itemHeight = itemSize.height;
		}
		
		var posx = g_vars.arrPosx[numCol];
		
		g_functions.placeElement(objTile, posx, posy);
		
		var realHeight = posy + itemHeight;
				
		g_vars.colHeights[numCol] = realHeight + g_vars.colGap;
		
		//set max height
		if(g_vars.maxColHeight < realHeight)
			g_vars.maxColHeight = realHeight;

		if(toShow == true)
			objTile.show().fadeTo(0,1);
		
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
		g_objTileDesign.resizeAllTiles(g_vars.colWidth, g_objTileDesign.resizemode.VISIBLE_ELEMENTS);
		
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

		//don't allow double put items
		var currentItem = g_gallery.getItem(index);
		if(currentItem.ordered_placed === true)
			return(false);

		
		var prevIndex = g_functions.getPrevRowSameColIndex(index, g_vars.numCols);

		//put first item in the column
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

		var objItem = g_gallery.getItem(index);
				
		g_objTileDesign.resizeTile(objTile, g_vars.colWidth);
		
		placeTile(objTile, true, true, col);
		
		objItem.ordered_placed = true;
		
		//check by recursion and place next items in column
		var numItems = g_gallery.getNumItems();
		var nextIndex = g_functions.getNextRowSameColIndex(index, g_vars.numCols);
		if(nextIndex >= numItems)
			return(false);
		
		var nextTile = g_thumbs.getThumbByIndex(nextIndex);
		var nextItem = g_gallery.getItem(nextIndex);
		
		var isLoaded = g_thumbs.isThumbLoaded(nextTile);
		
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
			
			g_objTileDesign.resizeTile(objTile, g_vars.colWidth);
			placeTile(objTile, true, true);
		}
	
	}
	
	
	
	/**
	 * run columns type
	 */
	function runColumnsType(){
		
		var objThumbs = g_thumbs.getThumbs();
		
		g_temp.isAllLoaded = false;
		
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
		
		
		objThumbs.fadeTo(0,0);
		var objImages = jQuery(g_objParent).find("img.ug-thumb-image");

		
		if(g_temp.isFixedMode == true){		//fixed mode type - just place tiles before images loaded
			
			g_objThis.trigger(t.events.TILES_FIRST_PLACED);
			
			placeTiles(true);
			
			g_functions.checkImagesLoaded(objImages, function(){
				setTransition();
				g_objThis.trigger(t.events.ALL_TILES_LOADED);
			});
			
		}else{	//dynamic size type
			
			var initNumCols = g_vars.numCols;
			var initWidth = g_vars.galleryWidth;
			var isFirstPlace = false;
			
			//on place the tile as it loads. After all tiles loaded,check position again.
			g_functions.checkImagesLoaded(objImages, function(){
								
				fillTilesVars();
				
				if(initNumCols != g_vars.numCols || initWidth != g_vars.galleryWidth){
					placeTiles(false);
				}
				
				setTransition();
				
				g_objThis.trigger(t.events.ALL_TILES_LOADED);
				
			} ,function(objImage, isError){
				
				if(isFirstPlace == false)
					g_objThis.trigger(t.events.TILES_FIRST_PLACED);
				
				isFirstPlace = true;
				
				onSingleImageLoad(objImage, isError);
			
			});
			
		}//end dynamic mode type
		
		
	}
	
	
	function __________JUSTIFIED_TYPE_RELATED_________(){};

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
            	
            	g_objTileDesign.resizeTile(objTile, tileWidth, tileHeight, g_objTileDesign.resizemode.VISIBLE_ELEMENTS);
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

		g_temp.isAllLoaded = false;
		
		objTiles.fadeTo(0,0);				
		
		g_functions.checkImagesLoaded(objImages, function(){
			
			setTimeout(function(){
				placeJustified(true);
				objTiles.fadeTo(0,1);
				g_objThis.trigger(t.events.TILES_FIRST_PLACED);
				setTransition();
				
				g_objThis.trigger(t.events.ALL_TILES_LOADED);
				
			});
						
		}, function(objImage, isError){

			objImage = jQuery(objImage);
			var objTile = jQuery(objImage).parent();
			g_thumbs.triggerImageLoadedEvent(objTile, objImage);
		
		});
				
	}
	

	
		
    function __________NESTED_TYPE_RELATED_________() {    };
    
    
    /**
     * ------------ NESTED TYPE RELATED FUNCTIONS ----------------
     */
    function runNestedType() {

        var objImages = jQuery(g_objWrapper).find("img.ug-thumb-image");
        var objTiles = g_thumbs.getThumbs();

        g_temp.isAllLoaded = false;
        
        objTiles.fadeTo(0, 0);

        g_functions.checkImagesLoaded(objImages, function () {
        	
        	if(g_gallery.isMobileMode() == true){
        		placeTiles(true);
        	}
        	else
        		placeNestedImages(true);
            
            g_objThis.trigger(t.events.TILES_FIRST_PLACED);
            setTransition();
			
            g_objThis.trigger(t.events.ALL_TILES_LOADED);

        }, function (objImage, isError) {

            objImage = jQuery(objImage);
            var objTile = jQuery(objImage).parent();
            g_thumbs.triggerImageLoadedEvent(objTile, objImage);

        });

    }

    
    /**
     * fill nested vars
     */
    function fillNestedVars(){

    	var galleryWidth = getParentWidth();
    	g_nestedWork.galleryWidth = galleryWidth;
        
        g_arrNestedGridRow = {};
    	g_nestedWork.colWidth = g_options.tiles_nested_col_width;
    	g_nestedWork.optimalTileWidth = g_options.tiles_nested_optimal_tile_width;
    	
    	g_nestedWork.currentGap = g_options.tiles_space_between_cols;

    	if(g_gallery.isMobileMode() == true)
            g_nestedWork.currentGap = g_options.tiles_space_between_cols_mobile;
    	
        if(g_nestedWork.colWidth == null){
			g_nestedWork.colWidth = Math.floor(g_nestedWork.optimalTileWidth/g_nestedWork.nestedOptimalCols);
		} else if (g_nestedWork.optimalTileWidth > g_nestedWork.colWidth) {
            g_nestedWork.nestedOptimalCols = Math.ceil(g_nestedWork.optimalTileWidth / g_nestedWork.colWidth);
        } else {
            g_nestedWork.nestedOptimalCols = 1;
        }
    	
    	g_nestedWork.maxColumns = g_functions.getNumItemsInSpace(galleryWidth, g_nestedWork.colWidth, g_nestedWork.currentGap);
    	
        //fix col width - justify tiles
        g_nestedWork.colWidth = g_functions.getItemSizeInSpace(galleryWidth, g_nestedWork.maxColumns, g_nestedWork.currentGap);
        
        g_nestedWork.gridY = 0;
        g_arrNestedItems = []
        
        //trace(g_nestedWork);
        
    	var objTiles = g_thumbs.getThumbs();
		objTiles.each(function(){
			var objTile = jQuery(this);
		    var sizes = setNestedSize(objTile);
		    g_arrNestedItems.push(sizes);
		 });
        
        if (g_nestedWork.optimalTileWidth > g_nestedWork.colWidth) {
            g_nestedWork.nestedOptimalCols = Math.ceil(g_nestedWork.optimalTileWidth / g_nestedWork.colWidth);
        } else {
            g_nestedWork.nestedOptimalCols = 1;
        }
        
        g_nestedWork.totalWidth = g_nestedWork.maxColumns*(g_nestedWork.colWidth+g_nestedWork.currentGap)-g_nestedWork.currentGap;

        switch(g_options.tiles_align){
			case "center":
			default:
				//add x to center point
				g_nestedWork.addX = Math.round( (g_nestedWork.galleryWidth - g_nestedWork.totalWidth) / 2 );
			break;
			case "left":
				g_nestedWork.addX = 0;
			break;
			case "right":
				g_nestedWork.addX = g_nestedWork.galleryWidth - g_nestedWork.totalWidth;
			break;
		}
        
        
        g_nestedWork.maxGridY = 0;
    }
    
    
    /**
     * place Nested type images
     */
    function placeNestedImages(toShow){
    	
    	var parentWidth = getParentWidth();
    	
    	fillNestedVars();
        placeNestedImagesCycle();
    	
        var totalHeight = g_nestedWork.maxGridY * (g_nestedWork.colWidth + g_nestedWork.currentGap) - g_nestedWork.currentGap;

    	//if the width changed after height change (because of scrollbar), recalculate
		g_objParent.height(totalHeight);
		
		var parentWidthAfter = getParentWidth();
		
		if(parentWidthAfter != parentWidth){
    		fillNestedVars();
        	placeNestedImagesCycle();
        }
        
        if(g_options.tiles_nested_debug == false)
        	drawNestedImages(toShow);

    }

    
    /**
     * set Nested size
     */
    function setNestedSize(objTile){

        var dimWidth, dimHeight;
        var output = {};
        
        var colWidth = g_nestedWork.colWidth;
        var gapWidth = g_nestedWork.currentGap;
        
        var objImageSize = g_objTileDesign.getTileImageSize(objTile);
        var index = objTile.index();
        
        var maxDim = Math.ceil(getPresettedRandomByWidth(index)*(g_nestedWork.nestedOptimalCols*1/3) + g_nestedWork.nestedOptimalCols * 2/3);
        
        var imgWidth = objImageSize.width;
        var imgHeight = objImageSize.height;
        
        var ratio = imgWidth/imgHeight;
        
        if(imgWidth>imgHeight){
            dimWidth = maxDim;
            dimHeight = Math.round(dimWidth/ratio);
            if(dimHeight == 0){
                dimHeight = 1;
            }
        } else {
            dimHeight = maxDim;
            dimWidth = Math.round(dimHeight*ratio);
            if(dimWidth == 0){
                dimWidth = 1;
            }
        }

        output.dimWidth = dimWidth;
        output.dimHeight = dimHeight;
        output.width = dimWidth * colWidth + gapWidth*(dimWidth-1);
        output.height = dimHeight * colWidth + gapWidth*(dimHeight-1);
        output.imgWidth =  imgWidth;
        output.imgHeight = imgHeight;
        output.left = 0;
        output.top = 0;
        return output;
    }

    
    /**
     *  get presetted random [0,1] from int
     */
    function getPresettedRandomByWidth(index){
        return Math.abs(Math.sin(Math.abs(Math.sin(index)*1000)));
    }

    
    /**
     * place nested images debug
     */
    function placeNestedImagesDebug(toShow, placeOne){
        
    	if(placeOne == false){
            for(var i = g_nestedWork.currentItem; i<g_arrNestedItems.length; i++){
                placeNestedImage(i, true);
            }
            g_nestedWork.currentItem = g_arrNestedItems.length-1;
        } else {
            placeNestedImage(g_nestedWork.currentItem, true);
        }
        
    	for(var i = 0; i<=g_nestedWork.currentItem; i++){
            drawNestedImage(i, true);
        }

        g_nestedWork.currentItem++;
    	
    }
    
    
    /**
     * start cycle of placing imgaes
     */
    function placeNestedImagesCycle(placeOne){
                
        if(g_options.tiles_nested_debug == true){

        	if(typeof placeOne === 'undefined')
                placeOne = true;
        	
        	placeNestedImagesDebug(true, placeOne);
        	
        	return(false);
        } 
                
        for(var i = 0; i < g_arrNestedItems.length; i++)
                placeNestedImage(i, true);
    
    }


    /**
     * place Nested Image
     */
    function placeNestedImage(tileID, toShow){

        if(!toShow)
            var toShow = false;
                
        g_nestedWork.maxColHeight = 0;

        var rowsValue = g_functions.getObjectLength(g_arrNestedGridRow);

        for(var row = g_nestedWork.gridY; row<=rowsValue+1; row++){
            for (var column = 0; column < g_nestedWork.maxColumns; column++) {
                if (isGridRowExists(g_nestedWork.gridY) == false || isGridCellTaken(g_nestedWork.gridY, column) == false) {
                    var totalFree = getTotalFreeFromPosition(column);
                    calculateOptimalStretchAndPosition(tileID, totalFree, column);
                                        
                    return;
                }
            }
            g_nestedWork.gridY++;
        }
        
    }

    
    /**
     * calculate optimal stretch of tile
     */
    function calculateOptimalStretchAndPosition(tileID, totalFree, column){

        var sizes = jQuery.extend(true, {}, g_arrNestedItems[tileID]);
        var currentWidth = sizes.dimWidth;
        var placeForNextImage = totalFree - sizes.dimWidth;
        var optimalWidth = g_nestedWork.nestedOptimalCols;
        var onlyCurrentImage = (totalFree<=sizes.dimWidth || placeForNextImage<=0.33*optimalWidth || totalFree<=optimalWidth);

        //Width stretching if needed
        if(onlyCurrentImage){	// if free space is smaller than image width - place to this space anyway
            resizeToNewWidth(tileID, totalFree);
        } else if (placeForNextImage<=optimalWidth){ // if there are place for 2 images
            if(optimalWidth>=4){
                if(isGridImageAligned(Math.floor(totalFree/2), column) == true){
                    resizeToNewWidth(tileID, Math.floor(totalFree/2)+1);
                } else {
                    resizeToNewWidth(tileID, Math.floor(totalFree/2));
                }
            } else {
                resizeToNewWidth(objImage, totalFree);
            }
        } else {
            if(isGridImageAligned(currentWidth, column) == true){
                switch(currentWidth>=optimalWidth){
                    case true:
                        resizeToNewWidth(tileID, currentWidth-1);
                        break
                    case false:
                        resizeToNewWidth(tileID, currentWidth+1);
                        break

                }
            }
        }

        //Height stretching if needed
        sizes = jQuery.extend(true, {}, g_arrNestedItems[tileID]);
        var columnInfo = getGridColumnHeight(tileID, sizes.dimWidth, column); 	// [columnHeight, imagesIDs]

        if(g_nestedWork.columnsValueToEnableHeightResize <= columnInfo[0] && g_nestedWork.maxColumns>=2*g_nestedWork.nestedOptimalCols){

            var sideHelper = getGridImageVerticalDifference(column, sizes);
            var columnSizes = resizeToNewHeight(tileID, sideHelper.newHeight, true);
            g_arrNestedItems[tileID].dimHeight = columnSizes.dimHeight;
            var columnResizes = redistributeColumnItems(columnInfo, columnSizes.dimWidth, column);
            var columnCrosshairs = getColumnCrosshairsCount(columnResizes);
            var disableColumnResizes = false;

            if(columnCrosshairs >= 2){
                disableColumnResizes = true;
            }

            if(sideHelper.newHeight>=sizes.dimHeight){
                sizes = resizeToNewHeight(tileID, sideHelper.newHeight, true);
            }
            var sideResizes = getSideResizeInfo(sideHelper.idToResize, sideHelper.newHeight, sizes.dimHeight);
            sizes.top = g_nestedWork.gridY;
            sizes.left = column;
            sideResizes.push({"tileID": tileID, "sizes": sizes});

            var sideResizesVal = calcResizeRatio(sideResizes);
            var columnResizesVal = calcResizeRatio(columnResizes);

            if(sideResizesVal<columnResizesVal || disableColumnResizes == true) {
                applyResizes(sideResizes);
                return;
            } else {
                applyResizes(columnResizes);
                return;
            }


        }
        sizes.left = column;
        sizes.top = g_nestedWork.gridY;
        g_arrNestedItems[tileID] = sizes;
        putImageToGridRow(tileID, sizes, column, g_nestedWork.gridY);
        
        g_nestedWork.maxGridY = sizes.top + sizes.dimHeight;
        
    }

    /**
     * check columns crosshairs
     */
    function getColumnCrosshairsCount(tilesAndSizes){

        var crosshairsCountR = 0;
        var crosshairsCountL = 0;

        for(var i = 0; i<tilesAndSizes.length-1; i++){

            var sizes = tilesAndSizes[i].sizes;
            var topItem = -1;
            var bottomItem = -1;
            if(isGridRowExists(sizes.top+sizes.dimHeight) && g_nestedWork.maxColumns>sizes.left+sizes.dimWidth){
                topItem = g_arrNestedGridRow[sizes.top+sizes.dimHeight-1][sizes.left+sizes.dimWidth];
                bottomItem = g_arrNestedGridRow[sizes.top+sizes.dimHeight][sizes.left+sizes.dimWidth];
            }
            if(topItem != bottomItem){
                crosshairsCountR++;
            }
        }

        for(var i = 0; i<tilesAndSizes.length-1; i++){

            var sizes = tilesAndSizes[i].sizes;
            var topItem = -1;
            var bottomItem = -1;
            if(isGridRowExists(sizes.top+sizes.dimHeight) && sizes.left-1>=0){
                topItem = g_arrNestedGridRow[sizes.top+sizes.dimHeight-1][sizes.left-1];
                bottomItem = g_arrNestedGridRow[sizes.top+sizes.dimHeight][sizes.left-1];
            }
            if(topItem != bottomItem){
                crosshairsCountL++;
            }
        }
        return Math.max(crosshairsCountL, crosshairsCountR);
    }

    /**
     * get size resize info
     */
    function getSideResizeInfo(idToResize, newHeight, dimHeight){

        var currentTile = g_arrNestedItems[idToResize];
        var	tileHeight = currentTile.dimHeight;
        var tileWidth = currentTile.dimWidth;
        var tileLeft = currentTile.left;
        var tileTop = currentTile.top;
        var tileDimTop = parseInt(tileTop / (g_nestedWork.colWidth + g_nestedWork.currentGap));
        var tileDimLeft = parseInt(tileLeft / (g_nestedWork.colWidth + g_nestedWork.currentGap));
        var newSideHeight = tileHeight - newHeight + dimHeight;

        var sideSizes = resizeToNewHeight(idToResize, newSideHeight, true);
        var output = [];
        output.push({"tileID": idToResize, "sizes": sideSizes});
        return output;
    }

    /**
     * apply resizes to fix column
     */
    function applyResizes(resizeTilesAndSizes){

        for(var i = 0; i<resizeTilesAndSizes.length; i++){
            var sizes = resizeTilesAndSizes[i].sizes;
            var tileID = resizeTilesAndSizes[i].tileID;
            g_arrNestedItems[tileID]=jQuery.extend(true, {}, sizes);
            putImageToGridRow(tileID, sizes, sizes.left, sizes.top);
        }

    }

    /**
     * redistribute heights in column
     * returns current item sizes
     */
    function redistributeColumnItems(columnInfo, columnWidth){

        var originalHeight = 0;
        var columnHeight = 0;
        var objTiles = [];
        var cordX = 0, cordY = 0;

        for(var i = 0; i<columnInfo[1].length; i++){
            var tileID = columnInfo[1][i];
            var currentTile = g_arrNestedItems[columnInfo[1][i]];
            columnHeight += currentTile.dimHeight;
            if(i==0){
                var sizes = resizeToNewWidth(tileID, columnWidth, true);
                originalHeight += sizes.dimHeight;
                objTiles.push([columnInfo[1][i], sizes.dimHeight]);
                continue;
            }
            originalHeight += currentTile.dimHeight;
            objTiles.push([tileID, currentTile.dimHeight]);
        }

        cordX = currentTile.left;
        cordY = currentTile.top;

        var tempHeight = columnHeight;
        var output = [];

        for(var i = objTiles.length-1; i>=0; i--){
            var tileID = objTiles[i][0];
            var newHeight;
            if(i != 0) {
                newHeight = Math.max(Math.round(columnHeight*1/3),Math.floor(objTiles[i][1] * (columnHeight / originalHeight)));
                tempHeight = tempHeight - newHeight;
                sizes = resizeToNewHeight(tileID, newHeight, true);
                sizes.left = cordX;
                sizes.top = cordY;
                output.push({"tileID": tileID, "sizes": sizes});
                cordY += sizes.dimHeight;
            } else {
                newHeight = tempHeight;
                sizes = resizeToNewHeight(tileID, newHeight, true);
                sizes.left = cordX;
                sizes.top = cordY;
                output.push({"tileID": tileID, "sizes": sizes});
            }
        }
        return output;
    }

    /**
     * Calculate num of objects in current column and return they are ID's
     */
    function getGridColumnHeight(tileID, dimWidth, column){
        var tempY = g_nestedWork.gridY-1;
        var curImage = 0;
        var prevImage = 0;
        var columnHeight = 1;
        var imagesIDs = [];
        var toReturn = [];
        imagesIDs.push(tileID);
        if(tempY>=0){
            prevImage = 0;
            while(tempY>=0){
                curImage = g_arrNestedGridRow[tempY][column];
                if( (typeof g_arrNestedGridRow[tempY][column-1] === 'undefined' || g_arrNestedGridRow[tempY][column-1] != g_arrNestedGridRow[tempY][column])
                    &&(typeof g_arrNestedGridRow[tempY][column+dimWidth] === 'undefined' || g_arrNestedGridRow[tempY][column+dimWidth-1] != g_arrNestedGridRow[tempY][column+dimWidth])
                    &&(g_arrNestedGridRow[tempY][column]==g_arrNestedGridRow[tempY][column+dimWidth-1])){
                    if(prevImage != curImage){
                        columnHeight++;
                        imagesIDs.push(curImage);
                    }
                } else {
                    toReturn.push(columnHeight);
                    toReturn.push(imagesIDs);
                    return toReturn;
                }
                tempY--;
                prevImage = curImage;
            }
            toReturn.push(columnHeight);
            toReturn.push(imagesIDs);
            return toReturn;
        }
        return [0, []];
    }

    /**
     * get new height based on left and right difference
     */
    function getGridImageVerticalDifference(column, sizes){
        var newHeightR = 0;
        var newHeightL = 0;
        var dimWidth = sizes.dimWidth;
        var dimHeight = sizes.dimHeight;
        var leftID = 0;
        var rightID = 0;
        var array = jQuery.map(g_arrNestedGridRow, function(value, index) {
            return [value];
        });

        if(typeof array[g_nestedWork.gridY] === 'undefined' || typeof array[g_nestedWork.gridY][column-1]=== 'undefined'){
            newHeightL = 0;
        } else {
            var tempY=0;
            while(true){
                if(typeof g_arrNestedGridRow[g_nestedWork.gridY+tempY] !== 'undefined' && g_arrNestedGridRow[g_nestedWork.gridY+tempY][column-1] != -1 ){
                    leftID = g_arrNestedGridRow[g_nestedWork.gridY+tempY][column-2];
                    tempY++;
                    newHeightL++;
                } else {
                    break;
                }
            }
        }

        if(typeof array[g_nestedWork.gridY] === 'undefined' || typeof array[g_nestedWork.gridY][column+dimWidth]=== 'undefined'){
            newHeightR = 0;
        } else {
            tempY=0;
            while(true){
                if(typeof g_arrNestedGridRow[g_nestedWork.gridY+tempY] !== 'undefined' && g_arrNestedGridRow[g_nestedWork.gridY+tempY][column+dimWidth] != -1 ){
                    rightID = g_arrNestedGridRow[g_nestedWork.gridY+tempY][column+dimWidth+1];
                    tempY++;
                    newHeightR++;
                } else {
                    break;
                }
            }
        }

        var newHeight = 0;
        var idToResize = 0;
        if(Math.abs(dimHeight - newHeightL) < Math.abs(dimHeight - newHeightR) && newHeightL != 0) {
            newHeight = newHeightL;
            idToResize = leftID;
        } else if (newHeightR !=0) {
            newHeight = newHeightR;
            idToResize = rightID;
        } else {
            newHeight = dimHeight; //malo li
        }

        var output = {"newHeight": newHeight, "idToResize": idToResize};

        return output;
    }

    /**
     * resize to new Dim width
     */
    function resizeToNewWidth(tileID, newDimWidth, toReturn) {
        if(!toReturn){
            toReturn = false;
        }
        
        var colWidth = g_nestedWork.colWidth;
        var gapWidth = g_nestedWork.currentGap;
        var currentTile = g_arrNestedItems[tileID];
        var imgWidth = currentTile.imgWidth;
        var imgHeight = currentTile.imgHeight;
        var ratio = imgWidth / imgHeight;
        dimWidth = newDimWidth;
        dimHeight = Math.round(dimWidth / ratio);
        if(toReturn == true){
            var sizes = jQuery.extend(true, {}, currentTile);
            sizes.dimWidth = dimWidth;
            sizes.dimHeight = dimHeight;
            sizes.width = dimWidth * colWidth + gapWidth * (dimWidth - 1);
            sizes.height = dimHeight * colWidth + gapWidth * (dimHeight - 1);
            return sizes;
        }
        currentTile.dimWidth = dimWidth;
        currentTile.dimHeight = dimHeight;
        currentTile.width = dimWidth * colWidth + gapWidth * (dimWidth - 1);
        currentTile.height = dimHeight * colWidth + gapWidth * (dimHeight - 1);
    }

    /**
     * resize to new height without width changing
     */
    function resizeToNewHeight(tileID, newDimHeight, toReturn) {

        if(!toReturn){
            toReturn = false;
        }

        var currentTile = g_arrNestedItems[tileID];
        var dimWidth = currentTile.dimWidth;
        var colWidth = g_nestedWork.colWidth;
        var gapWidth = g_nestedWork.currentGap;

        if(toReturn == true){
            var sizes = jQuery.extend(true, {}, currentTile);

            sizes.dimHeight = newDimHeight;
            sizes.width = dimWidth * colWidth + gapWidth * (dimWidth - 1);
            sizes.height = newDimHeight * colWidth + gapWidth * (newDimHeight - 1);
            
            return sizes;
        }

        currentTile.dimHeight = newDimHeight;
        currentTile.width = dimWidth * colWidth + gapWidth * (dimWidth - 1);
        currentTile.height = newDimHeight * colWidth + gapWidth * (newDimHeight - 1);
    }

    /**
     * calc resize koef
     */
    function calcResizeRatio(objTilesAndSizes){
        var tempResizes = 0;
        var tempNum = 0;

        for(var i = 0; i<objTilesAndSizes.length; i++){
            var sizes = g_arrNestedItems[objTilesAndSizes[i].tileID];
            if((sizes.dimHeight != 0) && (sizes.height != 0)){
                resizeVal = (sizes.dimWidth/sizes.dimHeight)/(sizes.imgWidth/sizes.imgHeight);
            } else {
                return;
            }
            if(resizeVal < 1){
                resizeVal = 1/resizeVal;
            }
            tempResizes += resizeVal;
            tempNum++;
        }
        return tempResizes/tempNum;
    }

    /**
     * check for column break
     */
    function isGridImageAligned(dimWidth, column){
        var y = g_nestedWork.gridY-1;
        if(y<=0 || isGridRowExists(y) == false){
            return false;
        }
        if(g_arrNestedGridRow[y][column+dimWidth-1]!=g_arrNestedGridRow[y][column+dimWidth]) {
            return true;
        }

        return false;
    }

    /**
     * get free line length in GridRow
     */
    function getTotalFreeFromPosition(column){
        var x = column;
        var totalFree = 0;
        if(isGridRowExists(g_nestedWork.gridY) == true){
            while(isGridCellTaken(g_nestedWork.gridY, x) == false){
                totalFree ++;
                x++;
            }
        } else {
            totalFree = g_nestedWork.maxColumns;
        }
        return totalFree;
    }

    /**
     * is nestedGridRow row exists
     */
    function isGridRowExists(y){
        if(typeof g_arrNestedGridRow[y] === 'undefined'){
            return false;
        }
        return true;
    }

    
    /**
     * put image to grid row
     */
    function putImageToGridRow(id, sizes, gridX, gridY){
        
    	for (var y = 0; y < sizes.dimHeight; y++) {
            for (var x = 0; x < sizes.dimWidth; x++) {
                if (isGridRowExists(gridY+y) == 0) {
                    addGridRow(gridY+y);
                }
                
                setGridCellValue(gridY+y, gridX+x, id);
            }
        }
    }

    /**
     * add grid with Y index
     */
    function addGridRow(y){
        g_arrNestedGridRow[y] = new Object;
        for (var t = 0; t < g_nestedWork.maxColumns; t++) {
            g_arrNestedGridRow[y][t] = -1;
        }
    }

    /**
     * isGridRowCellTaken
     */
    function isGridCellTaken(y,x){
        return (g_arrNestedGridRow[y][x] != -1);
    }

    /**
     * set nestedGridRow cell value
     */
    function setGridCellValue(y,x,value){
        g_arrNestedGridRow[y][x]=value;
    }


    /**
     * draw nested images
     */
    function drawNestedImages(toShow){
    	
        if(!toShow)
            var toShow = false;
        
        doBeforeTransition();
        
        for(var i = 0; i<g_arrNestedItems.length; i++){
            drawNestedImage(i, toShow);
        }

        g_objParent.height(g_nestedWork.maxColHeight);
        
        doAfterTransition();
    }

    
    /**
     * draw nested image
     */
    function drawNestedImage(i, toShow){
    	
        var objTile = g_thumbs.getThumbByIndex(i);

        var sizes = g_arrNestedItems[i];
        var newY = sizes.top * (g_nestedWork.colWidth + g_nestedWork.currentGap);
        var newX = g_nestedWork.addX + sizes.left * (g_nestedWork.colWidth + g_nestedWork.currentGap);
        
        g_objTileDesign.resizeTile(objTile, sizes.width, sizes.height, g_objTileDesign.resizemode.VISIBLE_ELEMENTS);
        
        g_functions.placeElement(objTile, newX, newY);
                
        if(newY + sizes.height > g_nestedWork.maxColHeight){
            g_nestedWork.maxColHeight = newY + sizes.height;
        };
        
        if(toShow == true){
            objTile.fadeTo(0, 1);
        }
        
    }
	
	
	function __________COMMON_AND_EVENTS_______(){};
	
	
	/**
	 * on resize event
	 */
	function onResize(){
		
		if(g_temp.isFirstTimeRun == true)
			return(true);
		
		if(g_temp.isAllLoaded == false)
			return(false);
		
		switch(g_options.tiles_type){
			case "columns":
				placeTiles(false);
			break;
			case "justified":
				placeJustified(false);
			break;
            case "nested":
            	
            	var isMobileMode = g_gallery.isMobileMode();
            	if(isMobileMode == true){
            		placeTiles(false);
            	}
            	else
            		placeNestedImages(false);
            
            break;
		}
		
	}

	
	/**
	 * init panel events
	 */
	function initEvents(){
		
		//only on first placed start size change event
		g_objThis.on(t.events.ALL_TILES_LOADED, function(){
						
			if(g_temp.isAllLoaded == true)
				return(true);
			
			g_temp.isAllLoaded = true;
			
		});
		
		g_objGallery.on(g_gallery.events.SIZE_CHANGE, onResize);
				
		g_objTileDesign.initEvents();
				
	}

	
	/**
	 * run the gallery after init and set html
	 */
	function run(){
				
		//show tiles
		g_objWrapper.children(".ug-tile").show();

		if(g_temp.isFirstTimeRun == true){
			initEvents();
		}
		
		g_objTileDesign.run();
				
		switch(g_options.tiles_type){
			default:
			case "columns":
				runColumnsType();
			break;
			case "justified":
				runJustifiedType();
			break;
			case "nested":
				runNestedType();
			break;
		}
		
		
		g_temp.isFirstTimeRun = false;
	}
	
	
	/**
	 * destroy the events
	 */
	this.destroy = function(){
		
		g_objGallery.off(g_gallery.events.SIZE_CHANGE);
		g_objTileDesign.destroy();
	}
	
	/**
	 * set the custom size mode.
	 * set it before the init
	 */
	this.setFixedSizeMode = function(){
		g_temp.isFixedMode = true;
		g_objTileDesign.setFixedMode();
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


