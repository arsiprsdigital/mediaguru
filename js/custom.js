(function ($) {
  "use strict";
    $(window).load(function(){
      $('.preloader').fadeOut(1000);   
    });
    
    $('.navbar-collapse a').on('click',function(){
      $(".navbar-collapse").collapse('hide');
    });

    $(window).scroll(function() {
      if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
          } else {
            $(".navbar-fixed-top").removeClass("top-nav-collapse");
          }
    });
    
    $.stellar({
      horizontalScrolling: false,
    }); 

    $('.image-popup').magnificPopup({
        type: 'image',
        removalDelay: 300,
        mainClass: 'mfp-with-zoom',
        gallery:{
          enabled:true
        },
        zoom: {
        enabled: true, 
        duration: 300, 
        easing: 'ease-in-out',
        opener: function(openerElement) {
        return openerElement.is('img') ? openerElement : openerElement.find('img');
        }
      }
    });

    $(function() {
      $('.custom-navbar a, #home a').on('click', function(event) {
        var $anchor = $(this);
          $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - 49
          }, 1000);
            event.preventDefault();
      });
    });  

})(jQuery);


document.addEventListener("contextmenu", (e) => e.preventDefault());
document.addEventListener("selectstart", (e) => e.preventDefault());
document.addEventListener("dragstart", (e) => e.preventDefault());
["copy", "cut", "paste"].forEach(evt => {
  document.addEventListener(evt, (e) => e.preventDefault());
});
document.addEventListener("keydown", function(e) {
  if (
    (e.ctrlKey && ["c", "u", "x", "v", "a", "s", "p"].includes(e.key.toLowerCase())) ||
    e.key === "F12" ||
    (e.ctrlKey && e.shiftKey && ["i", "j", "c"].includes(e.key.toLowerCase()))
  ) {
    e.preventDefault();
  }
});
