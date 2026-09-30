const TABS={daily:['Sổ ăn hàng ngày',ModDaily,'daily.view'],master:['Danh mục',ModMaster,'master.view'],report:['Báo cáo',ModReports,'report.view'],users:['Người dùng',ModUsers,'users.manage']};
function go(t){if(!guard(TABS[t][2]))return;const v=document.getElementById('view');v.replaceWith(v.cloneNode(false));TABS[t][1].mount(document.getElementById('view'))}
function logout(){SystemAPI.logout();location.reload()}
function changePwd(){ModAuth.showChangePassword(false,start)}
function buildNav(){const u=SystemAPI.current();
 document.getElementById('nav').innerHTML=Object.entries(TABS).filter(([k,v])=>SystemAPI.can(v[2])).map(([k,v])=>`<button onclick="go('${k}')">${v[0]}</button>`).join('')+
  ` <span>${esc(u.name)} · ${esc((SystemAPI.role(u)||{}).name||'')}</span> <button onclick="changePwd()">Cài đặt mật khẩu</button> <button onclick="logout()">Đăng xuất</button>`}
async function start(){try{await MealAPI.boot()}catch(e){document.getElementById('view').innerHTML='<p style="color:#c00">Không tải được dữ liệu: '+esc(e.message)+'</p><button onclick="start()">Thử lại</button>';return}
 buildNav();
 const first=Object.keys(TABS).find(k=>SystemAPI.can(TABS[k][2]));
 if(first)go(first);else document.getElementById('view').innerHTML='<p>Tài khoản chưa được cấp quyền nào. Liên hệ quản trị.</p>'}
(async()=>{try{await SystemAPI.boot()}catch(e){return document.getElementById('view').textContent=e.message}
 SystemAPI.current()?start():ModAuth.showLogin(start)})();
