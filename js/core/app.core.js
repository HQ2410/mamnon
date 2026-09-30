window.DB={
  classes:[],
  items:[],
  days:[],
  nutritionRecommendation:{
    energy:0,
    protein:0,
    lipid:0,
    glucid:0,
    fiber:0
  },
  minNutritionRecommendation:{
    energy:0,
    protein:0,
    lipid:0,
    glucid:0,
    fiber:0
  }
};

const vnd=n=>Math.round(n||0).toLocaleString('vi-VN');

const num=n=>
  (+n||0).toLocaleString('vi-VN',{
    maximumFractionDigits:2
  });

const uid=p=>
  p+Date.now().toString(36)+Math.random().toString(36).slice(2,4);

const GROUPS={
  staple:'Gạo (xuất từ kho)',
  main:'Ăn chính (trưa)',
  snack:'Bữa phụ (xế chiều)',
  evening:'Bữa chính chiều'
};

const prevDay=date=>
  DB.days
    .filter(d=>d.date<date&&d.lines.length)
    .sort((a,b)=>b.date.localeCompare(a.date))[0];


/* =========================================================
 * DINH DƯỠNG
 * ========================================================= */

/*
 * Chuẩn hóa dữ liệu dinh dưỡng để tương thích cả:
 * - dữ liệu mới có nutrition
 * - dữ liệu cũ chưa có nutrition
 */
function nutritionOf(item){
  const n=item?.nutrition||{};

  return {
    energy:+n.energy||0,
    protein:+n.protein||0,
    lipid:+n.lipid||0,
    glucid:+n.glucid||0,
    fiber:+n.fiber||0
  };
}

/*
 * Quy đổi số lượng xuất kho thành gram.
 *
 * - Kg  -> x 1000
 * - g   -> giữ nguyên
 * - các đơn vị khác -> dùng nutritionWeight
 *
 * Ví dụ:
 * 2 Kg thịt
 * = 2000g
 *
 * 16 Hộp sữa, nutritionWeight = 110
 * = 1760g
 */
function quantityToGram(qty,it){
  const q=+qty||0;
  const unit=String(it?.unit||'').trim().toLowerCase();

  if(unit==='kg'||unit==='kilogram'||unit==='kilograms'){
    return q*1000;
  }

  if(
    unit==='g'||
    unit==='gram'||
    unit==='grams'
  ){
    return q;
  }

  const weight=+it?.nutritionWeight||0;

  return q*weight;
}

/*
 * Tính dinh dưỡng của một dòng chi.
 *
 * nutrition được khai báo theo /100g.
 *
 * Ví dụ:
 * 5 Kg thực phẩm
 * = 5000g
 *
 * Protein = 20g/100g
 *
 * => 5000 * 20 / 100
 * => 1000g protein
 */
function calcLineNutrition(line,item){
  const grams=quantityToGram(line.qtyOut,item);
  const n=nutritionOf(item);

  if(grams<=0){
    return {
      energy:0,
      protein:0,
      lipid:0,
      glucid:0,
      fiber:0
    };
  }

  const factor=grams/100;

  return {
    energy:n.energy*factor,
    protein:n.protein*factor,
    lipid:n.lipid*factor,
    glucid:n.glucid*factor,
    fiber:n.fiber*factor
  };
}

/*
 * Cộng hai bộ dinh dưỡng.
 */
function addNutrition(a,b){
  return {
    energy:(a?.energy||0)+(b?.energy||0),
    protein:(a?.protein||0)+(b?.protein||0),
    lipid:(a?.lipid||0)+(b?.lipid||0),
    glucid:(a?.glucid||0)+(b?.glucid||0),
    fiber:(a?.fiber||0)+(b?.fiber||0)
  };
}

/*
 * Tính tổng dinh dưỡng theo từng bữa.
 */
function calcMealNutrition(d){
  const result={
    staple:{
      energy:0,
      protein:0,
      lipid:0,
      glucid:0,
      fiber:0
    },
    main:{
      energy:0,
      protein:0,
      lipid:0,
      glucid:0,
      fiber:0
    },
    snack:{
      energy:0,
      protein:0,
      lipid:0,
      glucid:0,
      fiber:0
    },
    evening:{
      energy:0,
      protein:0,
      lipid:0,
      glucid:0,
      fiber:0
    }
  };

  (d.lines||[]).forEach(line=>{
    const item=DB.items.find(i=>i.id===line.itemId);

    if(!item||!result[line.group])return;

    const n=calcLineNutrition(line,item);

    result[line.group]=addNutrition(
      result[line.group],
      n
    );
  });

  result.total={
    energy:0,
    protein:0,
    lipid:0,
    glucid:0,
    fiber:0
  };

  Object.keys(GROUPS).forEach(g=>{
    result.total=addNutrition(
      result.total,
      result[g]
    );
  });

  return result;
}


/* =========================================================
 * BUSINESS LOGIC
 * ========================================================= */

// Business logic:
// thu = số cháu x tiền ăn;
// chi = gas/gia vị + các dòng chi;
// tồn = đầu + nhập - chi;
// thừa/thiếu chuyển sang ngày sau.

function calc(d){
  const p=prevDay(d.date),
        pc=p&&calc(p);

  const kids=DB.classes.map(c=>({
    c,
    n:+d.attendance[c.id]||0
  }));

  const total=kids.reduce(
    (s,k)=>s+k.n,
    0
  );

  const nt=kids
    .filter(k=>k.c.nursery)
    .reduce((s,k)=>s+k.n,0);

  const moneyIn=
    total*d.ratePerChild;

  const prevBal=
    d.prevBalance!=null
      ? d.prevBalance
      : (pc?pc.balance:0);

  const gas=
    total*d.gasRate;

  const stock={
    ...(pc?pc.stock:{}),
    ...(d.opening||{})
  };

  const grp={
    staple:0,
    main:0,
    snack:0,
    evening:0
  };

  let chi=gas;
  let nhap=gas;

  const lines=d.lines.map(l=>{
    const it=
      DB.items.find(i=>i.id===l.itemId)
      ||
      {
        name:'(đã xóa)',
        unit:'',
        nutrition:{
          energy:0,
          protein:0,
          lipid:0,
          glucid:0,
          fiber:0
        }
      };

    const open=
      stock[l.itemId]||0;

    const close=
      open+
      (+l.qtyIn||0)-
      (+l.qtyOut||0);

    const n=
      (+l.qtyIn||0)*l.price;

    const c=
      (+l.qtyOut||0)*l.price;

    if(it.stock){
      stock[l.itemId]=close;
    }

    grp[l.group]+=c;
    chi+=c;
    nhap+=n;

    return{
      it,
      open,
      close,
      n,
      c,
      stock:it.stock
    };
  });

  const mealNutrition=
    calcMealNutrition(d);

  return{
    kids,
    total,
    nt,
    mg:total-nt,
    moneyIn,
    prevBal,
    available:moneyIn+prevBal,
    gas,
    lines,
    grp,
    chi,
    nhap,
    stock,
    balance:moneyIn+prevBal-chi,

    // Dinh dưỡng theo bữa + tổng ngày
    mealNutrition
  };
}


const esc=s=>
  String(s??'').replace(
    /[&<>"']/g,
    c=>({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      '"':'&quot;',
      "'":'&#39;'
    }[c])
  );


// Kiểm tra quyền + phiên ngay trong action nghiệp vụ.
function guard(p){
  if(!SystemAPI.current()){
    alert('Phiên đăng nhập đã hết hạn.');
    location.reload();
    return false;
  }

  if(!SystemAPI.can(p)){
    alert('Bạn không có quyền thực hiện thao tác này.');
    return false;
  }

  return true;
}


// Ngày hôm nay theo giờ máy.
const today=()=>{
  const d=new Date();

  return new Date(
    d.getTime()-
    d.getTimezoneOffset()*6e4
  )
  .toISOString()
  .slice(0,10);
};


// Tổng hợp báo cáo cho khoảng ngày [from,to].
function summarize(from,to){
  const rows=
    DB.days
      .filter(
        d=>
          d.lines.length&&
          d.date>=from&&
          d.date<=to
      )
      .sort(
        (a,b)=>a.date.localeCompare(b.date)
      )
      .map(d=>({
        d,
        r:calc(d)
      }));

  const S={
    rows,
    n:rows.length,
    kidDays:0,
    thu:0,
    chi:0,
    gas:0,
    grp:{
      staple:0,
      main:0,
      snack:0,
      evening:0
    },
    items:{},
    open:0,
    close:0,
    stock:{},

    nutrition:{
      staple:{
        energy:0,
        protein:0,
        lipid:0,
        glucid:0,
        fiber:0
      },
      main:{
        energy:0,
        protein:0,
        lipid:0,
        glucid:0,
        fiber:0
      },
      snack:{
        energy:0,
        protein:0,
        lipid:0,
        glucid:0,
        fiber:0
      },
      evening:{
        energy:0,
        protein:0,
        lipid:0,
        glucid:0,
        fiber:0
      },
      total:{
        energy:0,
        protein:0,
        lipid:0,
        glucid:0,
        fiber:0
      }
    }
  };

  rows.forEach(({d,r},i)=>{
    S.kidDays+=r.total;
    S.thu+=r.moneyIn;
    S.chi+=r.chi;
    S.gas+=r.gas;

    for(const g in r.grp){
      S.grp[g]+=r.grp[g];
    }

    // Tổng hợp dinh dưỡng
    for(const g of Object.keys(GROUPS)){
      S.nutrition[g]=addNutrition(
        S.nutrition[g],
        r.mealNutrition[g]
      );
    }

    S.nutrition.total=addNutrition(
      S.nutrition.total,
      r.mealNutrition.total
    );

    r.lines.forEach((x,j)=>{
      const l=d.lines[j];

      const o=
        S.items[l.itemId]
        ||
        (S.items[l.itemId]={
          it:x.it,
          qtyIn:0,
          qtyOut:0,
          money:0
        });

      o.qtyIn+=+l.qtyIn||0;
      o.qtyOut+=+l.qtyOut||0;
      o.money+=x.c;
    });

    if(i===0)S.open=r.prevBal;

    S.close=r.balance;
    S.stock=r.stock;
  });

  S.adjust=
    S.n
      ?S.close-(S.open+S.thu-S.chi)
      :0;

  S.chiPerKid=
    S.kidDays
      ?S.chi/S.kidDays
      :0;

  S.avgKids=
    S.n
      ?S.kidDays/S.n
      :0;

  return S;
}
// Lưu có báo lỗi: nếu ghi server thất bại thì báo ngay, tránh màn hình hiện dữ liệu mới nhưng F5 lại mất.
async function persist(fn){try{await fn();return true}catch(e){alert('Không lưu được dữ liệu: '+(e&&e.message||e)+'\nDữ liệu trên màn hình có thể chưa được lưu lên server.');return false}}
