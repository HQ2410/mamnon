window.MealAPI=(function(){
 const T=MN_CONFIG.tables,S=DataStore;
 return{
  async boot(){for(const n of['classes','items','days'])DB[n]=await S.load(T[n]);
   const savedRecommendation=await S.load(T.nutritionRecommendation);
   if(savedRecommendation.length){
     const record=savedRecommendation[0];
     const {minNutritionRecommendation:storedMin, ...recommendation}=record;
     DB.nutritionRecommendation={...DB.nutritionRecommendation,...recommendation};
     DB.minNutritionRecommendation={
       ...DB.minNutritionRecommendation,
       ...(storedMin||{})
     };
   }
   if(!DB.classes.length&&!DB.items.length&&!DB.days.length){Object.assign(DB,structuredClone(SEED));await this.saveAll()}
   // Gạo chỉ nằm ở nhóm "Gạo (xuất từ kho)": dọn các dòng gạo ở bữa khác (dữ liệu cũ)
   if(purgeRiceFromOtherMeals()&&SystemAPI.can('daily.edit'))await this.saveDays()} ,
  saveClasses:()=>S.save(T.classes,DB.classes),
  saveItems:()=>S.save(T.items,DB.items),
  saveDays:()=>S.save(T.days,DB.days.filter(d=>d.lines.length).map(d=>({...d,id:d.date}))), // id = ngày (yyyy-mm-dd)
  saveNutritionRecommendation:()=>S.save(
    T.nutritionRecommendation,
    [{
      id:'default',
      ...DB.nutritionRecommendation,
      minNutritionRecommendation:{...DB.minNutritionRecommendation}
    }]
  ),
  saveAll(){return Promise.all([this.saveClasses(),this.saveItems(),this.saveDays(),this.saveNutritionRecommendation()])}};
})();
