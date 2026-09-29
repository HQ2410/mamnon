// Người dùng / vai trò / phiên đăng nhập. DB.users -> roleId -> DB.roles -> permissions.
// Lưu ý: đây là kiểm soát phía trình duyệt; bảo mật thật cần kiểm tra thêm ở server/KIO.
window.SystemAPI=(function(){
 const T=MN_CONFIG.tables,S=KioStore,SK=MN_CONFIG.sessionKey,TTL=8*3600*1000;
 const PERMS={'daily.view':'Xem sổ ăn hàng ngày','daily.edit':'Nhập/sửa sổ ăn','master.view':'Xem danh mục','master.edit':'Sửa danh mục','report.view':'Xem báo cáo tuần/tháng','users.manage':'Quản lý người dùng'};
 const enc=s=>new TextEncoder().encode(s),hex=b=>[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
 async function hash(pw,salt){
  if(!(window.crypto&&crypto.subtle))throw new Error('Cần mở qua localhost hoặc HTTPS để mã hóa mật khẩu.');
  const k=await crypto.subtle.importKey('raw',enc(pw),'PBKDF2',false,['deriveBits']);
  return hex(await crypto.subtle.deriveBits({name:'PBKDF2',hash:'SHA-256',salt:enc(salt),iterations:100000},k,256))}
 const newSalt=()=>hex(crypto.getRandomValues(new Uint8Array(16)));
 const pack=a=>a.map(r=>({id:r.id,payload:r})),saveUsers=()=>S.save(T.users,pack(DB.users)),saveRoles=()=>S.save(T.roles,pack(DB.roles));
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
 return{PERMS,current,can,role,
  async boot(){DB.users=(await S.load(T.users)).map(r=>r.payload);DB.roles=(await S.load(T.roles)).map(r=>r.payload);
   let ch=false; // thêm vai trò/quyền mới của bản cập nhật, không gỡ quyền đã có
   for(const s of SEED_SYS.roles){const r=DB.roles.find(x=>x.id===s.id);
    if(!r){DB.roles.push(structuredClone(s));ch=true}
    else if((r.v||1)<s.v){s.permissions.forEach(p=>{if(!r.permissions.includes(p))r.permissions.push(p)});r.v=s.v;ch=true}}
   if(ch)await saveRoles();
   if(!DB.users.length){DB.users=[await mk('admin','Quản trị viên','admin','admin123',true)];await saveUsers()}},
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
