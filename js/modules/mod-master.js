window.ModMaster=(function(){
 let el;const used=id=>DB.days.some(d=>d.lines.some(l=>l.itemId===id));
 function render(){el.innerHTML=`<h3>Lớp học</h3><table><tr><th>Lớp<th>Cô chủ nhiệm<th>Nhà trẻ<th></tr>
  ${DB.classes.map(c=>`<tr><td>${c.name}<td>${c.teachers}<td>${c.nursery?'x':''}<td><button data-dc="${c.id}">Xóa</button></tr>`).join('')}</table><button id=ac>+ Thêm lớp</button>
  <h3>Thực phẩm</h3><table><tr><th>Tên<th>ĐVT<th>Đơn giá<th>Theo dõi tồn<th></tr>
  ${DB.items.map(i=>`<tr><td>${i.name}<td>${i.unit}<td class=num>${vnd(i.price)}<td>${i.stock?'x':''}<td><button data-di="${i.id}">Xóa</button></tr>`).join('')}</table><button id=ai>+ Thêm thực phẩm</button>`}
 const save=async()=>{await MealAPI.saveClasses();await MealAPI.saveItems();render()};
 return{mount(root){el=root;render();el.onclick=e=>{const b=e.target;
  if(b.id==='ac'){const n=prompt('Tên lớp');if(n){DB.classes.push({id:uid('c'),name:n,teachers:prompt('Cô chủ nhiệm')||'',nursery:confirm('Là nhà trẻ?')});save()}}
  else if(b.id==='ai'){const n=prompt('Tên thực phẩm');if(n){DB.items.push({id:uid('i'),name:n,unit:prompt('ĐVT','Kg')||'Kg',price:+prompt('Đơn giá',0)||0,stock:confirm('Theo dõi tồn kho?')});save()}}
  else if(b.dataset.dc){DB.classes=DB.classes.filter(c=>c.id!==b.dataset.dc);save()}
  else if(b.dataset.di){if(used(b.dataset.di))alert('Thực phẩm đã phát sinh chứng từ, không xóa.');else{DB.items=DB.items.filter(i=>i.id!==b.dataset.di);save()}}}}};
})();
