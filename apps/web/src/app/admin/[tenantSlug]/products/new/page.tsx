import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import ProductForm from "../components/ProductForm";

export default async function NewProductPage({ params }: { params: Promise<{ tenantSlug: string }> }) {
  const { tenantSlug } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  return (
    <div className="p-8">
      <ProductForm tenantSlug={tenantSlug} token={token} />
    </div>
  );
}
