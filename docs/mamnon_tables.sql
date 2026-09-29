-- Chỉ dùng khi driver = 'kio'. Theo đúng yêu cầu của kio-api.js (lenam): mỗi bảng tối thiểu id + payload.
-- id PHẢI tự tăng: adapter chia mỗi bản ghi thành nhiều dòng payload (120 ký tự/dòng) rồi ghép lại theo khóa.
CREATE TABLE mamnon_classes (id INT AUTO_INCREMENT PRIMARY KEY, payload VARCHAR(255));
CREATE TABLE mamnon_items   (id INT AUTO_INCREMENT PRIMARY KEY, payload VARCHAR(255));
CREATE TABLE mamnon_days    (id INT AUTO_INCREMENT PRIMARY KEY, payload VARCHAR(255));
CREATE TABLE mamnon_users   (id INT AUTO_INCREMENT PRIMARY KEY, payload VARCHAR(255));
CREATE TABLE mamnon_roles   (id INT AUTO_INCREMENT PRIMARY KEY, payload VARCHAR(255));
