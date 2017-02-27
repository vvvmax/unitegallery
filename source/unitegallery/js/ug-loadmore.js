/**
 loadmore panel class addon to unite gallery
 */
function UGLoadMore(){
	
	var t = this, g_objThis = jQuery(this),g_objGallery;
	var g_gallery = new UniteGalleryMain(), g_functions = new UGFunctions();
	var g_objWrapper, g_objButton, g_objLoader, g_objError;
	
	var g_temp = {
			isInited:false
	}
	
	var g_options = {
		loadmore_container: "ug_loadmore_wrapper"			//tabs container
	};
	
	
	this.events = {
		
	};
	
	
	/**
	 * init wrapper
	 */
	function initObjects(){
		
		g_objWrapper = jQuery("#"+g_options.loadmore_container);
		if(g_objWrapper.length == 0)
			return(false);
		
		g_objButton = g_objWrapper.find(".ug-loadmore-button");
		if(g_objButton.length == 0)
			return(false);
		
		g_objLoader = g_objWrapper.find(".ug-loadmore-loader");
		if(g_objLoader.length == 0)
			return(false);
		
		g_objError = g_objWrapper.find(".ug-loadmore-error");
		if(g_objError.length == 0)
			return(false);
		
		g_temp.isInited = true;
	}
	
	
	/**
	 * show loadmore
	 */
	function showLoadmore(){
		
		g_objWrapper.show();
	}
	
	
	/**
	 * on loadore click event
	 */
	function onLoadmoreClick(){
		
		g_objButton.hide();
		g_objLoader.show();
		
		var data = {
				numitems:g_gallery.getNumItems()
		};
		
		g_gallery.ajaxRequest("front_loadmore", data, function(response){
			
			g_objLoader.hide();
			
			var htmlItems = response.html_items;
			var showLoadmore = response.show_loadmore;
			
			if(showLoadmore == true){
				g_objButton.blur().show();
				g_objLoader.hide();
			}else{
				g_objWrapper.hide();
			}
			
			g_gallery.addItems(htmlItems);
						
		},function(errorText){
			errorText = "Ajax Error!" + errorText;
			
			g_objLoader.hide();
			g_objError.show();
			g_objError.html(errorText);
			
		});
		
	}
	
	
	/**
	 * init events
	 */
	function initEvents(){
		
		g_gallery.onEvent("tiles_first_placed", showLoadmore);
		
		g_objButton.click(onLoadmoreClick);
	}
	
	
	/**
	 * destroy
	 */
	this.destroy = function(){
		if(g_temp.isInited == false)
			return(false);
	}
	
	
	/**
	 * init the loadmore button
	 */
	this.init = function(gallery, customOptions){
		g_gallery = gallery;
		
		g_objGallery = jQuery(g_gallery);
		g_options = jQuery.extend(g_options, customOptions);
		
		initObjects();
		
		if(g_temp.isInited == false){
			trace("load more not inited, something is wrong");
			return(false);
		}
		
		initEvents();
	}
	
	
}