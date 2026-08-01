import { NextResponse } from "next/server";
import { currentAccount } from "@/lib/account";

export async function GET() {
  const account = await currentAccount();
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ token: account.publicToken });
}
