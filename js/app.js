const TABS={daily:['Sổ ăn hàng ngày',ModDaily],master:['Danh mục',ModMaster]};
function go(t){const v=document.getElementById('view');v.replaceWith(v.cloneNode(false));TABS[t][1].mount(document.getElementById('view'))}
(async()=>{await MealAPI.boot();
 document.getElementById('nav').innerHTML=Object.entries(TABS).map(([k,v])=>`<button onclick="go('${k}')">${v[0]}</button>`).join('');go('daily')})();
