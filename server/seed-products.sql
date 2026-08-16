-- ============================================================
-- Seed: demo products using existing brands, categories, images
-- + new attribute (پردازنده) and new attribute values
-- Run: PGPASSWORD=... psql -h localhost -U postgres -d postgres -f seed-products.sql
-- Idempotent: safe to re-run (ON CONFLICT DO NOTHING).
-- ============================================================

BEGIN;

-- region: attributes --------------------------------------------------
INSERT INTO attributes (id, name, slug, "isFilterable", "sortOrder")
VALUES ('c0000000-0000-4000-8000-000000000001', 'پردازنده', 'processor', true, 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO attribute_values (id, "attributeId", value, slug, "sortOrder") VALUES
  ('b0010000-0000-4000-8000-000000000001', 'deb3e299-2039-4b3d-8afe-419b4f04df2d', '12 گیگ', 'ram-12g', 2),
  ('b0020000-0000-4000-8000-000000000002', 'deb3e299-2039-4b3d-8afe-419b4f04df2d', '32 گیگ', 'ram-32g', 3),
  ('b0030000-0000-4000-8000-000000000003', 'd4c2b151-f1df-4126-a726-c554d77e3091', '256 گیگ', 'ssd-256', 1),
  ('b0040000-0000-4000-8000-000000000004', 'd4c2b151-f1df-4126-a726-c554d77e3091', '512 گیگ', 'ssd-512', 2),
  ('b0050000-0000-4000-8000-000000000005', '1c66af1f-7112-4b58-aa60-a894b5881b62', '1 ترابایت', 'hdd-1tb', 1),
  ('b0060000-0000-4000-8000-000000000006', 'd332c65b-6ad2-422a-9737-8189e1a21ca0', 'سفید', 'white', 2),
  ('b0070000-0000-4000-8000-000000000007', 'd332c65b-6ad2-422a-9737-8189e1a21ca0', 'آبی', 'blue', 3),
  ('b0080000-0000-4000-8000-000000000008', 'd332c65b-6ad2-422a-9737-8189e1a21ca0', 'خاکستری', 'gray', 4),
  ('c1000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Intel Core i5', 'intel-i5', 1),
  ('c2000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'Intel Core i7', 'intel-i7', 2),
  ('c3000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001', 'Snapdragon 8 Gen 2', 'snap-8gen2', 3),
  ('c4000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000001', 'Exynos 1380', 'exynos-1380', 4)
ON CONFLICT (id) DO NOTHING;
-- endregion

-- region: products ----------------------------------------------------
INSERT INTO products (
  id, name, slug, description, "shortDescription", sku, barcode, price, "salePrice",
  "costPrice", stock, "manageStock", "allowBackorder", weight, length, width, height,
  status, visibility, "isFeatured", "isActive", "soldCount", "viewCount", "likeCount",
  "commentCount", "publishedAt", "metaTitle", "metaDescription", keywords,
  "categoryId", "brandId"
)
SELECT
  p.id, p.name, p.slug, p.description, p."shortDescription", p.sku, p.barcode,
  p.price, p."salePrice", p."costPrice", p.stock, p."manageStock", p."allowBackorder",
  p.weight, p.length, p.width, p.height,
  'published', 'public',
  p."isFeatured", true,
  p."soldCount", p."viewCount", p."likeCount", p."commentCount",
  NOW(), p."metaTitle", p."metaDescription", p.keywords,
  c.id, b.id
FROM (VALUES
  (
    'a1000000-0000-4000-8000-000000000001'::uuid,
    'لپ تاپ ایسوس ویوو بوک 15 i5 - رم 16 - اس اس دی 512',
    'asus-vivobook-15-i5-1240p-ram-16-ssd-512',
    'لپ تاپ ایسوس ویوو بوک 15 با پردازنده اینتل Core i5 نسل ۱۲، ۱۶ گیگ رم و ۵۱۲ گیگ اس اس دی؛ مناسب کارهای اداری، برنامه‌نویسی و ادیت سبک.',
    'لپ‌تاپ سبک و قدرتمند برای کار و دانشگاه',
    'ASV15-BLK', '625170000001', 28900000, 24900000, 24000000,
    20, true, true, 1.80, 36.80, 23.00, 1.80,
    true, 214, 1850, 32, 4,
    'خرید لپ تاپ ایسوس ویوو بوک 15', 'ایسوس ویوو بوک 15 با 16 گیگ رم و 512 گیگ اس اس دی', 'لپ تاپ ایسوس',
    'lp-tap', 'asus'
  ),
  (
    'a1000000-0000-4000-8000-000000000002'::uuid,
    'لپ تاپ لنوو ایده پد 5 - رم ۸ گیگ - هارد ۱ ترابایت',
    'lenovo-ideapad-5-ram-8-hdd-1tb',
    'لپ تاپ لنوو ایده پد 5 با رم ۸ گیگ و هارد یک ترابایتی؛ گزینه اقتصادی برای کارهای روزمره و امور اداری.',
    'لپ‌تاپ اقتصادی لنوو برای استفاده روزانه',
    'LNVIP5-GR', '169852000001', 17200000, 15990000, 13000000,
    35, true, false, 1.90, 35.70, 23.80, 1.90,
    false, 156, 908, 23, 3,
    'خرید لپ تاپ لنوو ایده پد 5', 'لنوو ایده پد 5 با رم 8 گیگ و هارد 1 ترابایت', 'لپ تاپ لنوو',
    'lp-tap', 'lenovo'
  ),
  (
    'a1000000-0000-4000-8000-000000000003'::uuid,
    'گوشی سامسونگ گلکسی A54 5G',
    'samsung-galaxy-a54-5g',
    'گوشی سامسونگ گلکسی A54 با نمایشگر ۶.۴ اینچ، دوربین ۵۰ مگاپیکسلی، باتری ۵۰۰۰ میلی‌آمپری و حافظه ۱۲۸ گیگ.',
    'گوشی میان‌رده محبوب سامسونگ',
    'SAMA54-BLK', '100000000001', 29500000, 26900000, 18700000,
    200, true, false, 0.19, 15.80, 76.50, 8.20,
    false, 640, 5200, 123, 15,
    'خرید گوشی سامسونگ گلکسی A54', 'گلکسی A54 با دوربین ۵۰ مگاپیکسلی', 'گوشی سامسونگ',
    'mwbayl', 'samsung'
  ),
  (
    'a1000000-0000-4000-8000-000000000004'::uuid,
    'گوشی سامسونگ گلکسی S23',
    'samsung-galaxy-s23',
    'گلکسی S23 پرچمدار سامسونگ با پردازنده Snapdragon 8 Gen 2، رم ۸ گیگ، حافظه ۱۲۸ گیگ و دوربین سه‌گانه حرفه‌ای.',
    'پرچمدار قدرتمند سامسونگ',
    'SAMS23-SIL', '285609845121', 54900000, 47900000, 40000000,
    12, true, false, 0.19, 14.60, 7.00, 7.20,
    true, 470, 3100, 300, 12,
    'خرید سامسونگ گلکسی S23', 'S23 با اسنپدراگون 8 نسل 2', 'گلکسی S23',
    'mwbayl', 'samsung'
  ),
  (
    'a1000000-0000-4000-8000-000000000005'::uuid,
    'مانیتور سامسونگ ۲۴ اینچ فول اچ‌دی',
    'samsung-24-inch-monitor-fhd',
    'مانیتور ۲۴ اینچ سامسونگ با رزولوشن ۱۹۲۰×۱۰۸۰، پنل PLS و نرخ نوسازی ۷۵ هرتز؛ مناسب کار اداری و خانه.',
    'مانیتور اقتصادی سامسونگ',
    'SMM24-FHD', '880609512345', 12300000, 10500000, 8500000,
    25, true, false, 3.80, 56.00, 34.00, 5.60,
    false, 8, 41, 3, 1,
    'مانیتور سامسونگ ۲۴ اینچ', 'مانیتور ۲۴ اینچ FHD سامسونگ', 'مانیتور سامسونگ',
    'manytwr-1', 'samsung'
  ),
  (
    'a1000000-0000-4000-8000-000000000006'::uuid,
    'مانیتور ایسوس ۲۷ اینچ 2K گیمینگ',
    'asus-27-inch-monitor-2k-gaming',
    'مانیتور گیمینگ ایسوس ۲۷ اینچ WQHD با نرخ نوسازی ۱۸۵ هرتز و پنل Fast IPS؛ انتخابی ایده‌آل برای گیمرها.',
    'مانیتور گیمینگ ایسوس',
    'ASM27-2KG', '168200001234', 21500000, 19900000, 18000000,
    12, true, true, 4.50, 61.20, 53.00, 6.00,
    true, 5, 24, 8, 1,
    'خرید مانیتور گیمینگ ایسوس', 'مانیتور ۲۷ اینچ 2K ایسوس', 'مانیتور ایسوس',
    'manytwr-1', 'asus'
  ),
  (
    'a1000000-0000-4000-8000-000000000007'::uuid,
    'هدفون بلوتوثی لنوو SP70',
    'lenovo-sp70-bluetooth-headphone',
    'هدفون بلوتوثی لنوو SP70 با حذف نویز فعال، باتری ۳۶ ساعته و میکروفون تماس؛ مناسب موسیقی و مکالمه.',
    'هدفون میان‌رده لنوو',
    'LNSP70-BLK', '6952011234', 8900000, 7900000, 6000000,
    30, true, false, 0.24, 18.50, 17.00, 7.50,
    false, 62, 441, 9, 2,
    'هدفون لنوو SP70', 'هدفون بی‌سیم لنوو با حذف نویز فعال', 'هدفون لنوو',
    'dyjytal-1', 'lenovo'
  ),
  (
    'a1000000-0000-4000-8000-000000000008'::uuid,
    'کیبورد بی‌سیم ایسوس ۲٫۴ گیگاهرتزی',
    'asus-24ghz-wireless-keyboard',
    'کیبورد بی‌سیم ایسوس با اتصال ۲.۴ گیگاهرتز، کلیدهای کم‌صدا و چیدمان کامل فارسی/انگلیسی.',
    'کیبورد کم‌صدای ایسوس',
    'ASKB24-WHT', '400001234567', 4200000, 3600000, 2000000,
    120, true, false, 0.60, 44.00, 13.50, 2.50,
    false, 7, 21, 1, 0,
    'کیبورد بی‌سیم ایسوس', 'کیبورد ۲.۴ گیگاهرتزی ایسوس', 'کیبورد ایسوس',
    'dyjytal-1', 'asus'
  )
) AS p (id, name, slug, description, "shortDescription", sku, barcode, price, "salePrice",
         "costPrice", stock, "manageStock", "allowBackorder", weight, length, width, height,
         "isFeatured", "soldCount", "viewCount", "likeCount", "commentCount",
         "metaTitle", "metaDescription", keywords, "categorySlug", "brandSlug")
JOIN categories c ON c.slug = p."categorySlug"
JOIN brands b ON b.slug = p."brandSlug"
ON CONFLICT (id) DO NOTHING;
-- endregion

-- region: options -----------------------------------------------------
INSERT INTO product_options (id, "productId", "attributeId", "sortOrder")
SELECT o.id, p.id, a.id, o."sortOrder"
FROM (VALUES
  ('d1000000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-4000-8000-000000000001'::uuid, 'ram', 1),
  ('d1000000-0000-0000-0000-000000000002'::uuid, 'a1000000-0000-4000-8000-000000000001'::uuid, 'ssd', 2),
  ('d1000000-0000-0000-0000-000000000003'::uuid, 'a1000000-0000-4000-8000-000000000001'::uuid, 'color', 3),
  ('d1000000-0000-0000-0000-000000000004'::uuid, 'a1000000-0000-4000-8000-000000000001'::uuid, 'processor', 4),
  ('d2000000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-4000-8000-000000000002'::uuid, 'ram', 1),
  ('d2000000-0000-0000-0000-000000000002'::uuid, 'a1000000-0000-4000-8000-000000000002'::uuid, 'hdd', 2),
  ('d2000000-0000-0000-0000-000000000003'::uuid, 'a1000000-0000-4000-8000-000000000002'::uuid, 'color', 3),
  ('d3000000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-4000-8000-000000000003'::uuid, 'ram', 1),
  ('d3000000-0000-0000-0000-000000000002'::uuid, 'a1000000-0000-4000-8000-000000000003'::uuid, 'ssd', 2),
  ('d3000000-0000-0000-0000-000000000003'::uuid, 'a1000000-0000-4000-8000-000000000003'::uuid, 'color', 3),
  ('d4000000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-4000-8000-000000000004'::uuid, 'ram', 1),
  ('d4000000-0000-0000-0000-000000000002'::uuid, 'a1000000-0000-4000-8000-000000000004'::uuid, 'ssd', 2),
  ('d4000000-0000-0000-0000-000000000003'::uuid, 'a1000000-0000-4000-8000-000000000004'::uuid, 'color', 3),
  ('d5000000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-4000-8000-000000000005'::uuid, 'color', 1),
  ('d6000000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-4000-8000-000000000006'::uuid, 'color', 1),
  ('d7000000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-4000-8000-000000000007'::uuid, 'color', 1),
  ('d8000000-0000-0000-0000-000000000001'::uuid, 'a1000000-0000-4000-8000-000000000008'::uuid, 'color', 1)
) AS o (id, "productId", "attributeSlug", "sortOrder")
JOIN products p ON p.id = o."productId"
JOIN attributes a ON a.slug = o."attributeSlug"
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_option_values ("productOptionId", "attributeValueId")
SELECT o.id, av.id
FROM (VALUES
  ('d1000000-0000-0000-0000-000000000001'::uuid, '16g'),
  ('d1000000-0000-0000-0000-000000000002'::uuid, 'ssd-512'),
  ('d1000000-0000-0000-0000-000000000003'::uuid, 'black'),
  ('d1000000-0000-0000-0000-000000000004'::uuid, 'intel-i5'),
  ('d2000000-0000-0000-0000-000000000001'::uuid, '8g'),
  ('d2000000-0000-0000-0000-000000000002'::uuid, 'hdd-1tb'),
  ('d2000000-0000-0000-0000-000000000003'::uuid, 'gray'),
  ('d3000000-0000-0000-0000-000000000001'::uuid, '8g'),
  ('d3000000-0000-0000-0000-000000000002'::uuid, '128g'),
  ('d3000000-0000-0000-0000-000000000003'::uuid, 'black'),
  ('d4000000-0000-0000-0000-000000000001'::uuid, '8g'),
  ('d4000000-0000-0000-0000-000000000002'::uuid, '128g'),
  ('d4000000-0000-0000-0000-000000000003'::uuid, 'silver'),
  ('d5000000-0000-0000-0000-000000000001'::uuid, 'black'),
  ('d6000000-0000-0000-0000-000000000001'::uuid, 'black'),
  ('d7000000-0000-0000-0000-000000000001'::uuid, 'black'),
  ('d8000000-0000-0000-0000-000000000001'::uuid, 'white')
) AS ov ("productOptionId", "avSlug")
JOIN product_options o ON o.id = ov."productOptionId"
JOIN attribute_values av ON av.slug = ov."avSlug"
ON CONFLICT ("productOptionId", "attributeValueId") DO NOTHING;
-- endregion

-- region: variants ----------------------------------------------------
INSERT INTO product_variants (
  id, name, "productId", sku, barcode, price, "salePrice", stock, "manageStock",
  "allowBackorder", weight, length, width, height, image, "isDefault", "isActive"
) VALUES
  ('e1000000-0000-4000-8000-000000000001', 'مشکی', 'a1000000-0000-4000-8000-000000000001', 'ASV15-BLK-1', '625170000001', 28900000, 24900000, 20, true, true, 1.80, 36.80, 23.00, 1.80, NULL, true, true),
  ('e2000000-0000-4000-8000-000000000002', 'مشکی', 'a1000000-0000-4000-8000-000000000002', 'LNVIP5-BLK-1', '169852000002', 17200000, 15990000, 35, true, false, 1.90, 35.70, 23.80, 1.90, NULL, true, true),
  ('e3000000-0000-4000-8000-000000000003', 'مشکی', 'a1000000-0000-4000-8000-000000000004', 'SAMS23-BLK-1', '285609845122', 54900000, 47900000, 12, true, false, 0.19, 14.60, 7.00, 7.20, NULL, true, true),
  ('e4000000-0000-4000-8000-000000000004', 'سفید', 'a1000000-0000-4000-8000-000000000008', 'ASKB24-WHT-1', '400001234568', 4200000, 3600000, 120, true, false, 0.60, 44.00, 13.50, 2.50, NULL, true, true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO product_variant_values ("variantId", "attributeValueId")
SELECT v.id, av.id
FROM (VALUES
  ('e1000000-0000-4000-8000-000000000001'::uuid, 'black'),
  ('e2000000-0000-4000-8000-000000000002'::uuid, 'black'),
  ('e3000000-0000-4000-8000-000000000003'::uuid, 'black'),
  ('e4000000-0000-4000-8000-000000000004'::uuid, 'white')
) AS vv ("variantId", "avSlug")
JOIN product_variants v ON v.id = vv."variantId"
JOIN attribute_values av ON av.slug = vv."avSlug"
ON CONFLICT ("variantId", "attributeValueId") DO NOTHING;
-- endregion

-- region: media ---------------------------------------------------------------
INSERT INTO product_medias ("productId", type, url, alt, caption, "isThumbnail", "sortOrder")
SELECT p.id, 'image', 'http://localhost:4000/files/' || f.id, p.name, p.name, m."isThumb", m."sortOrder"
FROM (VALUES
  ('a1000000-0000-4000-8000-000000000001'::uuid, 'c5d9ff727c2d28271980f92b2705be1c.jpeg', true, 1),
  ('a1000000-0000-4000-8000-000000000001'::uuid, '24a69b37107ce333b3bf829c1c6910cf81.jpg', false, 2),
  ('a1000000-0000-4000-8000-000000000002'::uuid, 'd6b74f4e4966b6eb32de414c41fc8fd1.jpg', true, 1),
  ('a1000000-0000-4000-8000-000000000002'::uuid, 'b2e2311ecd46e3e22befc52375988633.jpg', false, 2),
  ('a1000000-0000-4000-8000-000000000003'::uuid, '6878f94ac48a24f192abfa10672be9d4b.jpg', true, 1),
  ('a1000000-0000-4000-8000-000000000004'::uuid, '169ffb1059c146bc26ad9acbe7e45aaa4.png', true, 1),
  ('a1000000-0000-4000-8000-000000000005'::uuid, 'caf5aebd9879190f71ee10104814c2ab41.jpg', true, 1),
  ('a1000000-0000-4000-8000-000000000006'::uuid, '4664c59024c8d37f829888fa31fda48e.jpg', true, 1),
  ('a1000000-0000-4000-8000-000000000007'::uuid, '8a1ba92e92c310da988e1a4cfece5f9fe.png', true, 1),
  ('a1000000-0000-4000-8000-000000000008'::uuid, 'b7c41039ccde5730bb5411016697a86c38.png', true, 1)
) AS m ("productId", "fileName", "isThumb", "sortOrder")
JOIN products p ON p.id = m."productId"
LEFT JOIN file f ON f.filename = m."fileName"
WHERE f.id IS NOT NULL;
-- endregion

COMMIT;