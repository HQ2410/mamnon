// Chỉ là dữ liệu mẫu (seed) khi kho trống — KHÔNG phải database runtime. Mẫu: phiếu ngày 22/09/2026.
const C=(id,name,teachers,nursery,children=0)=>({id,name,teachers,nursery:!!nursery,children:+children||0});
const I=(id,name,unit,price,stock,nutritionWeight=0)=>({
  id,name,unit,price,stock:!!stock,
  nutritionWeight:unit&&!(unit.toLowerCase()==='kg'||unit.toLowerCase()==='g'||unit.toLowerCase()==='gram'||unit.toLowerCase()==='grams')?(+nutritionWeight||0):0,
  nutrition:{energy:0,protein:0,lipid:0,glucid:0,fiber:0}
});
const L=(group,itemId,qtyIn,price,qtyOut)=>({group,itemId,qtyIn,price,qtyOut});
window.SEED={
 classes:[C('c1','5 tuổi A','Anh Cầm + Thảo Nguyên'),C('c2','5 tuổi B','Kim Hường + Cô Như'),C('c3','4 tuổi A','Cô Hải + Kim Anh'),
  C('c4','4 tuổi B','Lan Chi + Quỳnh Hoa'),C('c5','3 tuổi B','Vân Anh + Cô Hạnh'),C('c6','3 tuổi B','Cô Hằng + Cô Nga'),C('c7','Nhà trẻ','Cô Trang + Cô Duyên + Hà',1)],
 items:[I('gao','Gạo ăn bữa chính','Kg',15500,1),I('ca','Cá thu tươi','Kg',240000),I('rau','Rau ngót','Kg',18000),I('lon','Thịt lợn','Kg',130000),
  I('lac','Lạc','Kg',70000),I('vung','Vừng','Kg',80000),I('chao','Cháo canh','Kg',25000),I('bo','Thịt bò','Kg',240000),I('sua','Sữa tươi 110ml','Hộp',5292,1,110)],
 days:[{date:'2026-09-22',ratePerChild:23000,gasRate:2000,prevBalance:-25522,opening:{gao:80.3,sua:464},
  attendance:{c1:24,c2:22,c3:26,c4:18,c5:18,c6:22,c7:15},
  lines:[L('staple','gao',0,15500,15.95),L('main','ca',6.9,240000,6.9),L('main','rau',5,18000,5),L('main','lon',1,130000,1),
   L('main','lac',.5,70000,.5),L('main','vung',.3,80000,.3),L('snack','chao',5.5,25000,5.5),L('snack','bo',2,240000,2),
   L('snack','sua',0,5292,16),L('evening','chao',.5,25000,.5),L('evening','bo',.5,240000,.5)]}],
 nutritionRecommendation:{energy:0,protein:0,lipid:0,glucid:0,fiber:0},
 minNutritionRecommendation:{energy:0,protein:0,lipid:0,glucid:0,fiber:0},};

// Vai trò mặc định. '*' = toàn quyền. Quyền kiểm tra ở SystemAPI.can().
window.SEED_SYS={roles:[
 {id:'admin',v:2,name:'Quản trị',permissions:['*']},
 {id:'principal',v:2,name:'Hiệu trưởng',permissions:['daily.view','master.view','report.view']},
 {id:'accountant',v:2,name:'Người lập biểu / Kế toán',permissions:['daily.view','daily.edit','master.view','master.edit','report.view']},
 {id:'teacher',v:2,name:'Giáo viên (chỉ xem)',permissions:['daily.view']}]};
