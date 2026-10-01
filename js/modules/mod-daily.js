window.ModDaily=(function(){

  let date=today(),
      el;


  function ensure(){

    let d=
      DB.days.find(
        x=>x.date===date
      );

    if(d)return d;

    const p=prevDay(date);

    d={
      date,

      ratePerChild:
        p?p.ratePerChild:23000,

      gasRate:
        p?p.gasRate:2000,

      attendance:{},

      lines:[]
    };

    DB.days.push(d);

    return d;
  }


  function nutritionNumber(n){

    return num(
      Math.round(
        (+n||0)*100
      )/100
    );
  }

  function sanitizeDailyValue(value,{allowDecimalComma=false,defaultValue=0}={}){
    return sanitizePositiveNumber(value,{allowDecimalComma,defaultValue});
  }

  function validateStockLine(d, index, key, rawValue){
    const line=d.lines[index];

    if(!line){
      return true;
    }

    const item=DB.items.find(i=>i.id===line.itemId);

    if(!item || !item.stock){
      return true;
    }

    const next={
      ...line,
      [key]:sanitizeDailyValue(rawValue,{allowDecimalComma:key==='qtyIn'||key==='qtyOut',defaultValue:0})
    };

    const open=(calc(d).lines[index]||{open:0}).open;
    const close=open + (+next.qtyIn||0) - (+next.qtyOut||0);

    if(close < 0){
      alert('SL chi vượt tồn kho. Hãy nhập SL nhập tương ứng hoặc giảm SL chi.');
      return false;
    }

    return true;
  }


  function nutritionRow(
    title,
    n
  ){

    return `
      <tr>
        <td>${esc(title)}</td>

        <td class=num>
          ${nutritionNumber(n.energy)}
        </td>

        <td class=num>
          ${nutritionNumber(n.protein)}
        </td>

        <td class=num>
          ${nutritionNumber(n.lipid)}
        </td>

        <td class=num>
          ${nutritionNumber(n.glucid)}
        </td>

        <td class=num>
          ${nutritionNumber(n.fiber)}
        </td>
      </tr>
    `;
  }


  function render(){

    const d=ensure(),
          r=calc(d),

          ro=
            !SystemAPI.can(
              'daily.edit'
            ),

          dis=
            ro
              ?' disabled'
              :'',

          // Nhóm Gạo chỉ có Gạo; các bữa khác không có Gạo
          optFor=g=>
            itemsForGroup(g)
              .map(i=>
                `<option value="${esc(i.id)}">
                  ${esc(i.name)}
                  (${esc(i.unit)})
                </option>`
              )
              .join('');

    const nutritionRecommendation =
      DB.nutritionRecommendation || {
        energy:0,
        protein:0,
        lipid:0,
        glucid:0,
        fiber:0
      };

    const minNutritionRecommendation =
      DB.minNutritionRecommendation || {
        energy:0,
        protein:0,
        lipid:0,
        glucid:0,
        fiber:0
      };

    const nutritionExceeded =
      (
        nutritionRecommendation.energy > 0 &&
        r.mealNutrition.total.energy > nutritionRecommendation.energy
      ) ||
      (
        nutritionRecommendation.protein > 0 &&
        r.mealNutrition.total.protein > nutritionRecommendation.protein
      ) ||
      (
        nutritionRecommendation.lipid > 0 &&
        r.mealNutrition.total.lipid > nutritionRecommendation.lipid
      ) ||
      (
        nutritionRecommendation.glucid > 0 &&
        r.mealNutrition.total.glucid > nutritionRecommendation.glucid
      ) ||
      (
        nutritionRecommendation.fiber > 0 &&
        r.mealNutrition.total.fiber > nutritionRecommendation.fiber
      );

    const nutritionBelowMinimum =
      (
        minNutritionRecommendation.energy > 0 &&
        r.mealNutrition.total.energy < minNutritionRecommendation.energy
      ) ||
      (
        minNutritionRecommendation.protein > 0 &&
        r.mealNutrition.total.protein < minNutritionRecommendation.protein
      ) ||
      (
        minNutritionRecommendation.lipid > 0 &&
        r.mealNutrition.total.lipid < minNutritionRecommendation.lipid
      ) ||
      (
        minNutritionRecommendation.glucid > 0 &&
        r.mealNutrition.total.glucid < minNutritionRecommendation.glucid
      ) ||
      (
        minNutritionRecommendation.fiber > 0 &&
        r.mealNutrition.total.fiber < minNutritionRecommendation.fiber
      );

    const nutritionBelowWarnings = [];
    const nutritionExceededWarnings = [];

    if (
      minNutritionRecommendation.energy > 0 &&
      r.mealNutrition.total.energy < minNutritionRecommendation.energy
    ) {
      nutritionBelowWarnings.push('calorie');
    }

    if (
      minNutritionRecommendation.protein > 0 &&
      r.mealNutrition.total.protein < minNutritionRecommendation.protein
    ) {
      nutritionBelowWarnings.push('protein');
    }

    if (
      minNutritionRecommendation.lipid > 0 &&
      r.mealNutrition.total.lipid < minNutritionRecommendation.lipid
    ) {
      nutritionBelowWarnings.push('lipid');
    }

    if (
      minNutritionRecommendation.glucid > 0 &&
      r.mealNutrition.total.glucid < minNutritionRecommendation.glucid
    ) {
      nutritionBelowWarnings.push('glucid');
    }

    if (
      minNutritionRecommendation.fiber > 0 &&
      r.mealNutrition.total.fiber < minNutritionRecommendation.fiber
    ) {
      nutritionBelowWarnings.push('chất xơ');
    }

    if (
      nutritionRecommendation.energy > 0 &&
      r.mealNutrition.total.energy > nutritionRecommendation.energy
    ) {
      nutritionExceededWarnings.push('calorie');
    }

    if (
      nutritionRecommendation.protein > 0 &&
      r.mealNutrition.total.protein > nutritionRecommendation.protein
    ) {
      nutritionExceededWarnings.push('protein');
    }

    if (
      nutritionRecommendation.lipid > 0 &&
      r.mealNutrition.total.lipid > nutritionRecommendation.lipid
    ) {
      nutritionExceededWarnings.push('lipid');
    }

    if (
      nutritionRecommendation.glucid > 0 &&
      r.mealNutrition.total.glucid > nutritionRecommendation.glucid
    ) {
      nutritionExceededWarnings.push('glucid');
    }

    if (
      nutritionRecommendation.fiber > 0 &&
      r.mealNutrition.total.fiber > nutritionRecommendation.fiber
    ) {
      nutritionExceededWarnings.push('chất xơ');
    }

    const overBudget = r.chi > r.moneyIn;

    const row=(l,i)=>{

      const x=r.lines[i];

      const inp=k=>
        `<input
          data-l="${i}"
          data-k="${k}"
          type="number"
          min="0"
          step="any"
          inputmode="decimal"
          value="${sanitizeDailyValue(l[k],{allowDecimalComma:k==='qtyIn'||k==='qtyOut',defaultValue:0})}"
          ${dis}
        >`;

      return `
        <tr>

          <td>
            ${esc(x.it.name)}
          </td>

          <td>
            ${esc(x.it.unit)}
          </td>

          <td class=num>
            ${x.stock?num(x.open):''}
          </td>

          <td>
            ${inp('qtyIn')}
          </td>

          <td>
            ${inp('price')}
          </td>

          <td class=num>
            ${vnd(x.n)}
          </td>

          <td>
            ${inp('qtyOut')}
          </td>

          <td class=num>
            ${vnd(x.c)}
          </td>

          <td class=num>
            ${x.stock?num(x.close):''}
          </td>

          <td>
            ${
              ro
                ?''
                :`<button data-del="${i}">×</button>`
            }
          </td>

        </tr>
      `;
    };


    const grp=g=>`

      <tr class=grp>

        <td colspan=5>
          ${GROUPS[g]}
        </td>

        <td colspan=3 class=num>
          ${vnd(r.grp[g])}
        </td>

        <td colspan=2>

          ${
            ro
              ?''
              :`
                <select data-sel="${g}">
                  ${optFor(g)}
                </select>

                <button data-add="${g}">
                  +
                </button>
              `
          }

        </td>

      </tr>

      ${
        d.lines
          .map(
            (l,i)=>
              l.group===g
                ?row(l,i)
                :''
          )
          .join('')
      }
    `;


    /*
     * Bảng dinh dưỡng.
     */
    const mn=r.mealNutrition;


    el.innerHTML=`

      <h3>
        CÔNG KHAI XUẤT NHẬP CHI ĂN HÀNG NGÀY
      </h3>

      <div class=bar>

        <label>
          Ngày
          <input
            type=date
            id=dt
            value="${date}"
            style="width:140px"
          >
        </label>

        <label>
          Tiền ăn/trẻ
          <input data-f=ratePerChild type=number min="0" value="${sanitizeDailyValue(d.ratePerChild,{defaultValue:0})}"${dis}>
        </label>

        ${overBudget ? `
          <div class="daily-budget-warning">
            Sổ ăn hôm nay vượt mức tổng thu
          </div>
        ` : ''}

        <label>
          Gas+gia vị/trẻ
          <input
            data-f=gasRate
            type=number
            min="0"
            value="${sanitizeDailyValue(d.gasRate,{defaultValue:0})}"
            ${dis}
          >
        </label>

        <button onclick="print()">
          In phiếu
        </button>

        ${
          ro
            ?'<i>(chỉ xem)</i>'
            :''
        }

      </div>


      <!-- BẢNG 1: SỐ TRẺ / TIỀN ĂN -->

      <table>

        <tr>
          <th>TT</th>
          <th>Lớp và cô chủ nhiệm</th>
          <th>Số cháu</th>
          <th>Số tiền ăn/ngày</th>
          <th>Tổng tiền</th>
          <th>Ghi chú</th>
        </tr>

        ${
          r.kids
            .map(
              (k,i)=>`
                <tr>

                  <td>${i+1}</td>

                  <td>
                    ${esc(k.c.name)}
                    (${esc(k.c.teachers)})
                  </td>

                  <td>
                    <input
                      data-a="${esc(k.c.id)}"
                      type=number
                      min="0"
                      value="${sanitizeDailyValue(k.n,{defaultValue:0})}"
                      ${dis}
                    >
                  </td>

                  <td class=num>
                    ${vnd(d.ratePerChild)}
                  </td>

                  <td class=num>
                    ${vnd(
                      k.n*d.ratePerChild
                    )}
                  </td>

                  <td class="note-cell">
                    <input
                      data-n="${esc(k.c.id)}"
                      type="text"
                      maxlength="500"
                      value="${esc((d.notes||{})[k.c.id]||'')}"
                      ${dis}
                    >
                    <button
                      type="button"
                      data-vn="${esc(k.c.id)}"
                    >Xem</button>
                  </td>

                </tr>
              `
            )
            .join('')
        }

        <tr class=tot>

          <td colspan=2>
            Tổng trẻ MG ${r.mg}
            /
            Nhà trẻ ${r.nt}
          </td>

          <td>
            ${r.total}
          </td>

          <td>
            Tổng thu
          </td>

          <td class=num>
            ${vnd(r.moneyIn)}
          </td>

          <td></td>

        </tr>


        <tr>

          <td colspan=3>
            Tồn ngày trước
            (tự chuyển từ ngày trước, có thể sửa)
          </td>

          <td>
            <input
              data-f=prevBalance
              type=number
              min="0"
              value="${sanitizeDailyValue(r.prevBal,{defaultValue:0})}"
              ${dis}
            >
          </td>

          <td class=num>
            ${vnd(r.available)}
          </td>

          <td></td>

        </tr>

      </table>


      <!-- BẢNG 2: XUẤT NHẬP CHI -->

      <table>

        <tr>

          <th>Nội dung chi</th>
          <th>ĐVT</th>
          <th>Tồn trước</th>
          <th>SL nhập</th>
          <th>Đơn giá</th>
          <th>Tiền nhập</th>
          <th>SL chi</th>
          <th>Tiền chi</th>
          <th>Tồn</th>
          <th></th>

        </tr>


        <tr>

          <td>
            Tiền gia vị, khí đốt (ga)
          </td>

          <td></td>
          <td></td>
          <td></td>
          <td></td>

          <td class=num>
            ${vnd(r.gas)}
          </td>

          <td></td>

          <td class=num>
            ${vnd(r.gas)}
          </td>

          <td></td>
          <td></td>

        </tr>


        ${
          Object
            .keys(GROUPS)
            .map(grp)
            .join('')
        }


        <tr class=tot>

          <td colspan=5>
            Tổng chi
          </td>

          <td class=num>
            ${vnd(r.nhap)}
          </td>

          <td></td>

          <td class=num>
            ${vnd(r.chi)}
          </td>

          <td></td>
          <td></td>

        </tr>


        <tr class=tot>

          <td colspan=7>
            Tổng thu - chi = thừa / thiếu
          </td>

          <td class=num>
            ${vnd(r.balance)}
          </td>

          <td colspan=2></td>

        </tr>

      </table>


      <!-- BẢNG DINH DƯỠNG -->

      <h3 class="nutrition-heading">
        <span>HÀM LƯỢNG DINH DƯỠNG CÁC BỮA ĂN</span>

        ${nutritionBelowWarnings.length ? `
          <span class="daily-nutrition-warning">
            Lượng ${nutritionBelowWarnings.join(', ')} hôm nay dưới mức khuyến cáo
          </span>
        ` : ''}

        ${nutritionExceededWarnings.length ? `
          <span class="daily-nutrition-warning">
            Lượng ${nutritionExceededWarnings.join(', ')} hôm nay vượt mức khuyến cáo
          </span>
        ` : ''}
      </h3>

      <p>
        <i>
          Hàm lượng được tính từ số lượng thực phẩm đã chi,
          dựa trên giá trị dinh dưỡng /100g đã khai báo
          trong Danh mục.
        </i>
      </p>

      <table class="nutrition-table daily-nutrition">

        <tr>

          <th>Bữa ăn</th>

          <th>
            Năng lượng<br>
            (kcal)
          </th>

          <th>
            Protein<br>
            (g)
          </th>

          <th>
            Lipid<br>
            (g)
          </th>

          <th>
            Glucid<br>
            (g)
          </th>

          <th>
            Chất xơ<br>
            (g)
          </th>

        </tr>


        ${
          nutritionRow(
            GROUPS.staple,
            mn.staple
          )
        }

        ${
          nutritionRow(
            GROUPS.main,
            mn.main
          )
        }

        ${
          nutritionRow(
            GROUPS.snack,
            mn.snack
          )
        }

        ${
          nutritionRow(
            GROUPS.evening,
            mn.evening
          )
        }


        <tr class=tot>

          <td>
            Tổng ngày
          </td>

          <td class=num>
            ${nutritionNumber(
              mn.total.energy
            )}
          </td>

          <td class=num>
            ${nutritionNumber(
              mn.total.protein
            )}
          </td>

          <td class=num>
            ${nutritionNumber(
              mn.total.lipid
            )}
          </td>

          <td class=num>
            ${nutritionNumber(
              mn.total.glucid
            )}
          </td>

          <td class=num>
            ${nutritionNumber(
              mn.total.fiber
            )}
          </td>

        </tr>

      </table>

    `;
  }


  const save=async()=>{
    await persist(()=>MealAPI.saveDays());
    render();
  };


  /*
   * Modal xem toàn văn ghi chú của một lớp trong ngày đang chọn.
   * Chỉ đọc, nên tài khoản chỉ xem cũng dùng được.
   */
  function showNote(classId){

    const c=DB.classes.find(x=>x.id===classId);

    if(!c){
      return;
    }

    const note=(ensure().notes||{})[classId]||'';

    const dmy=date.split('-').reverse().join('/');

    const bg=document.createElement('div');
    bg.className='modal-bg';

    const box=document.createElement('div');
    box.className='modal-box';
    box.setAttribute('role','dialog');
    box.setAttribute('aria-modal','true');

    const h=document.createElement('h3');
    h.textContent='Ghi chú lớp '+c.name+' ngày '+dmy;

    const body=document.createElement('div');
    body.className='modal-note';

    if(note){
      body.textContent=note;
    }else{
      body.textContent='(Chưa có ghi chú)';
      body.classList.add('empty');
    }

    const close=document.createElement('button');
    close.type='button';
    close.textContent='Đóng';

    box.append(h,body,close);
    bg.append(box);
    document.body.append(bg);

    document.body.classList.add('modal-open');

    const done=()=>{
      document.removeEventListener('keydown',onKey);
      document.body.classList.remove('modal-open');
      bg.remove();
    };

    const onKey=e=>{
      if(e.key==='Escape'){
        done();
      }
    };

    close.onclick=done;

    bg.onclick=e=>{
      if(e.target===bg){
        done();
      }
    };

    document.addEventListener('keydown',onKey);

    close.focus();
  }


  function bind(){

    el.onchange=e=>{

      const t=e.target,
            v=t.value;


      // Đổi ngày
      if(t.id==='dt'){

        date=v;

        return render();
      }


      // Bỏ qua các control không phải dữ liệu phiếu (tránh báo thiếu quyền oan)
      if(
        t.dataset.f===undefined&&
        t.dataset.a===undefined&&
        t.dataset.n===undefined&&
        t.dataset.l===undefined
      ){
        return;
      }


      if(!guard('daily.edit')){

        return render();
      }


      const d=ensure();


      // Các field đầu phiếu
      if(t.dataset.f){

        d[t.dataset.f]=sanitizeDailyValue(v,{defaultValue:0});
      }


      // Ghi chú theo lớp (theo ngày)
      else if(t.dataset.n!==undefined){

        d.notes=d.notes||{};

        const note=v.trim().slice(0,500);

        if(note)d.notes[t.dataset.n]=note;
        else delete d.notes[t.dataset.n];

        persist(()=>MealAPI.saveDays());

        return;
      }


      // Số trẻ
      else if(t.dataset.a){

        d.attendance[t.dataset.a]=sanitizeDailyValue(v,{defaultValue:0});
      }


      // Dòng thực phẩm
      else if(t.dataset.l){

        const key=t.dataset.k;
        const idx=+t.dataset.l;

        if(!validateStockLine(d,idx,key,v)){
          render();
          return;
        }

        d.lines[
          idx
        ][key]=sanitizeDailyValue(v,{allowDecimalComma:key==='qtyIn'||key==='qtyOut',defaultValue:0});
      }


      else{

        return;
      }


      save();
    };


    el.onclick=e=>{

      const b=e.target;


      // Xem ghi chú: chỉ đọc, không cần quyền sửa
      if(b.dataset.vn!==undefined){

        return showNote(b.dataset.vn);
      }


      if(
        !b.dataset.add&&
        !b.dataset.del
      ){
        return;
      }


      if(!guard('daily.edit')){

        return;
      }


      const d=ensure();


      // Thêm dòng thực phẩm
      if(b.dataset.add){

        const id=
          el.querySelector(
            `[data-sel="${b.dataset.add}"]`
          ).value;

        const it=
          DB.items.find(
            i=>i.id===id
          );


        // Gạo chỉ được thêm ở nhóm Gạo; nhóm Gạo chỉ nhận Gạo
        const allowed=
          b.dataset.add==='staple'
            ?id===RICE_ID
            :id!==RICE_ID;

        if(it&&allowed){

          d.lines.push({

            group:b.dataset.add,

            itemId:id,

            qtyIn:0,

            price:it.price,

            qtyOut:0

          });

          save();
        }

      }


      // Xóa dòng
      else{

        d.lines.splice(
          +b.dataset.del,
          1
        );

        save();
      }

    };
  }


  return{

    mount(root){

      el=root;

      bind();

      render();

    }

  };

})();