window.DB={classes:[],items:[],days:[]};
const vnd=n=>Math.round(n||0).toLocaleString('vi-VN'), num=n=>(+n||0).toLocaleString('vi-VN',{maximumFractionDigits:2});
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,4);
const GROUPS={staple:'Gạo (xuất từ kho)',main:'Ăn chính (trưa)',snack:'Bữa phụ (xế chiều)',evening:'Bữa chính chiều'};
const prevDay=date=>DB.days.filter(d=>d.date<date&&d.lines.length).sort((a,b)=>b.date.localeCompare(a.date))[0];
// Business logic: thu = số cháu x tiền ăn; chi = gas/gia vị + các dòng chi; tồn = đầu + nhập - chi; thừa/thiếu chuyển sang ngày sau.
function calc(d){
 const p=prevDay(d.date),pc=p&&calc(p);
 const kids=DB.classes.map(c=>({c,n:+d.attendance[c.id]||0})),total=kids.reduce((s,k)=>s+k.n,0);
 const nt=kids.filter(k=>k.c.nursery).reduce((s,k)=>s+k.n,0),moneyIn=total*d.ratePerChild;
 const prevBal=d.prevBalance!=null?d.prevBalance:(pc?pc.balance:0),gas=total*d.gasRate;
 const stock={...(pc?pc.stock:{}),...(d.opening||{})},grp={staple:0,main:0,snack:0,evening:0};let chi=gas,nhap=gas;
 const lines=d.lines.map(l=>{const it=DB.items.find(i=>i.id===l.itemId)||{name:'(đã xóa)',unit:''};
  const open=stock[l.itemId]||0,close=open+(+l.qtyIn||0)-(+l.qtyOut||0),n=(+l.qtyIn||0)*l.price,c=(+l.qtyOut||0)*l.price;
  if(it.stock)stock[l.itemId]=close;grp[l.group]+=c;chi+=c;nhap+=n;return{it,open,close,n,c,stock:it.stock}});
 return{kids,total,nt,mg:total-nt,moneyIn,prevBal,available:moneyIn+prevBal,gas,lines,grp,chi,nhap,stock,balance:moneyIn+prevBal-chi};
}

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
// Kiểm tra quyền + phiên ngay trong action nghiệp vụ (không chỉ ẩn nút ở UI).
function guard(p){if(!SystemAPI.current()){alert('Phiên đăng nhập đã hết hạn.');location.reload();return false}
 if(!SystemAPI.can(p)){alert('Bạn không có quyền thực hiện thao tác này.');return false}return true}

// Ngày hôm nay theo giờ máy (không dùng UTC để khỏi lệch ngày lúc sáng sớm ở VN).
const today=()=>{const d=new Date();return new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10)};
// Tổng hợp báo cáo cho khoảng ngày [from,to] (chỉ tính ngày đã có dòng chi).
function summarize(from,to){
 const rows=DB.days.filter(d=>d.lines.length&&d.date>=from&&d.date<=to).sort((a,b)=>a.date.localeCompare(b.date)).map(d=>({d,r:calc(d)}));
 const S={rows,n:rows.length,kidDays:0,thu:0,chi:0,gas:0,grp:{staple:0,main:0,snack:0,evening:0},items:{},open:0,close:0,stock:{}};
 rows.forEach(({d,r},i)=>{S.kidDays+=r.total;S.thu+=r.moneyIn;S.chi+=r.chi;S.gas+=r.gas;for(const g in r.grp)S.grp[g]+=r.grp[g];
  r.lines.forEach((x,j)=>{const l=d.lines[j],o=S.items[l.itemId]||(S.items[l.itemId]={it:x.it,qtyIn:0,qtyOut:0,money:0});o.qtyIn+=+l.qtyIn||0;o.qtyOut+=+l.qtyOut||0;o.money+=x.c});
  if(i===0)S.open=r.prevBal;S.close=r.balance;S.stock=r.stock});
 S.adjust=S.n?S.close-(S.open+S.thu-S.chi):0; // chênh do sửa tay "tồn ngày trước"
 S.chiPerKid=S.kidDays?S.chi/S.kidDays:0;S.avgKids=S.n?S.kidDays/S.n:0;return S}
