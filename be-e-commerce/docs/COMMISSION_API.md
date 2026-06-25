# Commission API

Tài liệu rút gọn cho module commission (admin).

## Endpoints

### 1) Cập nhật cấu hình commission

- Method: `PATCH`
- Path: `/api/admin/commission`
- Role: `ADMIN`

Request body:

```json
{
  "fixedCommissionFee": 10000,
  "minimumCommissionBalance": 20000
}
```

Response mẫu:

```json
{
  "fixedCommissionFee": 10000,
  "minimumCommissionBalance": 20000,
  "updatedAt": "2026-05-29T12:30:00",
  "updatedBy": "Admin admin@example.com"
}
```

Validation:
- `fixedCommissionFee`: required, >= 0
- `minimumCommissionBalance`: required, >= 0

### 2) Lấy cấu hình commission đầy đủ

- Method: `GET`
- Path: `/api/admin/commission-settings`
- Role: `ADMIN`

Response mẫu:

```json
{
  "fixedCommissionFee": 10000,
  "minimumCommissionBalance": 20000,
  "autoLockEnabled": true,
  "updatedAt": "2026-05-29T12:30:00"
}
```

## Backward Compatibility

- `PATCH /api/admin/commission` không còn nhận `autoLockEnabled` trong request.
- Response của `PATCH /api/admin/commission` cũng không còn `autoLockEnabled`.
- Nếu client cần `autoLockEnabled`, gọi `GET /api/admin/commission-settings`.

## Test nhanh (cURL)

```bash
curl -X PATCH http://localhost:8080/api/admin/commission \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"fixedCommissionFee":10000,"minimumCommissionBalance":20000}'
```

```bash
curl -X GET http://localhost:8080/api/admin/commission-settings \
  -H "Authorization: Bearer <token>"
```

## File liên quan trong code

- `src/main/java/com/example/becommerce/controller/AdminController.java`
- `src/main/java/com/example/becommerce/service/AdminService.java`
- `src/main/java/com/example/becommerce/service/impl/AdminServiceImpl.java`
- `src/main/java/com/example/becommerce/dto/request/admin/CommissionUpdateRequest.java`
- `src/main/java/com/example/becommerce/dto/response/admin/CommissionResponse.java`
- `src/main/java/com/example/becommerce/dto/response/admin/CommissionSettingsResponse.java`
