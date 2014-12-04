$(function(){
  $('#about_link').click(about_section);
  $('#projects_link').click(projects_section);
  $('#contact_link').click(contact_section);
});

function about_section(){
  $('#projects_section').hide();
  $('#contact_section').hide();
  $('#about_section').show();
}

function projects_section(){
  var slider = $('#slider');
  $('#about_section').hide();
  $('#contact_section').hide();
  $('#projects_section').show();
  slider.addClass('bxSlider');
  if ($('.bx-wrapper').length <= 0) {
    $('.bxslider').bxSlider({
    mode: 'fade',
    captions: true
});
}

}

function contact_section(){
  $('#projects_section').hide();
  $('#about_section').hide();
  $('#contact_section').show();
}