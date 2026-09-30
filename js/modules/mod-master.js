window.ModMaster=(function(){

  let el;

  const used=id=>
    DB.days.some(d=>
      d.lines.some(l=>l.itemId===id)
    );

  const nutritionValue=(item,key)=>{
    return +(item?.nutrition?.[key]||0);
  };

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
          <th>Nhà trẻ</th>
          <th></th>
        </tr>

        ${DB.classes.map(c=>`
          <tr>
            <td>${esc(c.name)}</td>
            <td>${esc(c.teachers)}</td>
            <td>${c.nursery?'x':''}</td>
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
          <th>Theo dõi tồn</th>
          <th></th>
        </tr>

        ${DB.items.map(i=>`

          <tr>
            <td>${esc(i.name)}</td>
            <td>${esc(i.unit)}</td>
            <td class=num>${vnd(i.price)}</td>
            <td>${i.stock?'x':''}</td>
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

      el.onclick=e=>{

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

          const n=prompt('Tên lớp');

          if(n){

            DB.classes.push({
              id:uid('c'),
              name:n,
              teachers:prompt('Cô chủ nhiệm')||'',
              nursery:confirm('Là nhà trẻ?')
            });

            save();
          }

        }


        // Thêm thực phẩm
        else if(b.id==='ai'){

          const n=prompt('Tên thực phẩm');

          if(n){

            const unit=
              prompt('ĐVT','Kg')||'Kg';

            const price=
              +prompt('Đơn giá',0)||0;

            const stock=
              confirm('Theo dõi tồn kho?');

            /*
             * nutrition mặc định bằng 0.
             *
             * nutritionWeight:
             * dùng khi đơn vị không phải Kg/g.
             */
            let nutritionWeight=0;

            if(
              unit.toLowerCase()==='hộp'||
              unit.toLowerCase()==='chai'
            ){

              nutritionWeight=
                +prompt(
                  'Khối lượng dinh dưỡng của 1 '+unit+' (gram).\n'+
                  'Nhập 0 nếu chưa xác định.',
                  0
                )||0;
            }

            DB.items.push({

              id:uid('i'),

              name:n,

              unit,

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
            prompt('Tên lớp',c.name);

          if(name===null){
            return;
          }

          const teachers=
            prompt('Cô chủ nhiệm',c.teachers||'');

          if(teachers===null){
            return;
          }

          const nursery=
            confirm('Là nhà trẻ?');

          c.name=name.trim();
          c.teachers=teachers.trim();
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
            prompt('Tên thực phẩm',item.name);

          if(name===null){
            return;
          }

          const unit=
            prompt('ĐVT',item.unit||'Kg');

          if(unit===null){
            return;
          }

          const priceInput=
            prompt('Đơn giá',item.price);

          if(priceInput===null){
            return;
          }

          const price=
            +priceInput||0;

          const stock=
            confirm('Theo dõi tồn kho?');

          let nutritionWeight=
            item.nutritionWeight||0;

          if(
            unit.toLowerCase()==='hộp'||
            unit.toLowerCase()==='chai'
          ){

            const weightInput=
              prompt(
                'Khối lượng dinh dưỡng của 1 '+unit+
                ' (gram).\nNhập 0 nếu chưa xác định.',
                nutritionWeight
              );

            if(weightInput===null){
              return;
            }

            nutritionWeight=
              +weightInput||0;
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

          DB.nutritionRecommendation[key]=Math.max(
            0,
            +input.value||0
          );

          MealAPI.saveNutritionRecommendation();

          return;
        }

        if(input.dataset.minRecommendationKey){

          if(!guard('master.edit')){
            render();
            return;
          }

          const key=input.dataset.minRecommendationKey;

          DB.minNutritionRecommendation[key]=Math.max(
            0,
            +input.value||0
          );

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
          Math.max(
            0,
            +input.value||0
          );

        MealAPI.saveItems();
      };

    }

  };

})();