(function ($) {

    "use strict";

    $(function () {
        let videoUrl = null;
        if (Dm.settings.env == 'local') {
           videoUrl = 'trailer.mp4'; 			
        } else {
           videoUrl = Dm.settings.bucket_uploadfiles_url + '/assets/video/trailer.mp4';
        }
        var video = $('#videoTrailer');
        video.attr('src', videoUrl);
        video[0].load();
    });

})(jQuery);