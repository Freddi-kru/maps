/* TO DO - split code into separate .js and load them from the main.js */

//Global Functions

//..check if in edit mode url ?edit=true
function urlParam(name){
    var results = new RegExp('[\?&]' + name + '=([^&]+)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}

function tooltips() {
      $('[data-toggle="tooltip"]').tooltip();
};

function get_current_mainslide_id(){
    return $('.slide-main-area[status="active"]').attr('id');
}

function confirmAction(message) {
    var act = confirm(message);
    return act;
}

function clean_clone_form_group(group_class,group_first_to_clone_id,group_layer_id_prefix,target_group_id){
     var n = $(group_class).length+1;
     var layer_clone = $(group_first_to_clone_id).clone()
                                .find('input:text').val("").end()
                                .find('select').val("").end()
                                .find('input:checkbox').prop('checked',false).end()
                                .find('div.delete-this-layer').attr('action','delete').end()
                                .find('div.delete-this-layer').html('<i class="far fa-trash-alt fa-2x" data-toggle="tooltip" title="Delete Layer"></i>').end()
                                .attr('id',group_layer_id_prefix+n);

   $(target_group_id).append( layer_clone );
   $('div.delete-this-layer[action="delete"]').on('click',function(){
       $(this).closest('.group_layer').remove();
   });
   /* activate new tooltips */
   tooltips();
}

/* Scroll to top */
function scrollUp(deltaPage){
    $('#floatingcontent').css('overflow-y','unset');
    if (deltaPage<0){
        //var rp_a = function(){$('#floatingcontent').animate({ scrollTop: 5 }, 0);}
        var rp = function (){render_slide(deltaPage);};

        $.when(rp()).done(function(){
            console.log( 'Rendering finished.' );
            $('#floatingcontent').css('overflow-y','scroll');
            //$('#floatingcontent').animate({ scrollTop: 5 }, 0);
            $('#floatingcontent').fadeIn(500);
            $('#floatingcontent').animate({ scrollTop: 5 }, 0);
        });
    }else{
        var rp = function (){render_slide(deltaPage);};

        $.when(rp()).done(function(){
            console.log( 'Rendering finished.' );
            $('#floatingcontent').css('overflow-y','scroll');
            $('#floatingcontent').animate({ scrollTop: 5 }, 500);
        });
    }
}

function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function encodeHTML(str){
    var encoded = str.replace("'","&apos;");
    return encoded;
}

function activate_slide(id_to_activate){
    var slides = $('.slides');
    var indexofslide = slides.index($('#slide-'+id_to_activate)) +1;

    $('.slides[status="active"] , .slide-main-area[status="active"] ').fadeOut("slow").promise().then(function(){
        //$('.slide-main-area, .slides').hide();
        $('.slide-main-area, .slides').attr('status','');
        $('#slide-'+id_to_activate).attr('status','active');
        $('#slide_main-'+id_to_activate).attr('status','active');
        updateSlideCounter();
        console.log('Rendering slide >> moving to: ' + id_to_activate );
        $('.slides[status="active"] , .slide-main-area[status="active"] ').css('opacity', 0)
                                                                          .slideDown('slow')
                                                                          .animate(
                                                                            { opacity: 1 },
                                                                            { queue: false, duration: 'slow' }
                                                                          );

        //check for iframes and reload innerHTML to render properly
        if (typeof GlobalContents.iframes['slide_main-'+id_to_activate] != 'undefined'){
          if (typeof initializedObj['slide_main-'+id_to_activate] == 'undefined'){
            $('#slide_main-'+id_to_activate).html($('#slide_main-'+id_to_activate).html());
            initializedObj['slide_main-'+id_to_activate] = true;
          }
        }

        //check for Maps and set default zoom bbox
        if (typeof GlobalContents.maps['slide_main-'+id_to_activate] != 'undefined'){
             console.log('reset zoom');
             GlobalContents.maps['slide_main-'+id_to_activate].map.zoomToBB(GlobalContents.maps['slide_main-'+id_to_activate].bounds);
        }

        //check floating open or close
         var ifopen = GlobalContents.floatings[ 'slide-'+id_to_activate ].open;
         minimize_floating(toggle=false,ifopen);

    });

}

function hide_LogoTitle(next_slide,first_slide){
    /*hide logo/title check*/
    //console.log(next_slide + " ccc " +first_slide);
    if (next_slide != first_slide){
        if(GlobalContents.floatings['slide-'+next_slide].logo){
                    $('#floating-slides-title').show();
            }else{
                    $('#floating-slides-title').hide();
        }
    }else{$('#floating-slides-title').show();}
}

/* keep visible main stage content based on floating slide id */
function render_slide (moveto,jump=false){

    var slides = $('.slides');
    var home_slide = $(slides[0]).attr('id');
    var act_slide_id = (typeof $('.slides[status="active"]').attr('id') === 'undefined') ? home_slide : $('.slides[status="active"]').attr('id');
    var act_slide = act_slide_id.split('-')[1];
    /* max and min slides id */
    var first_slide = $(slides[0]).attr('id').split('-')[1];
    var last_slide = $(slides[slides.length-1]).attr('id').split('-')[1];

    if (moveto == -9999 ){
        var next_sl_id = pad(first_slide,3);
        $('#floating-slides-title').show();
        activate_slide(next_sl_id);

    }else{
        if (jump){
            var active_slide_idx = $('.slides').index($('#'+act_slide_id));
            console.log(active_slide_idx);
            var next_slide_index = $('.slides')[ (moveto + active_slide_idx) ].id;
            console.log(next_slide_index);
            hide_LogoTitle(next_slide_index.split('-')[1],first_slide);
            activate_slide(next_slide_index.split('-')[1]);

        }else{
            if (moveto < 0 ){
                var next_slide_index = $('#'+act_slide_id).prev().attr('id');
                if (typeof(next_slide_index) != 'undefined'){
                    hide_LogoTitle(next_slide_index.split('-')[1],first_slide);
                    activate_slide(next_slide_index.split('-')[1]);
                }else{
                    next_slide_index = first_slide;
                    hide_LogoTitle(next_slide_index,first_slide);
                    console.log('Reached first slide.');
                }

            }else if (moveto > 0){
                var next_slide_index = $('#'+act_slide_id).next().attr('id');
                if (typeof(next_slide_index) != 'undefined'){
                    hide_LogoTitle(next_slide_index.split('-')[1],first_slide);
                    activate_slide(next_slide_index.split('-')[1]);
                }else{
                    next_slide_index = last_slide;
                    hide_LogoTitle(next_slide_index,first_slide);
                    console.log('Reached Last slide.');
                }
            }
        }
        console.log('next slide is: '+next_slide_index +'('+first_slide+'-'+last_slide+')');
        //var next_sl_id = pad( Math.max(parseInt(act_slide) + moveto , 0 ) , 3 );
        var next_sl_id = next_slide_index.split('-')[1];
    }
    return true;
}

function list_slides(){

    $('#slides-list, #slides-home').empty();
    var slides_floating = $('.slides');
    var home_slide = $(slides_floating[0]).attr('id');
    var slides_main = $('.slide-main-area');

    $('#slides-home').append('<li class="list-group-item d-flex justify-content-between align-items-center">\
        <i class="fab fa-fort-awesome"></i>'+home_slide+'|\
        '+GlobalContents.floatings[home_slide].title+' <i class="fas fa-minus"></i> </li>');

    for (var i=1; i < slides_floating.length; i++){
        $('#slides-list').append('<li class="ui-state-default list-group-item d-flex justify-content-between align-items-center">\
        <i class="far fa-hand-rock btn"></i><div class="ordered-div" target="'+$(slides_floating[i]).attr('id')+'">'+$(slides_floating[i]).attr('id')+'|\
        '+GlobalContents.floatings[$(slides_floating[i]).attr('id')].title+'</div><i class="fas fa-trash delete-slide btn" target="'+$(slides_floating[i]).attr('id')+'"></i></li>');
    }

    $('.delete-slide').on('click',function(){
        //..can't delete first slide
        var ns = $(this).attr('target').split('-')[1];
        $('#slide-' +ns  ).remove();
        $('#slide_main-'+ns).remove();
        console.log('Slide: '+ns+' Deleted.');
        updateSlideCounter();
        //..TODO REMOVE FROM DB ALSO!
        list_slides();
        activate_slide(home_slide.split('-')[1]);

        //delete floatings
        if ( GlobalContents.floatings.hasOwnProperty( 'slide-'+ns ) ){
            delete GlobalContents.floatings['slide-'+ns];
        }
        //delete mains
        if ( GlobalContents.mains.hasOwnProperty( 'slide_main-'+ns ) ){
            delete GlobalContents.mains['slide_main-'+ns];
        }

      //delete maps
        if ( GlobalContents.maps.hasOwnProperty( 'slide_main-'+ns ) ){
            delete GlobalContents.maps['slide_main-'+ns];
        }
        if ( GlobalContents.maps.hasOwnProperty( 'slide-'+ns ) ){
            delete GlobalContents.maps['slide-'+ns];
        }
        console.log(GlobalContents.maps);
        //..TODO delete contents from DB

    });
}

function updateSlideCounter(){
    var slides = $('.slides');
    var nslides = slides.length;
    var act_slide_id = $('.slides[status="active"]').attr('id');
    var indexofslide = slides.index($('#'+act_slide_id)) +1;

    $('#pagination_story .this_page').attr('tabindex',indexofslide);
    $('#pagination_story .this_page').attr('title',indexofslide+' (' + (nslides) + ')');
    $('#pagination_story .this_page').attr('data-original-title', indexofslide+' (' + (nslides) + ')');
    $('#pagination_story .this_page #counter-pages').html(indexofslide+' (' + (nslides) + ')');
}

function applyStyle(){
    /* Apply Global classes css */
    $("#override_style").html('<style type="text/css"></style>');
    var new_stylesheet = $("#override_style").children(':last');
    var new_css = "";
    $.each( Object.keys(GlobalOptions.classes), function(idx,i_class) {
        new_css += "." + i_class + "{";
        $.each( GlobalOptions.classes[i_class].css, function(key,val){
            new_css += key + ':' + val + '!important;';
        });
        new_css += "} ";
    } )
    new_stylesheet.html(new_css);
    console.log('Store GlobalOptions to DB: TODO!');
    console.log(GlobalOptions);
}

function loadStoryTitle(){
    var content = GlobalContents.title['floating-slides-title'].content;
    $('#floating-slides-title').html(content);
}

function loadSlideContentStyle(sid){

    /* Load floating content and style */
    var content = GlobalContents.floatings[sid].content;
    var slide_css = GlobalContents.floatings[sid].css;
    var m_sid = 'slide_main-'+sid.split('-')[1];

    /* check existing div */
    if ($('#'+sid).length == 0){
       $('#main_slides_container').append('<div id="'+m_sid+'" class="slide-main-area main_padding_left vertical-middle" status="active" fullscreen="adapt"></div>');
       $('#floating_slides_container').append('<div id="'+sid+'" class="slides editablediv" status="active"></div>');
    }

    $('#'+sid).html( content );
    $('#'+sid).css(slide_css);
    // if( GlobalContents.floatings[sid].logo ){
    //     $('#floating-slides-title').delay(1000).show();
    // }else{
    //     $('#floating-slides-title').hide();
    // }

    /* Load Map if defined for this main div */
    if (GlobalContents.maps.hasOwnProperty(m_sid)){
        $('#'+m_sid).css({position:'absolute',width:'-webkit-fill-available',height:'-webkit-fill-available'});
        render_map(m_sid);
        render_slide(-9999);
    }else if(GlobalContents.iframes.hasOwnProperty(m_sid)){
        var main_content = GlobalContents.iframes[m_sid].iframe;
        var iframe_css = GlobalContents.iframes[m_sid].css;
        var fullscreen = GlobalContents.iframes[m_sid].fullscreen;

        if(fullscreen){
            $('#'+m_sid).removeClass('main_padding_left');
            $('#'+m_sid).attr('fullscreen','keep');
        }else{
            $('#'+m_sid).addClass('main_padding_left');
            $('#'+m_sid).attr('fullscreen','adapt');
        }

        $('#'+m_sid).attr('contenteditable','false');
        $('#'+m_sid).html(main_content);
        $('#'+m_sid + ' iframe').css( iframe_css );

    }else{
        /* Load main content and style */
        $('#'+m_sid).addClass('editablediv');
        var main_content = GlobalContents.mains[m_sid].content;
        var main_css = GlobalContents.mains[m_sid].css;
        $('#'+m_sid).html( main_content );
        $('#'+m_sid).css(main_css);
        /* Load classes to main div */
        $.each( GlobalContents.mains[m_sid].classes, function(idx,val){
          $('#'+m_sid).addClass(val);
        });
    }


    /* Update slide counter */
    updateSlideCounter();
}

function getAllContents(){
    GlobalContents.title['floating-slides-title'].content = $('#floating-slides-title').html();

    $.each( Object.keys(GlobalContents.floatings), function(idx,key){
        GlobalContents.floatings[key]["content"] = $('#'+key).html();
    });
    $.each( Object.keys(GlobalContents.mains), function(idx,key){
        /* Avoid Map html */
        if (GlobalContents.maps.hasOwnProperty(key) || GlobalContents.iframes.hasOwnProperty(key)){
            GlobalContents.mains[key]["content"] = "";
        }else{
            GlobalContents.mains[key]["content"] = $('#'+key).html();
        }
    });

    /* Clean Unecessary keys values eg. Map generated by Leaflet, will be re genrate when rendering */
    $.each(Object.keys(GlobalContents.maps),function(idx,key){
        GlobalContents.maps[key].map = null;
    });
}

function move2slideN(idx){
    if (idx!=0){
        console.log(idx);
        render_slide(idx,jump=true);
        //$('#slides_list_pophover').fadeOut().empty();
    }
}

function pophoverSlidesList(elem){
    $('#slides_list_pophover').empty();
    var slides_floating = $('.slides');
    var active_slide_idx = $('.slides').index($('.slides[status="active"]'));
    $.each(slides_floating,function(idx,val){
//           $('#slides_list_pophover').append('<div class="btn btn-sm btn-primary"  onclick="move2slideN('+(idx-active_slide_idx)+');">s.'+(idx+1)+'</div>');
//           $('#slides_list_pophover').append('<div class="btn btn-sm btn-light inrows" onclick="move2slideN('+(idx-active_slide_idx)+');">s.'+(idx+1)+'</div>');
     var slide_title = 's.' + idx+1;
     if (GlobalContents.floatings[val.id].hasOwnProperty('title')){
          slide_title = GlobalContents.floatings[val.id].title;
        }
     $('#slides_list_pophover').append('<div class="btn btn-sm btn-light inrows" onclick="move2slideN('+(idx-active_slide_idx)+');">'+(slide_title)+'</div>');
    })
    //$('#slides_list_pophover').fadeIn();

    //$('#slides_list_pophover').mouseleave(function() {
    //        $('#slides_list_pophover').fadeOut().empty();
    //});
}

function createMarkup(obj) {
  var keys = Object.keys(obj)
  if (!keys.length) return ''
  var i, len = keys.length
  var result = ''

  for (i = 0; i < len; i++) {
    var key = keys[i]
    var val = obj[key]
    result += key + ':' + val + ';'
  }

  return result
}

function minimize_floating(toggle=true,ifopen=true){
   if (toggle){
        $('#floatingcontent').toggleClass('minimized_floating',500);
        $('#minimize_floating i.fa-window-minimize').toggleClass('minimize_hide');
        $('#minimize_floating i.fa-window-maximize').toggleClass('minimize_hide');
        if ( $('.slide-main-area[status="active"]').attr('fullscreen') != 'keep' ){
            $('.slide-main-area[status="active"]').toggleClass('main_padding_left');
        }
        $('div.story_toolbox').toggleClass('toolbox-left-zero');
   }else{
     if (ifopen){
          if ( $('#floatingcontent').hasClass('minimized_floating' ) ){
              $('#floatingcontent').removeClass('minimized_floating',500);
              $('#minimize_floating i.fa-window-minimize').removeClass('minimize_hide');
              $('#minimize_floating i.fa-window-maximize').addClass('minimize_hide');
              if ( $('.slide-main-area[status="active"]').attr('fullscreen') != 'keep' ){
                  $('.slide-main-area[status="active"]').addClass('main_padding_left');
              }
              $('div.story_toolbox').removeClass('toolbox-left-zero');
          }else{

          }
     }else{
          if ( !$('#floatingcontent').hasClass('minimized_floating' ) ){
              $('#floatingcontent').addClass('minimized_floating',500);
              $('#minimize_floating i.fa-window-minimize').addClass('minimize_hide');
              $('#minimize_floating i.fa-window-maximize').removeClass('minimize_hide');
              if ( $('.slide-main-area[status="active"]').attr('fullscreen') != 'keep' ){
                  $('.slide-main-area[status="active"]').removeClass('main_padding_left');
              }
              $('div.story_toolbox').addClass('toolbox-left-zero');
          }
     }
   }
//           $('#minimize_floating i.fa-window-minimize').toggleClass('minimize_hide');
//         $('#minimize_floating i.fa-window-maximize').toggleClass('minimize_hide');
//         if ( $('.slide-main-area[status="active"]').attr('fullscreen') != 'keep' ){
//             $('.slide-main-area[status="active"]').toggleClass('main_padding_left');
//         }
//         $('div.story_toolbox').toggleClass('toolbox-left-zero');

}

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function enableScroll() {
    console.log('...Scroll Enabled again...');
    if (window.removeEventListener){
        window.removeEventListener('DOMMouseScroll', preventDefault, false);
    }
    window.onmousewheel = document.onmousewheel = null;
    window.onwheel = null;
    window.ontouchmove = null;
    document.onkeydown = null;
}

function disableScroll(callback) {
  console.log('...Scroll Disabled...');
  if (window.addEventListener) {// older FF
      window.addEventListener('DOMMouseScroll', preventDefault, false);
  }
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
  document.onkeydown  = preventDefaultForScrollKeys;
  //$('#'+get_current_mainslide_id()).ready( setTimeout(enableScroll(),2500) );
  //setTimeout(function(){ enableScroll() },2500);
}

function arcgis_replace_extents(iframe_str=false){

  if (!iframe_str){
    iframe_str = $('#input_content_iframe_arcgis').val();
  }

  var extents = [];
          $('input.input-arcgis-extent').each(function(){
            extents.push($(this).val());
          });
          console.log(iframe_str.replace(/[\?&]extent=([^&]+)/g,'&extent='+extents.join(',')))
          $('#input_content_iframe_arcgis').val(iframe_str.replace(/[\?&]extent=([^&]+)/g,'&extent='+extents.join(',')));
          //console.log();
}

function arcgis_iframe_extent(iframe_str){
  var extent = $.parseJSON(  '[' + new RegExp('[\?&]extent=([^&]+)').exec($.parseHTML(iframe_str)[0].src)[1] + ']');
  //$('#arcgis_extent').html('&nbsp;Extent:&nbsp;');
  $('#arcgis_extent').empty();
        $.each(extent,function(idx,value){
          $('#arcgis_extent').append('<input class="form-control input-arcgis-extent" type="numeric" name="'+idx+'" value="'+value+'">&nbsp;');
        });
        $('.input-arcgis-extent').on('change paste keyup',function(){
          arcgis_replace_extents(iframe_str);
        })
  return extent;
}

function init_replace_cke_iframes(chandler=""){
    $(chandler + '.cke_iframe').each(function(){
          if (!$(this).next().is('iframe')){
             var iframe = decodeURIComponent($(this).attr('data-cke-realelement'));
             var iframe_elem = $(iframe).addClass('cke_iframe_rendered');
             $(this).after(iframe_elem);
             $(this).hide();
          }
        });
}

function ckeditor_iframes_replace(){
   //console.log('Duccio re-replaces');
  //Replacing CKEDITOR iFrames when leaving focus from inline editing
//     $('.slide-main-area').on('focusout',function(){
   //Replacing CKEDITOR iFrames when leaving focus from inline editing floating section
     $(document).on('focusout','.slide-main-area', function(){
        init_replace_cke_iframes(".slide-main-area "); //space is important here
    })
//     $('.slide-main-area').on('focusin',function(){
    $(document).on('focusin','.slide-main-area',function(){
//         $('.slide-main-area .cke_iframe').each(function(){
        $('.slide-main-area .cke_iframe_rendered').remove();
        $(this).find('.cke_iframe').each(function(){
              $(this).show();
        });
    })
    //Replacing CKEDITOR iFrames when leaving focus from inline editing floating section
     $(document).on('focusout','.slides', function(){
        init_replace_cke_iframes(".slides "); //space is important here
    })
    $(document).on('focusin','.slides',function(){
        $('.slides .cke_iframe_rendered').remove();
        $(document).find('.slides .cke_iframe').each(function(){
           $(this).show();
        });
    })
}

function getmap_key(title_pk){
  if (Object.keys(GlobalMaps).length > 0){
    var next_key = (Math.max( Array.from(Object.keys(GlobalMaps), x => parseInt(x))) + 1).toString();
    /* Override if existing */
    $.each( GlobalMaps, function(key,obj){
      if (title_pk == obj.map.general_info.map_name){
        next_key = key;
      }
    });
    return next_key;
  }else{
    return '0';
  }
}
