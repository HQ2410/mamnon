// Mọi tên bảng khai báo tập trung tại đây (không khai báo rải rác trong module).
window.MN_CONFIG={driver:(typeof location!=='undefined'&&new URLSearchParams(location.search).get('driver'))||'local', // 'local' = localStorage | 'kio' = KIO server (thử nhanh: mở index.html?driver=kio)
 school:{name:'TRƯỜNG MẦM NON ĐỨC THỊNH',branch:'PHÂN HIỆU: ĐIỂM CHÍNH'},
 sessionKey:'mamnon:auth:session:v1',
 tables:{classes:'mamnon_classes',items:'mamnon_items',days:'mamnon_days',users:'mamnon_users',roles:'mamnon_roles'}};
