-- Dùng khi chuyển driver sang 'kio'. Cấu trúc tối thiểu giống lenam: id + payload (JSON).
CREATE TABLE mamnon_classes (id VARCHAR(64) PRIMARY KEY, payload LONGTEXT);
CREATE TABLE mamnon_items   (id VARCHAR(64) PRIMARY KEY, payload LONGTEXT);
CREATE TABLE mamnon_days    (id VARCHAR(16) PRIMARY KEY, payload LONGTEXT); -- id = yyyy-mm-dd
