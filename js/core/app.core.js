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
