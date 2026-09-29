window.MealAPI=(function(){
 const T=MN_CONFIG.tables,S=KioStore,pack=(a,key)=>a.map(r=>({id:r[key],payload:r}));
 return{
  async boot(){for(const n of['classes','items','days'])DB[n]=(await S.load(T[n])).map(r=>r.payload);
   if(!DB.classes.length&&!DB.items.length&&!DB.days.length){Object.assign(DB,structuredClone(SEED));await this.saveAll()}},
  saveClasses:()=>S.save(T.classes,pack(DB.classes,'id')),
  saveItems:()=>S.save(T.items,pack(DB.items,'id')),
  saveDays:()=>S.save(T.days,pack(DB.days.filter(d=>d.lines.length),'date')),
  saveAll(){return Promise.all([this.saveClasses(),this.saveItems(),this.saveDays()])}};
})();
