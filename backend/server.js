require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const { createClient } = require("@supabase/supabase-js");

const app = express();
app.use(cors());
app.use(express.json({ limit: "20mb" }));

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "essu_marketplace";

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY are required in .env");
}

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_SECRET_KEY || SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

const supabaseAuth = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
);

const supabaseAdmin = SUPABASE_SECRET_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
    })
  : null;

function nowIso() {
  return new Date().toISOString();
}

function getExtensionFromMime(mimeType) {
  if (!mimeType) return "bin";
  if (mimeType.includes("jpeg")) return "jpg";
  if (mimeType.includes("png")) return "png";
  if (mimeType.includes("webp")) return "webp";
  if (mimeType.includes("gif")) return "gif";
  const fallback = mimeType.split("/")[1] || "bin";
  return fallback.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin";
}

function isLikelyHttpUrl(value) {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

function getBucketPathFromPublicUrl(url) {
  if (!isLikelyHttpUrl(url)) return "";
  const normalized = url.trim();
  const marker = `/storage/v1/object/public/${SUPABASE_BUCKET}/`;
  const idx = normalized.indexOf(marker);
  if (idx === -1) return "";
  return normalized.slice(idx + marker.length);
}

function uniqueStrings(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

async function deleteBucketFiles(urls) {
  const paths = uniqueStrings((urls || []).map(getBucketPathFromPublicUrl)).filter(Boolean);
  if (!paths.length) return;
  const removed = await supabase.storage.from(SUPABASE_BUCKET).remove(paths);
  if (removed.error) {
    console.warn("Storage remove failed:", removed.error.message);
  }
}

async function uploadDataUrlToBucket(dataUrl, folder) {
  const match = String(dataUrl || "").match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return dataUrl;

  const mimeType = match[1];
  const base64Payload = match[2];
  const fileBytes = Buffer.from(base64Payload, "base64");
  const ext = getExtensionFromMime(mimeType);
  const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

  const uploaded = await supabase.storage.from(SUPABASE_BUCKET).upload(filePath, fileBytes, {
    contentType: mimeType,
    upsert: false
  });
  if (uploaded.error) {
    throw new Error(`Storage upload failed: ${uploaded.error.message}`);
  }

  const publicUrl = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(filePath);
  return publicUrl?.data?.publicUrl || dataUrl;
}

async function normalizeImageInput(imageValue, folder) {
  if (typeof imageValue !== "string" || !imageValue.trim()) return "";
  if (isLikelyHttpUrl(imageValue)) return imageValue.trim();
  return uploadDataUrlToBucket(imageValue, folder);
}

async function normalizeImagesArray(images, folder) {
  if (!Array.isArray(images)) return [];
  const normalized = [];
  for (const img of images) {
    if (typeof img !== "string" || !img.trim()) continue;
    normalized.push(await normalizeImageInput(img, folder));
  }
  return normalized;
}

function sanitizeUser(row) {
  if (!row) return null;
  return {
    id: Number(row.id),
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
  const existing = await supabase.from("carts").select("id").eq("user_id", userId).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data?.id) return Number(existing.data.id);
  const created = await supabase
    .from("carts")
    .insert({ user_id: userId, updated_at: nowIso() })
    .select("id")
    .single();
  if (created.error) throw created.error;
  return Number(created.data.id);
}

async function seedDefaultAdmin() {
  const adminEmail = "admin@essu.local";
  const existing = await supabase.from("users").select("id").eq("email", adminEmail).maybeSingle();
  if (existing.error) return;
  if (existing.data?.id) return;
  const hash = await bcrypt.hash("admin12345", 10);
  if (!supabaseAdmin) return;
  await supabaseAdmin.auth.admin.createUser({
    email: adminEmail,
    password: "admin12345",
    email_confirm: true
  });
  await supabase.from("users").insert({
    fullname: "ESSU Admin",
    email: adminEmail,
    password_hash: hash,
    role: "admin",
    status: "ACTIVE",
    joined_at: nowIso(),
    updated_at: nowIso()
  });
}

async function findAuthUserIdByEmail(email) {
  if (!supabaseAdmin || !email) return "";
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) return "";
  const match = (data?.users || []).find(u => String(u.email || "").toLowerCase() === email.toLowerCase());
  return match?.id || "";
}

async function findExistingConversation(participantUserIds, listingProductId) {
  const participants = Array.from(new Set((participantUserIds || []).map(id => Number(id)).filter(Boolean)));
  if (participants.length < 2) return null;

  const [firstId, secondId] = participants;
  const firstRows = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", firstId);
  if (firstRows.error) return null;
  const firstIds = (firstRows.data || []).map(row => row.conversation_id);
  if (!firstIds.length) return null;

  const secondRows = await supabase
    .from("conversation_participants")
    .select("conversation_id")
    .eq("user_id", secondId)
    .in("conversation_id", firstIds);
  if (secondRows.error) return null;
  const sharedIds = (secondRows.data || []).map(row => row.conversation_id);
  if (!sharedIds.length) return null;

  let query = supabase.from("conversations").select("id, listing_product_id").in("id", sharedIds);
  if (listingProductId == null) {
    query = query.is("listing_product_id", null);
  } else {
    query = query.eq("listing_product_id", listingProductId);
  }
  const existing = await query.order("created_at", { ascending: false }).maybeSingle();
  if (existing.error) return null;
  return existing.data?.id ? Number(existing.data.id) : null;
}

app.get("/api/health", async (_req, res) => {
  const result = await supabase.from("users").select("*", { head: true, count: "exact" });
  if (result.error) return res.status(500).json({ ok: false, error: result.error.message });
  return res.json({ ok: true, users: result.count || 0 });
});

app.get("/", (_req, res) => {
  return res.json({
    ok: true,
    service: "ESSU Marketplace API",
    health: "/api/health"
  });
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
    if (!supabaseAdmin) {
      return res.status(500).json({ error: "SUPABASE_SECRET_KEY is required for signup." });
    }

    const exists = await supabase.from("users").select("id").ilike("email", email.trim()).maybeSingle();
    if (exists.error) return res.status(500).json({ error: exists.error.message });
    if (exists.data?.id) return res.status(409).json({ error: "Email already exists." });

    const authCreate = await supabaseAdmin.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true
    });
    if (authCreate.error) {
      const message = authCreate.error.message || "Unable to create auth user.";
      const status = message.toLowerCase().includes("already") ? 409 : 500;
      return res.status(status).json({ error: message });
    }

    const hash = await bcrypt.hash(password, 10);
    const created = await supabase
      .from("users")
      .insert({
        fullname: fullname.trim(),
        email: email.trim().toLowerCase(),
        password_hash: hash,
        role,
        mobile: mobile.trim(),
        joined_at: nowIso(),
        updated_at: nowIso()
      })
      .select("*")
      .single();
    if (created.error) return res.status(500).json({ error: created.error.message });
    return res.status(201).json({ user: sanitizeUser(created.data) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: "email and password are required." });

    const authResult = await supabaseAuth.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password
    });
    if (authResult.error) {
      // Legacy fallback: check public.users and migrate to Auth if needed
      const legacyRow = await supabase.from("users").select("*").ilike("email", email.trim()).maybeSingle();
      if (legacyRow.error) return res.status(500).json({ error: legacyRow.error.message });
      if (legacyRow.data && (await bcrypt.compare(password, legacyRow.data.password_hash))) {
        if (!supabaseAdmin) {
          return res.status(500).json({ error: "SUPABASE_SECRET_KEY is required to migrate auth users." });
        }
        const create = await supabaseAdmin.auth.admin.createUser({
          email: email.trim().toLowerCase(),
          password,
          email_confirm: true
        });
        if (create.error) {
          const authUserId = await findAuthUserIdByEmail(email.trim().toLowerCase());
          if (authUserId) {
            await supabaseAdmin.auth.admin.updateUserById(authUserId, { password });
          }
        }
        return res.json({ user: sanitizeUser(legacyRow.data), migrated: true });
      }
      return res.status(401).json({ error: authResult.error.message || "Invalid credentials." });
    }

    const userRow = await supabase.from("users").select("*").ilike("email", email.trim()).maybeSingle();
    if (userRow.error) return res.status(500).json({ error: userRow.error.message });
    if (!userRow.data) return res.status(404).json({ error: "User profile not found." });

    return res.json({ user: sanitizeUser(userRow.data) });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/users", async (_req, res) => {
  const rows = await supabase.from("users").select("*").order("created_at", { ascending: false });
  if (rows.error) return res.status(500).json({ error: rows.error.message });
  return res.json({ users: (rows.data || []).map(sanitizeUser) });
});

app.patch("/api/users/:id", async (req, res) => {
  const userId = Number(req.params.id);
  const { fullname, mobile, photo, status, role, email, password } = req.body || {};

  const existingUser = await supabase.from("users").select("id, photo, email").eq("id", userId).maybeSingle();
  if (existingUser.error) return res.status(500).json({ error: existingUser.error.message });
  if (!existingUser.data) return res.status(404).json({ error: "User not found." });

  const updatePayload = { updated_at: nowIso() };
  if (typeof fullname === "string") updatePayload.fullname = fullname.trim();
  if (typeof mobile === "string") updatePayload.mobile = mobile.trim();
  if (typeof photo === "string") updatePayload.photo = await normalizeImageInput(photo, "profiles");
  if (typeof status === "string") updatePayload.status = status;
  if (typeof role === "string") updatePayload.role = role;
  if (typeof email === "string") updatePayload.email = email.trim().toLowerCase();
  if (typeof password === "string" && password.trim()) {
    updatePayload.password_hash = await bcrypt.hash(password, 10);
  }

  const updated = await supabase.from("users").update(updatePayload).eq("id", userId).select("*").maybeSingle();
  if (updated.error) return res.status(500).json({ error: updated.error.message });
  if (!updated.data) return res.status(404).json({ error: "User not found." });

  if (supabaseAdmin) {
    const authUserId = await findAuthUserIdByEmail(existingUser.data.email || updated.data.email);
    if (authUserId) {
      const updates = {};
      if (typeof email === "string") {
        updates.email = email.trim().toLowerCase();
        updates.email_confirm = true;
      }
      if (typeof password === "string" && password.trim()) {
        updates.password = password.trim();
      }
      if (Object.keys(updates).length) {
        await supabaseAdmin.auth.admin.updateUserById(authUserId, updates);
      }
    }
  }

  const previousPhoto = existingUser.data.photo || "";
  const nextPhoto = updated.data.photo || "";
  if (previousPhoto && previousPhoto !== nextPhoto) {
    await deleteBucketFiles([previousPhoto]);
  }
  return res.json({ user: sanitizeUser(updated.data) });
});

app.get("/api/products", async (req, res) => {
  const includeSold = req.query.includeSold === "true";
  let q = supabase
    .from("products")
    .select("*, seller:users!products_seller_user_id_fkey(fullname,email)")
    .order("created_at", { ascending: false });
  if (!includeSold) q = q.neq("status", "sold");
  const rows = await q;
  if (rows.error) return res.status(500).json({ error: rows.error.message });

  const products = (rows.data || []).map(row => ({
    id: Number(row.id),
    sellerUserId: Number(row.seller_user_id),
    sellerName: row.seller?.fullname || "Seller",
    sellerEmail: row.seller?.email || "",
    name: row.name,
    category: row.category,
    price: Number(row.price),
    condition: row.item_condition,
    location: row.location,
    description: row.description,
    image: row.cover_image,
    images: Array.isArray(row.images_json) ? row.images_json : [],
    status: row.status,
    posted: row.posted_label,
    views: Number(row.views || 0),
    createdAt: row.created_at
  }));
  return res.json({ products });
});

app.post("/api/products", async (req, res) => {
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

  const seller = await supabase.from("users").select("id").eq("id", sellerUserId).maybeSingle();
  if (seller.error) return res.status(500).json({ error: seller.error.message });
  if (!seller.data) return res.status(404).json({ error: "Seller not found." });

  const normalizedImages = await normalizeImagesArray(images, "products");
  const normalizedCover = await normalizeImageInput(image || normalizedImages[0] || "", "products");

  const inserted = await supabase
    .from("products")
    .insert({
      seller_user_id: sellerUserId,
      name,
      category,
      price: Number(price),
      item_condition: condition,
      location,
      description,
      cover_image: normalizedCover,
      images_json: normalizedImages,
      status: "available",
      posted_label: "Just now",
      views: 0,
      created_at: nowIso(),
      updated_at: nowIso()
    })
    .select("*")
    .single();
  if (inserted.error) return res.status(500).json({ error: inserted.error.message });
  return res.status(201).json({ product: inserted.data });
});

app.patch("/api/products/:id", async (req, res) => {
  const productId = Number(req.params.id);
  const {
    name,
    category,
    price,
    condition,
    location,
    description,
    image,
    images
  } = req.body || {};

  const existing = await supabase
    .from("products")
    .select("id, cover_image, images_json")
    .eq("id", productId)
    .maybeSingle();
  if (existing.error) return res.status(500).json({ error: existing.error.message });
  if (!existing.data) return res.status(404).json({ error: "Product not found." });

  const updatePayload = { updated_at: nowIso() };
  if (typeof name === "string") updatePayload.name = name.trim();
  if (typeof category === "string") updatePayload.category = category;
  if (price != null) updatePayload.price = Number(price);
  if (typeof condition === "string") updatePayload.item_condition = condition;
  if (typeof location === "string") updatePayload.location = location;
  if (typeof description === "string") updatePayload.description = description;
  if (typeof image === "string") updatePayload.cover_image = await normalizeImageInput(image, "products");
  if (Array.isArray(images)) updatePayload.images_json = await normalizeImagesArray(images, "products");

  const updated = await supabase.from("products").update(updatePayload).eq("id", productId).select("*").maybeSingle();
  if (updated.error) return res.status(500).json({ error: updated.error.message });
  if (!updated.data) return res.status(404).json({ error: "Product not found." });

  const prevImages = uniqueStrings([
    existing.data.cover_image,
    ...(Array.isArray(existing.data.images_json) ? existing.data.images_json : [])
  ]);
  const nextImages = uniqueStrings([
    updated.data.cover_image,
    ...(Array.isArray(updated.data.images_json) ? updated.data.images_json : [])
  ]);
  const removed = prevImages.filter(url => !nextImages.includes(url));
  if (removed.length) {
    await deleteBucketFiles(removed);
  }
  return res.json({ product: updated.data });
});

app.patch("/api/products/:id/status", async (req, res) => {
  const productId = Number(req.params.id);
  const { status } = req.body || {};
  if (!["available", "sold", "archived"].includes(status)) {
    return res.status(400).json({ error: "Invalid status." });
  }
  const updated = await supabase
    .from("products")
    .update({ status, updated_at: nowIso() })
    .eq("id", productId)
    .select("*")
    .maybeSingle();
  if (updated.error) return res.status(500).json({ error: updated.error.message });
  if (!updated.data) return res.status(404).json({ error: "Product not found." });
  return res.json({ product: updated.data });
});

app.delete("/api/products/:id", async (req, res) => {
  const productId = Number(req.params.id);
  const existing = await supabase
    .from("products")
    .select("id, cover_image, images_json")
    .eq("id", productId)
    .maybeSingle();
  if (existing.error) return res.status(500).json({ error: existing.error.message });
  if (!existing.data) return res.status(404).json({ error: "Product not found." });

  const deleted = await supabase.from("products").delete().eq("id", productId).select("id").maybeSingle();
  if (deleted.error) return res.status(500).json({ error: deleted.error.message });
  if (!deleted.data) return res.status(404).json({ error: "Product not found." });

  await deleteBucketFiles([
    existing.data.cover_image,
    ...(Array.isArray(existing.data.images_json) ? existing.data.images_json : [])
  ]);
  return res.json({ ok: true });
});

app.get("/api/cart/:userId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const cartId = await ensureCart(userId);
    const items = await supabase
      .from("cart_items")
      .select("id, qty, product:products(id,name,price,cover_image,status,seller_user_id, seller:users!products_seller_user_id_fkey(id,fullname))")
      .eq("cart_id", cartId)
      .order("created_at", { ascending: false });
    if (items.error) return res.status(500).json({ error: items.error.message });

    const mapped = (items.data || []).map(it => ({
      id: Number(it.id),
      qty: Number(it.qty),
      product_id: Number(it.product?.id),
      name: it.product?.name || "",
      price: Number(it.product?.price || 0),
      cover_image: it.product?.cover_image || "",
      status: it.product?.status || "",
      seller_name: it.product?.seller?.fullname || "",
      seller_user_id: Number(it.product?.seller_user_id || 0)
    }));
    return res.json({ items: mapped });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/cart/:userId/items", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const { productId, qty = 1 } = req.body || {};
    if (!productId) return res.status(400).json({ error: "productId is required." });

    const productRow = await supabase.from("products").select("*").eq("id", productId).maybeSingle();
    if (productRow.error) return res.status(500).json({ error: productRow.error.message });
    if (!productRow.data) return res.status(404).json({ error: "Product not found." });
    if (productRow.data.status !== "available") return res.status(400).json({ error: "Product is not available." });
    if (Number(productRow.data.seller_user_id) === userId) return res.status(400).json({ error: "Cannot add your own listing." });

    const cartId = await ensureCart(userId);
    const existing = await supabase
      .from("cart_items")
      .select("id, qty")
      .eq("cart_id", cartId)
      .eq("product_id", productId)
      .maybeSingle();
    if (existing.error) return res.status(500).json({ error: existing.error.message });

    const quantity = Math.max(1, Number(qty) || 1);
    if (existing.data?.id) {
      const updated = await supabase
        .from("cart_items")
        .update({ qty: Number(existing.data.qty) + quantity })
        .eq("id", existing.data.id);
      if (updated.error) return res.status(500).json({ error: updated.error.message });
    } else {
      const inserted = await supabase.from("cart_items").insert({ cart_id: cartId, product_id: productId, qty: quantity });
      if (inserted.error) return res.status(500).json({ error: inserted.error.message });
    }
    await supabase.from("carts").update({ updated_at: nowIso() }).eq("id", cartId);
    return res.status(201).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.delete("/api/cart/:userId/items/:productId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const productId = Number(req.params.productId);
    const cartId = await ensureCart(userId);
    const removed = await supabase.from("cart_items").delete().eq("cart_id", cartId).eq("product_id", productId);
    if (removed.error) return res.status(500).json({ error: removed.error.message });
    await supabase.from("carts").update({ updated_at: nowIso() }).eq("id", cartId);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.patch("/api/cart/:userId/items/:productId", async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    const productId = Number(req.params.productId);
    const qty = Number(req.body?.qty);
    if (!Number.isFinite(qty)) return res.status(400).json({ error: "qty is required." });

    const cartId = await ensureCart(userId);
    if (qty <= 0) {
      const removed = await supabase.from("cart_items").delete().eq("cart_id", cartId).eq("product_id", productId);
      if (removed.error) return res.status(500).json({ error: removed.error.message });
    } else {
      const updated = await supabase
        .from("cart_items")
        .update({ qty: Math.max(1, Math.floor(qty)) })
        .eq("cart_id", cartId)
        .eq("product_id", productId);
      if (updated.error) return res.status(500).json({ error: updated.error.message });
    }

    await supabase.from("carts").update({ updated_at: nowIso() }).eq("id", cartId);
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/api/checkout/:buyerUserId", async (req, res) => {
  try {
    const buyerUserId = Number(req.params.buyerUserId);
    const cartId = await ensureCart(buyerUserId);

    const cartItems = await supabase
      .from("cart_items")
      .select("id, qty, product:products(id,name,price,status,seller_user_id)")
      .eq("cart_id", cartId);
    if (cartItems.error) return res.status(500).json({ error: cartItems.error.message });
    if (!cartItems.data?.length) return res.status(400).json({ error: "Cart is empty." });

    const purchased = [];
    for (const item of cartItems.data) {
      const product = item.product;
      if (!product) continue;
      if (product.status !== "available") continue;
      if (Number(product.seller_user_id) === buyerUserId) continue;
      const qty = Math.max(1, Number(item.qty) || 1);

      const productUpdate = await supabase
        .from("products")
        .update({ status: "sold", updated_at: nowIso() })
        .eq("id", product.id)
        .eq("status", "available");
      if (productUpdate.error) return res.status(500).json({ error: productUpdate.error.message });

      const txnInsert = await supabase.from("transactions").insert({
        product_id: product.id,
        buyer_user_id: buyerUserId,
        seller_user_id: product.seller_user_id,
        item_name: qty > 1 ? `${product.name} (x${qty})` : product.name,
        amount: Number(product.price) * qty,
        status: "Completed",
        created_at: nowIso()
      });
      if (txnInsert.error) return res.status(500).json({ error: txnInsert.error.message });

      purchased.push({
        productId: Number(product.id),
        qty,
        item: product.name,
        amount: Number(product.price) * qty
      });
    }

    const clear = await supabase.from("cart_items").delete().eq("cart_id", cartId);
    if (clear.error) return res.status(500).json({ error: clear.error.message });
    await supabase.from("carts").update({ updated_at: nowIso() }).eq("id", cartId);

    if (!purchased.length) return res.status(400).json({ error: "No purchasable items in cart." });
    return res.json({
      ok: true,
      purchasedCount: purchased.reduce((sum, item) => sum + Number(item.qty || 1), 0),
      total: purchased.reduce((sum, item) => sum + Number(item.amount || 0), 0),
      purchased
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/api/transactions", async (req, res) => {
  const userId = Number(req.query.userId || 0);
  let query = supabase
    .from("transactions")
    .select("*, buyer:users!transactions_buyer_user_id_fkey(fullname), seller:users!transactions_seller_user_id_fkey(fullname)")
    .order("created_at", { ascending: false });
  if (userId) {
    query = query.or(`buyer_user_id.eq.${userId},seller_user_id.eq.${userId}`);
  }
  const rows = await query;
  if (rows.error) return res.status(500).json({ error: rows.error.message });

  const transactions = (rows.data || []).map(row => ({
    id: Number(row.id),
    listingId: Number(row.product_id),
    date: String(row.created_at).slice(0, 10),
    item: row.item_name,
    type: userId ? (Number(row.seller_user_id) === userId ? "Sale" : "Purchase") : "Completed",
    status: row.status,
    amount: Number(row.amount),
    buyerName: row.buyer?.fullname || "",
    sellerName: row.seller?.fullname || ""
  }));
  return res.json({ transactions });
});

app.get("/api/conversations", async (req, res) => {
  const userId = Number(req.query.userId || 0);
  if (!userId) return res.status(400).json({ error: "userId query is required." });

  const part = await supabase.from("conversation_participants").select("conversation_id").eq("user_id", userId);
  if (part.error) return res.status(500).json({ error: part.error.message });
  const ids = (part.data || []).map(x => x.conversation_id);
  if (!ids.length) return res.json({ conversations: [] });

  const convos = await supabase
    .from("conversations")
    .select("id, listing_product_id, created_at")
    .in("id", ids)
    .order("created_at", { ascending: false });
  if (convos.error) return res.status(500).json({ error: convos.error.message });

  const participants = await supabase
    .from("conversation_participants")
    .select("conversation_id, user:users(id, fullname, email)")
    .in("conversation_id", ids);
  if (participants.error) return res.status(500).json({ error: participants.error.message });

  const messages = await supabase
    .from("messages")
    .select("conversation_id, message_text, created_at, sender_user_id")
    .in("conversation_id", ids)
    .order("created_at", { ascending: false });
  if (messages.error) return res.status(500).json({ error: messages.error.message });

  const participantsByConversation = {};
  (participants.data || []).forEach(row => {
    const key = String(row.conversation_id);
    if (!participantsByConversation[key]) participantsByConversation[key] = [];
    if (row.user) {
      participantsByConversation[key].push({
        id: Number(row.user.id),
        fullname: row.user.fullname || "",
        email: row.user.email || ""
      });
    }
  });

  const lastMessageByConversation = {};
  (messages.data || []).forEach(row => {
    const key = String(row.conversation_id);
    if (lastMessageByConversation[key]) return;
    lastMessageByConversation[key] = {
      text: row.message_text,
      created_at: row.created_at,
      sender_user_id: Number(row.sender_user_id)
    };
  });

  const payload = (convos.data || []).map(convo => ({
    id: Number(convo.id),
    listingProductId: convo.listing_product_id ? Number(convo.listing_product_id) : null,
    createdAt: convo.created_at,
    participants: participantsByConversation[String(convo.id)] || [],
    lastMessage: lastMessageByConversation[String(convo.id)] || null
  }));

  return res.json({ conversations: payload });
});

app.post("/api/conversations", async (req, res) => {
  const { listingProductId = null, participantUserIds = [] } = req.body || {};
  if (!Array.isArray(participantUserIds) || participantUserIds.length < 2) {
    return res.status(400).json({ error: "participantUserIds must contain at least 2 users." });
  }

  const existingId = await findExistingConversation(participantUserIds, listingProductId);
  if (existingId) {
    return res.json({ conversationId: Number(existingId), existing: true });
  }

  const convo = await supabase
    .from("conversations")
    .insert({ listing_product_id: listingProductId, created_at: nowIso() })
    .select("id")
    .single();
  if (convo.error) return res.status(500).json({ error: convo.error.message });
  const conversationId = convo.data.id;

  const participantRows = participantUserIds.map(userId => ({
    conversation_id: conversationId,
    user_id: Number(userId)
  }));
  const insertPart = await supabase.from("conversation_participants").insert(participantRows);
  if (insertPart.error) return res.status(500).json({ error: insertPart.error.message });

  return res.status(201).json({ conversationId: Number(conversationId) });
});

app.delete("/api/conversations/:conversationId", async (req, res) => {
  const conversationId = Number(req.params.conversationId);
  if (!conversationId) return res.status(400).json({ error: "Invalid conversation id." });

  const deleteMessages = await supabase.from("messages").delete().eq("conversation_id", conversationId);
  if (deleteMessages.error) return res.status(500).json({ error: deleteMessages.error.message });

  const deleteParticipants = await supabase.from("conversation_participants").delete().eq("conversation_id", conversationId);
  if (deleteParticipants.error) return res.status(500).json({ error: deleteParticipants.error.message });

  const deleteConversation = await supabase.from("conversations").delete().eq("id", conversationId);
  if (deleteConversation.error) return res.status(500).json({ error: deleteConversation.error.message });

  return res.json({ ok: true });
});

app.get("/api/conversations/:conversationId/messages", async (req, res) => {
  const conversationId = Number(req.params.conversationId);
  const rows = await supabase
    .from("messages")
    .select("id, message_text, created_at, sender_user_id, sender:users!messages_sender_user_id_fkey(fullname)")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });
  if (rows.error) return res.status(500).json({ error: rows.error.message });
  const messages = (rows.data || []).map(m => ({
    id: Number(m.id),
    message_text: m.message_text,
    created_at: m.created_at,
    sender_user_id: Number(m.sender_user_id),
    sender_name: m.sender?.fullname || ""
  }));
  return res.json({ messages });
});

app.post("/api/conversations/:conversationId/messages", async (req, res) => {
  const conversationId = Number(req.params.conversationId);
  const { senderUserId, text } = req.body || {};
  if (!senderUserId || !text?.trim()) {
    return res.status(400).json({ error: "senderUserId and text are required." });
  }
  const inserted = await supabase
    .from("messages")
    .insert({
      conversation_id: conversationId,
      sender_user_id: Number(senderUserId),
      message_text: text.trim(),
      created_at: nowIso()
    })
    .select("*")
    .single();
  if (inserted.error) return res.status(500).json({ error: inserted.error.message });
  return res.status(201).json({ message: inserted.data });
});

app.get("/api/admin/summary", async (_req, res) => {
  const [u, p, t] = await Promise.all([
    supabase.from("users").select("*", { head: true, count: "exact" }),
    supabase.from("products").select("*", { head: true, count: "exact" }),
    supabase.from("transactions").select("*", { head: true, count: "exact" })
  ]);
  if (u.error || p.error || t.error) {
    return res.status(500).json({ error: u.error?.message || p.error?.message || t.error?.message });
  }
  return res.json({
    totalUsers: u.count || 0,
    totalProducts: p.count || 0,
    totalTransactions: t.count || 0
  });
});

app.use((err, _req, res, _next) => {
  res.status(500).json({ error: err?.message || "Unexpected server error." });
});

const PORT = Number(process.env.PORT || 3000);

seedDefaultAdmin()
  .catch(() => {})
  .finally(() => {
    app.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`ESSU Marketplace API running on http://localhost:${PORT}`);
      // eslint-disable-next-line no-console
      console.log(`Supabase project: ${SUPABASE_URL}`);
      // eslint-disable-next-line no-console
      console.log(`Supabase bucket: ${SUPABASE_BUCKET}`);
    });
  });
