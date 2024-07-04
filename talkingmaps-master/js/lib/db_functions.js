/* TalkingStory Sqlite db JS */

function loadDB(){
    var story_id = urlParam('id');
    
     $.getJSON("./db/"+story_id+".json", function(json) {
        console.log(json); // this will show the info it in firebug console
        GlobalContents = json[story_id].GlobalContents;
        GlobalOptions = json[story_id].GlobalOptions;
        GlobalMaps = json[story_id].GlobalMaps;
        saveStorage();
    }).fail(function() { console.log(story_id+'.json not found on server.'); }); 
    return true;
}

function loadFromDB(story_id,json){
    GlobalContents = json[story_id].GlobalContents;
    GlobalOptions = json[story_id].GlobalOptions;
    GlobalMaps = json[story_id].GlobalMaps;
    saveStorage(story_id);
}

function saveDB(){
    
    var story_id = urlParam('id');
    
    GlobalTalkingStory = {};
    GlobalTalkingStory[story_id] = { 'GlobalContents':GlobalContents,
                                        'GlobalOptions':GlobalOptions,
                                        'GlobalMaps':GlobalMaps
                                    };
                                    
    console.log(GlobalTalkingStory);
}

/* Save DB button */
$('#save_db').on('click',function(){
    
    $.when(saveDB()).then(
        function(){
            var story_id = urlParam('id');
            var json = stringify(GlobalTalkingStory,null,2);
            var blob = new Blob([json], {type: "application/json"});
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            var fileName = story_id + ".json";
            link.download = fileName;
            link.click();
        }
    );
});