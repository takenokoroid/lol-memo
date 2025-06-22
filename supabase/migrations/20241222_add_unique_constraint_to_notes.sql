-- 既存の重複データを処理（各チャンピオンごとに最新のメモのみを残す）
WITH duplicates AS (
  SELECT 
    id,
    user_id,
    champion_id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, champion_id 
      ORDER BY updated_at DESC
    ) as rn
  FROM notes
  WHERE champion_id IS NOT NULL
)
DELETE FROM notes
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- UNIQUE制約を追加
ALTER TABLE notes 
ADD CONSTRAINT unique_user_champion 
UNIQUE (user_id, champion_id);

-- champion_idがNULLの場合は複数作成可能なので、部分インデックスを使用
CREATE UNIQUE INDEX idx_notes_unique_user_champion 
ON notes (user_id, champion_id) 
WHERE champion_id IS NOT NULL;