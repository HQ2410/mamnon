window.ModAuth=(function(){
 const $=id=>document.getElementById(id),v=id=>$(id).value,err=(m,ok)=>{$('err').style.color=ok?'#080':'#c00';$('err').textContent=m};
 const box=h=>{$('nav').innerHTML='';const o=$('view');o.replaceWith(o.cloneNode(false)); // bỏ onclick/onchange của tab trước còn gắn trên #view
  $('view').innerHTML=`<div style="max-width:340px;margin:40px auto">${h}<p id="err" style="color:#c00"></p></div>`};
 const inp=(id,ph,t)=>`<p><input id="${id}" type="${t||'text'}" placeholder="${ph}" style="width:100%"></p>`;
 const otp=id=>`<p><input id="${id}" inputmode="numeric" autocomplete="one-time-code" maxlength="7" placeholder="Mã OTP 6 số" style="width:100%;letter-spacing:4px;text-align:center"></p>`;
 const enter=(id,f)=>$(id).onkeydown=e=>{if(e.key==='Enter')f()};
 const grp=s=>s.replace(/(.{4})/g,'$1 ').trim();
 // bọc thao tác async: hiện lỗi thay vì ném ra ngoài
 const safe=f=>async()=>{try{await f()}catch(e){err(e.message)}};
 const M={
  showLogin(onOk){box(`<h3>Đăng nhập</h3>${inp('un','Tên đăng nhập')}${inp('pw','Mật khẩu','password')}<button id="ok">Đăng nhập</button> <button id="fp">Quên mật khẩu</button>`);
   const run=safe(async()=>{const u=await SystemAPI.login(v('un'),v('pw'));u.mustChange?M.showChangePassword(true,onOk):onOk()});
   $('ok').onclick=run;$('pw').onkeydown=e=>{if(e.key==='Enter')run()};$('fp').onclick=()=>M.showForgot(onOk);$('un').focus()},

  // Quên mật khẩu: nhập tên đăng nhập + OTP từ app Authenticator -> đúng thì cho đặt mật khẩu mới
  showForgot(onOk){box(`<h3>Quên mật khẩu</h3><p>Nhập tên đăng nhập và mã OTP hiện tại trong ứng dụng Google Authenticator.</p>${inp('un','Tên đăng nhập')}${otp('oc')}<button id="ok">Xác nhận</button> <button id="cx">Quay lại</button>`);
   const run=safe(async()=>{const t=await SystemAPI.verifyResetOtp(v('un'),v('oc'));M.showResetPassword(t,onOk)});
   $('ok').onclick=run;enter('oc',run);$('cx').onclick=()=>M.showLogin(onOk);$('un').focus()},
  showResetPassword(ticket,onOk){box(`<h3>Đặt mật khẩu mới</h3><p>Xác thực OTP thành công.</p>${inp('n1','Mật khẩu mới (≥ 8 ký tự)','password')}${inp('n2','Nhập lại mật khẩu mới','password')}<button id="ok">Lưu</button> <button id="cx">Hủy</button>`);
   const run=safe(async()=>{if(v('n1')!==v('n2'))throw new Error('Hai mật khẩu mới không khớp.');await SystemAPI.resetByTicket(ticket,v('n1'));M.showLogin(onOk);err('Đã đổi mật khẩu. Hãy đăng nhập bằng mật khẩu mới.',true)});
   $('ok').onclick=run;enter('n2',run);$('cx').onclick=()=>M.showLogin(onOk);$('n1').focus()},

  // Cài đặt mật khẩu: đổi mật khẩu + thiết lập khóa OTP (time-based) dùng cho "Quên mật khẩu"
  showChangePassword(forced,onDone){const u=SystemAPI.current(),on=SystemAPI.hasTotp(u);
   box(`<h3>Cài đặt mật khẩu</h3>${forced?'<p>Bạn cần đổi mật khẩu trước khi tiếp tục.</p>':''}
   <h4>Đổi mật khẩu</h4>
   ${inp('o','Mật khẩu hiện tại','password')}${inp('n1','Mật khẩu mới (≥ 8 ký tự)','password')}${inp('n2','Nhập lại mật khẩu mới','password')}
   <button id="ok">Lưu</button> ${forced?'<button id="lo">Đăng xuất</button>':'<button id="cx">Đóng</button>'}
   ${forced?'':`<hr><h4>Khóa OTP (Google Authenticator)</h4>
   <p>Trạng thái: <b style="color:${on?'#080':'#c00'}">${on?'Đã bật':'Chưa thiết lập'}</b>. Dùng để lấy lại mật khẩu khi quên.</p>
   ${inp('op','Mật khẩu hiện tại (để thiết lập OTP)','password')}
   <button id="su">${on?'Tạo khóa mới':'Thiết lập khóa OTP'}</button>${on?' <button id="off">Tắt OTP</button>':''}`}`);
   $('ok').onclick=safe(async()=>{if(v('n1')!==v('n2'))throw new Error('Hai mật khẩu mới không khớp.');await SystemAPI.changePassword(v('o'),v('n1'));onDone()});
   if(forced)$('lo').onclick=()=>{SystemAPI.logout();location.reload()};
   else{$('cx').onclick=onDone;
    $('su').onclick=safe(async()=>{const pw=v('op'),s=await SystemAPI.beginTotpSetup(pw);M.showTotpSetup(pw,s,onDone)});
    if(on)$('off').onclick=()=>M.showTotpOff(onDone)}},

  showTotpSetup(pw,s,onDone){
   const qr=qrcode(0,'M');qr.addData(s.uri);qr.make();
   box(`<h3>Thiết lập khóa OTP</h3>
   <ol style="padding-left:18px"><li>Mở Google Authenticator → dấu <b>+</b> → <b>Quét mã QR</b> (hoặc <b>Nhập khóa thiết lập</b>).</li><li>Nhập mã 6 số app hiển thị để xác nhận.</li></ol>
   <div style="width:200px;margin:auto">${qr.createSvgTag({cellSize:4,margin:8,scalable:true})}</div>
   <p style="text-align:center">Khóa thiết lập (theo thời gian):<br><code style="font-size:15px;user-select:all">${grp(s.secret)}</code></p>
   <p style="color:#666;font-size:12px">Giữ kín khóa này. Ai có khóa đều có thể đặt lại mật khẩu của bạn.</p>
   ${otp('oc')}<button id="ok">Xác nhận & bật</button> <button id="cx">Hủy</button>`);
   const run=safe(async()=>{await SystemAPI.enableTotp(pw,s.secret,v('oc'));M.showChangePassword(false,onDone);err('Đã bật OTP.',true)});
   $('ok').onclick=run;enter('oc',run);$('cx').onclick=()=>M.showChangePassword(false,onDone);$('oc').focus()},
  showTotpOff(onDone){box(`<h3>Tắt OTP</h3><p>Sau khi tắt, bạn sẽ không dùng được chức năng Quên mật khẩu.</p>${inp('op','Mật khẩu hiện tại','password')}${otp('oc')}<button id="ok">Tắt OTP</button> <button id="cx">Hủy</button>`);
   const run=safe(async()=>{await SystemAPI.disableTotp(v('op'),v('oc'));M.showChangePassword(false,onDone);err('Đã tắt OTP.',true)});
   $('ok').onclick=run;enter('oc',run);$('cx').onclick=()=>M.showChangePassword(false,onDone);$('op').focus()}};
 return M;
})();
