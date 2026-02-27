import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { fetchApi } from "../../../../../../lib/api";
import ProductForm from "../components/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ tenantSlug: string; productId: string }> }) {
  const { tenantSlug, productId } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("adminToken")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  let product = null;
  try {
    // We use the same fetchApi but now it should work since we updated the backend to handle ID or slug
    product = await fetchApi(`/tenants/${tenantSlug}/catalog/products/${productId}`, {
      adminToken: token,
    });
  } catch (e) {
    console.error("Failed to fetch product for editing", e);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="p-8">
      <ProductForm tenantSlug={tenantSlug} token={token} initialData={product} />
    </div>
  );
}
