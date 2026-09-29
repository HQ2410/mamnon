window.MealAPI=(function(){
 const T=MN_CONFIG.tables,S=DataStore;
 return{
  async boot(){for(const n of['classes','items','days'])DB[n]=await S.load(T[n]);
   if(!DB.classes.length&&!DB.items.length&&!DB.days.length){Object.assign(DB,structuredClone(SEED));await this.saveAll()}},
  saveClasses:()=>S.save(T.classes,DB.classes),
  saveItems:()=>S.save(T.items,DB.items),
  saveDays:()=>S.save(T.days,DB.days.filter(d=>d.lines.length).map(d=>({...d,id:d.date}))), // id = ngày (yyyy-mm-dd)
  saveAll(){return Promise.all([this.saveClasses(),this.saveItems(),this.saveDays()])}};
})();
