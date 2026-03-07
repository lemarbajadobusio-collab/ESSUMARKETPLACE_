require("dotenv").config();

const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY =
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) are required.");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
});

const APPLY = process.argv.includes("--apply");

function keyFromParticipants(rows) {
  const ids = Array.from(new Set((rows || []).map(r => Number(r.user_id)).filter(Boolean))).sort((a, b) => a - b);
  return ids.join(":");
}

async function run() {
  const convosRes = await supabase
    .from("conversations")
    .select("id, listing_product_id, created_at")
    .order("created_at", { ascending: true });
  if (convosRes.error) throw convosRes.error;
  const conversations = convosRes.data || [];

  const partsRes = await supabase
    .from("conversation_participants")
    .select("conversation_id, user_id");
  if (partsRes.error) throw partsRes.error;
  const participants = partsRes.data || [];

  const byConversation = {};
  participants.forEach(row => {
    const cId = Number(row.conversation_id);
    if (!byConversation[cId]) byConversation[cId] = [];
    byConversation[cId].push(row);
  });

  const grouped = {};
  conversations.forEach(convo => {
    const cId = Number(convo.id);
    const pRows = byConversation[cId] || [];
    const key = keyFromParticipants(pRows);
    if (!key) return;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(convo);
  });

  const mergePlans = [];
  Object.keys(grouped).forEach(key => {
    const list = grouped[key];
    if (list.length < 2) return;
    const sorted = list
      .slice()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const keep = sorted[0];
    const duplicates = sorted.slice(1);
    const listingIds = new Set(sorted.map(x => Number(x.listing_product_id || 0)).filter(Boolean));
    mergePlans.push({
      key,
      keepId: Number(keep.id),
      duplicateIds: duplicates.map(x => Number(x.id)),
      participantUserIds: key.split(":").map(x => Number(x)).filter(Boolean),
      shouldClearListingProductId: listingIds.size > 1
    });
  });

  if (!mergePlans.length) {
    console.log("No duplicate conversations found.");
    return;
  }

  const totalDuplicateConversations = mergePlans.reduce((sum, p) => sum + p.duplicateIds.length, 0);
  console.log(`Found ${mergePlans.length} participant groups with duplicates.`);
  console.log(`Duplicate conversations to merge: ${totalDuplicateConversations}`);

  if (!APPLY) {
    console.log("Dry run only. Re-run with --apply to execute merge.");
    mergePlans.slice(0, 10).forEach(plan => {
      console.log(`keep=${plan.keepId}, merge=${plan.duplicateIds.join(",")} participants=${plan.key}`);
    });
    return;
  }

  for (const plan of mergePlans) {
    if (!plan.duplicateIds.length) continue;

    const moved = await supabase
      .from("messages")
      .update({ conversation_id: plan.keepId })
      .in("conversation_id", plan.duplicateIds);
    if (moved.error) throw moved.error;

    const deleteParts = await supabase
      .from("conversation_participants")
      .delete()
      .in("conversation_id", plan.duplicateIds);
    if (deleteParts.error) throw deleteParts.error;

    const keepPartsRes = await supabase
      .from("conversation_participants")
      .select("user_id")
      .eq("conversation_id", plan.keepId);
    if (keepPartsRes.error) throw keepPartsRes.error;
    const keepUsers = new Set((keepPartsRes.data || []).map(r => Number(r.user_id)));
    const missingUsers = plan.participantUserIds.filter(u => !keepUsers.has(u));
    if (missingUsers.length) {
      const insertParts = await supabase
        .from("conversation_participants")
        .insert(missingUsers.map(userId => ({ conversation_id: plan.keepId, user_id: userId })));
      if (insertParts.error) throw insertParts.error;
    }

    if (plan.shouldClearListingProductId) {
      const clearListingId = await supabase
        .from("conversations")
        .update({ listing_product_id: null })
        .eq("id", plan.keepId);
      if (clearListingId.error) throw clearListingId.error;
    }

    const deleteConvos = await supabase
      .from("conversations")
      .delete()
      .in("id", plan.duplicateIds);
    if (deleteConvos.error) throw deleteConvos.error;
  }

  console.log("Merge completed successfully.");
}

run().catch(error => {
  console.error("Merge failed:", error.message || error);
  process.exitCode = 1;
});
