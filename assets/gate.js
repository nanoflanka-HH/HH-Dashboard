// 門禁設定區：後續若要改密碼或延長期限，改這兩行即可。
const DASHBOARD_PASSWORD = 'ABG0702';
const DASHBOARD_EXPIRES_AT = '2026-07-31T23:59:59+08:00';

(function(){
  const html = document.documentElement;
  html.classList.add('auth-locked');

  function formatDeadline(value){
    return new Date(value).toLocaleString('zh-TW',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'});
  }

  function isExpired(){
    return Date.now() > new Date(DASHBOARD_EXPIRES_AT).getTime();
  }

  function unlock(){
    sessionStorage.setItem('hhDashboardAuth','ok');
    html.classList.remove('auth-locked');
    const gate = document.getElementById('gateOverlay');
    if(gate) gate.remove();
  }

  function showGate(){
    const expired = isExpired();
    if(expired){
      html.classList.add('auth-expired');
    }

    const gate = document.createElement('div');
    gate.id = 'gateOverlay';
    gate.className = 'gate-overlay';
    gate.innerHTML = `
      <div class="gate-card ${expired ? 'gate-expired' : ''}" role="dialog" aria-modal="true" aria-labelledby="gateTitle">
        <div class="gate-lock">🔒</div>
        <h2 class="gate-title" id="gateTitle">HH 人力趨勢 Dashboard</h2>
        <p class="gate-desc">此頁面僅供指定人員於開放期間內瀏覽與填寫補充說明。</p>
        <div class="gate-deadline">本網頁開放期限至 ${formatDeadline(DASHBOARD_EXPIRES_AT)}。<br>${expired ? '目前已超過開放期限，網頁暫不開放。' : '逾期後將停止瀏覽與存檔功能。'}</div>
        <label class="gate-label" for="gatePassword">請輸入密碼</label>
        <input class="gate-input" id="gatePassword" type="password" autocomplete="current-password" placeholder="請輸入密碼後進入">
        <div class="gate-actions"><button class="gate-btn" id="gateSubmit" type="button">進入 Dashboard</button></div>
        <div class="gate-error" id="gateError"></div>
        <div class="gate-foot">若需延長開放期限或調整密碼，請由維護者更新 GitHub：assets/gate.js。</div>
      </div>`;
    document.body.appendChild(gate);

    if(expired){
      document.getElementById('gateError').textContent = '已逾期：請先延長開放期限後重新部署。';
      return;
    }

    const input = document.getElementById('gatePassword');
    const submit = document.getElementById('gateSubmit');
    const error = document.getElementById('gateError');

    function check(){
      if(input.value === DASHBOARD_PASSWORD){
        unlock();
      }else{
        error.textContent = '密碼錯誤，請重新輸入。';
        input.value = '';
        input.focus();
      }
    }

    submit.addEventListener('click', check);
    input.addEventListener('keydown', e => { if(e.key === 'Enter') check(); });
    setTimeout(()=>input.focus(),100);
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(isExpired()){
      sessionStorage.removeItem('hhDashboardAuth');
      showGate();
      return;
    }

    if(sessionStorage.getItem('hhDashboardAuth') === 'ok'){
      unlock();
      return;
    }

    showGate();
  });
})();
