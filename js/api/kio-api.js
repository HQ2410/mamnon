// Lớp persistence duy nhất. Bản ghi dạng {id, payload} giống lenam.
window.KioStore=(function(){
 const k=t=>'mamnon:store:'+t;
 const local={async load(t){try{return JSON.parse(localStorage.getItem(k(t))||'[]')}catch(e){return[]}},
  async save(t,rows){localStorage.setItem(k(t),JSON.stringify(rows))}};
 const kio={async load(t){throw new Error('TODO: nối getKrudList (list.js)')},
  async save(t,rows){throw new Error('TODO: nối sendFormDataKRUD/krud (krud.js)')}};
 const d=()=>MN_CONFIG.driver==='kio'?kio:local;
 return{load:t=>d().load(t),save:(t,r)=>d().save(t,r)};
})();
