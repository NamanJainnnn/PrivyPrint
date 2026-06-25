import { NextResponse } from "next/server";
import { db } from "../../../lib/firebase";
import { collection, query, where, getDocs, deleteDoc, doc } from "firebase/firestore";
import { supabase } from "../../../lib/supabase";

export async function GET(request) {
  // Verify it's coming from Vercel Cron
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date().toISOString();

    // Find all expired pending jobs
    const q = query(
      collection(db, "printJobs"),
      where("status", "==", "pending"),
      where("expiresAt", "<=", now)
    );

    const snap = await getDocs(q);
    const expired = snap.docs;

    if (expired.length === 0) {
      return NextResponse.json({ message: "No expired jobs", deleted: 0 });
    }

    // Delete each file from Supabase + Firestore
    const deletions = expired.map(async (d) => {
      const job = d.data();
      await supabase.storage.from("print-docs").remove([job.fileName]);
      await deleteDoc(doc(db, "printJobs", d.id));
    });

    await Promise.all(deletions);

    return NextResponse.json({ message: "Cleanup done", deleted: expired.length });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}