/* TalkingStory Map functions JS */

function render_map(div_id){
  //console.log(GlobalContents.maps[div_id]);
  $('#'+div_id).empty();
  var baselayers = GlobalContents.maps[div_id]['baselayers'];
  var overlayers = GlobalContents.maps[div_id]['overlayers'];
  var markers = GlobalContents.maps[div_id]['markers'];
  var bounds = GlobalContents.maps[div_id]['bounds'];
  GlobalContents.maps[div_id]['map'] = new MyMap(div_id,baselayers,overlayers,markers);
  GlobalContents.maps[div_id]['map'].createMap(0,0,1);
  GlobalContents.maps[div_id]['map'].zoomToBB(bounds);
}

function populate_map_form(div_id,map_id=null){

  var mapObj2render;

  /* if there is already a div then get the map id form the div otherwise use directly the map id from GlobalMaps */
  if ( typeof GlobalContents.maps[div_id] != 'undefined' && map_id==null){
      var map_id = null;
      $.each(GlobalMaps,function(key,obj){
          if (obj.div_id == div_id){
            map_id = key;
          } 
      });
      mapObj2render = GlobalContents.maps[div_id];
  } else if ( map_id != null){
      mapObj2render = GlobalMaps[map_id].map;
  }  else {
      mapObj2render = null;
  }

 if (  mapObj2render != null ) {
   console.log('Map already defined, loading data slide: '+div_id);
   
   /* Loading General infos */
   var general_info = mapObj2render.general_info;
   $.each(Object.keys(general_info),function(idx,key){
      $('#form_map .form_general[name="'+key+'"]').val(general_info[key]);
      //..TODO manage different object type case here
   });
   
   /* Loading Baselayers from GlobalContents.maps variable */
   var baselayers = mapObj2render['baselayers'];
   $.each(baselayers,function(idx,obj){
      if( obj.hasOwnProperty('default') && obj.default ){
          
      }
      switch (obj.source){
            
            case "default":
                $('#CheckOSM').prop('checked',true);
                break;
            case "mapbox":
                  $(Object.keys(obj)).each(function(idx,key){
                      if (key == 'opt'){
                        $(Object.keys(obj['opt'])).each(function(idx,key){
                            $('#form_map .form_baselayers_mapbox[name="opt-'+key+'"]').val(obj['opt'][key]);  
                        });  
                      }else{
                        $('#form_map .form_baselayers_mapbox[name="'+key+'"]').val(obj[key]);
                      }
                  });
                break;
            case "generic_wms":
                  $(Object.keys(obj)).each(function(idx,key){
                      if (key == 'opt'){
                        $(Object.keys(obj['opt'])).each(function(idx,key){
                            $('#form_map .form_baselayers_wms[name="opt-'+key+'"]').val(obj['opt'][key]);  
                        });  
                      }else{
                        $('#form_map .form_baselayers_wms[name="'+key+'"]').val(obj[key]);
                      }
                  });
                break;
      }
   });
   
    /* Loading Overlayers from GlobalContents.maps variable */
    var overlayers = mapObj2render['overlayers'];        
    $.each(overlayers,function(idx,obj){
        
         var target_id = obj.target_id;
         
         if ($(target_id).length == 0){
               var group_id_div = target_id.split('-')[0];
               var group_id_first_elem = group_id_div+'-1';
               var g_layer_clone = $(group_id_first_elem).clone().attr('id',target_id.replace("#",""));
               $(group_id_div).append( g_layer_clone );
               
         }
        
         switch (obj.type){
             case "wms":
                 $(Object.keys(obj)).each(function(idx,key){
                      if (key == 'opt'){
                        $(Object.keys(obj['opt'])).each(function(idx,key){
                            $(target_id+' .form_overlayers_wms[name="opt-'+key+'"]').val(obj['opt'][key]);  
                        });  
                      }else if(key=='visibility'){
                        if (obj[key]){
                            $(target_id+' .form_overlayers_wms[name="'+key+'"]').prop('checked',true);  
                        }
                      }else{
                        $(target_id+' .form_overlayers_wms[name="'+key+'"]').val(obj[key]);
                      }
                  });
                 break;
             case "geojson":
             case "prj_geojson":
                 $(Object.keys(obj)).each(function(idx,key){
                      if (key == 'opt'){
                        $(Object.keys(obj['opt'])).each(function(idx,key){
                            if (key=="popup_fields"){
                                if ( typeof(obj['opt'][key]) == 'object' ){
                                    $(target_id+' .form_overlayers_gjson[name="opt-'+key+'"]').val( JSON.stringify( obj['opt'][key] ) );
                                }else{
                                    $(target_id+' .form_overlayers_gjson[name="opt-'+key+'"]').val(obj['opt'][key]);                                  
                                }
                            }else{
                                $(target_id+' .form_overlayers_gjson[name="opt-'+key+'"]').val(obj['opt'][key]);  
                            }
                        });  
                      }else if(key=='visibility'){
                        if (obj[key]){
                            $(target_id+' .form_overlayers_gjson[name="'+key+'"]').prop('checked',true);  
                        }
                      }else{
                        $(target_id+' .form_overlayers_gjson[name="'+key+'"]').val(obj[key]);
                      }
                  });
                 break;
         }   
    });
   
   var mks = mapObj2render['markers'];
   var bounds = mapObj2render['bounds'];

    $('#map_preview').show();
    $('#map_preview').css({position:'relative',width:'-webkit-fill-available'});
    $('#map_default_bbox').show(); 
    $('#map_idx_title').show();
    $('#map_idx_title').empty().append('Map: <h3 id="map_title" mapid="'+map_id+'">'+general_info.map_name+'</h3>');

    if (mapPreview == null){
      setTimeout(function(){
        mapPreview = new MyMap(map_preview_id,baselayers,overlayers,markers_list=mks);
        mapPreview.createMap(0,0,1);    
        mapPreview.zoomToBB(bounds);
      },1000);
    }else{
      console.log('Restoring Map data...');
      mapPreview.map.remove();
      setTimeout(function(){
           mapPreview = new MyMap(map_preview_id,baselayers,overlayers,markers_list=mks);
           mapPreview.createMap(0,0,1);    
           mapPreview.zoomToBB(bounds);
      },1000);
    }   
    
 }else{
   console.log('ERROR Missing Both Map div & Map ID');
 }
}

function arcgis_map_extent(){
   $('#arcgis_extent_map, #arcgis_extent').toggleClass('arcgis_extent_show');
   if ($('#arcgis_extent_map').html().length == 0){
       var basel = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
                maxZoom: 16,
                attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ'
            });  
      var map = L.map('arcgis_extent_map').setView([0, 0], 1).addLayer(basel);
      map.on('moveend', function(e) {
       var bounds = map.getBounds();
       var b_arr = [ bounds._southWest.lng, bounds._southWest.lat, bounds._northEast.lng, bounds._northEast.lat ];   
       $.each(b_arr,function(idx,value){
         $($('.input-arcgis-extent')[idx]).val( value );
       });
        arcgis_replace_extents();        
      });     
   }
}