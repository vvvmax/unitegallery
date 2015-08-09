/**
 * grid panel class
 * addon to grid gallery
 */
function UGGridPanel(){
	
	var t = this, g_objThis = jQuery(this);
	var g_gallery = new UniteGalleryMain(), g_objGallery, g_objWrapper, g_objPanel;
	var g_functions = new UGFunctions();
	var g_objGrid = new UGThumbsGrid();
	var g_panelBase = new UGPanelsBase();
	var g_objArrowNext, g_objArrowPrev;
	
	this.events = {
		FINISH_MOVE: "gridpanel_move_finish",	//called after close or open panel (slide finish).
		OPEN_PANEL: "open_panel",				//called before opening the panel.
		CLOSE_PANEL: "close_panel"				//called before closing the panel.
	};
	
	var g_options = {
			gridpanel_vertical_scroll: true,			//vertical or horizontal grid scroll and arrows
			gridpanel_grid_align: "middle",				//top , middle , bottom, left, center, right - the align of the grid panel in the gallery 
			gridpanel_padding_border_top: 10,		    //padding between the top border of the panel
			gridpanel_padding_border_bottom: 4,			//padding between the bottom border of the panel
			gridpanel_padding_border_left: 10,			//padding between the left border of the panel
			gridpanel_padding_border_right: 10,			//padding between the right border of the panel
			
			gridpanel_arrows_skin: "",					//skin of the arrows, if empty inherit from gallery skin
			gridpanel_arrows_align_vert: "middle",		//borders, grid, middle - vertical align of arrows, to the top and bottom botders, to the grid, or in the middle space.
			gridpanel_arrows_padding_vert: 4,			//padding between the arrows and the grid, in case of middle align, it will be minimal padding
			gridpanel_arrows_align_hor: "center",		//borders, grid, center - horizontal align of arrows, to the left and right botders, to the grid, or in the center space.
			gridpanel_arrows_padding_hor: 10,			//in case of horizontal type only, minimal size from the grid in case of "borders" and size from the grid in case of "grid"
			
			gridpanel_space_between_arrows: 20,			//space between arrows on horizontal grids only
			gridpanel_arrows_always_on: false,			//always show arrows even if the grid is one pane only

			gridpanel_enable_handle: true,				//enable grid handle			
			gridpanel_handle_align: "top",				//top, middle, bottom , left, right, center - close handle tip align on the handle bar according panel orientation
			gridpanel_handle_offset: 0,					//offset of handle bar according the valign
			gridpanel_handle_skin: "",					//skin of the handle, if empty inherit from gallery skin
			
			gridpanel_background_color:""				//background color of the grid wrapper, if not set, it will be taken from the css
	};
	
	
	//default options for vertical scroll
	var g_defaultsVertical = {
			gridpanel_grid_align: "middle",			//top , middle , bottom
			gridpanel_padding_border_top: 2,		//padding between the top border of the panel
			gridpanel_padding_border_bottom: 2		//padding between the bottom border of the panel
	};
	
	//default options for horizontal type panel
	var g_defaultsHorType = {
			gridpanel_grid_align: "center"			//left, center, right			
	};
	
	var g_temp = {
		panelType: "grid",
		isHorType: false,
		arrowsVisible: false,
		panelHeight: 0,
		panelWidth: 0,
		originalPosX:null,
		isEventsInited: false,
		isClosed: false,
		orientation: null
	};
	
	
	/**
	 * init the grid panel
	 */
	function initGridPanel(gallery, customOptions){
		
		g_gallery = gallery;
		
		validateOrientation();
		
		//set defaults and custom options
		if(customOptions && customOptions.vertical_scroll){
			g_options.gridpanel_vertical_scroll = customOptions.vertical_scroll;			
		}
		
		g_options = jQuery.extend(g_options, customOptions);
				
		//set defautls for horizontal panel type
		if(g_temp.isHorType == true){
						
			g_options = jQuery.extend(g_options, g_defaultsHorType);
			g_options = jQuery.extend(g_options, customOptions);
					
		}else if(g_options.gridpanel_vertical_scroll == true){

			//set defaults for vertical scroll
			g_options = jQuery.extend(g_options, g_defaultsVertical);
			g_options = jQuery.extend(g_options, customOptions);
			g_options.grid_panes_direction = "bottom";		
		}
		
		//set arrows skin:
		var galleryOptions = g_gallery.getOptions();
		var globalSkin = galleryOptions.gallery_skin;		
		if(g_options.gridpanel_arrows_skin == "")
			g_options.gridpanel_arrows_skin = globalSkin;
		
		
		//get the gallery wrapper
		var objects = gallery.getObjects();
		g_objWrapper = objects.g_objWrapper;
		
		//init the base panel object:
		g_panelBase.init(g_gallery, g_temp, t, g_options, g_objThis);		
	}
	
	
	/**
	 * validate the orientation if exists
	 */
	function validateOrientation(){
		
		if(g_temp.orientation == null)
			throw new Error("Wrong orientation, please set panel orientation before run");
		
	}
	
	/**
	 * run the rid panel
	 */
	function runPanel(){
		
		//validate orientation
		validateOrientation();
		
		processOptions();
		
		g_objGrid.run();
		
		setArrows();
		setPanelSize();
		placeElements();
		
		initEvents();
	}
	
	
	/**
	 * set html of the grid panel
	 */
	function setHtmlPanel(){
		
		//add panel wrapper
		g_objWrapper.append("<div class='ug-grid-panel'></div>");
		
		g_objPanel = g_objWrapper.children('.ug-grid-panel');
		
		//add arrows:
		if(g_temp.isHorType){
			
			g_objPanel.append("<div class='grid-arrow grid-arrow-left-hortype ug-skin-" + g_options.gridpanel_arrows_skin + "'></div>");
			g_objPanel.append("<div class='grid-arrow grid-arrow-right-hortype ug-skin-" + g_options.gridpanel_arrows_skin + "'></div>");
			
			g_objArrowPrev = g_objPanel.children(".grid-arrow-left-hortype");
			g_objArrowNext = g_objPanel.children(".grid-arrow-right-hortype");
		}
		else if(g_options.gridpanel_vertical_scroll == false){		//horizonatl arrows
			g_objPanel.append("<div class='grid-arrow grid-arrow-left ug-skin-" + g_options.gridpanel_arrows_skin + "'></div>");
			g_objPanel.append("<div class='grid-arrow grid-arrow-right ug-skin-" + g_options.gridpanel_arrows_skin + "'></div>");
			
			g_objArrowPrev = g_objPanel.children(".grid-arrow-left");
			g_objArrowNext = g_objPanel.children(".grid-arrow-right");
			
		}else{		//vertical arrows
			g_objPanel.append("<div class='grid-arrow grid-arrow-up ug-skin-" + g_options.gridpanel_arrows_skin + "'></div>");
			g_objPanel.append("<div class='grid-arrow grid-arrow-down ug-skin-" + g_options.gridpanel_arrows_skin + "'></div>");
			
			g_objArrowPrev = g_objPanel.children(".grid-arrow-up");
			g_objArrowNext = g_objPanel.children(".grid-arrow-down");
		}
		
		g_panelBase.setHtml(g_objPanel);
		
		//hide the arrows
		g_objArrowPrev.fadeTo(0,0);
		g_objArrowNext.fadeTo(0,0);
		
		//init the grid panel		
		g_gallery.initThumbsPanel("grid", g_options);
		
		//get the grid object
		var objects = g_gallery.getObjects();
		g_objGrid = objects.g_objThumbs;
		
		g_objGrid.setHtml(g_objPanel);
		
		setHtmlProperties();
	}
	
	
	/**
	 * set html properties according the options
	 */
	function setHtmlProperties(){
		
		//set panel background color
		if(g_options.gridpanel_background_color != "")
			g_objPanel.css("background-color",g_options.gridpanel_background_color);
	}
	
	
	/**
	 * process and fix certain options, avoid arrows and validate options
	 */
	function processOptions(){
		
		if(g_options.gridpanel_grid_align == "center")
			g_options.gridpanel_grid_align = "middle";
	}
	
		
	/**
	 * place panel with some animation
	 */
	function placePanelAnimation(panelX, functionOnComplete){
						
		var objCss  = {left: panelX + "px"};
		
		g_objPanel.stop(true).animate(objCss ,{
			duration: 300,
			easing: "easeInOutQuad",
			queue: false,
			complete: function(){
				if(functionOnComplete)
					functionOnComplete();
			}
		});
		
	}
	
		
	
	/**
	 * get max height of the grid according the arrows size
	 */
	function getGridMaxHeight(){
		
		//check space taken without arrows for one pane grids
		var spaceTaken = g_options.gridpanel_padding_border_top + g_options.gridpanel_padding_border_bottom;
		var maxGridHeight = g_temp.panelHeight - spaceTaken;
		
		if(g_options.gridpanel_arrows_always_on == false){
			var numPanes = g_objGrid.getNumPanesEstimationByHeight(maxGridHeight);
			if(numPanes == 1)
				return(maxGridHeight);
		}
		
		//count the size with arrows
		var arrowsSize = g_functions.getElementSize(g_objArrowNext);
		var arrowsHeight = arrowsSize.height;
		
		var spaceTaken = arrowsHeight + g_options.gridpanel_arrows_padding_vert;
		
		if(g_options.gridpanel_vertical_scroll == true)	//in case of 2 arrows multiply by 2
			spaceTaken *= 2;
				
		spaceTaken += g_options.gridpanel_padding_border_top + g_options.gridpanel_padding_border_bottom;
		
		maxGridHeight = g_temp.panelHeight - spaceTaken;			
		
		return(maxGridHeight);
	}
	
	
	/**
	 * get grid maximum width
	 */
	function getGridMaxWidth(){
				
		//check space taken without arrows for one pane grids
		var spaceTaken = g_options.gridpanel_padding_border_left + g_options.gridpanel_padding_border_right;
				
		var maxGridWidth = g_temp.panelWidth - spaceTaken;
		
		if(g_options.gridpanel_arrows_always_on == false){
			var numPanes = g_objGrid.getNumPanesEstimationByWidth(maxGridWidth);
						
			if(numPanes == 1)
				return(maxGridWidth);
		}
		
		//count the size with arrows
		var arrowsSize = g_functions.getElementSize(g_objArrowNext);
		var arrowsWidth = arrowsSize.width;
		
		spaceTaken += (arrowsWidth + g_options.gridpanel_arrows_padding_hor) * 2;
								
		maxGridWidth = g_temp.panelWidth - spaceTaken;			
		
		return(maxGridWidth);
	}
		
	
	/**
	 * enable / disable arrows according the grid
	 */
	function setArrows(){
		
		var showArrows = false;
		if(g_options.gridpanel_arrows_always_on == true){
			showArrows = true;
		}
		else{
			var numPanes = g_objGrid.getNumPanes();
			if(numPanes > 1)
				showArrows = true;
		}
		
		if(showArrows == true){		//show arrows
			
			g_objArrowNext.show().fadeTo(0,1);
			g_objArrowPrev.show().fadeTo(0,1);
			g_temp.arrowsVisible = true;
			
		}else{		//hide arrows
			
			g_objArrowNext.hide();
			g_objArrowPrev.hide();
			g_temp.arrowsVisible = false;			
		
		}
		
	}
	
	
	/**
	 * set panel size by the given height and grid width
	 */
	function setPanelSize(){
		var gridSize = g_objGrid.getSize();
				
		//set panel size
		if(g_temp.isHorType == true)
			g_temp.panelHeight = gridSize.height + g_options.gridpanel_padding_border_top + g_options.gridpanel_padding_border_bottom;
		else
			g_temp.panelWidth = gridSize.width + g_options.gridpanel_padding_border_left + g_options.gridpanel_padding_border_right;
		
		g_functions.setElementSize(g_objPanel, g_temp.panelWidth, g_temp.panelHeight);
		
	}
	
	
	/**
	 * place the panel without animation
	 * @param panelDest
	 */
	function placePanelNoAnimation(panelDest){
		
		switch(g_temp.orientation){
			case "right":		//vertical
			case "left":
				g_functions.placeElement(g_objPanel, panelDest, null);
			break;
		}
		
	}
	
	
	
	function __________EVENTS___________(){};
	
	
	
	/**
	 * event on panel slide finish
	 */
	function onPanelSlideFinish(){
				
		g_objThis.trigger(t.events.FINISH_MOVE);
			
	}
	
	
	/**
	 * init panel events
	 */
	function initEvents(){
		
		if(g_temp.isEventsInited == true)
			return(false);
		
		g_temp.isEventsInited = true;
				
		if(g_objArrowPrev){
			g_functions.addClassOnHover(g_objArrowPrev);
			g_objGrid.attachPrevPaneButton(g_objArrowPrev);			
		}
		
		
		if(g_objArrowNext){
			g_functions.addClassOnHover(g_objArrowNext);
			g_objGrid.attachNextPaneButton(g_objArrowNext);			
		}
		
		g_panelBase.initEvents();
		
	}
	
	
	/**
	 * destroy the events
	 */
	this.destroy = function(){
		
		if(g_objArrowPrev)
			g_functions.destroyButton(g_objArrowPrev);
		
		if(g_objArrowNext)
			g_functions.destroyButton(g_objArrowNext);
		
		g_panelBase.destroy();
		
		g_objGrid.destroy();
	}
	
	
	function ______PLACE_ELEMENTS___________(){};
	
	
	/**
	 * get padding left of the grid
	 */
	function getGridPaddingLeft(){
		
		var gridPanelLeft = g_options.gridpanel_padding_border_left;
		
		return(gridPanelLeft);
	}
	
	
	/**
	 * place elements vertical - grid only
	 */
	function placeElements_noarrows(){
		
		//place grid
		var gridY = g_options.gridpanel_grid_align, gridPaddingY = 0;
		
		switch(gridY){
			case "top":
				gridPaddingY = g_options.gridpanel_padding_border_top;
				
			break;
			case "bottom":
				gridPaddingY = g_options.gridpanel_padding_border_bottom;				
			break;
		}
		
		var gridPanelLeft = getGridPaddingLeft();
		
		var gridElement = g_objGrid.getElement();		
		g_functions.placeElement(gridElement, gridPanelLeft, gridY, 0 , gridPaddingY);
				
	}
	
	
	/**
	 * place elements vertical - with arrows
	 */
	function placeElementsVert_arrows(){
		
		//place grid
		var gridY, prevArrowY, nextArrowY, nextArrowPaddingY;
		var objArrowSize = g_functions.getElementSize(g_objArrowPrev);		
		var objGridSize = g_objGrid.getSize();		
		
		
		switch(g_options.gridpanel_grid_align){
			default:
			case "top":
				gridY = g_options.gridpanel_padding_border_top + objArrowSize.height + g_options.gridpanel_arrows_padding_vert;
			break;
			case "middle":
				gridY = "middle";
			break;
			case "bottom":
				gridY = g_temp.panelHeight - objGridSize.height - objArrowSize.height - g_options.gridpanel_padding_border_bottom - g_options.gridpanel_arrows_padding_vert;
			break;
		}
		
		//place the grid
		var gridPanelLeft = getGridPaddingLeft();
		
		var gridElement = g_objGrid.getElement();		
		g_functions.placeElement(gridElement, gridPanelLeft, gridY);
		
		var objGridSize = g_objGrid.getSize();		
						
		//place arrows
		switch(g_options.gridpanel_arrows_align_vert){
			default:
			case "center":
			case "middle":
				prevArrowY = (objGridSize.top - objArrowSize.height) / 2;
				nextArrowY = objGridSize.bottom + (g_temp.panelHeight - objGridSize.bottom - objArrowSize.height) / 2;
				nextArrowPaddingY = 0;
			break;
			case "grid":
				prevArrowY = objGridSize.top - objArrowSize.height - g_options.gridpanel_arrows_padding_vert_vert
				nextArrowY = objGridSize.bottom + g_options.gridpanel_arrows_padding_vert;
				nextArrowPaddingY = 0;
			break;
			case "border":
			case "borders":
				prevArrowY = g_options.gridpanel_padding_border_top;				
				nextArrowY = "bottom"; 
				nextArrowPaddingY = g_options.gridpanel_padding_border_bottom;
			break;
		}
		
		g_functions.placeElement(g_objArrowPrev, "center", prevArrowY);
						
		g_functions.placeElement(g_objArrowNext, "center", nextArrowY, 0, nextArrowPaddingY);
	}
	
	
	/**
	 * place elements vertical
	 */
	function placeElementsVert(){
		
		if(g_temp.arrowsVisible == true)
			placeElementsVert_arrows();
		else
			placeElements_noarrows();
	}
	
	
	/**
	 * place elements horizontal with arrows
	 */
	function placeElementsHor_arrows(){
		
		var arrowsY, prevArrowPadding, arrowsPaddingY, nextArrowPadding;
		var objArrowSize = g_functions.getElementSize(g_objArrowPrev);		
		var objGridSize = g_objGrid.getSize();
		
		//place grid
		var gridY = g_options.gridpanel_padding_border_top;
		
		switch(g_options.gridpanel_grid_align){
			case "middle":
				
				switch(g_options.gridpanel_arrows_align_vert){
					default:
						var elementsHeight = objGridSize.height + g_options.gridpanel_arrows_padding_vert + objArrowSize.height;
						gridY = (g_temp.panelHeight - elementsHeight) / 2;
					break;
					case "border":
					case "borders":
						var remainHeight = g_temp.panelHeight - objArrowSize.height - g_options.gridpanel_padding_border_bottom;
						gridY = (remainHeight - objGridSize.height) / 2;
					break;
				}
								
			break;
			case "bottom":
				var elementsHeight = objGridSize.height + objArrowSize.height + g_options.gridpanel_arrows_padding_vert;
				gridY = g_temp.panelHeight - elementsHeight - g_options.gridpanel_padding_border_bottom;
			break;
		}
				
		var gridElement = g_objGrid.getElement();		
		var gridPanelLeft = getGridPaddingLeft();
		
		g_functions.placeElement(gridElement, gridPanelLeft, gridY);
		
		var objGridSize = g_objGrid.getSize();
		
		switch(g_options.gridpanel_arrows_align_vert){
			default:
			case "center":
			case "middle":
				arrowsY = objGridSize.bottom + (g_temp.panelHeight - objGridSize.bottom - objArrowSize.height) / 2;
				arrowsPaddingY = 0;								
			break;
			case "grid":
				arrowsY = objGridSize.bottom + g_options.gridpanel_arrows_padding_vert;
				arrowsPaddingY = 0;
			break;
			case "border":
			case "borders":
				arrowsY = "bottom";
				arrowsPaddingY = g_options.gridpanel_padding_border_bottom;
			break;
		}
		
		prevArrowPadding = -objArrowSize.width/2 - g_options.gridpanel_space_between_arrows / 2;
				
		g_functions.placeElement(g_objArrowPrev, "center", arrowsY, prevArrowPadding, arrowsPaddingY);
						
		//place next arrow
		var nextArrowPadding = Math.abs(prevArrowPadding);		//make positive
				
		g_functions.placeElement(g_objArrowNext, "center", arrowsY, nextArrowPadding, arrowsPaddingY);
					
	}
	
	
	/**
	 * place elements horizonatal
	 */
	function placeElementsHor(){
		
		if(g_temp.arrowsVisible == true)
			placeElementsHor_arrows();
		else
			placeElements_noarrows();
		
	}
	
	
	/**
	 * place elements horizontal type with arrows
	 */
	function placeElementsHorType_arrows(){
		
		//place grid
		var gridX, prevArrowX, nextArrowX, arrowsY;
		var objArrowSize = g_functions.getElementSize(g_objArrowPrev);		
		var objGridSize = g_objGrid.getSize();
		
		switch(g_options.gridpanel_grid_align){
			default:
			case "left":
				gridX = g_options.gridpanel_padding_border_left + g_options.gridpanel_arrows_padding_hor + objArrowSize.width;
			break;
			case "middle":
			case "center":
				gridX = "center";
			break;
			case "right":
				gridX = g_temp.panelWidth - objGridSize.width - objArrowSize.width - g_options.gridpanel_padding_border_right - g_options.gridpanel_arrows_padding_hor;
			break;
		}
		
		//place the grid		
		var gridElement = g_objGrid.getElement();
		g_functions.placeElement(gridElement, gridX, g_options.gridpanel_padding_border_top);
		objGridSize = g_objGrid.getSize();
		
		//place arrows, count Y
		switch(g_options.gridpanel_arrows_align_vert){
			default:
			case "center":
			case "middle":
				arrowsY = (objGridSize.height - objArrowSize.height) / 2 + objGridSize.top;
			break;
			case "top":
				arrowsY = g_options.gridpanel_padding_border_top + g_options.gridpanel_arrows_padding_vert;
			break;
			case "bottom":
				arrowsY = g_temp.panelHeight - g_options.gridpanel_padding_border_bottom - g_options.gridpanel_arrows_padding_vert - objArrowSize.height;
			break;
		}
				
		//get arrows X
		switch(g_options.gridpanel_arrows_align_hor){
			default:
			case "borders":
				prevArrowX = g_options.gridpanel_padding_border_left;
				nextArrowX = g_temp.panelWidth - g_options.gridpanel_padding_border_right - objArrowSize.width;
			break;
			case "grid":
				prevArrowX = objGridSize.left - g_options.gridpanel_arrows_padding_hor - objArrowSize.width;
				nextArrowX = objGridSize.right + g_options.gridpanel_arrows_padding_hor;
			break;
			case "center":
				prevArrowX = (objGridSize.left - objArrowSize.width) / 2;
				nextArrowX = objGridSize.right + (g_temp.panelWidth - objGridSize.right - objArrowSize.width) / 2;
			break;
		}
		
		g_functions.placeElement(g_objArrowPrev, prevArrowX, arrowsY);		
		g_functions.placeElement(g_objArrowNext, nextArrowX, arrowsY);
	}
	
	
	/**
	 * place elements horizontal type without arrows
	 */
	function placeElementHorType_noarrows(){
		
		var gridX;
		var objGridSize = g_objGrid.getSize();
		
		switch(g_options.gridpanel_grid_align){
			default:
			case "left":
				gridX = g_options.gridpanel_padding_border_left;
			break;
			case "middle":
			case "center":
				gridX = "center";
			break;
			case "right":
				gridX = g_temp.panelWidth - objGridSize.width - g_options.gridpanel_padding_border_right;
			break;
		}
		
		//place the grid		
		var gridElement = g_objGrid.getElement();
		g_functions.placeElement(gridElement, gridX, g_options.gridpanel_padding_border_top);
	}
	
	
	/**
	 * place elements when the grid in horizontal position
	 */
	function placeElementsHorType(){
		
		if(g_temp.arrowsVisible == true)
			placeElementsHorType_arrows();
		else
			placeElementHorType_noarrows();
		
	}
	
	
	/**
	 * place the arrows
	 */
	function placeElements(){
		
		if(g_temp.isHorType == false){
			
			if(g_options.gridpanel_vertical_scroll == true)
				placeElementsVert();
			else
				placeElementsHor();
			
		}else{
			placeElementsHorType();
		}
		
		g_panelBase.placeElements();
	}
	
	
	/**
	 * get panel orientation
	 */
	this.getOrientation = function(){
		
		return(g_temp.orientation);
	}
	
	
	/**
	 * set panel orientation (left, right, top, bottom)
	 */
	this.setOrientation = function(orientation){
		
		g_temp.orientation = orientation;
		
		//set isHorType temp variable for ease of use
		switch(orientation){
			case "right":
			case "left":
				g_temp.isHorType = false;
			break;
			case "top":
			case "bottom":
				g_temp.isHorType = true;
			break;
			default:
				throw new Error("Wrong grid panel orientation: " + orientation);
			break;
		}
		
	}
	
	/**
	 * set panel height
	 */
	this.setHeight = function(height){
		
		if(g_temp.isHorType == true)
			throw new Error("setHeight is not appliable to this orientatio ("+g_temp.orientation+"). Please use setWidth");		
		
		g_temp.panelHeight = height;
		var gridMaxHeight = getGridMaxHeight();
		
		g_objGrid.setMaxHeight(gridMaxHeight);
	}
	
	
	/**
	 * set panel width
	 */
	this.setWidth = function(width){

		if(g_temp.isHorType == false)
			throw new Error("setWidth is not appliable to this orientatio ("+g_temp.orientation+"). Please use setHeight");		
		
		g_temp.panelWidth = width;
		
		var gridMaxWidth = getGridMaxWidth();
				
		g_objGrid.setMaxWidth(gridMaxWidth);
	}
	
	
	/**
	 * init the panel
	 */
	this.init = function(gallery, customOptions){
		
		initGridPanel(gallery, customOptions);
	}
	
	/**
	 * place panel html
	 */
	this.setHtml = function(){
		setHtmlPanel();
	}
	
	
	/**
	 * run the panel
	 */
	this.run = function(){
		
		runPanel();
	}
	
	
	/**
	 * get the panel element
	 */
	this.getElement = function(){
		return(g_objPanel);
	}
	
	
	/**
	 * get panel size object
	 */
	this.getSize = function(){
		
		var objSize = g_functions.getElementSize(g_objPanel);
		
		return(objSize);
	}
	
	this.__________Functions_From_Base_____ = function() {}
	
	/**
	 * tells if the panel is closed
	 */
	this.isPanelClosed = function() {		
		return (g_panelBase.isPanelClosed());
	}

	/**
	 * get closed panel destanation
	 */
	this.getClosedPanelDest = function() {
		return g_panelBase.getClosedPanelDest();
	}	
		
	/**
	 * open the panel
	 */	
	this.openPanel = function(noAnimation) {
		g_panelBase.openPanel(noAnimation);
	}
	
	
	/**
	 * close the panel (slide in)
	 */
	this.closePanel = function(noAnimation) {
		g_panelBase.closePanel(noAnimation);		
	}	
	
	/**
	 * set the panel opened state
	 */
	this.setOpenedState = function(originalPos) {
		g_panelBase.setOpenedState(originalPos);
	}

	/**
	 * set the panel that it's in closed state, and set original pos for opening later
	 */
	this.setClosedState = function(originalPos) {
		g_panelBase.setClosedState(originalPos);	
	}
	
	
	/**
	 * set panel disabled at start
	 */
	this.setDisabledAtStart = function(timeout){
		
		g_panelBase.setDisabledAtStart(timeout);
		
	}
	
	
}
