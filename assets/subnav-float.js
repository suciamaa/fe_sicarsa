// Floating subnav and responsive helpers copied/adjusted from landing page
(function(){
  // Enable hover dropdown functionality (desktop)
  function enableHoverDropdown(){
    document.querySelectorAll('.dropdown').forEach(function(dropdown) {
      dropdown.addEventListener('mouseenter', function() {
        if (window.innerWidth >= 992) {
          const dropdownMenu = this.querySelector('.dropdown-menu');
          if (dropdownMenu) dropdownMenu.classList.add('show');
        }
      });
      dropdown.addEventListener('mouseleave', function() {
        if (window.innerWidth >= 992) {
          const dropdownMenu = this.querySelector('.dropdown-menu');
          if (dropdownMenu) dropdownMenu.classList.remove('show');
        }
      });
    });
  }

  // Inject minimal styles for floating subnav
  function injectFloatingStyles(){
    const css = `
    .floating-subnav{position:fixed;top:68px;right:16px;width:260px;background:#fff;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,0.12);z-index:2050;padding:8px;display:none}
    .floating-subnav.open{display:block}
    .floating-subnav .fs-close{position:absolute;right:8px;top:6px;border:none;background:transparent;font-size:22px}
    .floating-subnav .fs-list{list-style:none;margin:0;padding:8px}
    .floating-subnav .fs-list li{padding:10px;border-radius:8px;cursor:pointer}
    .floating-subnav .fs-list li:hover{background:rgba(18,153,144,0.05)}
    .floating-subnav .fs-item{display:flex;justify-content:space-between;align-items:center}
    .floating-subnav .fs-submenu{position:absolute;top:0;left:-240px;width:220px;background:#fff;border-radius:8px;box-shadow:0 8px 20px rgba(0,0,0,0.08);padding:8px;display:none}
    .floating-subnav .fs-submenu.open{display:block}
    `;
    const s = document.createElement('style'); s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
  }

  function setupFloatingSubnav(){
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const floatWrap = document.createElement('div');
    floatWrap.className = 'floating-subnav';
    floatWrap.innerHTML = '<button class="fs-close" aria-label="Close">&times;</button><ul class="fs-list"></ul>';
    document.body.appendChild(floatWrap);

    const fsList = floatWrap.querySelector('.fs-list');
    const fsClose = floatWrap.querySelector('.fs-close');

    function closeFloat(){ floatWrap.classList.remove('open'); document.removeEventListener('click', outsideHandler); }
    fsClose.addEventListener('click', closeFloat);

    const topItems = document.querySelectorAll('.navbar-nav > .nav-item');
    topItems.forEach(function(item){
      const a = item.querySelector('.nav-link');
      if (!a) return;
      const li = document.createElement('li');
      li.innerHTML = '<div class="fs-item">'+a.textContent.trim()+' <span class="chev">›</span></div>';
      fsList.appendChild(li);

      const submenu = item.querySelector('.dropdown-menu');
      if (submenu) {
        const subPanel = document.createElement('div');
        subPanel.className = 'fs-submenu';
        const subul = document.createElement('ul'); subul.style.listStyle='none'; subul.style.padding='0'; subul.style.margin='0';
        Array.from(submenu.querySelectorAll('.dropdown-item')).forEach(function(si){
          const subli = document.createElement('li');
          const link = document.createElement('a');
          link.href = si.getAttribute('href') || '#';
          link.textContent = si.textContent.trim();
          link.style.display='block'; link.style.padding='8px'; link.style.color='inherit'; link.style.textDecoration='none';
          subli.appendChild(link); subul.appendChild(subli);
        });
        subPanel.appendChild(subul); li.appendChild(subPanel);

        li.addEventListener('click', function(e){
          if (window.innerWidth < 992) {
            e.stopPropagation();
            floatWrap.classList.add('open');
            floatWrap.querySelectorAll('.fs-submenu').forEach(s=>s.classList.remove('open'));
            subPanel.classList.add('open');
            setTimeout(()=>document.addEventListener('click', outsideHandler), 10);
          }
        });
      } else {
        li.addEventListener('click', function(){ window.location = a.getAttribute('href') || '#'; });
      }
    });

    function outsideHandler(e){ if (!floatWrap.contains(e.target)) closeFloat(); }

    let trigger = document.getElementById('mobileFloatTrigger');
    if (!trigger) {
      trigger = document.createElement('button');
      trigger.id = 'mobileFloatTrigger';
      trigger.className = 'd-lg-none';
      trigger.setAttribute('aria-label','Open menu');
      trigger.style.background='transparent'; trigger.style.border='none'; trigger.style.fontSize='22px';
      trigger.innerHTML = '<i class="bi bi-list"></i>';
      const brand = document.querySelector('.navbar-brand');
      if (brand && brand.parentNode) brand.parentNode.insertBefore(trigger, brand.nextSibling);
    }
    trigger.addEventListener('click', function(e){
      e.stopPropagation(); floatWrap.classList.toggle('open'); floatWrap.querySelectorAll('.fs-submenu').forEach(s=>s.classList.remove('open'));
      if (floatWrap.classList.contains('open')) setTimeout(()=>document.addEventListener('click', outsideHandler), 10);
    });
  }

  // Initialize when DOM ready
  document.addEventListener('DOMContentLoaded', function(){
    enableHoverDropdown();
    injectFloatingStyles();
    setupFloatingSubnav();
    responsiveSidebar();
  });

  // Responsive: remove/restore Left Sidebar (JS-only) on small screens
  // It looks for a `.list-group` inside a `.col-lg-4` and removes that column on small viewports (<992px).
  const _sidebarState = { node: null, parent: null, next: null };
  function responsiveSidebar(){
    function findSidebarCol(){
      const list = document.querySelector('.col-lg-4 .list-group.list-group-flush, .col-lg-4 .list-group');
      return list ? list.closest('.col-lg-4') : null;
    }

    function removeSidebar(col){
      if (!col || _sidebarState.node) return;
      _sidebarState.node = col;
      _sidebarState.parent = col.parentNode;
      _sidebarState.next = col.nextSibling;
      _sidebarState.parent.removeChild(col);
    }

    function restoreSidebar(){
      if (!_sidebarState.node) return;
      if (_sidebarState.parent) {
        if (_sidebarState.next) _sidebarState.parent.insertBefore(_sidebarState.node, _sidebarState.next);
        else _sidebarState.parent.appendChild(_sidebarState.node);
      }
      _sidebarState.node = null; _sidebarState.parent = null; _sidebarState.next = null;
    }

    function check(){
      const col = findSidebarCol();
      if (window.innerWidth < 992) {
        // if sidebar exists in DOM, remove it; if already removed, nothing to do
        if (col) removeSidebar(col);
      } else {
        // restore only if we previously removed it
        if (!_sidebarState.node) return;
        restoreSidebar();
      }
    }

    window.addEventListener('resize', check);
    window.addEventListener('orientationchange', check);
    // run immediately in case DOM already loaded
    check();
  }
})();
