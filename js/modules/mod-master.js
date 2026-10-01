window.ModMaster=(function(){

  let el;

  const used=id=>
    DB.days.some(d=>
      d.lines.some(l=>l.itemId===id)
    );

  const isMetricWeightUnit = unit => {
    const u=String(unit||'').trim().toLowerCase();
    return ['kg','kilogram','kilograms','g','gram','grams'].includes(u);
  };

  const requiresNutritionWeight = unit => {
    const u=String(unit||'').trim();
    return !!u && !isMetricWeightUnit(u);
  };

  const nutritionValue=(item,key)=>{
    return +(item?.nutrition?.[key]||0);
  };

  function askText(title, defaultValue=''){
    return new Promise(resolve=>{
      const bg=document.createElement('div');
      bg.className='modal-bg';

      const box=document.createElement('div');
      box.className='modal-box';
      box.style.maxWidth='420px';

      const h=document.createElement('h3');
      h.textContent=title;

      const input=document.createElement('input');
      input.type='text';
      input.value=String(defaultValue ?? '');
      input.style.width='100%';
      input.style.margin='12px 0';
      input.style.boxSizing='border-box';

      const actions=document.createElement('div');
      actions.style.display='flex';
      actions.style.justifyContent='flex-end';
      actions.style.gap='8px';
      actions.style.marginTop='8px';

      const ok=document.createElement('button');
      ok.type='button';
      ok.textContent='OK';
      ok.onclick=()=>{
        bg.remove();
        resolve(input.value);
      };

      const cancel=document.createElement('button');
      cancel.type='button';
      cancel.textContent='Hủy';
      cancel.onclick=()=>{
        bg.remove();
        resolve(null);
      };

      bg.onclick=e=>{
        if(e.target===bg){
          bg.remove();
          resolve(null);
        }
      };

      actions.append(cancel,ok);
      box.append(h,input,actions);
      bg.append(box);
      document.body.append(bg);
      input.focus();
      input.select();
      input.addEventListener('keydown',e=>{
        if(e.key==='Enter'){
          e.preventDefault();
          ok.click();
        }
        if(e.key==='Escape'){
          e.preventDefault();
          cancel.click();
        }
      });
    });
  }

  function render(){

    const ro=!SystemAPI.can('master.edit');

    const minNutritionRecommendation =
      DB.minNutritionRecommendation || {
        energy:0,
        protein:0,
        lipid:0,
        glucid:0,
        fiber:0
      };

    const chk=(v,label)=>
      `<input type="checkbox" class="ro-check" ${v?'checked':''}
        tabindex="-1" aria-readonly="true" aria-label="${label}"
        onclick="return false">`;

    const b=(a,id, editKey)=>
      ro
        ?''
        :`
          <button data-edit-${editKey}="${esc(id)}">Sửa</button>
          <button data-${a}="${esc(id)}">Xóa</button>
        `;

    el.innerHTML=`

      <h3>Lớp học</h3>

      <table>
        <tr>
          <th>Lớp</th>
          <th>Cô chủ nhiệm</th>
          <th>Số cháu</th>
          <th class="chk">Nhà trẻ</th>
          <th></th>
        </tr>

        ${DB.classes.map(c=>`
          <tr>
            <td>${esc(c.name)}</td>
            <td>${esc(c.teachers)}</td>
            <td class="num">${Math.max(0, +c.children || 0)}</td>
            <td class="chk">${chk(c.nursery,'Nhà trẻ')}</td>
            <td>${b('dc',c.id, 'class')}</td>
          </tr>
        `).join('')}

      </table>

      ${ro?'':'<button id=ac>+ Thêm lớp</button>'}


      <h3>Thực phẩm</h3>

      <table>

        <tr>
          <th>Tên</th>
          <th>ĐVT</th>
          <th>Đơn giá</th>
          <th>Khối lượng / đơn vị</th>
          <th class="chk">Theo dõi tồn</th>
          <th></th>
        </tr>

        ${DB.items.map(i=>`

          <tr>
            <td>${esc(i.name)}</td>
            <td>${esc(i.unit)}</td>
            <td class=num>${vnd(i.price)}</td>
            <td class="num">
              ${
                requiresNutritionWeight(i.unit)
                  ? `${Math.max(0, +i.nutritionWeight || 0)} g`
                  : '<span>—</span>'
              }
            </td>
            <td class="chk">${chk(i.stock,'Theo dõi tồn')}</td>
            <td>${b('di',i.id, 'item')}</td>
          </tr>

        `).join('')}

      </table>

      ${ro
        ?'<p><i>(chỉ xem)</i></p>'
        :'<button id=ai>+ Thêm thực phẩm</button>'
      }


      <h3>Hàm lượng dinh dưỡng (/100g)</h3>

      <table class="nutrition-table">

        <tr>
          <th>Thực phẩm</th>
          <th>Năng lượng<br>(kcal/100g)</th>
          <th>Protein<br>(g/100g)</th>
          <th>Lipid<br>(g/100g)</th>
          <th>Glucid<br>(g/100g)</th>
          <th>Chất xơ<br>(g/100g)</th>
        </tr>

        ${DB.items.map(i=>`

          <tr>

            <td>
              ${esc(i.name)}
            </td>

            <td class="num">

              <input
                data-nutrition-id="${esc(i.id)}"
                data-nutrition-key="energy"
                type="number"
                min="0"
                step="any"
                value="${nutritionValue(i,'energy')}"
                ${ro?'disabled':''}
              >

            </td>

            <td class="num">

              <input
                data-nutrition-id="${esc(i.id)}"
                data-nutrition-key="protein"
                type="number"
                min="0"
                step="any"
                value="${nutritionValue(i,'protein')}"
                ${ro?'disabled':''}
              >

            </td>

            <td class="num">

              <input
                data-nutrition-id="${esc(i.id)}"
                data-nutrition-key="lipid"
                type="number"
                min="0"
                step="any"
                value="${nutritionValue(i,'lipid')}"
                ${ro?'disabled':''}
              >

            </td>

            <td class="num">

              <input
                data-nutrition-id="${esc(i.id)}"
                data-nutrition-key="glucid"
                type="number"
                min="0"
                step="any"
                value="${nutritionValue(i,'glucid')}"
                ${ro?'disabled':''}
              >

            </td>

            <td class="num">

              <input
                data-nutrition-id="${esc(i.id)}"
                data-nutrition-key="fiber"
                type="number"
                min="0"
                step="any"
                value="${nutritionValue(i,'fiber')}"
                ${ro?'disabled':''}
              >

            </td>

          </tr>

        `).join('')}

      </table>

      <h3>Hàm lượng dinh dưỡng khuyến cáo cho một ngày</h3>

      <table class="nutrition-table nutrition-recommendation">

        <tr>
          <th>Chỉ tiêu</th>
          <th>Năng lượng<br>(kcal/ngày)</th>
          <th>Protein<br>(g/ngày)</th>
          <th>Lipid<br>(g/ngày)</th>
          <th>Glucid<br>(g/ngày)</th>
          <th>Chất xơ<br>(g/ngày)</th>
        </tr>

        <tr>

          <td>
            Mức khuyến cáo
          </td>

          <td>
            <input
              data-recommendation-key="energy"
              type="number"
              min="0"
              step="any"
              value="${DB.nutritionRecommendation.energy}"
              ${ro?'disabled':''}
            >
          </td>

          <td>
            <input
              data-recommendation-key="protein"
              type="number"
              min="0"
              step="any"
              value="${DB.nutritionRecommendation.protein}"
              ${ro?'disabled':''}
            >
          </td>

          <td>
            <input
              data-recommendation-key="lipid"
              type="number"
              min="0"
              step="any"
              value="${DB.nutritionRecommendation.lipid}"
              ${ro?'disabled':''}
            >
          </td>

          <td>
            <input
              data-recommendation-key="glucid"
              type="number"
              min="0"
              step="any"
              value="${DB.nutritionRecommendation.glucid}"
              ${ro?'disabled':''}
            >
          </td>

          <td>
            <input
              data-recommendation-key="fiber"
              type="number"
              min="0"
              step="any"
              value="${DB.nutritionRecommendation.fiber}"
              ${ro?'disabled':''}
            >
          </td>

        </tr>

        <tr>

          <td>
            Mức tối thiểu
          </td>

          <td>
            <input
              data-min-recommendation-key="energy"
              type="number"
              min="0"
              step="any"
              value="${minNutritionRecommendation.energy}"
              ${ro?'disabled':''}
            >
          </td>

          <td>
            <input
              data-min-recommendation-key="protein"
              type="number"
              min="0"
              step="any"
              value="${minNutritionRecommendation.protein}"
              ${ro?'disabled':''}
            >
          </td>

          <td>
            <input
              data-min-recommendation-key="lipid"
              type="number"
              min="0"
              step="any"
              value="${minNutritionRecommendation.lipid}"
              ${ro?'disabled':''}
            >
          </td>

          <td>
            <input
              data-min-recommendation-key="glucid"
              type="number"
              min="0"
              step="any"
              value="${minNutritionRecommendation.glucid}"
              ${ro?'disabled':''}
            >
          </td>

          <td>
            <input
              data-min-recommendation-key="fiber"
              type="number"
              min="0"
              step="any"
              value="${minNutritionRecommendation.fiber}"
              ${ro?'disabled':''}
            >
          </td>

        </tr>

      </table>

      ${ro
        ?'<p><i>(chỉ xem)</i></p>'
        :'<p><i>Nhập 0 nếu không muốn kiểm tra chỉ tiêu đó.</i></p>'
      }

      ${ro
        ?'<p><i>(chỉ xem)</i></p>'
        :'<p><i>Nhập giá trị dinh dưỡng tính trên 100g thực phẩm.</i></p>'
      }

    `;
  }


  const save=async()=>{
    await MealAPI.saveClasses();
    await MealAPI.saveItems();
    render();
  };


  return{

    mount(root){

      el=root;

      render();

      el.onclick=async e=>{

        const b=e.target;

        // Chỉ xử lý khi click đúng nút hành động. Không dùng `b.id` chung chung:
        // bôi đen văn bản làm click bắn vào phần tử cha chung (vd. <main id="view">)
        // và sẽ bị nhận nhầm là thao tác sửa.
        if(
          !(b.id==='ac'||
            b.id==='ai'||
            b.dataset.dc||
            b.dataset.di||
            b.dataset.editClass||
            b.dataset.editItem)
        ){
          return;
        }

        if(!guard('master.edit')){
          return;
        }


        // Thêm lớp
        if(b.id==='ac'){

          const n=await askText('Tên lớp');

          if(n!==null&&n.trim()){

            const teachers=
              (await askText('Cô chủ nhiệm',''))||'';

            const childrenInput=
              await askText('Số cháu','0');

            const children=
              sanitizePositiveNumber(childrenInput,{defaultValue:0});

            DB.classes.push({
              id:uid('c'),
              name:n.trim(),
              teachers:teachers.trim(),
              nursery:confirm('Là nhà trẻ?'),
              children
            });

            save();
          }

        }


        // Thêm thực phẩm
        else if(b.id==='ai'){

          const n=await askText('Tên thực phẩm');

          if(n!==null&&n.trim()){

            const unit=
              (await askText('ĐVT','Kg'))||'Kg';

            const priceInput=
              await askText('Đơn giá','0');

            const price=
              sanitizePositiveNumber(priceInput,{defaultValue:0});

            const stock=
              confirm('Theo dõi tồn kho?');

            /*
             * nutrition mặc định bằng 0.
             *
             * nutritionWeight:
             * dùng khi đơn vị không phải Kg/g.
             */
            let nutritionWeight=0;

            if(!isMetricWeightUnit(unit)){

              const nutritionWeightInput=
                await askText(
                  'Khối lượng dinh dưỡng của 1 '+unit+' (gram).\nNhập 0 nếu chưa xác định.',
                  '0'
                );

              nutritionWeight=
                sanitizePositiveNumber(nutritionWeightInput,{allowDecimalComma:true,defaultValue:0});
            }

            DB.items.push({

              id:uid('i'),

              name:n.trim(),

              unit:unit.trim()||'Kg',

              price,

              stock,

              nutritionWeight,

              nutrition:{
                energy:0,
                protein:0,
                lipid:0,
                glucid:0,
                fiber:0
              }

            });

            save();
          }

        }

        // Sửa lớp
        else if(b.dataset.editClass){

          const c=
            DB.classes.find(
              c=>c.id===b.dataset.editClass
            );

          if(!c){
            return;
          }

          const name=
            await askText('Tên lớp',c.name);

          if(name===null){
            return;
          }

          const teachers=
            await askText('Cô chủ nhiệm',c.teachers||'');

          if(teachers===null){
            return;
          }

          const childrenInput=
            await askText('Số cháu',String(c.children||0));

          if(childrenInput===null){
            return;
          }

          const nursery=
            confirm('Là nhà trẻ?');

          c.name=name.trim();
          c.teachers=teachers.trim();
          c.children=sanitizePositiveNumber(childrenInput,{defaultValue:0});
          c.nursery=nursery;

          save();
        }

        // Xóa lớp
        else if(b.dataset.dc){

          DB.classes=
            DB.classes.filter(
              c=>c.id!==b.dataset.dc
            );

          save();
        }

        // Sửa thực phẩm
        else if(b.dataset.editItem){

          const item=
            DB.items.find(
              i=>i.id===b.dataset.editItem
            );

          if(!item){
            return;
          }

          const name=
            await askText('Tên thực phẩm',item.name);

          if(name===null){
            return;
          }

          const unit=
            await askText('ĐVT',item.unit||'Kg');

          if(unit===null){
            return;
          }

          const priceInput=
            await askText('Đơn giá',String(item.price));

          if(priceInput===null){
            return;
          }

          const price=
            sanitizePositiveNumber(priceInput,{defaultValue:0});

          const stock=
            confirm('Theo dõi tồn kho?');

          let nutritionWeight=
            item.nutritionWeight||0;

          if(!isMetricWeightUnit(unit)){

            const weightInput=
              await askText(
                'Khối lượng dinh dưỡng của 1 '+unit+
                ' (gram).\nNhập 0 nếu chưa xác định.',
                String(nutritionWeight)
              );

            if(weightInput===null){
              return;
            }

            nutritionWeight=
              sanitizePositiveNumber(weightInput,{allowDecimalComma:true,defaultValue:0});
          }else{
            nutritionWeight=0;
          }

          item.name=name.trim();
          item.unit=unit.trim();
          item.price=price;
          item.stock=stock;
          item.nutritionWeight=nutritionWeight;

          save();
        }

        // Xóa thực phẩm
        else if(b.dataset.di){

          if(
            used(b.dataset.di)
          ){

            alert(
              'Thực phẩm đã phát sinh chứng từ, không xóa.'
            );

          }else{

            DB.items=
              DB.items.filter(
                i=>i.id!==b.dataset.di
              );

            save();
          }
        }

      };


      el.oninput=e=>{

        const input=e.target;

        if(
          !(input.dataset && (
            input.dataset.recommendationKey!==undefined ||
            input.dataset.minRecommendationKey!==undefined ||
            input.dataset.nutritionId!==undefined
          )) ||
          input.type!=='number'
        ){
          return;
        }

        const currentValue=input.value;
        const cleaned=sanitizePositiveNumber(currentValue,{allowDecimalComma:true,defaultValue:0});

        if(currentValue !== String(cleaned)){
          input.value=String(cleaned);
        }
      };

      /*
       * Nhập/sửa hàm lượng dinh dưỡng.
       *
       * Dùng blur/change thay vì mỗi lần gõ một ký tự
       * đều gọi save.
       */
      el.onchange=e=>{

        const input=e.target;

        if(input.dataset.recommendationKey){

          if(!guard('master.edit')){
            render();
            return;
          }

          const key=input.dataset.recommendationKey;

          DB.nutritionRecommendation[key]=sanitizePositiveNumber(input.value,{allowDecimalComma:true,defaultValue:0});

          MealAPI.saveNutritionRecommendation();

          return;
        }

        if(input.dataset.minRecommendationKey){

          if(!guard('master.edit')){
            render();
            return;
          }

          const key=input.dataset.minRecommendationKey;

          DB.minNutritionRecommendation[key]=sanitizePositiveNumber(input.value,{allowDecimalComma:true,defaultValue:0});

          MealAPI.saveNutritionRecommendation();

          return;
        }

        if(
          !input.dataset.nutritionId
        ){
          return;
        }

        if(
          !guard('master.edit')
        ){
          render();
          return;
        }

        const item=
          DB.items.find(
            i=>i.id===input.dataset.nutritionId
          );

        if(!item){
          return;
        }

        if(!item.nutrition){

          item.nutrition={
            energy:0,
            protein:0,
            lipid:0,
            glucid:0,
            fiber:0
          };

        }

        const key=
          input.dataset.nutritionKey;

        item.nutrition[key]=
          sanitizePositiveNumber(input.value,{allowDecimalComma:true,defaultValue:0});

        MealAPI.saveItems();
      };

    }

  };

})();