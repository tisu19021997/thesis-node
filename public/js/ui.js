$(document).ready(function () {

  const bpTablet = '(max-width: 46.24em)';
  const bpDesktop = '(max-width 61.24em)';

  // navigation menu
  const menuItems = $('.c-nav__item');

  const multilevelNav = $('.c-nav.c-nav--multi-level');
  const navHeight = multilevelNav.outerHeight();
  const navWidth = multilevelNav.outerWidth();


  menuItems.each(
    function (index) {
      const child = $(this).find('.child').first();

      child.css('left', navWidth).css('height', navHeight + 36).css('width', navWidth + 1);

      $(this).hover(
        function (e) {
          child.addClass('active');
        },
        function (e) {
          child.removeClass('active');
        }
      )
    });

  //- Product quantity control
  $(document).on('click', '.js-option-control', function (e) {
    let controlScreen = $(this).siblings('.js-option-screen');
    let screenValue = parseInt(controlScreen.val());

    if ($(this).attr('data-control') === 'decrease') {
      if (screenValue === 0) {
        return;
      }
      screenValue -= 1;
    } else {
      screenValue += 1;
    }

    controlScreen.val(screenValue);
  });


  // Tab object
  $(document).on('click', '.c-tab__header-name', function (e) {
    e.preventDefault();

    const dataTab = e.target.dataset.tab;
    const tabToShow = $(`.c-tab__content-item[data-tab="${dataTab}"]`);
    const currentShowingTab = $('.c-tab__content-item.active');
    const currentShowingHeader = $('.c-tab__header-name.active');

    if (!$(this).hasClass('active')) {
      $(this).addClass('active');
    }

    if (!tabToShow.hasClass('active')) {
      // remove active state of current showing tab
      currentShowingTab.removeClass('active');
      // add active state to new tab
      tabToShow.addClass('active');
      // change the bottom border of tab header
      currentShowingHeader.removeClass('active');
    }

  })

});
