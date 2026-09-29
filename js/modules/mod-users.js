window.ModUsers=(function(){
 let el;const run=async f=>{if(!guard('users.manage'))return;try{await f();render()}catch(e){alert(e.message)}};
 function render(){const me=SystemAPI.current(),ro=DB.roles.map(r=>`<option value="${esc(r.id)}">${esc(r.name)}</option>`).join('');
  el.innerHTML=`<h3>Người dùng</h3><table><tr><th>Tên đăng nhập<th>Họ tên<th>Vai trò<th>Trạng thái<th></tr>
  ${DB.users.map(u=>`<tr><td>${esc(u.username)}<td>${esc(u.name)}<td><select data-role="${esc(u.id)}">${ro.replace(`value="${esc(u.roleId)}"`,`value="${esc(u.roleId)}" selected`)}</select>
  <td>${u.active?'Hoạt động':'Đã khóa'}${u.mustChange?' (chờ đổi mật khẩu)':''}
  <td><button data-rp="${esc(u.id)}">Đặt lại MK</button> <button data-act="${esc(u.id)}">${u.active?'Khóa':'Mở khóa'}</button> ${u.id===me.id?'':`<button data-rm="${esc(u.id)}">Xóa</button>`}</tr>`).join('')}</table>
  <h4>Thêm người dùng</h4><div class="bar"><input id="nu" placeholder="Tên đăng nhập"><input id="nn" placeholder="Họ tên"><select id="nr">${ro}</select><input id="np" type="password" placeholder="MK tạm (≥8)"><button id="na">Thêm</button></div>
  <h4>Phân quyền theo vai trò</h4><table><tr><th>Quyền${DB.roles.map(r=>`<th>${esc(r.name)}`).join('')}</tr>
  ${Object.entries(SystemAPI.PERMS).map(([p,l])=>`<tr><td>${esc(l)}${DB.roles.map(r=>`<td style="text-align:center">${r.permissions.includes('*')||r.permissions.includes(p)?'✔':''}`).join('')}</tr>`).join('')}</table>`}
 return{mount(root){el=root;render();
  el.onchange=e=>{const t=e.target;if(t.dataset.role)run(()=>SystemAPI.setRole(t.dataset.role,t.value))};
  el.onclick=e=>{const b=e.target,d=b.dataset;
   if(b.id==='na')run(async()=>{await SystemAPI.addUser({username:$v('nu'),name:$v('nn'),roleId:$v('nr'),password:$v('np')})});
   else if(d.rp){const p=prompt('Mật khẩu tạm mới (≥ 8 ký tự). Người dùng sẽ phải đổi khi đăng nhập.');if(p)run(()=>SystemAPI.resetPassword(d.rp,p))}
   else if(d.act){const u=DB.users.find(x=>x.id===d.act);run(()=>SystemAPI.setActive(d.act,!u.active))}
   else if(d.rm&&confirm('Xóa người dùng này?'))run(()=>SystemAPI.removeUser(d.rm))};
  function $v(id){return el.querySelector('#'+id).value}}};
})();
