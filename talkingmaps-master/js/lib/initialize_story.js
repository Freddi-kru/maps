/* TalkingStory initializations */

function initialize_with_first_slide(){
    /* initialize with slide 1 */
    applyStyle();
    loadStoryTitle();
    var sorted_ids = [];
    $.each(Object.keys(GlobalContents.floatings), function(idx, key){
        /* minus 1 because idx start from 0 while slides from 1 */
        sorted_ids.splice(GlobalContents.floatings[key].slide_n -1, 0, key);
    });
     $.each( sorted_ids, function(idx,key){
            console.log('Loading Slide: '+key);
            loadSlideContentStyle(key); //loads both slide and main

            //initialize tooltips
           tooltips();

        });
    render_slide(-9999);
}

function initialize_story_editing(){

    var deltaPage = 0;
    //initialize tooltips
    tooltips();

    //..iniitialize sql db
    var init_with_db = loadDB();

    $.when(init_with_db).then(
        //..initialize webStorage data if local sqlite db not found
        loadStorage()
    ).then(
        function(){ setTimeout(function(){initialize_with_first_slide();},200);}
    );

    //..initialize color Picker && Main Options Events
    new Picker({
        parent: document.querySelector('#options_background_color_floating'),
        onChange: function(color){
            //changeFloatingBkgdColor(color);
            $('#options_background_color_floating').css('background-color',color.rgbaString);
            GlobalOptions.classes.floatingcontent.css['background-color'] = color.rgbaString;
            applyStyle();

        }
    });
    new Picker({
        parent: document.querySelector('#options_text_color_floating'),
        onChange: function(color){
            $('#options_background_color_floating').css('color',color.rgbaString);
            GlobalOptions.classes.floatingcontent.css['color'] = color.rgbaString;
            applyStyle();

        }
    })
    new Picker({
        parent: document.querySelector('#options_box_shadow_floating'),
        onChange: function(color){
            $('#options_background_color_floating').css('box-shadow','0px 0px 15px 3px '+color.rgbaString);
            GlobalOptions.classes.floatingcontent.css['box-shadow'] = '0px 0px 15px 3px '+color.rgbaString;
            applyStyle();

        }
    })

//Picker for main content background color
new Picker({
    parent: document.querySelector('#options_background_color_main'),
    onChange: function(color){
        //changeFloatingBkgdColor(color);
        $('#options_background_color_main').css('background-color',color.rgbaString);
        //GlobalOptions.classes.floatingcontent.css['background-color'] = color.rgbaString; TO DO!!!!!!!!!!!!!!!!!!!!!!!!!!!
        applyStyle();

    }
});

    $('#options_floating_title').on('change',function(){
      var float_id = 'slide-' + get_current_mainslide_id().split('-')[1];
      GlobalContents.floatings[float_id]['title'] = $(this).val();
    });

    $('#options_floating_height').on('change',function(){
        // $('#floatingcontent').css('height',$(this).val()+"%");
        GlobalOptions.classes.floatingcontent.css.height = $(this).val()+"%";
        applyStyle();

    });
    $('#options_floating_width').on('change',function(){
        GlobalOptions.classes.floatingcontent.css.width = $(this).val()+'%';
        GlobalOptions.classes.main_padding_left.css['padding-left'] = (parseFloat($(this).val())+1) + '%';
        $('div.story_toolbox').css('left',(parseFloat($(this).val())+1) + '%');
        applyStyle();

    });

    CKEDITOR.config.extraPlugins = 'sourcedialog';
    CKEDITOR.config.allowedContent = true;

    // iframes objects auto-replace
    //init_replace_cke_iframes();
    ckeditor_iframes_replace();

  //...
    $('#collapse_nav, #nav-logo').on('click',function(){
            $('nav.navbar').slideUp();
            $('#collapsed_nav').slideDown();
    });
    $('#collapsed_nav').on('click',function(){
            $('nav.navbar').slideDown();
            $('#collapsed_nav').slideUp();
    });

    //$('.story_toolbox').show();
    $('nav.navbar').css('display','inline-flex');
    $('nav.navbar').slideDown();
    $('#collapse_nav').click();
    //$('#loader').hide();

    /* Add Slide Button */
    $('#button_add_slide').on('click',function(){
        var IDs = [];
        $('.slides').each(function(){ IDs.push(parseInt(this.id.split('-')[1])); });
        var nslides = IDs.length;
        var new_slide_id = Math.max.apply(Math, IDs) + 1;

        var floating_slide_id = 'slide-'+pad(new_slide_id,3);
        var main_slide_id = 'slide_main-'+pad(new_slide_id,3);

       $('.slide-main-area, .slides').hide();
       $('.slide-main-area, .slides').attr('status','');
       $('#main_slides_container').append('<div id="'+main_slide_id+'" class="slide-main-area main_padding_left vertical-middle editablediv" status="active" fullscreen="adapt"></div>');
       $('#floating_slides_container').append('<div id="'+floating_slide_id+'" class="slides editablediv" status="active"></div>');

       $('#floating-slides-title').fadeIn();
       GlobalContents.floatings[floating_slide_id] = {
            'logo' : true,
            'open' : true,
            'content' : 'Add your content here ...',
            'css' : {},
            'slide_n':new_slide_id
        };

        GlobalContents.mains[main_slide_id] = {
            'content':'<h1 style="text-align:center"><span style="font-size:72px">Add your content here ...</span></h1>',
            'css':{
                  'background-image':'url(./imgs/loading_img2.jpg)',
                  'background-size': 'cover',
                  'background-position':'50% 0%'
              }
        }

        loadSlideContentStyle(floating_slide_id);


       updateSlideCounter();
       console.log('Added slide '+pad(new_slide_id,3));
       $('.slides[status="active"] , .slide-main-area[status="active"] ').show();
       $('#floatingcontent').animate({ scrollTop: 5 }, 1000);
       //initialize tooltips
       tooltips();

       //enable editable divs
          var inlineeditor_m = CKEDITOR.inline( 'slide_main-'+pad(new_slide_id,3) );
          $('#'+'slide_main-'+pad(new_slide_id,3)).attr('contenteditable',true);
          var inlineeditor_f = CKEDITOR.inline( 'slide-'+pad(new_slide_id,3) );
          $('#'+'slide-'+pad(new_slide_id,3)).attr('contenteditable',true);

    });

    /* Edit Actions */
    $('#button_edit_content').on('click',function(){
        var act_slide = $('.slides[status="active"]').attr('id').split('-')[1];
        $('#exampleModalLabel').html('Edit Content - Slide: '+act_slide+' ('+$('.slides').length+')');

        //..TODO populate all tabs with specific slide ID content

        //populate title
        if (GlobalContents.floatings['slide-'+act_slide].hasOwnProperty('title')){
          $('#options_floating_title').val( GlobalContents.floatings['slide-'+act_slide].title);
        }else{
          $('#options_floating_title').val('');
        }

        // populate image background and css
        $('#input_content_img').val( GlobalContents.mains[get_current_mainslide_id()].css["background-image"].replace("url(","").replace(")","") );
        $('#input_content_img_css').val( createMarkup( GlobalContents.mains[get_current_mainslide_id()]["css"] ) );

        //populate main options
        if (GlobalContents.floatings['slide-'+act_slide].logo ){
            $("#options_title_on").prop('checked',true);
        }else{
            $("#options_title_on").prop('checked',false);
        }
        if (GlobalContents.floatings['slide-'+act_slide].open ){
            $("#options_floating_open").prop('checked',true);
        }else{
            $("#options_floating_open").prop('checked',false);
        }

        //populate iframe tab
        if (GlobalContents.iframes.hasOwnProperty(get_current_mainslide_id())){
            if (GlobalContents.iframes[get_current_mainslide_id()].fullscreen ){
                $("#input_content_iframe_fullscreen").prop('checked',true);
            }
            if (GlobalContents.iframes[get_current_mainslide_id()].iframe !== ''){
              var ifrm_src = $.parseHTML( GlobalContents.iframes[get_current_mainslide_id()].iframe )[0].src;
              if ( GlobalContents.iframes[get_current_mainslide_id()].type == 'url'){
                  $("#input_content_iframe").val(ifrm_src);
                }else if (GlobalContents.iframes[get_current_mainslide_id()].type == 'qgis'){
                  $("#input_content_iframe_qgis").val(ifrm_src);
                }else if (GlobalContents.iframes[get_current_mainslide_id()].type == 'arcgis'){
                  ifrm_src = GlobalContents.iframes[get_current_mainslide_id()].iframe;
                  $("#input_content_iframe_arcgis").val(ifrm_src);
                  var extent = arcgis_iframe_extent(ifrm_src);
                }
            }
        }


        //populate Main content Map tab
        $("#edit_content_map").load( "./templates/form_map.html" ,function() {
          console.log( "Template: ./templates/form_maps.html >> Loaded" );
          // initialize form
          populate_map_form(get_current_mainslide_id());

          // populate select existing maps
          if (Object.keys(GlobalMaps).length > 0){
              $.each(GlobalMaps,function(key,obj){
                 $('#select_existing_maps').append('<option class="add_existing_map" label="' + key + " | " + obj.map.general_info.map_name +'">'+ key +'</option>');
              });
          }else{
              $('#form_existing_maps').hide();
          }
        });

    });


    /* Manage SLides Actions */
    $( "#slides-list" ).sortable();
    $( "#slides-list" ).disableSelection();
    $('#button_manage_slides').on('click',function(){
        list_slides();
    });
    $('#save-slides-reordered').on('click',function(){
        var IDs = [];
        $('#slides-list .ordered-div').each(function(){ IDs.push( $(this).attr('target') )});
        console.log(IDs);
        if (IDs.length > 1){

            var slide_n = 2; //slide 1 can't be moved or deleted
            $(IDs).each(function(){
               $('#'+this).appendTo('#floating_slides_container');
               GlobalContents.floatings[this].slide_n = slide_n;
               slide_n+=1;
            });
            render_slide(-9999);
        }
    });

    $('#input_content_text_middle').on('change',function(){
        var this_slide_id= get_current_mainslide_id();
        var v_align = "top";
        if(this.checked){
            $('#'+this_slide_id).css('vertical-align','middle');
            v_align = 'middle';
            //$('#'+this_slide_id).addClass('vertical-middle');
        }else{
            $('#'+this_slide_id).css('vertical-align','top');
            //$('#'+this_slide_id).removeClass('vertical-middle');
        }
        GlobalContents.mains[this_slide_id].css['vertical-align'] = v_align;
    });

    /* Apply Changes Image background */
    $('#input_content_img').on('change',function(){
        var act_main_slide = get_current_mainslide_id();
        var content_image = $("#input_content_img").val();

        var content_image_css = $('#'+get_current_mainslide_id()).attr('style').replace(/(\r\n\t|\n|\r\t|\s)/gm,"").split(';');
        var css = {};
        for (var i=0; i<content_image_css.length;i++){
            if (content_image_css[i]!=""){
                css[ content_image_css[i].split(':')[0] ] = content_image_css[i].split(':')[1];
            }
        }
        css['background-image'] = 'url('+content_image+')';
        $('#'+act_main_slide).css( css );
        GlobalContents.mains[act_main_slide].css = css;
    });
     $('#input_content_img_css').on('change',function(){
        var act_main_slide = get_current_mainslide_id();
        var content_image_css = $("#input_content_img_css").val().replace(/(\r\n\t|\n|\r\t|\s)/gm,"").split(';');
        var css = {};
        for (var i=0; i<content_image_css.length;i++){
            if (content_image_css[i]!=""){
                css[ content_image_css[i].split(':')[0] ] = content_image_css[i].split(':')[1];
            }
        }

        if (GlobalContents.mains[act_main_slide].css.hasOwnProperty('background-image')){
            css['background-image'] = GlobalContents.mains[act_main_slide].css['background-image'];
        };
        $('#'+act_main_slide).css( css );
        GlobalContents.mains[act_main_slide].css = css;
    });

    /* populate and handle images background animations */
    $.each(animations_classes,function(key,val){
      $('#input_content_img_anim').append('<option value="'+key+'">'+val+'</option>');
    });
    $("#input_content_img_anim").on('change',function(){
      var act_main_slide = get_current_mainslide_id();
      var anim_class = $(this).val();
      if (!GlobalContents.mains[act_main_slide].hasOwnProperty('classes')){
        GlobalContents.mains[act_main_slide]['classes'] = [];
      }
      if ( GlobalContents.mains[act_main_slide]['classes'].indexOf(anim_class) < 0 ){
        GlobalContents.mains[act_main_slide]['classes'].push(anim_class);
      }
      $('#'+act_main_slide).addClass(anim_class);
      /* Remove all animation classes */
      if(anim_class==''){
        $('#'+act_main_slide).removeClass(Object.keys(animations_classes).join(' '));
        GlobalContents.mains[act_main_slide]['classes'] = [];
      }

    });

    /* Apply changes iFrame */
    $('#apply_iframe').on('click',function(){
        var url_iframe = $("#input_content_iframe").val();
        var url_iframe_qgis = $("#input_content_iframe_qgis").val();
        var iframe_arcgis = $("#input_content_iframe_arcgis").val();

      var content_iframe;
      var iframe_type;
      if (url_iframe.length == 0){
          if (url_iframe_qgis.length == 0){
            var arcgis_src = $.parseHTML(iframe_arcgis)[0].src;
            content_iframe = '<iframe src="'+arcgis_src+'"></iframe>'; //iframe_arcgis;
            iframe_type = 'arcgis';
          }else{
            content_iframe = '<iframe src="'+url_iframe_qgis+'"></iframe>';
            iframe_type = 'qgis';
          }
        }else{
          content_iframe = '<iframe src="'+url_iframe+'"></iframe>';
          iframe_type = 'url';
        }

        var fullscreen = $('#input_content_iframe_fullscreen').is(":checked");
        var content_iframe_css = $("#input_content_iframe_css").val().replace(/(\r\n\t|\n|\r\t|\s)/gm,"").split(';');
        var css = {};
        for (var i=0; i<content_iframe_css.length;i++){
            if (content_iframe_css[i]!=""){
                css[ content_iframe_css[i].split(':')[0] ] = content_iframe_css[i].split(':')[1];
            }
        }

        var act_main_slide = get_current_mainslide_id();
        $('#'+act_main_slide).attr('contenteditable','false');
        if ( CKEDITOR.instances.hasOwnProperty(act_main_slide) ){
            CKEDITOR.instances[act_main_slide].setReadOnly(true);
        }
        $('#'+act_main_slide).html(content_iframe);
        $('#'+act_main_slide + ' iframe').css( css );

        if(fullscreen==1 || fullscreen){
            $('#'+act_main_slide).removeClass('main_padding_left');
            $('#'+act_main_slide).attr('fullscreen','keep');
        }else{
            $('#'+act_main_slide).addClass('main_padding_left');
            $('#'+act_main_slide).attr('fullscreen','adapt');
        }

        GlobalContents.iframes[act_main_slide] = {};
        GlobalContents.iframes[act_main_slide]['type'] = iframe_type;
        GlobalContents.iframes[act_main_slide]['iframe'] = content_iframe;
        GlobalContents.iframes[act_main_slide]['css'] = css;
        GlobalContents.iframes[act_main_slide]['fullscreen'] = fullscreen;

    });
    $('#remove_iframe').on('click',function(){
       var act_main_slide = get_current_mainslide_id();
       $('#'+act_main_slide + ' iframe').remove();
       $('#'+act_main_slide).attr('contenteditable','true');
       if ( CKEDITOR.instances.hasOwnProperty(act_main_slide) ){
           CKEDITOR.instances[act_main_slide].setReadOnly(false);
       } else {
            $('#'+act_main_slide).addClass('editablediv');
            var inlineeditor = CKEDITOR.inline( act_main_slide );
            $('#'+act_main_slide).attr('contenteditable',true);
       }
       if (GlobalContents.iframes.hasOwnProperty(act_main_slide)){
           delete GlobalContents.iframes[act_main_slide];
       }
    });
    $('.delete-input').on('click',function(){
      $(this).closest('div.input-group').find('input').val('');
      $('#input_content_iframe').removeAttr('disabled');
      $('#input_content_iframe_qgis').removeAttr('disabled');
      $('#input_content_iframe_arcgis').removeAttr('disabled');
    });

    /* Save Changes Button Actions */
    $('#button_save_changes').on('click', function(event) {

        $('#loader').show();
        $('#save_changes_modal').hide();

         /* Remove rendered ckeditor iframes to avoid duplicates */
         $('.cke_iframe_rendered').remove();
         $('.cke_iframe').show();

        //..TODO save to obj then to LocalStorage and then to DBs option
        //..temporary setTimeout
        getAllContents();

        var ls_info = saveStorage();
        saveDB();

        //console.log(GlobalContents);

        setTimeout(function(){
            $('#loader').hide();
            $('#save_changes_modal_output').html('Web Local Storage in use: '+ls_info.used+' / left: '+ls_info.left);
            $('#save_changes_modal').modal('show');
        },2000);
    });


    /*Load db from file button*/
    var dbFileElm = document.getElementById('dbfile');
    dbFileElm.onchange = () => {
        var f = dbFileElm.files[0];
        var r = new FileReader();
        r.onload = function () {
            var text = r.result;
            var json = JSON.parse(text);
            $('#tm_ids_list').empty();

            var tm_id = Object.keys(json)[0];
            var load = loadFromDB(tm_id,json);
            $.when(load).then(function(){
              $('#tm_ids_list').html('<br><h5>TalkingMaps loaded from the uploaded backup.</h5><a href="?edit=true&id='+tm_id+'">Cick Here to open your TalkingMap</a>'); 
              loadStorage();
            }).then(
              function(){ setTimeout(function(){initialize_with_first_slide();},200); }
            );
//            var tm_ids = Object.keys(json);
//            $('#tm_ids_list').html('<br><h5>TalkingMaps loaded from the uploaded backup:</h5><hr></hr>');
//             $.each(tm_ids, function(index, tm_id) {
//                 var url = window.location.href.split('?')[0] + '?edit=true&id=' + tm_id;
//                 var load = loadFromDB(tm_id,json);
//                 $.when(load).then(function(){
//                   $('#tm_ids_list').append('<p><div class="tm-logo-icon"></div><a href="'+url+'" target="_blank"><button class="btn btn-sm btn-success"> '+tm_id+'</button></a></p>');
//                 });
//             });
            // do here
            //var story_id = urlParam('id');
//             loadFromDB(story_id,json);
//             var url = window.location.href.split('?')[0] + '?edit=true&id=' + urlParam('id');
//             window.open(url, '_self');
        };
        r.readAsText(f);
    }

    /* Preview Button */
    $('#preview').on('click',function(){
        var url = window.location.href.split('?')[0] + '?id=' + urlParam('id');
        window.open(url, '_blank');
    })

    /* Delete this TalkingStory from LocalStorage */
    $('#delete_this_talkingstory').on('click',function(){
        var confirm = confirmAction("This action can not be undone, proceed to delete this TalkingStory ?");
        if (confirm){
            var story_id = urlParam('id');

            deleteStorage('TalkingStory_'+story_id);
            deleteStorage('TalkingStory_maps_'+story_id);
            deleteStorage('TalkingStory_options_'+story_id);

            var url = window.location.href.split('?')[0] + '?edit=true&id=' + story_id;
            window.open(url,'_self');
        }
    });

    /* Main Options Actions */
    $('#options_title_on').on('change',function(){
       var floating_slide_id = $('.slides[status="active"]').attr('id');
       if ($(this).is(':checked')){
           GlobalContents.floatings[floating_slide_id].logo = true;
           $('#floating-slides-title').fadeIn();
       }else{
           GlobalContents.floatings[floating_slide_id].logo = false;
           $('#floating-slides-title').fadeOut();
       }
    });
    $('#options_floating_open').on('change',function(){
       var floating_slide_id = $('.slides[status="active"]').attr('id');
       if ($(this).is(':checked')){
           GlobalContents.floatings[floating_slide_id].open = true;
           minimize_floating(toggle=false,ifopen=true);
       }else{
           GlobalContents.floatings[floating_slide_id].open = false;
           minimize_floating(toggle=false,ifopen=false);
       }
    });

    $('.story_toolbox').fadeIn(3000);

  /* Text Area Options actions */
    // enable by default editable divs
    setTimeout( function(){
      $('.editablediv').each(function(idx,elem){
        var thisdiv = elem.id;
        $('#'+thisdiv).ready( function(){
          $('#'+thisdiv).attr('contenteditable',true);
          CKEDITOR.inline( thisdiv);
          console.log(thisdiv);
        })
      });
    },4000);

    return true;
}

function initialize_story_reading(){

        tooltips();
        //..disable editors tooltips
        $('.tooltipoff').tooltip('disable');

        //..iniitialize sql db
        var init_with_db = loadDB();

        $.when(init_with_db).then(
            //..initialize webStorage data if local sqlite db not found
            loadStorage()
        ).then(
            function(){ setTimeout(function(){
              initialize_with_first_slide();
              init_replace_cke_iframes();
            },4000);}
          //initialize_with_first_slide()
        );
        return true;
}

function after_initialization(){


        /* pophover Slides List */
    $('#slides-dropdown-button').on('click',function(){
       pophoverSlidesList(this);
    });

    var scroll2 = false;
    /* Scrolling check */
    $('.floatingcontent').on('scroll', function() {

        var IDs = [];
        $('.slides').each(function(){ IDs.push(this.id.split('-')[1]); });
        var nslides = IDs.length;
        var act_slide = $('.slides[status="active"]').attr('id').split('-')[1];

                if(Math.round($(this).scrollTop() + $(this).innerHeight(), 10) >= Math.round($(this)[0].scrollHeight, 10)) {
                    if (IDs[IDs.length-1]!=act_slide){
                        console.log('end reached');
                        disableScroll();
                        $('#loader').show();
                       if (scroll2 === false){
                        scrollUp(1)
                       }
                      scroll2 = true;
                      setTimeout(function(){if(scroll2){enableScroll();};scroll2=false;$('#loader').hide();},2500);
                    }
                }else if(Math.round( $(this).scrollTop() ) <= 0) {
                    console.log('Top reached');
                    disableScroll();
                    $('#loader').show();
                    if (scroll2 === false){
                      scrollUp(-1)
                    }
                    scroll2 = true;
                     setTimeout(function(){if(scroll2){enableScroll();};scroll2=false;$('#loader').hide();},2500);
                }

    });

    /* Inputs Roles */
    $('#input_content_iframe_arcgis').on('change paste keyup',function(){
      if ($(this).val() == ''){
        $('#input_content_iframe_qgis').removeAttr('disabled');
        $('#input_content_iframe').removeAttr('disabled');
      }else{
        $('#input_content_iframe_qgis').attr('disabled','disabled');
        $('#input_content_iframe').attr('disabled','disabled');
        var extent = arcgis_iframe_extent($('#input_content_iframe_arcgis').val());
      }
    });
    $('#input_content_iframe_qgis').on('change paste keyup',function(){
      if ($(this).val() == ''){
        $('#input_content_iframe_arcgis').removeAttr('disabled');
        $('#input_content_iframe').removeAttr('disabled');
      }else{
        $('#input_content_iframe_arcgis').attr('disabled','disabled');
        $('#input_content_iframe').attr('disabled','disabled');
      }
    });
    $('#input_content_iframe').on('change paste keyup',function(){
      if ($(this).val() == ''){
        $('#input_content_iframe_qgis').removeAttr('disabled');
        $('#input_content_iframe_arcgis').removeAttr('disabled');
      }else{
        $('#input_content_iframe_qgis').attr('disabled','disabled');
        $('#input_content_iframe_arcgis').attr('disabled','disabled');
      }
    });

    /* pagination actions */
    $('.page-link.enabled, .sm-page-link.enabled').on('click',function(){
        var moveto = parseInt( $(this).attr('tabdelta') );
        console.log('page delta: '+moveto);
        $('#floatingcontent').animate({ scrollTop: 5 }, 1000);
        render_slide(moveto);
    });
    $('#minimize_floating, #min-vertical-button').on('click',function(){
      minimize_floating(toggle=true);
    });

    return true;
}

/*--------------*/
if (urlParam('edit')=="true"){
    $.when(initialize_story_editing()).then(after_initialization()).done(function(){
        $('nav').show();
        $('nav.navbar').hide();
        $('#loader').hide();
        $('#empty_loading_background').fadeOut(2000);
    });
}else{
    $.when(initialize_story_reading()).then(after_initialization()).done(function(){
        $('#loader').hide();
        // $('nav').show();
        $('#empty_loading_background').fadeOut(2000);
    });
}
