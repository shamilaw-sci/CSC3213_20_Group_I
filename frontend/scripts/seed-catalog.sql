INSERT INTO category (categoryId, name, slug, createdAt, updatedAt) VALUES
('10000000-0000-4000-8000-000000000001','Dresses','dresses',NOW(),NOW()),
('10000000-0000-4000-8000-000000000002','Tops','tops',NOW(),NOW())
ON DUPLICATE KEY UPDATE categoryId=VALUES(categoryId), name=VALUES(name), updatedAt=NOW();

INSERT INTO merchant (merchantId, storeName, email, status, createdAt, updatedAt) VALUES
('20000000-0000-4000-8000-000000000001','Fashion Hub','catalog@fashionhub.example','ACTIVE',NOW(),NOW()),
('20000000-0000-4000-8000-000000000002','Style Corner','catalog@stylecorner.example','ACTIVE',NOW(),NOW())
ON DUPLICATE KEY UPDATE merchantId=VALUES(merchantId), storeName=VALUES(storeName), status='ACTIVE', updatedAt=NOW();

INSERT INTO product (productId,merchantId,categoryId,externalId,productName,price,currency,primaryImageUrl,merchantUrl,status,createdAt,updatedAt) VALUES
('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','elegant-evening-dress','Elegant Evening Dress',129.99,'LKR','https://images.pexels.com/photos/14801160/pexels-photo-14801160.jpeg','https://example.com/fashion-hub/elegant-evening-dress','ACTIVE',NOW(),NOW()),
('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','summer-casual-dress','Summer Casual Dress',79.99,'LKR','https://images.pexels.com/photos/8209332/pexels-photo-8209332.jpeg','https://example.com/style-corner/summer-casual-dress','ACTIVE',NOW(),NOW()),
('30000000-0000-4000-8000-000000000003','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','floral-garden-midi','Floral Garden Midi Dress',95.00,'LKR','https://images.pexels.com/photos/985635/pexels-photo-985635.jpeg','https://example.com/fashion-hub/floral-garden-midi','ACTIVE',NOW(),NOW()),
('30000000-0000-4000-8000-000000000004','20000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','midnight-satin-gown','Midnight Satin Gown',185.00,'LKR','https://images.pexels.com/photos/1755428/pexels-photo-1755428.jpeg','https://example.com/style-corner/midnight-satin-gown','ACTIVE',NOW(),NOW())
ON DUPLICATE KEY UPDATE productId=VALUES(productId),productName=VALUES(productName),price=VALUES(price),primaryImageUrl=VALUES(primaryImageUrl),status='ACTIVE',updatedAt=NOW();

INSERT INTO productvariant (productVariantId,productId,sku,size,stockQuantity,createdAt,updatedAt) VALUES
('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','EED-S','S',10,NOW(),NOW()),('40000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000001','EED-M','M',10,NOW(),NOW()),('40000000-0000-4000-8000-000000000003','30000000-0000-4000-8000-000000000001','EED-L','L',10,NOW(),NOW()),('40000000-0000-4000-8000-000000000004','30000000-0000-4000-8000-000000000001','EED-XL','XL',10,NOW(),NOW())
ON DUPLICATE KEY UPDATE stockQuantity=VALUES(stockQuantity),updatedAt=NOW();
