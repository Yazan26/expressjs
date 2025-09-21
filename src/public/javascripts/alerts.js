// Themed Bootstrap alert helper (dark mode aware)
// Replaces window.alert with a non-blocking toast-like dismissible alert.
(function(){
  const LEVEL_MAP = {
    success: {icon: 'fa-circle-check', cls: 'alert-success'},
    info: {icon: 'fa-circle-info', cls: 'alert-info'},
    warning: {icon: 'fa-triangle-exclamation', cls: 'alert-warning'},
    danger: {icon: 'fa-octagon-exclamation', cls: 'alert-danger'},
    error: {icon: 'fa-octagon-exclamation', cls: 'alert-danger'},
    default: {icon: 'fa-bell', cls: 'alert-secondary'}
  };

  function ensureContainer(){
    let c = document.getElementById('globalAlertRegion');
    if(!c){
      c = document.createElement('div');
      c.id = 'globalAlertRegion';
      c.className = 'position-fixed top-0 start-50 translate-middle-x p-3 mt-3';
      c.style.zIndex = 2000;
      document.body.appendChild(c);
    }
    return c;
  }

  function buildAlert(message, level='info', opts={}){
    const container = ensureContainer();
    const meta = LEVEL_MAP[level] || LEVEL_MAP.default;
    const alert = document.createElement('div');
    alert.className = `alert ${meta.cls} mx-alert shadow fade show d-flex align-items-start gap-2 mb-2 border-0`; // custom class for extra theme styling
    alert.setAttribute('role','alert');

    const iconWrapper = document.createElement('span');
    iconWrapper.innerHTML = `<i class="fas ${meta.icon}"></i>`;
    iconWrapper.className = 'pt-1';

    const msgWrapper = document.createElement('div');
    msgWrapper.innerHTML = opts.html ? message : escapeHtml(message);

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'btn-close btn-close-white ms-auto';
    closeBtn.setAttribute('data-bs-dismiss','alert');
    closeBtn.setAttribute('aria-label','Close');
    closeBtn.addEventListener('click', ()=> alert.remove());

    alert.appendChild(iconWrapper);
    alert.appendChild(msgWrapper);
    alert.appendChild(closeBtn);

    container.appendChild(alert);

    // auto dismiss
    const timeout = opts.timeout === 0 ? 0 : (opts.timeout || 5000);
    if(timeout){
      setTimeout(()=> {
        alert.classList.remove('show');
        alert.addEventListener('transitionend', ()=> alert.remove());
      }, timeout);
    }
    return alert;
  }

  function escapeHtml(str){
    return str
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  // Expose helper
  window.mxAlert = buildAlert;

  // Override blocking alert
  const nativeAlert = window.alert;
  window.alert = function(msg){
    buildAlert(String(msg), 'info');
    try { nativeAlert.call(window, msg); } catch(e) { /* ignore if blocked */ }
  };
})();
