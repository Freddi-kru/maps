/* TalkingStory Local Storage JS */

function checkStorageLeft(){
    var size = 0;
    for (var i = 0; i < localStorage.length; i++){
        var lsi = localStorage.getItem(localStorage.key(i));
        size += unescape(encodeURIComponent(JSON.stringify(lsi))).length;
    }
    var default_ls_size = 1024 * 1024 * 5;
    var ls_info = {'used':size,'left':default_ls_size-size};
    console.log('Web Local Storage in use: '+ls_info.used+' / left: '+ls_info.left);
    return ls_info;
}

function checkNeededStorage(storages=[]){
    var size=0;
    for (var i = 0; i < storages.length; i++){
        size += unescape(encodeURIComponent(storages[i])).length;
    }
    return size;
}

function saveStorage(tmid=false){
    var story_id = urlParam('id');
    if (tmid){
      story_id = tmid;
    }
    var storage_name= 'TalkingStory_'+story_id;
    var storage_maps_name = 'TalkingStory_maps_'+story_id;
    var storage_options_name= 'TalkingStory_options_'+story_id;

    var storage_info = checkStorageLeft();
    var storage_needed = checkNeededStorage([stringify(GlobalContents,null,2),stringify(GlobalMaps,null,2),stringify(GlobalOptions,null,2)]);

    // Check browser support
    if (typeof(Storage) !== "undefined") {
        if (storage_info.left > storage_needed){
            // Store using stringify for circular objects
            localStorage.setItem(storage_name, stringify(GlobalContents,null,2));
            localStorage.setItem(storage_maps_name, stringify(GlobalMaps,null,2));
            localStorage.setItem(storage_options_name, stringify(GlobalOptions,null,2));
            // Retrieve
            console.log('Storage saved properly.');
        }else{
            alert("Sorry, Web Storage 5MB exceeded, try to clean Browser cache and/or save your TalkingStory to DB.\
            Note: if you are trying to load big GeoJson geometries consider to use instead a wms or a QGIS2Web iFrame application.");
        }
    } else {
        alert("Sorry, your browser does not support Web Storage... try to use Chrome");
    }

    return storage_info;
}

function deleteStorage(storageName){
    if (localStorage.hasOwnProperty(storageName)) {
      localStorage.removeItem(storageName);
      console.log('Storage '+storageName+" deleted.");
    }

}

function loadStorage(){
    var story_id = urlParam('id');
    var storage_name= 'TalkingStory_'+story_id;
    var storage_maps_name = 'TalkingStory_maps_'+story_id;
    var storage_options_name= 'TalkingStory_options_'+story_id;

    if (localStorage.hasOwnProperty(storage_name)) {
        GlobalContents = JSON.parse(localStorage.getItem(storage_name));
    }else{
        saveStorage();
        console.log('WebStorage not Existing, initializing with empty TalkingStory Contents');
    };
    if (localStorage.hasOwnProperty(storage_options_name)) {
        GlobalOptions = JSON.parse(localStorage.getItem(storage_options_name));
    }else{
        saveStorage();
        console.log('WebStorage not Existing, initializing with empty TalkingStory Options');
    };
    if (localStorage.hasOwnProperty(storage_maps_name)) {
        GlobalMaps = JSON.parse(localStorage.getItem(storage_maps_name));
    }else{
        saveStorage();
        console.log('WebStorage not Existing, initializing with empty TalkingStory Options');
    };

    console.log('TalkingStory Storage loaded correctly:');

    //console.log(GlobalContents);
    //console.log(GlobalMaps);
    //console.log(GlobalOptions);
}

function remove_all_storage(){
  localStorage.clear();
  var url = window.location.href.split('?')[0] + '?edit=true&id=' + urlParam('id');;
  window.open(url,'_self');
}
