import { NextResponse } from "next/server";

import { createContactMessage } from "@/lib/admin-db";

export async function POST(request: Request) {
  const formData = await request.formData();
  const name = formValue(formData, "name");
  const email = formValue(formData, "email");
  const message = formValue(formData, "message");

  if (name && email) {
    createContactMessage({ email, message, name });
  }

  const url = new URL("/lien-he", request.url);

  url.searchParams.set("sent", name && email ? "1" : "0");

  return NextResponse.redirect(url, { status: 303 });
}

function formValue(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}
