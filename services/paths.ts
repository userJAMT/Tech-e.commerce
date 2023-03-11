export async function getProducts() {
  const request = await fetch(
    "https://api-products-pf-production.up.railway.app/products"
  );
  const products = await request.json();

  return products;
}
