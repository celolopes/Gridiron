import { fetchApi } from "../../../../../lib/api";
import { cookies } from "next/headers";
import SuppliersClient from "./SuppliersClient";
import { redirect } from "next/navigation";

async function getSuppliers(tenantSlug: string, token: string) {
  try {
    return (await fetchApi<any[]>(`/tenants/${tenantSlug}/suppliers`, { adminToken: token })) || [];
  } catch (e) {
    return [];
  }
}

export default async function SuppliersPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  const suppliers = await getSuppliers(tenantSlug, token);

  return <SuppliersClient initialSuppliers={suppliers} tenantSlug={tenantSlug} token={token} />;
}
