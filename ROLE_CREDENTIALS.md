# Sahad Stores — Role Login Credentials

All staff accounts are **seeded automatically** into MongoDB the first time the
server connects. You do not need to create them manually.

---

## Staff Accounts (use the Staff Portal tab on /auth)

| Role        | Email                       | Password         | Dashboard URL       |
|-------------|----------------------------|------------------|---------------------|
| Admin       | admin@sahadstores.com       | Admin@123456     | /admin              |
| Manager     | manager@sahadstores.com     | Manager@123456   | /manager            |
| Delivery    | delivery@sahadstores.com    | Delivery@123456  | /delivery           |
| Developer   | developer@sahadstores.com   | Developer@123456 | /developer          |

---

## Buyer Accounts (use the Shop Account tab on /auth)

Buyers **register themselves** at `/auth` → Create Account.

Password requirements:
- Minimum 8 characters
- At least one uppercase letter (A–Z)
- At least one number (0–9)

---

## Affiliate (Reader) Accounts

The **reader** role is granted by an Admin:
1. Admin logs in → /admin/users
2. Finds the buyer by email
3. Clicks **Enable Affiliate**

Once promoted, the buyer logs in via the **Shop Account** tab (same
email + password) and is redirected to `/affiliate`.

---

## Role Permissions Summary

| Feature                  | Admin | Manager | Delivery | Developer | Buyer | Reader |
|--------------------------|:-----:|:-------:|:--------:|:---------:|:-----:|:------:|
| View all orders          | ✅    | ✅      |          | ✅        |       |        |
| Manage products          |       | ✅      |          |           |       |        |
| Manage categories        | ✅    | ✅      |          |           |       |        |
| Manage users / roles     | ✅    |         |          |           |       |        |
| Enable affiliates        | ✅    |         |          |           |       |        |
| View delivery orders     |       |         | ✅       |           |       |        |
| Update delivery status   |       |         | ✅       |           |       |        |
| Platform analytics       | ✅    |         |          | ✅        |       |        |
| Place orders / cart      |       |         |          |           | ✅    | ✅     |
| View affiliate earnings  |       |         |          |           |       | ✅     |
| Generate referral links  |       |         |          |           |       | ✅     |

---

## Auth Architecture

```
/auth  →  Shop Account tab   →  loginBuyer / signupBuyer  (buyer, reader)
/auth  →  Staff Portal tab   →  loginStaff                (admin, manager, delivery, developer)
```

- Passwords are hashed with **bcrypt (12 salt rounds)** — never stored in plain text.
- Sessions use **JWT (HS256)** signed with `JWT_SECRET`, stored in an `httpOnly` cookie.
- Rate limiting: **10 auth attempts per 15 minutes** per IP (brute-force protection).
- No external OAuth / Manus dependency — fully self-contained.
