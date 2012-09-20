$(function () {
  window.prettyPrint(); //prettify.js

  var $tocToggle = $('#table-of-contents-toggle'),
      $toc       = $('#table-of-contents'),
      $tryToggle = $('#try-little-smallscript-toggle'),
      $try       = $('#try-little-smallscript'),
      $lss       = $('#lss-source'),
      $js        = $('#js-source'),
      $run       = $('#eval-button'),
      $error     = $('#lss-error'),
      $errorWrp  = $('.error');
  
  //show table of contents
  $tocToggle.click(function (e) {
    e.preventDefault();
    $toc.toggleClass('hidden');
  });

  //hide toc on click
  $toc.find('a').click(function () {
    $toc.addClass('hidden');
    setTimeout(function () {
      window.scrollTo(0, window.scrollY - 60);
    }, 100);
  });
  
  //show try littlesmallscript
  $tryToggle.click(function (e) {
    e.preventDefault();
    $try.toggleClass('hidden');
  });

  //compile on each keystroke
  $lss.on('keyup', function () {
    compileWriteAt($lss.val(), $js);
  });
  
  //run
  $run.click(function () {
    try {
      return alert(eval($js.val()));
    } catch (err) {
      return alert(err.message||err.type||"Error");
    }
  });

  function compileWriteAt (txt, jQ) {
    $error.text('');
    $errorWrp.hide();
    var js;
    try {
      js = new LittleSmallscript(txt, {prettyprint: true, optimization: true}).toJS();
    } catch (err) {
      $errorWrp.show();
      $error.text(err.message||err.type||"Error");
      if (err.partialjs) jQ.text(err.partialjs);
    }
    jQ.text(js);
    return js;
  };
});
