window.ModReports=(function(){
 let el,mode='week',ref=today();
 const fmt=ms=>new Date(ms).toISOString().slice(0,10),dmy=s=>s.split('-').reverse().join('/'),DAY=864e5;
 const parts=s=>s.split('-').map(Number);
 function range(){const[y,m,d]=parts(ref);
  if(mode==='month')return[fmt(Date.UTC(y,m-1,1)),fmt(Date.UTC(y,m,0))];
  const t=Date.UTC(y,m-1,d),wd=(new Date(t).getUTCDay()+6)%7;return[fmt(t-wd*DAY),fmt(t-wd*DAY+6*DAY)]}
 function shift(k){const[y,m,d]=parts(ref);ref=mode==='month'?fmt(Date.UTC(y,m-1+k,1)):fmt(Date.UTC(y,m-1,d)+7*k*DAY)}
 function render(){const[from,to]=range(),S=summarize(from,to),sc=MN_CONFIG.school;
  const th=(...c)=>'<tr>'+c.map(x=>`<th>${x}`).join('')+'</tr>',td=(...c)=>'<tr>'+c.map((x,i)=>`<td${i?' class=num':''}>${x}`).join('')+'</tr>';
  const items=Object.values(S.items).sort((a,b)=>b.money-a.money),stk=DB.items.filter(i=>i.stock&&S.stock[i.id]!=null);
  el.innerHTML=`<div class=bar><select id=mode><option value=week${mode==='week'?' selected':''}>Theo tuần</option><option value=month${mode==='month'?' selected':''}>Theo tháng</option></select>
   <button id=pv>◀</button><input type=date id=ref value="${ref}" style="width:140px"><button id=nx>▶</button>
   <button onclick="print()">In</button><button id=csv>Xuất CSV</button></div>
   <p style="text-align:center;margin:8px 0"><b>${esc(sc.name)}</b><br>${esc(sc.branch)}<br><b>BÁO CÁO CHI ĂN ${mode==='week'?'TUẦN':'THÁNG'}</b><br><i>Từ ${dmy(from)} đến ${dmy(to)}</i></p>
   ${S.n?`<table>${th('Chỉ tiêu','Giá trị')}${td('Số ngày có sổ',S.n)}${td('Tổng lượt trẻ ăn (bình quân '+num(S.avgKids)+' trẻ/ngày)',vnd(S.kidDays))}
    ${td('Tồn đầu kỳ',vnd(S.open))}${td('Tổng thu',vnd(S.thu))}${td('Tổng chi',vnd(S.chi))}${S.adjust?td('Điều chỉnh tay "tồn ngày trước"',vnd(S.adjust)):''}
    <tr class=tot><td>Thừa / thiếu cuối kỳ<td class=num>${vnd(S.close)}</tr>${td('Chi bình quân / trẻ / ngày',vnd(S.chiPerKid))}</table>
    <h4>Theo ngày</h4><table>${th('Ngày','Số cháu','Thu','Chi','Thừa/thiếu lũy kế')}${S.rows.map(({d,r})=>td(dmy(d.date),r.total,vnd(r.moneyIn),vnd(r.chi),vnd(r.balance))).join('')}
    <tr class=tot><td>Cộng<td class=num>${vnd(S.kidDays)}<td class=num>${vnd(S.thu)}<td class=num>${vnd(S.chi)}<td class=num>${vnd(S.close)}</tr></table>
    <h4>Chi theo nhóm</h4><table>${th('Nhóm','Tiền chi','Tỷ lệ')}${[['Gas, gia vị',S.gas],...Object.keys(GROUPS).map(g=>[GROUPS[g],S.grp[g]])].map(([n,v])=>td(esc(n),vnd(v),S.chi?(v/S.chi*100).toFixed(1)+'%':'')).join('')}</table>
    <h4>Theo thực phẩm</h4><table>${th('Thực phẩm','ĐVT','SL nhập','SL chi','Tiền chi')}${items.map(o=>td(esc(o.it.name),esc(o.it.unit),num(o.qtyIn),num(o.qtyOut),vnd(o.money))).join('')}</table>
    ${stk.length?`<h4>Tồn kho cuối kỳ</h4><table>${th('Mặt hàng','ĐVT','Tồn')}${stk.map(i=>td(esc(i.name),esc(i.unit),num(S.stock[i.id]))).join('')}</table>`:''}`
   :'<p><i>Chưa có sổ ăn nào trong kỳ này.</i></p>'}`;
  el.S=S,el.R=[from,to]}
 function csv(){const S=el.S,[f,t]=el.R,q=x=>`"${String(x).replace(/"/g,'""')}"`,L=[['sep=;'],[q('Báo cáo '+dmy(f)+' - '+dmy(t))],['Ngày','Số cháu','Thu','Chi','Thừa/thiếu lũy kế'].map(q)];
  S.rows.forEach(({d,r})=>L.push([dmy(d.date),r.total,Math.round(r.moneyIn),Math.round(r.chi),Math.round(r.balance)]));
  L.push([],['Thực phẩm','ĐVT','SL nhập','SL chi','Tiền chi'].map(q));
  Object.values(S.items).sort((a,b)=>b.money-a.money).forEach(o=>L.push([q(o.it.name),q(o.it.unit),o.qtyIn,o.qtyOut,Math.round(o.money)]));
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+L.map(r=>r.join(';')).join('\r\n')],{type:'text/csv'}));a.download=`bao-cao-${mode}-${f}.csv`;a.click()}
 return{mount(root){el=root;ref=today();render();
  el.onchange=e=>{if(!['mode','ref'].includes(e.target.id))return;if(!guard('report.view'))return;if(e.target.id==='mode')mode=e.target.value;else if(e.target.id==='ref'&&e.target.value)ref=e.target.value;else return;render()};
  el.onclick=e=>{const id=e.target.id;if(!['pv','nx','csv'].includes(id))return;if(!guard('report.view'))return;
   if(id==='csv')csv();else{shift(id==='nx'?1:-1);render()}}}};
})();
