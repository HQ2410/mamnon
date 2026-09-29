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

    const b=(a,id)=>
      ro
        ?''
        :`<button data-${a}="${esc(id)}">Xóa</button>`;

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
            <td>${b('dc',c.id)}</td>
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
            <td>${b('di',i.id)}</td>
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

        if(
          !(b.id||
            b.dataset.dc||
            b.dataset.di)
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


        // Xóa lớp
        else if(b.dataset.dc){

          DB.classes=
            DB.classes.filter(
              c=>c.id!==b.dataset.dc
            );

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