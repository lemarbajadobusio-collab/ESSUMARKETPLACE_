const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcryptjs");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));

const rootDir = path.resolve(__dirname, "..");
const dataDir = path.join(rootDir, "data");
const dbPath = path.join(dataDir, "essu_marketplace.db");
const schemaPath = path.join(__dirname, "schema.sql");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) return reject(err);
      resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

function nowIso() {
  return new Date().toISOString();
}

async function initDatabase() {
  const schema = fs.readFileSync(schemaPath, "utf8");
  await new Promise((resolve, reject) => {
    db.exec(schema, err => {
      if (err) return reject(err);
      resolve();
    });
  });

  const adminEmail = "admin@essu.local";
  const existingAdmin = await get("SELECT id FROM users WHERE email = ?", [adminEmail]);
  if (!existingAdmin) {
    const hash = await bcrypt.hash("admin12345", 10);
    await run(
      "INSERT INTO users (fullname, email, password_hash, role, status) VALUES (?, ?, ?, 'admin', 'ACTIVE')",
      ["ESSU Admin", adminEmail, hash]
    );
  }
}

function sanitizeUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    fullname: row.fullname,
    email: row.email,
    role: row.role,
    mobile: row.mobile || "",
    status: row.status,
    photo: row.photo || "",
    joinedAt: row.joined_at
  };
}

async function ensureCart(userId) {
  let cart = await get("SELECT id FROM carts WHERE user_id = ?", [userId]);
  if (!cart) {
    const created = await run("INSERT INTO carts (user_id, updated_at) VALUES (?, ?)", [userId, nowIso()]);
    cart = { id: created.id };
  }
  return cart.id;
}

app.get("/api/health", async (_req, res) => {
  const counts = await get("SELECT COUNT(*) AS usersCount FROM users");
  res.json({ ok: true, users: counts?.usersCount || 0 });
});

app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullname, email, password, role = "buyer", mobile = "" } = req.body || {};
    if (!fullname || !email || !password) {
      return res.status(400).json({ error: "fullname, email, and password are required." });
    }
    if (!["buyer", "seller", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role." });
    }

    const existing = await get("SELECT id FROM users WHERE lower(email) = lower(?)", [email.trim()]);
    if (existing) return res.status(409).json({ error: "Email already exists." });

    const hash = await bcrypt.hash(password, 10);
    const created = await run(
      "INSERT INTO users (fullname, email, password_hash, role, mobile, joined_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [fullname.trim(), email.trim().toLowerCase(), hash, role, mobile.trim(), nowIso(), nowIso()]
    );
    const user = await get("SELECT * FROM users WHERE id = ?", [created.id]);
    return res.status(201).json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password are required." });

    const user = await get("SELECT * FROM users WHERE lower(email) = lower(?)", [email.trim()]);
    if (!user) return res.status(401).json({ error: "Invalid credentials." });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials." });

    return res.json({ user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/users", async (_req, res) => {
  try {
    const users = await all("SELECT * FROM users ORDER BY created_at DESC");
    res.json({ users: users.map(sanitizeUser) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const { includeSold = "false" } = req.query;
    const where = includeSold === "true" ? "" : "WHERE p.status != 'sold'";
    const rows = await all(
      `
      SELECT
        p.*,
        u.fullname AS seller_name,
        u.email AS seller_email
      FROM products p
      JOIN users u ON u.id = p.seller_user_id
      ${where}
      ORDER BY p.created_at DESC
      `
    );
    const products = rows.map(row => ({
      id: row.id,
      sellerUserId: row.seller_user_id,
      sellerName: row.seller_name,
      sellerEmail: row.seller_email,
      name: row.name,
      category: row.category,
      price: row.price,
      condition: row.item_condition,
      location: row.location,
      description: row.description,
      image: row.cover_image,
      images: JSON.parse(row.images_json || "[]"),
      status: row.status,
      posted: row.posted_label,
      views: row.views,
      createdAt: row.created_at
    }));
    res.json({ products });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/products", async (req, res) => {
  try {
    const {
      sellerUserId,
      name,
      category,
      price,
      condition,
      location = "",
      description = "",
      image = "",
      images = []
    } = req.body || {};

    if (!sellerUserId || !name || !category || price == null || !condition) {
      return res.status(400).json({ error: "sellerUserId, name, category, price, condition are required." });
    }
    const seller = await get("SELECT id FROM users WHERE id = ?", [sellerUserId]);
    if (!seller) return res.status(404).json({ error: "Seller not found." });

    const created = await run(
      `
      INSERT INTO products (
        seller_user_id, name, category, price, item_condition, location, description,
        cover_image, images_json, status, posted_label, views, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'available', 'Just now', 0, ?, ?)
      `,
      [
        sellerUserId,
        name,
        category,
        Number(price),
        condition,
        location,
        description,
        image || (images[0] || ""),
        JSON.stringify(Array.isArray(images) ? images : []),
        nowIso(),
        nowIso()
      ]
    );
    const product = await get("SELECT * FROM products WHERE id = ?", [created.id]);
    res.status(201).json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch("/api/products/:id/status", async (req, res) => {
  try {
    const productId = Number(req.params.id);
    const { status } = req.body || {};
    if (!["available", "sold", "archived"].includes(status)) {
      return res.status(400).json({ error: "Invalid status." });
    }
    await run("UPDATE products SET status = ?, updated_at = ? WHERE id = ?", [status, nowIso(), productId]);
    const product = await get("SELECT * FROM products WHERE id = ?", [productId]);
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json({ product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/cart/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const cartId = await ensureCart(userId);
    const items = await all(
      `
      SELECT
        ci.id,
        ci.qty,
        p.id AS product_id,
        p.name,
        p.price,
        p.cover_image,
        p.status,
        u.fullname AS seller_name,
        u.id AS seller_user_id
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      JOIN users u ON u.id = p.seller_user_id
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at DESC
      `,
      [cartId]
    );
    res.json({ items });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/cart/:userId/items", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { productId, qty = 1 } = req.body || {};
    if (!productId) return res.status(400).json({ error: "productId is required." });

    const product = await get("SELECT * FROM products WHERE id = ?", [productId]);
    if (!product) return res.status(404).json({ error: "Product not found." });
    if (product.status !== "available") return res.status(400).json({ error: "Product is not available." });
    if (product.seller_user_id === userId) return res.status(400).json({ error: "Cannot add your own listing." });

    const cartId = await ensureCart(userId);
    await run(
      `
      INSERT INTO cart_items (cart_id, product_id, qty)
      VALUES (?, ?, ?)
      ON CONFLICT(cart_id, product_id) DO UPDATE SET qty = qty + excluded.qty
      `,
      [cartId, productId, Math.max(1, Number(qty) || 1)]
    );
    await run("UPDATE carts SET updated_at = ? WHERE id = ?", [nowIso(), cartId]);
    res.status(201).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/api/cart/:userId/items/:productId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const productId = Number(req.params.productId);
    const cartId = await ensureCart(userId);
    await run("DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?", [cartId, productId]);
    await run("UPDATE carts SET updated_at = ? WHERE id = ?", [nowIso(), cartId]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/checkout/:buyerUserId", async (req, res) => {
  try {
    const buyerUserId = Number(req.params.buyerUserId);
    const cartId = await ensureCart(buyerUserId);

    const items = await all(
      `
      SELECT ci.product_id, ci.qty, p.name, p.price, p.status, p.seller_user_id
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = ?
      `,
      [cartId]
    );
    if (!items.length) return res.status(400).json({ error: "Cart is empty." });

    const purchased = [];
    for (const item of items) {
      if (item.status !== "available") continue;
      if (item.seller_user_id === buyerUserId) continue;

      await run("UPDATE products SET status = 'sold', updated_at = ? WHERE id = ?", [nowIso(), item.product_id]);
      await run(
        `
        INSERT INTO transactions (
          product_id, buyer_user_id, seller_user_id, item_name, amount, status, created_at
        ) VALUES (?, ?, ?, ?, ?, 'Completed', ?)
        `,
        [item.product_id, buyerUserId, item.seller_user_id, item.name, Number(item.price), nowIso()]
      );
      purchased.push({
        productId: item.product_id,
        item: item.name,
        amount: item.price
      });
    }

    await run("DELETE FROM cart_items WHERE cart_id = ?", [cartId]);
    await run("UPDATE carts SET updated_at = ? WHERE id = ?", [nowIso(), cartId]);

    if (!purchased.length) {
      return res.status(400).json({ error: "No purchasable items in cart." });
    }
    return res.json({
      ok: true,
      purchasedCount: purchased.length,
      total: purchased.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      purchased
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/transactions", async (req, res) => {
  try {
    const userId = Number(req.query.userId || 0);
    if (!userId) return res.status(400).json({ error: "userId query is required." });

    const rows = await all(
      `
      SELECT
        t.*,
        b.fullname AS buyer_name,
        s.fullname AS seller_name
      FROM transactions t
      JOIN users b ON b.id = t.buyer_user_id
      JOIN users s ON s.id = t.seller_user_id
      WHERE t.buyer_user_id = ? OR t.seller_user_id = ?
      ORDER BY t.created_at DESC
      `,
      [userId, userId]
    );

    const transactions = rows.map(row => ({
      id: row.id,
      listingId: row.product_id,
      date: row.created_at.slice(0, 10),
      item: row.item_name,
      type: row.seller_user_id === userId ? "Sale" : "Purchase",
      status: row.status,
      amount: row.amount,
      buyerName: row.buyer_name,
      sellerName: row.seller_name
    }));

    res.json({ transactions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/conversations", async (req, res) => {
  try {
    const userId = Number(req.query.userId || 0);
    if (!userId) return res.status(400).json({ error: "userId query is required." });

    const rows = await all(
      `
      SELECT c.id, c.listing_product_id, c.created_at
      FROM conversations c
      JOIN conversation_participants cp ON cp.conversation_id = c.id
      WHERE cp.user_id = ?
      ORDER BY c.created_at DESC
      `,
      [userId]
    );
    res.json({ conversations: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/conversations", async (req, res) => {
  try {
    const { listingProductId = null, participantUserIds = [] } = req.body || {};
    if (!Array.isArray(participantUserIds) || participantUserIds.length < 2) {
      return res.status(400).json({ error: "participantUserIds must contain at least 2 users." });
    }

    const created = await run(
      "INSERT INTO conversations (listing_product_id, created_at) VALUES (?, ?)",
      [listingProductId, nowIso()]
    );
    for (const userId of participantUserIds) {
      await run("INSERT INTO conversation_participants (conversation_id, user_id) VALUES (?, ?)", [
        created.id,
        Number(userId)
      ]);
    }
    res.status(201).json({ conversationId: created.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/conversations/:conversationId/messages", async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);
    const rows = await all(
      `
      SELECT m.id, m.message_text, m.created_at, m.sender_user_id, u.fullname AS sender_name
      FROM messages m
      JOIN users u ON u.id = m.sender_user_id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
      `,
      [conversationId]
    );
    res.json({ messages: rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/conversations/:conversationId/messages", async (req, res) => {
  try {
    const conversationId = Number(req.params.conversationId);
    const { senderUserId, text } = req.body || {};
    if (!senderUserId || !text?.trim()) {
      return res.status(400).json({ error: "senderUserId and text are required." });
    }
    const created = await run(
      "INSERT INTO messages (conversation_id, sender_user_id, message_text, created_at) VALUES (?, ?, ?, ?)",
      [conversationId, Number(senderUserId), text.trim(), nowIso()]
    );
    const message = await get("SELECT * FROM messages WHERE id = ?", [created.id]);
    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/admin/summary", async (_req, res) => {
  try {
    const [users, products, transactions] = await Promise.all([
      get("SELECT COUNT(*) AS value FROM users"),
      get("SELECT COUNT(*) AS value FROM products"),
      get("SELECT COUNT(*) AS value FROM transactions")
    ]);
    res.json({
      totalUsers: users?.value || 0,
      totalProducts: products?.value || 0,
      totalTransactions: transactions?.value || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err?.message || "Unexpected server error." });
});

const PORT = Number(process.env.PORT || 3000);

initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`ESSU Marketplace API running on http://localhost:${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`SQLite DB: ${dbPath}`);
    });
  })
  .catch(error => {
    // eslint-disable-next-line no-console
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
