/* TalkingStory Global Variables */

var GlobalContents = {
    'title':{
        'floating-slides-title':{
            'content':'<div class="slide-title" ><h1><img alt="" src="./imgs/logo_TM_big.png" style="border-style:solid; border-width:2px;width:100%;" />TalkingMaps</h1></div>',
            'css' : {},
            'classes' : []
        }
    },

    'floatings':{
        'slide-001' : {
            'title' : 'First Slide',
            'logo' : true,
            'open' : true,
            'content' : '<h2>A new way to tell your stories by TeNoli Team!</h2>',
            'css' : {},
            'slide_n' : 1,
            'classes' : []
        },
    },
    'mains':{
        'slide_main-001' : {
            'content':'<h1 style="text-align:center"><span style="font-size:72px">ALMENO IL DOPPIO!</span></h1>',
            'css':{
                  'background-image':'url(./imgs/loading_img2.jpg)',
                  'background-size': 'cover',
                  'background-position':'50% 0%'
              },
            'classes' : []
        }
    },
    'maps':{

    },
    'iframes' : {

    },
};

/* To store created mapsand reuse in other slides */
var GlobalMaps = {};

var GlobalOptions = {
    'classes':{
        'floatingcontent':{
            'css':{'width':'35%;',
                    'height':'98%',
                    'box-shadow': '0px 0px 15px 3px #2d393cff',
                    'color':'white',
                  }
        },
        'main_padding_left':{
            'css':{
                'padding-left':'36%'
            }
        }
    }
};


// this is the object containing the preview map for this ID slide, need to push it to the main global object containing all maps for all slides
var mapPreview = null;
var map_preview_id = "map_preview";
var arcgisMApExtent;

var GlobalDB = null;

var GlobalTalkingStory = null;

var initializedObj = {};

var animations_classes = {'zoomin_images':'Zoom In',
                          'moveleft_images':'Slide Left',
                          'moveright_images': 'Slide Right'};
