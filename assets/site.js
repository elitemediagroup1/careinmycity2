// CareInMyCity shared site behavior
(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.documentElement.classList.add('js-ready');

    // Carl widget accessibility fallback
    var carl = document.querySelector('.carl-widget');
    if (carl && !carl.getAttribute('aria-label')) {
      carl.setAttribute('aria-label', 'Start with Carl');
    }

    // Care option selector fallback
    var forms = document.querySelectorAll('form[data-care-router], .care-search-form');
    forms.forEach(function (form) {
      form.addEventListener('submit', function (e) {
        var select = form.querySelector('select');
        if (!select || !select.value) return;
        var base = window.location.pathname.replace(/\/?$/, '/');
        var target = base + select.value.replace(/^\//, '').replace(/\/?$/, '/') ;
        if (select.value.indexOf('/state/') === 0 || select.value.indexOf('../') === 0) {
          target = select.value;
        }
        e.preventDefault();
        window.location.href = target;
      });
    });
  });
})();
