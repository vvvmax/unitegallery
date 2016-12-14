
/**
 * API Class
 * addon to Unite gallery
 */
function UG_API(gallery){
	
	var t = this, g_objThis = jQuery(t);
	var g_gallery = new UniteGalleryMain(), g_objGallery;
	var g_arrEvents = [];
	
	g_gallery = gallery;
	g_objGallery = jQuery(gallery);
	
	
	this.events = {
			API_INIT_FUNCTIONS:"api_init",
			API_ON_EVENT:"api_on_event"
	}
	
	
	/**
	 * get item data for output
	 */
	function convertItemDataForOutput(item){
		
		var output = {
				index: item.index,
				title: item.title,
				description: item.description,
				urlImage: item.urlImage,
				urlThumb: item.urlThumb
			};
			
			//add aditional variables to the output
			var addData = item.objThumbImage.data();
			
			for(var key in addData){
				switch(key){
					case "image":
					case "description":
						continue;
					break;
				}
				output[key] = addData[key];
			}
			
			return(output);
	}
	
	
	/**
	 * event handling function
	 */
	this.on = function(event, handlerFunction, notCache){
		
		//remember cache
		if(notCache !== true){
			g_arrEvents.push({event:event,func:handlerFunction});
		}
		
		switch(event){
			case "item_change":
				
				g_objGallery.on(g_gallery.events.ITEM_CHANGE, function(){
						var currentItem = g_gallery.getSelectedItem();
						var output = convertItemDataForOutput(currentItem);
						handlerFunction(output.index, output);
				});
				
			break;
			case "resize":
				g_objGallery.on(g_gallery.events.SIZE_CHANGE, handlerFunction);
			break;
			case "enter_fullscreen":
				g_objGallery.on(g_gallery.events.ENTER_FULLSCREEN, handlerFunction);				
			break;
			case "exit_fullscreen":
				g_objGallery.on(g_gallery.events.EXIT_FULLSCREEN, handlerFunction);				
			break;
			case "play":
				g_objGallery.on(g_gallery.events.START_PLAY, handlerFunction);				
			break;
			case "stop":
				g_objGallery.on(g_gallery.events.STOP_PLAY, handlerFunction);				
			break;
			case "pause":
				g_objGallery.on(g_gallery.events.PAUSE_PLAYING, handlerFunction);				
			break;
			case "continue":
				g_objGallery.on(g_gallery.events.CONTINUE_PLAYING, handlerFunction);
			break;
			case "open_lightbox":
				g_objGallery.on(g_gallery.events.OPEN_LIGHTBOX, handlerFunction);
			break;
			case "close_lightbox":
				g_objGallery.on(g_gallery.events.CLOSE_LIGHTBOX, handlerFunction);
			break;
			default:
				if(console)
					console.log("wrong api event: " + event);
			break;
		}
		
		g_objGallery.trigger(t.events.API_ON_EVENT, [event, handlerFunction]);
	}
	
	
	/**
	 * start playing 
	 */
	this.play = function(){		
		g_gallery.startPlayMode();		
	}
	
	
	/**
	 * stop playing
	 */
	this.stop = function(){
		g_gallery.stopPlayMode();
	}
	
	
	/**
	 * toggle playing
	 */
	this.togglePlay = function(){
		g_gallery.togglePlayMode();
	}
	
	
	/**
	 * enter fullscreen
	 */
	this.enterFullscreen = function(){
		g_gallery.toFullScreen();
	}
	
	/**
	 * exit fullscreen
	 */
	this.exitFullscreen = function(){
		g_gallery.exitFullScreen();
	}
	
	/**
	 * toggle fullscreen
	 */
	this.toggleFullscreen = function(){
		
		g_gallery.toggleFullscreen();		
	}
	
	
	/**
	 * reset zoom
	 */
	this.resetZoom = function(){
		var objSlider = g_gallery.getObjSlider();
		if(!objSlider)
			return(false);
		
		objSlider.zoomBack();
	}
	
	
	/**
	 * zoom in
	 */
	this.zoomIn = function(){
		
		var objSlider = g_gallery.getObjSlider();
		if(!objSlider)
			return(false);
		
		objSlider.zoomIn();		
	}

	/**
	 * zoom in
	 */
	this.zoomOut = function(){
		
		var objSlider = g_gallery.getObjSlider();
		if(!objSlider)
			return(false);
		
		objSlider.zoomOut();		
	}
	
	/**
	 * next item
	 */
	this.nextItem = function(){
		g_gallery.nextItem();
	}
	
	
	/**
	 * prev item
	 */
	this.prevItem = function(){
		g_gallery.prevItem();
	}
	
	/**
	 * go to some item by index (0-numItems)
	 */
	this.selectItem = function(numItem){
		
		g_gallery.selectItem(numItem);
	
	}
	
	
	/**
	 * resize the gallery to some width (height).
	 */
	this.resize = function(width, height){
		
		if(height)
			g_gallery.resize(width, height);
		else
			g_gallery.resize(width);
	}
	
	
	/**
	 * toggle gridpanel or strippanel (show, hide)
	 */
	this.togglePanel = function(noAnimation) {
		g_gallery.togglePanel(noAnimation);
	}


	/**
	 * open gridpanel or strippanel
	 */
	this.openPanel = function(noAnimation) {
		g_gallery.openPanel(noAnimation);
	}


	/**
	 * close gridpanel or strippanel
	 */
	this.closePanel = function(noAnimation) {
		g_gallery.openPanel(noAnimation);
	}


	/**
	 * get some item by index
	 */
	this.getItem = function(numItem){
		
		var data = g_gallery.getItem(numItem);
		var output = convertItemDataForOutput(data);
		
		return(output);
	}
	
	
	/**
	 * get number of items in the gallery
	 */
	this.getNumItems = function(){
		var numItems = g_gallery.getNumItems();
		return(numItems);
	}
	
	/**
	 * refresh gallery with another options
	 */
	this.reloadGallery = function(customOptions){
		if(!customOptions)
			var customOptions = {};
		
		g_gallery.run(null, customOptions);
		
		//restore events:
		g_arrEvents.map(function(obj){
			t.on(obj.event,obj.func,true);
		});
		
	}
	
	
	/**
	 * destroy the gallery
	 */
	this.destroy = function(){
		g_gallery.destroy();
	}
	
	//trigger api on init event
	g_objGallery.trigger(t.events.API_INIT_FUNCTIONS, t);
	
}
