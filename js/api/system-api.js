// Người dùng / vai trò / phiên đăng nhập. DB.users -> roleId -> DB.roles -> permissions.
// Lưu ý: đây là kiểm soát phía trình duyệt; bảo mật thật cần kiểm tra thêm ở server/KIO.
window.SystemAPI=(function(){
 const T=MN_CONFIG.tables,S=DataStore,SK=MN_CONFIG.sessionKey,TTL=8*3600*1000;
 const PERMS={'daily.view':'Xem sổ ăn hàng ngày','daily.edit':'Nhập/sửa sổ ăn','master.view':'Xem danh mục','master.edit':'Sửa danh mục','report.view':'Xem báo cáo tuần/tháng','users.manage':'Quản lý người dùng'};
 const enc=s=>new TextEncoder().encode(s),hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
 async function hash(pw,salt){
  if(!(window.crypto&&crypto.subtle))throw new Error('Cần mở qua localhost hoặc HTTPS để mã hóa mật khẩu.');
  const k=await crypto.subtle.importKey('raw',enc(pw),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc(salt),iterations:100000},k,256))}
 const newSalt=()=>hex(crypto.getRandomValues(new Uint8Array(16)));
 const saveUsers=()=>S.save(T.users,DB.users),saveRoles=()=>S.save(T.roles,DB.roles);
 const fails={};
 function session(){try{const s=JSON.parse(localStorage.getItem(SK)||'null');return s&&s.exp>Date.now()?s:null}catch(e){return null}}
 function current(){const s=session();if(!s)return null;const u=DB.users.find(x=>x.id===s.uid);return u&&u.active?u:null}
 const role=u=>DB.roles.find(r=>r.id===u.roleId);
 function can(p){const u=current();if(!u)return false;const r=role(u);return !!r&&(r.permissions.includes('*')||r.permissions.includes(p))}
 const isAdmin=u=>{const r=role(u);return !!r&&r.permissions.includes('*')};
 const need=p=>{if(!can(p))throw new Error('Không có quyền: '+p)};
 const keepAdmin=(u,stillAdmin)=>{if(isAdmin(u)&&u.active&&!stillAdmin&&DB.users.filter(x=>x.active&&isAdmin(x)).length<=1)throw new Error('Phải còn ít nhất một quản trị viên đang hoạt động.')};
 const checkPw=p=>{if(!p||p.length<8)throw new Error('Mật khẩu tối thiểu 8 ký tự.')};
 async function mk(username,name,roleId,pw,mustChange){const s=newSalt();
  return{id:uid('u'),username:username.trim().toLowerCase(),name:name.trim(),roleId,salt:s,hash:await hash(pw,s),active:true,mustChange:!!mustChange}}
 const byId=id=>{const u=DB.users.find(x=>x.id===id);if(!u)throw new Error('Không tìm thấy người dùng.');return u};
// --- TOTP (RFC 6238, tương thích Google Authenticator): HMAC-SHA1, 6 số, chu kỳ 30 giây. Khóa lưu ở u.totp={secret,last} ---
 const B32='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567',ISSUER='MamNon',TICKET_TTL=5*60000,tickets={};
 const b32enc=b=>{let bits='',o='';for(const x of b)bits+=x.toString(2).padStart(8,'0');for(let i=0;i<bits.length;i+=5)o+=B32[parseInt(bits.slice(i,i+5).padEnd(5,'0'),2)];return o};
 const b32dec=s=>{let bits='';for(const c of String(s).replace(/[\s=-]/g,'').toUpperCase()){const i=B32.indexOf(c);if(i<0)throw new Error('Khóa không hợp lệ.');bits+=i.toString(2).padStart(5,'0')}
  return Uint8Array.from({length:Math.floor(bits.length/8)},(_,i)=>parseInt(bits.slice(i*8,i*8+8),2))};
 async function hotp(secret,counter){
  const k=await crypto.subtle.importKey('raw',b32dec(secret),{name:'HMAC',hash:'SHA-1'},false,['sign']),buf=new ArrayBuffer(8),dv=new DataView(buf);
  dv.setUint32(0,Math.floor(counter/2**32));dv.setUint32(4,counter>>>0);
  const h=new Uint8Array(await crypto.subtle.sign('HMAC',k,buf)),o=h[19]&15;
  return String(((h[o]&127)<<24|h[o+1]<<16|h[o+2]<<8|h[o+3])%1e6).padStart(6,'0')}
 // trả về bước 30s khớp mã (cho phép lệch ±1 bước do đồng hồ), hoặc null
 async function totpStep(secret,code){code=String(code||'').replace(/\s/g,'');if(!/^\d{6}$/.test(code))return null;
  const t=Math.floor(Date.now()/30000);for(const d of[0,-1,1])if(await hotp(secret,t+d)===code)return t+d;return null}
 const hasTotp=u=>!!(u&&u.totp&&u.totp.secret);
 async function verifyPw(u,pw){if(await hash(pw||'',u.salt)!==u.hash)throw new Error('Mật khẩu hiện tại không đúng.')}
 const lim=k=>{const f=fails[k]||{n:0,until:0};if(f.until>Date.now())throw new Error('Sai quá nhiều lần, thử lại sau '+Math.ceil((f.until-Date.now())/1000)+' giây.');return f};
 const bad=(k,f)=>{f.n++;if(f.n>=5){f.until=Date.now()+60000;f.n=0}fails[k]=f};
 return{PERMS,current,can,role,hasTotp,
  async boot(){DB.users=await S.load(T.users);DB.roles=await S.load(T.roles);
   let ch=false; // thêm vai trò/quyền mới của bản cập nhật, không gỡ quyền đã có
   for(const s of SEED_SYS.roles){const r=DB.roles.find(x=>x.id===s.id);
    if(!r){DB.roles.push(structuredClone(s));ch=true}
    else if((r.v||1)<s.v){s.permissions.forEach(p=>{if(!r.permissions.includes(p))r.permissions.push(p)});r.v=s.v;ch=true}}
   if(ch)await saveRoles();
   if(!DB.users.length){const a=await mk('admin','Quản trị viên','admin','admin123',true);a.id='u_admin';DB.users=[a]; // id cố định để 2 máy khởi tạo cùng lúc không sinh 2 admin
   await saveUsers()}},
  async login(un,pw){un=(un||'').trim().toLowerCase();const f=fails[un]||{n:0,until:0};
   if(f.until>Date.now())throw new Error('Sai quá nhiều lần, thử lại sau '+Math.ceil((f.until-Date.now())/1000)+' giây.');
   const u=DB.users.find(x=>x.username===un),ok=u&&u.active&&await hash(pw||'',u.salt)===u.hash;
   if(!ok){f.n++;if(f.n>=5){f.until=Date.now()+60000;f.n=0}fails[un]=f;throw new Error('Sai tên đăng nhập hoặc mật khẩu.')}
   delete fails[un];localStorage.setItem(SK,JSON.stringify({uid:u.id,exp:Date.now()+TTL}));return u},
  logout(){localStorage.removeItem(SK)},
  async changePassword(oldPw,newPw){const u=current();if(!u)throw new Error('Chưa đăng nhập.');
   if(await hash(oldPw||'',u.salt)!==u.hash)throw new Error('Mật khẩu cũ không đúng.');checkPw(newPw);
   if(newPw===oldPw)throw new Error('Mật khẩu mới phải khác mật khẩu cũ.');
   u.salt=newSalt();u.hash=await hash(newPw,u.salt);u.mustChange=false;await saveUsers()},
  // Bước 1 của thiết lập: xác thực mật khẩu, sinh khóa mới (CHƯA lưu cho tới khi nhập đúng mã ở enableTotp)
  async beginTotpSetup(pw){const u=current();if(!u)throw new Error('Chưa đăng nhập.');await verifyPw(u,pw);
   const secret=b32enc(crypto.getRandomValues(new Uint8Array(20)));
   return{secret,uri:'otpauth://totp/'+encodeURIComponent(ISSUER+':'+u.username)+'?secret='+secret+'&issuer='+encodeURIComponent(ISSUER)+'&algorithm=SHA1&digits=6&period=30'}},
  async enableTotp(pw,secret,code){const u=current();if(!u)throw new Error('Chưa đăng nhập.');await verifyPw(u,pw);
   const k='otp:'+u.id,f=lim(k),step=await totpStep(secret,code);if(step==null){bad(k,f);throw new Error('Mã OTP không đúng. Kiểm tra giờ trên điện thoại và thử lại.')}
   delete fails[k];u.totp={secret,last:step};await saveUsers()},
  async disableTotp(pw,code){const u=current();if(!u)throw new Error('Chưa đăng nhập.');if(!hasTotp(u))return;await verifyPw(u,pw);
   const k='otp:'+u.id,f=lim(k),step=await totpStep(u.totp.secret,code);if(step==null||step<=u.totp.last){bad(k,f);throw new Error('Mã OTP không đúng hoặc đã dùng rồi. Đợi mã mới và thử lại.')}
   delete fails[k];delete u.totp;await saveUsers()},
  async adminDisableTotp(id){need('users.manage');const u=byId(id);delete u.totp;await saveUsers()},
  // Quên mật khẩu: xác thực OTP (chưa cần đăng nhập) -> nhận "vé" 5 phút để đặt mật khẩu mới
  async verifyResetOtp(un,code){un=(un||'').trim().toLowerCase();const k='otp:'+un,f=lim(k),u=DB.users.find(x=>x.username===un);
   const step=u&&u.active&&hasTotp(u)?await totpStep(u.totp.secret,code):null;
   if(step==null||step<=u.totp.last){bad(k,f);throw new Error('Tên đăng nhập hoặc mã OTP không đúng (hoặc tài khoản chưa thiết lập OTP).')}
   delete fails[k];u.totp.last=step;await saveUsers(); // mỗi mã chỉ dùng một lần
   const t=hex(crypto.getRandomValues(new Uint8Array(16)));tickets[t]={uid:u.id,exp:Date.now()+TICKET_TTL};return t},
  async resetByTicket(ticket,newPw){const t=tickets[ticket];if(!t||t.exp<Date.now()){delete tickets[ticket];throw new Error('Phiên xác thực OTP đã hết hạn. Hãy thực hiện lại.')}
   checkPw(newPw);const u=byId(t.uid);u.salt=newSalt();u.hash=await hash(newPw,u.salt);u.mustChange=false;delete tickets[ticket];delete fails[u.username];await saveUsers()},
  async addUser({username,name,roleId,password}){need('users.manage');
   if(!/^[a-z0-9._-]{3,30}$/i.test(username||''))throw new Error('Tên đăng nhập 3-30 ký tự (chữ, số, . _ -).');
   if(DB.users.some(x=>x.username===username.trim().toLowerCase()))throw new Error('Tên đăng nhập đã tồn tại.');
   if(!(name||'').trim())throw new Error('Nhập họ tên.');if(!DB.roles.some(r=>r.id===roleId))throw new Error('Vai trò không hợp lệ.');checkPw(password);
   DB.users.push(await mk(username,name,roleId,password,true));await saveUsers()},
  async resetPassword(id,pw){need('users.manage');checkPw(pw);const u=byId(id);u.salt=newSalt();u.hash=await hash(pw,u.salt);u.mustChange=true;await saveUsers()},
  async setRole(id,roleId){need('users.manage');const u=byId(id),r=DB.roles.find(x=>x.id===roleId);if(!r)throw new Error('Vai trò không hợp lệ.');
   keepAdmin(u,r.permissions.includes('*'));u.roleId=roleId;await saveUsers()},
  async setActive(id,flag){need('users.manage');const u=byId(id);if(!flag){if(current().id===id)throw new Error('Không thể tự khóa tài khoản đang đăng nhập.');keepAdmin(u,false)}u.active=!!flag;await saveUsers()},
  async removeUser(id){need('users.manage');const u=byId(id);if(current().id===id)throw new Error('Không thể tự xóa tài khoản đang đăng nhập.');keepAdmin(u,false);
   DB.users=DB.users.filter(x=>x.id!==id);await saveUsers()}};
})();
