 DROP DATABASE `trip_manager`;
CREATE DATABASE IF NOT EXISTS trip_manager
    CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;
-- DROP SCHEMA tirp_manager;
USE trip_manager;

-- 1. טבלת בתי ספר
CREATE TABLE schools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name NVARCHAR(150) NOT NULL,
    institution_number INT NOT NULL UNIQUE, -- יישום מספר מוסד ייחודי
    city NVARCHAR(100),                     -- תמיכה מלאה בעברית באמצעות NVARCHAR
    street NVARCHAR(100),
    house_number INT,
    postal_code INT,
    contact_email VARCHAR(150),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    phone VARCHAR(13)
) ;

-- 2. טבלת תפקידים (תיקון הערה: "של תפקיד ויוזר ID לשנות ולשים טבלה")
CREATE TABLE roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL UNIQUE
);

-- 3. טבלת משתמשים
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT,
    full_name NVARCHAR(100) NOT NULL,
    national_id VARCHAR(9) NOT NULL UNIQUE,        -- תיקון הערה: "id_number לשים כאן שם יותר מתאים"
    email VARCHAR(150) UNIQUE,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
) ;

-- 4. טבלת תפקידי משתמשים (טבלת קשר המממשת את תיקון ההערה לטבלה נפרדת)
CREATE TABLE user_roles (
    user_id INT,
    role_name VARCHAR(100),
    PRIMARY KEY (user_id, role_name),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_name) REFERENCES roles(role_name) ON DELETE CASCADE
) ;

-- 5. טבלת סיסמאות משתמשים (תיקון הערה: "password_hash טבלה נפרדת" למען אבטחה)
CREATE TABLE user_passwords (
    user_id INT,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id,password_hash),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ;

-- 6. טבלת כיתות (תיקון הערה: "צריך לעשות טבלה נוספת של קוד כיתה וכיתה")
CREATE TABLE classes ( 
    id INT AUTO_INCREMENT PRIMARY KEY,
    school_id INT NOT NULL,
  -- to add here a reference to the list of the students
    class_name VARCHAR(50) NOT NULL,        -- שם כיתה (למשל: 'ט-2')
    grade INT NOT NULL,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ;

-- 7. טבלת טיולים

CREATE TABLE statuses(
status_id INT AUTO_INCREMENT PRIMARY KEY,
status_name VARCHAR(20));
-- 8. טבלת תלמידים ונוכחות בטיול
-- CREATE TABLE trip_attendance (
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     trip_id INT NOT NULL,
--     student_name VARCHAR(100) NOT NULL,
--     class_id INT NOT NULL,                  -- תיקון מהערה: קישור מפתח זר לטבלת כיתות החדשה
--     is_present BOOLEAN DEFAULT NULL,        -- NULL מסמל שטרם בוצע קריאת שמות
--     notes TEXT,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
--     FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
-- ) ;

CREATE TABLE trips (
    id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
    school_id INT NOT NULL,
    trip_leader_id INT,                  -- קישור למשתמש האחראי
    title VARCHAR(200) NOT NULL,
    trip_date DATE NOT NULL,
    trip_status INT,
    route_geojson JSON,            -- שמירת נתוני מסלול גיאוגרפיים
    parent_token VARCHAR(255) UNIQUE NULL,  -- טוקן ייחודי לצפיית הורים ללא התחברות
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    FOREIGN KEY (trip_leader_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (trip_status) REFERENCES statuses(status_id) ON DELETE SET NULL
) ;
CREATE TABLE trip_kit(
id INT AUTO_INCREMENT PRIMARY KEY,
trip_id INT,
  FOREIGN KEY (trip_id)REFERENCES trips(id) ON DELETE CASCADE
);
-- DROP TABLE trip_kit;

CREATE TABLE file_types(
id INT AUTO_INCREMENT PRIMARY KEY NOT NULL,
type_name VARCHAR(10) NOT NULL UNIQUE);
CREATE TABLE trip_files (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT ,
    trip_kit INT,
    uploaded_by INT,
    original_name VARCHAR(255) NOT NULL,
    stored_name VARCHAR(255) NOT NULL,
    relative_path NVARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_extension VARCHAR(20),
    file_size BIGINT NOT NULL,
    description VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
	file_code INT,
    deleted_at TIMESTAMP NULL DEFAULT NULL,   
	FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE SET NULL,
	FOREIGN KEY (uploaded_by)REFERENCES users(id) ON DELETE SET NULL,
	FOREIGN KEY (trip_kit) REFERENCES trip_kit(id) ON DELETE SET NULL
);
CREATE TABLE file_codes(
	file_name NVARCHAR(255),
	file_id INT AUTO_INCREMENT PRIMARY KEY

);


-- להוסיף כאן אפשרויות של קבצים שחייבים בתיק טיול, ואז שיהיה להם קוד קבוע, אולי כדאי גם להוסיף טבלה של תיק טיול?
-- 10. טבלת רמות/סוגי חירום (תיקון הערה: "לעשות עוד רמות... בטוח לעשות טבלה נפרדת")

CREATE TABLE emergency_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type_name VARCHAR(50) NOT NULL UNIQUE,  -- כגון 'minor', 'major', 'critical' וכדומה
    severity_level INT DEFAULT 1
) ;
CREATE TABLE emergency_status(
	status_code INT PRIMARY KEY,
	status_name VARCHAR(20)
);
-- 11. טבלת אירועי חירום בטיול
CREATE TABLE emergencies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    trip_id INT NOT NULL,
    opened_by INT NULL,
    emergency_type_id INT NOT NULL,         -- קישור לטבלת רמות החירום המופרדת
    description TEXT NOT NULL,
    status INT,
    location_lat DECIMAL(10,7) NULL,
    location_lng DECIMAL(10,7) NULL,
    opened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    closed_at TIMESTAMP NULL,
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (opened_by) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (emergency_type_id) REFERENCES emergency_types(id),
    FOREIGN KEY (status) REFERENCES emergency_status(status_code) ON DELETE CASCADE
) ;

-- 12. טבלת לוג ביקורת (Audit Log)
CREATE TABLE audit_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action_type VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) DEFAULT NULL,
    old_values LONGTEXT DEFAULT NULL,
    new_values LONGTEXT DEFAULT NULL,
    message LONGTEXT NOT NULL,
    -- ip_address VARCHAR(45),
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    -- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL 
) ;
CREATE TABLE staff_trip(
staff_id INT,
trip_id INT,
class_id INT,
FOREIGN KEY (staff_id)	REFERENCES users(id) ON DELETE CASCADE,
FOREIGN KEY (trip_id)	REFERENCES trips(id) ON DELETE CASCADE,
FOREIGN KEY (class_id)	REFERENCES classes(id) ON DELETE CASCADE
)
;
-- טבלת קשר בין טיול לכיתות המשתתפות בו (משמשת לבדיקת כיסוי כיתות לפני אישור טיול)
CREATE TABLE trip_classes (
    trip_id INT NOT NULL,
    class_id INT NOT NULL,
    PRIMARY KEY (trip_id, class_id),
    FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
);
CREATE TABLE external_role(
id INT AUTO_INCREMENT PRIMARY KEY,
role_name NVARCHAR(20) NOT NULL UNIQUE
);
CREATE TABLE external_employees(
id INT AUTO_INCREMENT PRIMARY KEY,
name NVARCHAR(100),
external_role INT NOT NULL,
phone VARCHAR(10) NOT NULL ,
FOREIGN KEY (external_role) REFERENCES external_role(id) ON DELETE CASCADE
);
INSERT INTO roles (role_name)Values('principal');
INSERT INTO roles (role_name)VALUES('coordinator');
INSERT INTO roles (role_name)VALUES('trip leader');
INSERT INTO roles (role_name)VALUES('teacher');
INSERT INTO statuses(status_name)VALUES("schedualed");
INSERT INTO statuses(status_name)VALUES("approved");
INSERT INTO emergency_types (type_name, severity_level) VALUES ('minor', 1);
INSERT INTO emergency_types (type_name, severity_level) VALUES ('critical', 2);
INSERT INTO file_codes (file_name) VALUES ("מינוי אחראי טיול");
INSERT INTO file_codes (file_name) VALUES ("אישור יציאה לטיול ממנהל מוסד");
INSERT INTO file_codes (file_name) VALUES ("אישורי הורים");
INSERT INTO file_codes (file_name) VALUES ("רשימת תלמידים");
INSERT INTO file_codes (file_name) VALUES ("רשימת תלמידים עם מגבלות רפואיות");
INSERT INTO file_codes (file_name) VALUES ("טופס הפניה לטיפול רפואי לתלמיד שנפגע במהלך טיול");
INSERT INTO file_codes (file_name) VALUES ("רשימת תלמידים שנפגעו במהלך טיול");
INSERT INTO file_codes (file_name) VALUES ("טופס ביטוח למתנדב");
INSERT INTO file_codes (file_name) VALUES ("רשימת מלווים וטלפונים חיוניים בטיול");
INSERT INTO file_codes (file_name) VALUES ("הנחיות למורה אחראי כיתה");
INSERT INTO file_codes (file_name) VALUES ("טופס תיאום טיולים מאושר");

select * from users limit 10;
select * from user_roles limit 10;
select * from user_passwords limit 19;
select * from roles limit 10;
select * from trips limit 10;
select * from schools limit 10;

select * from staff_trip ;
select * from file_codes;
select * from trip_files;
DELETe  FROM trip_files WHERE trip_id=1;
select * from trip_kit ;
-- INSERT INTO trip_kit(id,trip_id)VALUES(1,1);
INSERT INTO emergency_status (status_code,status_name) VALUES (1,"open");
select * from external_employees;

INSERT INTO external_role(role_name)VALUES("guard");
INSERT INTO external_role(role_name)VALUES("medic");
INSERT INTO external_role(role_name)VALUES("paramedic");
INSERT INTO external_role(role_name)VALUES("guide");
INSERT INTO external_role(role_name)VALUES("first-aid-provider");
select * from external_role;
CREATE TABLE external_staff_trip(
trip_id INT,
staff_id INT,
FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
FOREIGN KEY (staff_id) REFERENCES external_employees(id) ON DELETE CASCADE
);
DELETE FROM trip_files WHERE trip_id=2;
