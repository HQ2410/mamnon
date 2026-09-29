window.ModMaster=(function(){
 let el;const used=id=>DB.days.some(d=>d.lines.some(l=>l.itemId===id));
 function render(){const ro=!SystemAPI.can('master.edit'),b=(a,id)=>ro?'':`<button data-${a}="${esc(id)}">Xóa</button>`;
  el.innerHTML=`<h3>Lớp học</h3><table><tr><th>Lớp<th>Cô chủ nhiệm<th>Nhà trẻ<th></tr>
  ${DB.classes.map(c=>`<tr><td>${esc(c.name)}<td>${esc(c.teachers)}<td>${c.nursery?'x':''}<td>${b('dc',c.id)}</tr>`).join('')}</table>${ro?'':'<button id=ac>+ Thêm lớp</button>'}
  <h3>Thực phẩm</h3><table><tr><th>Tên<th>ĐVT<th>Đơn giá<th>Theo dõi tồn<th></tr>
  ${DB.items.map(i=>`<tr><td>${esc(i.name)}<td>${esc(i.unit)}<td class=num>${vnd(i.price)}<td>${i.stock?'x':''}<td>${b('di',i.id)}</tr>`).join('')}</table>${ro?'':'<button id=ai>+ Thêm thực phẩm</button>'}${ro?'<p><i>(chỉ xem)</i></p>':''}`}
 const save=async()=>{await MealAPI.saveClasses();await MealAPI.saveItems();render()};
 return{mount(root){el=root;render();el.onclick=e=>{const b=e.target;if(!(b.id||b.dataset.dc||b.dataset.di))return;if(!guard('master.edit'))return;
  if(b.id==='ac'){const n=prompt('Tên lớp');if(n){DB.classes.push({id:uid('c'),name:n,teachers:prompt('Cô chủ nhiệm')||'',nursery:confirm('Là nhà trẻ?')});save()}}
  else if(b.id==='ai'){const n=prompt('Tên thực phẩm');if(n){DB.items.push({id:uid('i'),name:n,unit:prompt('ĐVT','Kg')||'Kg',price:+prompt('Đơn giá',0)||0,stock:confirm('Theo dõi tồn kho?')});save()}}
  else if(b.dataset.dc){DB.classes=DB.classes.filter(c=>c.id!==b.dataset.dc);save()}
  else if(b.dataset.di){if(used(b.dataset.di))alert('Thực phẩm đã phát sinh chứng từ, không xóa.');else{DB.items=DB.items.filter(i=>i.id!==b.dataset.di);save()}}}}};
})();
