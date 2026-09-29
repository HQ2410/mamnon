window.ModAuth=(function(){
 const $=id=>document.getElementById(id),v=id=>$(id).value,err=m=>$('err').textContent=m;
 const box=h=>{$('nav').innerHTML='';$('view').innerHTML=`<div style="max-width:340px;margin:40px auto">${h}<p id="err" style="color:#c00"></p></div>`};
 const inp=(id,ph,t)=>`<p><input id="${id}" type="${t||'text'}" placeholder="${ph}" style="width:100%"></p>`;
 return{
  showLogin(onOk){box(`<h3>Đăng nhập</h3>${inp('un','Tên đăng nhập')}${inp('pw','Mật khẩu','password')}<button id="ok">Đăng nhập</button>`);
   const run=async()=>{try{const u=await SystemAPI.login(v('un'),v('pw'));u.mustChange?ModAuth.showChangePassword(true,onOk):onOk()}catch(e){err(e.message)}};
   $('ok').onclick=run;$('pw').onkeydown=e=>{if(e.key==='Enter')run()};$('un').focus()},
  showChangePassword(forced,onDone){box(`<h3>Đổi mật khẩu</h3>${forced?'<p>Bạn cần đổi mật khẩu trước khi tiếp tục.</p>':''}
   ${inp('o','Mật khẩu hiện tại','password')}${inp('n1','Mật khẩu mới (≥ 8 ký tự)','password')}${inp('n2','Nhập lại mật khẩu mới','password')}
   <button id="ok">Lưu</button> ${forced?'<button id="lo">Đăng xuất</button>':'<button id="cx">Hủy</button>'}`);
   $('ok').onclick=async()=>{try{if(v('n1')!==v('n2'))throw new Error('Hai mật khẩu mới không khớp.');await SystemAPI.changePassword(v('o'),v('n1'));onDone()}catch(e){err(e.message)}};
   if(forced)$('lo').onclick=()=>{SystemAPI.logout();location.reload()};else $('cx').onclick=onDone}};
})();
