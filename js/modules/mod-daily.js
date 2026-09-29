window.ModDaily=(function(){
 let date=new Date().toISOString().slice(0,10),el;
 function ensure(){let d=DB.days.find(x=>x.date===date);if(d)return d;const p=prevDay(date);
  d={date,ratePerChild:p?p.ratePerChild:23000,gasRate:p?p.gasRate:2000,attendance:p?{...p.attendance}:{},lines:[]};DB.days.push(d);return d}
 function render(){
  const d=ensure(),r=calc(d),opt=DB.items.map(i=>`<option value="${i.id}">${i.name} (${i.unit})</option>`).join('');
  const row=(l,i)=>{const x=r.lines[i],inp=k=>`<input data-l="${i}" data-k="${k}" type="number" step="any" value="${l[k]}">`;
   return`<tr><td>${x.it.name}<td>${x.it.unit}<td class=num>${x.stock?num(x.open):''}<td>${inp('qtyIn')}<td>${inp('price')}<td class=num>${vnd(x.n)}<td>${inp('qtyOut')}<td class=num>${vnd(x.c)}<td class=num>${x.stock?num(x.close):''}<td><button data-del="${i}">×</button></tr>`};
  const grp=g=>`<tr class=grp><td colspan=5>${GROUPS[g]}<td colspan=3 class=num>${vnd(r.grp[g])}<td colspan=2><select data-sel="${g}">${opt}</select> <button data-add="${g}">+</button></tr>`+
   d.lines.map((l,i)=>l.group===g?row(l,i):'').join('');
  el.innerHTML=`<h3>CÔNG KHAI XUẤT NHẬP CHI ĂN HÀNG NGÀY</h3><div class=bar><label>Ngày <input type=date id=dt value="${date}" style="width:140px"></label>
   <label>Tiền ăn/trẻ <input data-f=ratePerChild type=number value="${d.ratePerChild}"></label><label>Gas+gia vị/trẻ <input data-f=gasRate type=number value="${d.gasRate}"></label>
   <button onclick="print()">In phiếu</button></div>
   <table><tr><th>TT<th>Lớp và cô chủ nhiệm<th>Số cháu<th>Số tiền ăn/ngày<th>Tổng tiền</tr>
   ${r.kids.map((k,i)=>`<tr><td>${i+1}<td>${k.c.name} (${k.c.teachers})<td><input data-a="${k.c.id}" type=number value="${k.n}"><td class=num>${vnd(d.ratePerChild)}<td class=num>${vnd(k.n*d.ratePerChild)}</tr>`).join('')}
   <tr class=tot><td colspan=2>Tổng trẻ MG ${r.mg} / Nhà trẻ ${r.nt}<td>${r.total}<td>Tổng thu<td class=num>${vnd(r.moneyIn)}</tr>
   <tr><td colspan=3>Tồn ngày trước (tự chuyển từ ngày trước, có thể sửa)<td><input data-f=prevBalance type=number value="${r.prevBal}"><td class=num>${vnd(r.available)}</tr></table>
   <table><tr><th>Nội dung chi<th>ĐVT<th>Tồn trước<th>SL nhập<th>Đơn giá<th>Tiền nhập<th>SL chi<th>Tiền chi<th>Tồn<th></tr>
   <tr><td>Tiền gia vị, khí đốt (ga)<td><td><td><td><td class=num>${vnd(r.gas)}<td><td class=num>${vnd(r.gas)}<td><td></tr>
   ${Object.keys(GROUPS).map(grp).join('')}
   <tr class=tot><td colspan=5>Tổng chi<td class=num>${vnd(r.nhap)}<td><td class=num>${vnd(r.chi)}<td><td></tr>
   <tr class=tot><td colspan=7>Tổng thu - chi = thừa / thiếu<td class=num>${vnd(r.balance)}<td colspan=2></tr></table>`}
 const save=async()=>{await MealAPI.saveDays();render()};
 function bind(){el.onchange=e=>{const t=e.target,d=ensure(),v=t.value;
  if(t.id==='dt'){date=v;return render()}
  if(t.dataset.f)d[t.dataset.f]=+v;else if(t.dataset.a)d.attendance[t.dataset.a]=+v;else if(t.dataset.l)d.lines[t.dataset.l][t.dataset.k]=+v;else return;save()};
  el.onclick=e=>{const b=e.target,d=ensure();
   if(b.dataset.add){const id=el.querySelector(`[data-sel="${b.dataset.add}"]`).value,it=DB.items.find(i=>i.id===id);
    if(it){d.lines.push({group:b.dataset.add,itemId:id,qtyIn:0,price:it.price,qtyOut:0});save()}}
   else if(b.dataset.del){d.lines.splice(+b.dataset.del,1);save()}}}
 return{mount(root){el=root;bind();render()}};
})();
