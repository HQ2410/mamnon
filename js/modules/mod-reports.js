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
 function csv(){
  const S = el.S;
  const [f, t] = el.R;

  // Escape dữ liệu CSV:
  // - luôn bọc text bằng "
  // - " bên trong text -> ""
  const csvText = value => {
    if (value === null || value === undefined) return '""';
    return '"' + String(value).replace(/"/g, '""') + '"';
  };

  // Giá trị số:
  // Không dùng dấu phân cách hàng nghìn và không quote,
  // để Excel nhận trực tiếp là Number.
  const csvNum = value => {
    if (value === null || value === undefined || value === '') return '';
    const n = Number(value);
    return Number.isFinite(n) ? String(Math.round(n)) : '';
  };

  // Số lượng thực phẩm có thể có số lẻ.
  // Dùng "." làm decimal separator trong CSV.
  // Excel sẽ tự chuyển theo thiết lập vùng khi import.
  const csvQty = value => {
    if (value === null || value === undefined || value === '') return '';

    const n = Number(value);
    if (!Number.isFinite(n)) return csvText(value);

    // Không để dạng 1.00000000001
    return String(Number(n.toFixed(6)));
  };

  // Mỗi dòng CSV
  const rows = [];

  // =========================================================
  // TIÊU ĐỀ
  // =========================================================
  rows.push([
    csvText(
      'BÁO CÁO CHI ĂN ' +
      (mode === 'week' ? 'TUẦN' : 'THÁNG')
    )
  ]);

  rows.push([
    csvText(MN_CONFIG.school.name)
  ]);

  rows.push([
    csvText(MN_CONFIG.school.branch)
  ]);

  rows.push([
    csvText(`Từ ${dmy(f)} đến ${dmy(t)}`)
  ]);

  rows.push([]);

  // =========================================================
  // KHÔNG CÓ SỔ ĂN
  // =========================================================
  if (!S.n) {
    rows.push([
      csvText('Chưa có sổ ăn nào trong kỳ này.')
    ]);
  } else {

    // =======================================================
    // TỔNG HỢP
    // =======================================================
    rows.push([csvText('TỔNG HỢP')]);

    rows.push([
      csvText('Chỉ tiêu'),
      csvText('Giá trị')
    ]);

    rows.push([
      csvText('Số ngày có sổ'),
      csvNum(S.n)
    ]);

    rows.push([
      csvText(
        'Tổng lượt trẻ ăn (bình quân ' +
        num(S.avgKids) +
        ' trẻ/ngày)'
      ),
      csvNum(S.kidDays)
    ]);

    rows.push([
      csvText('Tồn đầu kỳ'),
      csvNum(S.open)
    ]);

    rows.push([
      csvText('Tổng thu'),
      csvNum(S.thu)
    ]);

    rows.push([
      csvText('Tổng chi'),
      csvNum(S.chi)
    ]);

    if (S.adjust) {
      rows.push([
        csvText('Điều chỉnh tay "tồn ngày trước"'),
        csvNum(S.adjust)
      ]);
    }

    rows.push([
      csvText('Thừa / thiếu cuối kỳ'),
      csvNum(S.close)
    ]);

    rows.push([
      csvText('Chi bình quân / trẻ / ngày'),
      csvNum(S.chiPerKid)
    ]);

    rows.push([]);

    // =======================================================
    // THEO NGÀY
    // =======================================================
    rows.push([
      csvText('THEO NGÀY')
    ]);

    rows.push([
      csvText('Ngày'),
      csvText('Số cháu'),
      csvText('Thu'),
      csvText('Chi'),
      csvText('Thừa/thiếu lũy kế')
    ]);

    S.rows.forEach(({d, r}) => {
      rows.push([
        csvText(dmy(d.date)),
        csvNum(r.total),
        csvNum(r.moneyIn),
        csvNum(r.chi),
        csvNum(r.balance)
      ]);
    });

    // Dòng cộng
    rows.push([
      csvText('Cộng'),
      csvNum(S.kidDays),
      csvNum(S.thu),
      csvNum(S.chi),
      csvNum(S.close)
    ]);

    rows.push([]);

    // =======================================================
    // CHI THEO NHÓM
    // =======================================================
    rows.push([
      csvText('CHI THEO NHÓM')
    ]);

    rows.push([
      csvText('Nhóm'),
      csvText('Tiền chi'),
      csvText('Tỷ lệ')
    ]);

    const groups = [
      ['Gas, gia vị', S.gas],
      ...Object.keys(GROUPS).map(g => [
        GROUPS[g],
        S.grp[g]
      ])
    ];

    groups.forEach(([name, value]) => {
      rows.push([
        csvText(name),
        csvNum(value),
        S.chi
          ? csvText((value / S.chi * 100).toFixed(1) + '%')
          : csvText('')
      ]);
    });

    rows.push([]);

    // =======================================================
    // THEO THỰC PHẨM
    // =======================================================
    rows.push([
      csvText('THEO THỰC PHẨM')
    ]);

    rows.push([
      csvText('Thực phẩm'),
      csvText('ĐVT'),
      csvText('SL nhập'),
      csvText('SL chi'),
      csvText('Tiền chi')
    ]);

    Object.values(S.items)
      .sort((a, b) => b.money - a.money)
      .forEach(o => {
        rows.push([
          csvText(o.it.name),
          csvText(o.it.unit),
          csvQty(o.qtyIn),
          csvQty(o.qtyOut),
          csvNum(o.money)
        ]);
      });

    rows.push([]);

    // =======================================================
    // TỒN KHO CUỐI KỲ
    // =======================================================
    const stk = DB.items.filter(
      i => i.stock && S.stock[i.id] != null
    );

    if (stk.length) {
      rows.push([
        csvText('TỒN KHO CUỐI KỲ')
      ]);

      rows.push([
        csvText('Mặt hàng'),
        csvText('ĐVT'),
        csvText('Tồn')
      ]);

      stk.forEach(i => {
        rows.push([
          csvText(i.name),
          csvText(i.unit),
          csvQty(S.stock[i.id])
        ]);
      });
    }
  }

  // =========================================================
  // GHÉP CSV
  // =========================================================
  //
  // Dùng CRLF (\r\n) để tương thích tốt với Excel Windows.
  //
  const csvData = rows
    .map(row => row.join(';'))
    .join('\r\n');

  // =========================================================
  // UTF-8 BOM
  // =========================================================
  //
  // BOM = EF BB BF
  //
  // Đây là phần quan trọng giúp Excel khi NHÁY ĐÚP file
  // nhận biết file là UTF-8 và không lỗi tiếng Việt.
  //
  const BOM = '\uFEFF';

  const finalData = BOM + csvData;

  const blob = new Blob(
    [finalData],
    {
      type: 'text/csv;charset=utf-8'
    }
  );

  // =========================================================
  // DOWNLOAD
  // =========================================================
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download =
    `bao-cao-${mode}-${f}.csv`;

  document.body.appendChild(a);
  a.click();
  a.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
}
 return{mount(root){el=root;ref=today();render();
  el.onchange=e=>{if(!['mode','ref'].includes(e.target.id))return;if(!guard('report.view'))return;if(e.target.id==='mode')mode=e.target.value;else if(e.target.id==='ref'&&e.target.value)ref=e.target.value;else return;render()};
  el.onclick=e=>{const id=e.target.id;if(!['pv','nx','csv'].includes(id))return;if(!guard('report.view'))return;
   if(id==='csv')csv();else{shift(id==='nx'?1:-1);render()}}}};
})();
