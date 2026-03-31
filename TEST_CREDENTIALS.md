# Sahad Stores — Login Credentials

All staff accounts are **automatically seeded into MongoDB** when the server
starts for the first time (`server/mongodb.ts → seedStaffAccounts`).

---

## Staff Portal  (`/auth` → "Staff Portal" tab)

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| **Admin** | `admin@sahadstores.com` | `Admin@123456` | `/admin` |
| **Manager** | `manager@sahadstores.com` | `Manager@123456` | `/manager` |
| **Delivery** | `delivery@sahadstores.com` | `Delivery@123456` | `/delivery` |
| **Developer** | `developer@sahadstores.com` | `Developer@123456` | `/developer` |

> Staff accounts are created in MongoDB at startup. You can also click the
> quick-login cards on the Staff Portal tab to log in instantly.

---

## Shop Account  (`/auth` → "Shop Account" tab)

| Role | How to get it |
|------|---------------|
| **Buyer** | Sign up with any email + password on the Shop Account tab |
| **Affiliate (Reader)** | Admin promotes a buyer to affiliate from the User Management panel |

---

## Role Permissions Summary

| Feature | Admin | Manager | Delivery | Developer | Buyer | Affiliate |
|---------|:-----:|:-------:|:--------:|:---------:|:-----:|:---------:|
| View platform stats | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Manage users / roles | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Sales analytics | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ |
| Create / edit products | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage inventory | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage categories | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View & update delivery orders | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ |
| Shop / place orders | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| View referral earnings | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

---

## Password Policy (Buyers)

When signing up as a buyer, passwords must:
- Be **at least 8 characters** long
- Contain **at least one uppercase letter**
- Contain **at least one number**

---

## Security Notes

- Passwords are hashed with **bcrypt** (12 salt rounds) — never stored in plain text.
- Sessions use **HS256 JWT** stored in an `httpOnly` cookie.
- Auth endpoints are **rate-limited** to 10 requests per 15 minutes per IP.
- The buyer login and staff login are **separate endpoints** — each rejects the wrong role.
- Generic "Invalid email or password" messages prevent **email enumeration**.
