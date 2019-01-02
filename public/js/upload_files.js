import {update_front_with_msg, update_front_with_errors} from './front-update.js';
var session = JSON.parse(sessionStorage.getItem('session'));
//sessionStorage.clear();
//console.log(session);
var user = null;
var userId = null;
var token = null;
var iframe;
var upload_imgs_link = $("a[data-action='images']");
upload_imgs_link.on("click", on_upload_imgs_link_click);
var upload_file_input = $("input[name='uploaded_file']");
upload_file_input.on('filepreupload', single_file_preupload);
upload_file_input.on('fileuploaded', single_file_uploaded);
if (session != null && session.user != undefined){
    user = session.user;
    userId = user.id;
    token = session.token;
}
function on_upload_imgs_link_click(event){
    event.preventDefault();
    var link = $(event.target).parents("a[data-action='images']");
    if (link.length == 0)
        link = $(event.target);
    var div = $("div#"+$(link[0]).data("form"));
    var files = div.find("input[name='uploaded_file']");
    var datas = {}
    datas.file_profileId = div.data("profil");
   if (datas.file_profileId != 0){
        $(files[0]).fileinput("upload");
        // $.ajax({
        //     type: "POST",
        //     url: '/upload-files',
        //     beforeSend: function (req){
        //         req.setRequestHeader("x-access-token", token);
        //     },
        //     data: datas,
        //     success: function(data){
        //         update_front_with_msg(data, "upload-files-msg");
        //     }
        // })
    }else{
        update_front_with_msg({success: [false], global_msg: ["Veuillez remplir votre profile avant de modifier votre galerie d'images !"]}, "upload-files-msg");
    }
}
function single_file_preupload(e, data, previewId, index){
    var form = data.form, files = data.files, extra = data.extra;
    form.append("file_profileId", $("div#images").data("profil"));
}
function single_file_uploaded(e, data, previewId, index){
    var form = data.form, files = data.files, extra = data.extra;
    var content = '<div class="file-preview-thumbnails"><div class="file-preview-frame" id="preview-1541678623004-0" data-fileindex="0"><img src='+data.response.path+' class="file-preview-image" title="Capture.PNG" alt="Capture.PNG" style="width:auto;height:160px;"><div class="file-thumbnail-footer"><div class="file-actions"><div class="file-footer-buttons" style="position: absolute; right: 0; bottom: 0;"><button type="button" onclick="removeFile("path a checker")" style="background: #c6454a;" class="kv-file-remove btn btn-xs btn-default" title="Remove file"><i class="glyphicon glyphicon-trash" style="color:#ffff"></i></button></div><div class="clearfix"></div></div></div></div></div>';
    $('#docImg').append(content);
    console.log(data.response)
}
$(document).on('click', '#redirectAdmin', function(event) {
    event.preventDefault();
    $("#switcher-button2").trigger('click');
    $($('iframe[src="/chat"]')[0].contentDocument).find("#friends").trigger('click');
	$($('iframe[src="/chat"]')[0].contentDocument).find(".friend:nth-child(1)").trigger('click');
});