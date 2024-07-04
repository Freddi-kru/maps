//POP-UP definitions

function geojsonPopup(feature, layer) {
    // does this feature have a property named popupContent?
        if(typeof Object.keys(feature.properties) != "undefined"){
          //variable exists, do what you want
          var html = "";
          var keys=[];

          if (layer.options.popup_fields != "*"){
            $(Object.keys(layer.options.popup_fields)).each(function(){
                  html+= "<p><b>"+layer.options.popup_fields[this]+"</b> : "+feature.properties[this]+"</p>";
            });
          }else{
            $(Object.keys(feature.properties)).each(function(){
              html+= "<p><b>"+this+"</b> : "+feature.properties[this]+"</p>";
            });
          }
            layer.bindPopup(html);
        }
}

// map constructor

class MyMap{
  constructor(elemid,baselayers,overlayers,markers_list={},lcontrol=true){
    this.elemid = elemid;
    this.baselayers = baselayers;
    this.overlayers = overlayers;
    this.markers_list = markers_list;
    this.lcontrol = lcontrol;
    this.map = L.map(elemid, {zoomControl:false});
  }

//zoomToMarker
  zoomToMarker(lat,lon,zoom){
    var map = this.map.flyTo([lat,lon],zoom);
  }

//ZoomToBoundingBox

 save_bounds(){
   var map = this.map;
   var b = map.getBounds()
   return [[b._northEast.lat,b._northEast.lng],[b._southWest.lat,b._southWest.lng]];
 }

 zoomToBB(bounds){
   var map = this.map;
   map.fitBounds(bounds);
 }


//create MapBox

  createMap(lat,lon,zoom){
      //var map = L.map(this.elemid).setView([lon, lat], zoom);
      var map = this.map.setView([lon, lat], zoom);

      //add layer WMS

      //layer control
      var basemaps = {};
      for (var b = 0; b < this.baselayers.length; b++){
        if (this.baselayers[b].type=='wms'){
            basemaps[this.baselayers[b].name] = L.tileLayer.wms(this.baselayers[b].url, {layers:this.baselayers[b].layers});
        }
        if (this.baselayers[b].type=='tileLayer'){
           basemaps[this.baselayers[b].name] = L.tileLayer(this.baselayers[b].url, this.baselayers[b].opt);
        }
      }
      basemaps[Object.keys(basemaps)[0]].addTo(map);


      var coordinates = [];
//       for (var c = 0; c < this.markers_list.length; c++){
//         coordinates.push( L.marker([this.markers_list[c].lat, this.markers_list[c].lon]).bindPopup(this.markers_list[c].popup));
//       }
      $.each(this.markers_list, function(key,val){
        coordinates.push( L.marker([val.lat, val.lon]).bindPopup(val.popup));
      });

      //create a group that contains all the above layers
      var markers = L.layerGroup(coordinates);

      //add the group to the map
      var overlayMaps = {
          "Markers": markers,  // markers to manage actions (to hide later on)
      };

      markers.addTo(map);


//add layers to map

      for (var z=0; z< this.overlayers.length; z++) {

        var lry = this.overlayers[z];

        if (lry.type=='wms'){
          $('#loader').show();
          overlayMaps[lry.name] = L.tileLayer.betterWms(lry.url, lry.opt);
            if (lry.visibility) {
                  overlayMaps[lry.name].addTo(map);
            }
          $('#loader').hide();
        }
        if (lry.type=='geojson'){
          $('#loader').show();
          var geojson_opt = lry.opt;
          geojson_opt['onEachFeature'] = geojsonPopup;
          overlayMaps[lry.name] = new L.GeoJSON.AJAX(lry.url,geojson_opt);
          if (lry.visibility) {
                  overlayMaps[lry.name].addTo(map);
            }
          $('#loader').hide();
        }
        if (lry.type=='prj_geojson'){

          $('#loader').show();
          // adding projection
          // GeoJSON layer (UTM15)
          proj4.defs(lry.epsg_code, lry.epsg_def);

          var geojson;
          var lry = this.overlayers[z];

          function projLayer(lyr,geojson) {
            //console.log(geojson);
            var geojson_opt = lry.opt;
            geojson_opt['onEachFeature'] = geojsonPopup;

            overlayMaps[lry.name] =  new L.Proj.geoJson(geojson,geojson_opt);
            if (lry.visibility) {
                  overlayMaps[lry.name].addTo(map);
            }
            control.addOverlay(overlayMaps[lry.name],lry.name);
          }

          // $.getJSON(lry.url, function (data) {
          //       //geojson = data;
          //     }).done(function(data) {
          //         projLayer(lry,data);
          // });

          var request = $.ajax({
              dataType: "json",
              url: lry.url,
              success: function( data ) {
                  projLayer(lry,data);
                  $('#loader').hide();
                },
              timeout: 20000
          }).fail( function( xhr, status ) {
              if( status == "timeout" ) {
                  // do stuff in case of timeout
                  alert('Timeout Loading geoJson data, might be too big.');
              }
          });

        }


      }

      //add the list of the layers in the map
      if (this.lcontrol){
        L.control.layers(basemaps, overlayMaps).addTo(map);
      };

      //add zoom control with your options
      L.control.zoom({
           position:'bottomright'
      }).addTo(map);

      //add legend eg Geoserver: http://212.237.232.12:8080/geoserver/LocalPostgis/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=LocalPostgis:pi-lcjr
      var legend = L.control({position: 'bottomright'});
      legend.onAdd=function(map){
        var div=L.DomUtil.create('div','legend');
        // $(div).load('http://212.237.232.12:8080/geoserver/LocalPostgis/wms?REQUEST=GetLegendGraphic&VERSION=1.0.0&FORMAT=image/png&WIDTH=20&HEIGHT=20&LAYER=LocalPostgis:pi-lcjr');
        div.innerHTML='<div><b>Legend</b></div';
        return div;
      };
      legend.addTo(map);

   }
  }
