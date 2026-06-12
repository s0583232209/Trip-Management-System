USE trip_manager;

-- עדכון שמות הסטטוסים הקיימים לעברית/אנגלית תקנית
UPDATE statuses SET status_name = 'planned'   WHERE status_id = 1;
UPDATE statuses SET status_name = 'approved'  WHERE status_id = 2;

-- הוספת סטטוסים חדשים אם לא קיימים
INSERT IGNORE INTO statuses (status_id, status_name) VALUES (3, 'done');
INSERT IGNORE INTO statuses (status_id, status_name) VALUES (4, 'post-edit');

-- הוספת עמודת הערת תיקון בדיעבד לטבלת הטיולים
ALTER TABLE trips ADD COLUMN IF NOT EXISTS post_edit_note TEXT NULL;

-- כל טיול ללא סטטוס יקבל 'planned'
UPDATE trips SET trip_status = 1 WHERE trip_status IS NULL;
