/* TalkingMaps Main JS */

function loadJSlibs (jslibs,next=0,location){

    if (next < jslibs.length){
        var scriptTag = document.createElement('script');
        scriptTag.src = jslibs[next];
        location.appendChild(scriptTag);

        scriptTag.onload = function(){
            console.log('JS lib: '+jslibs[next]+' loaded ...');
            next+=1;
            loadJSlibs(jslibs,next,location);
        }
        //scriptTag.onreadystatechange = implementationCode;
    }
}

window.onload = function() {

    /* place JS libraries in the correct order, Global variables/functions must be declared always before use */
    var jslibs = [
        './js/lib/global_variables.js',
        './js/lib/global_functions.js',
        './js/lib/storage_functions.js',
        './js/lib/db_functions.js',
        './js/lib/map_functions.js',
        './js/lib/initialize_story.js',
        ];

    loadJSlibs(jslibs,0,document.body);
};
