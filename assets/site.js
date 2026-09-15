(function(){
  "use strict";

  var nav     = document.getElementById('topnav');
  var navwrap = nav ? nav.querySelector('.navwrap') : null;
  var prog    = document.getElementById('prog');
  var totop   = document.getElementById('totop');
  var subnav  = document.querySelector('.subnav');

  /* ---- mark the current page in the top navigation ---- */
  if (navwrap){
    var here = location.pathname.split('/').pop() || 'index.html';
    Array.prototype.forEach.call(navwrap.querySelectorAll('a[data-page]'), function(a){
      if (a.dataset.page === here) a.classList.add('active');
    });
  }

  /* ---- in-page section tracking (sub-navigation) ---- */
  var subLinks = subnav ? Array.prototype.slice.call(subnav.querySelectorAll('a[href^="#"]')) : [];
  var sections = subLinks.map(function(a){ return document.getElementById(a.getAttribute('href').slice(1)); })
                         .filter(Boolean);
  var navH    = nav ? nav.offsetHeight : 0;
  var current = null;

  function onScroll(){
    var y   = window.pageYOffset || document.documentElement.scrollTop;
    var max = document.documentElement.scrollHeight - window.innerHeight;

    if (prog) prog.style.width = (max > 0 ? Math.min(y / max, 1) * 100 : 0) + '%';
    if (nav)   nav.classList.toggle('stuck', y > 4);
    if (totop) totop.classList.toggle('show', y > 520);

    if (!sections.length) return;

    /* the active section is the last one whose top has passed the nav baseline */
    var line = y + navH + 46;
    var active = sections[0];
    for (var i = 0; i < sections.length; i++){
      if (sections[i].offsetTop <= line) active = sections[i];
    }
    if (max - y < 4) active = sections[sections.length - 1];

    if (active !== current){
      current = active;
      subLinks.forEach(function(a){
        a.classList.toggle('active', a.getAttribute('href') === '#' + active.id);
      });
    }
  }

  var ticking = false;
  function schedule(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){ ticking = false; onScroll(); });
  }
  window.addEventListener('scroll', schedule, {passive:true});
  window.addEventListener('resize', function(){ navH = nav ? nav.offsetHeight : 0; schedule(); });

  if (totop){
    totop.addEventListener('click', function(){
      window.scrollTo({top:0, behavior:'smooth'});
      history.replaceState(null, '', location.pathname + location.search);
    });
  }

  /* ---- reveal sections on first entry ---- */
  var revealables = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {rootMargin:'0px 0px -8% 0px', threshold:0.04});
    Array.prototype.forEach.call(revealables, function(el){ io.observe(el); });
  } else {
    Array.prototype.forEach.call(revealables, function(el){ el.classList.add('in'); });
  }

  /* ---- tab groups (Publications) ---- */
  var tabs  = Array.prototype.slice.call(document.querySelectorAll('.tab'));
  var panes = tabs.map(function(t){ return document.getElementById(t.getAttribute('aria-controls')); });
  tabs.forEach(function(tab, i){
    tab.addEventListener('click', function(){
      tabs.forEach(function(t, j){
        var on = (j === i);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        if (panes[j]) panes[j].hidden = !on;
      });
      schedule();
    });
  });

  /* ---- type filter inside a pane ---- */
  var filts = Array.prototype.slice.call(document.querySelectorAll('.filt'));
  if (filts.length){
    var scope = document.getElementById(filts[0].dataset.scope) || document;
    var cards = Array.prototype.slice.call(scope.querySelectorAll('.card[data-type]'));
    filts.forEach(function(btn){
      btn.addEventListener('click', function(){
        var f = btn.dataset.f;
        filts.forEach(function(b){ b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        cards.forEach(function(c){
          c.dataset.hidden = (f === 'all' || c.dataset.type === f) ? '0' : '1';
        });
        schedule();
      });
    });
  }

  /* ---- land on the right section when arriving with a #hash ---- */
  if (location.hash){
    var t = document.getElementById(location.hash.slice(1));
    if (t) setTimeout(function(){ t.scrollIntoView(); schedule(); }, 0);
  }
  onScroll();
})();
