import Layout from "components/layout";
import useSWR from "swr";
import styles from "../../styles/result.module.css";
import { useRouter } from "next/router";
import { findUniqueUser } from "services/userEndPoints";
import { useAppContext } from "components/statewrapper";
import { useEffect, useState } from "react";
import { updateStock } from "services/productEndPoints";
import Link from "next/link";
import { postSale } from "services/saleEndPoints";
import { createDetailSale } from "services/DetailSaleendPoints";
import { useSession } from "next-auth/react";
import NotFound from "components/notFound";
import PaymentSuccessful from "components/paymentSuccessful";

async function sale(cart: any[], user: any): Promise<string | undefined> {
  let itemsArr: any;

  if (cart) {
    itemsArr = Array.from(cart.values());
  }

  let sum = 0;
  if (itemsArr && itemsArr.length) {
    if (typeof user === "string") {
      itemsArr.map((el: any) => {
        sum += el.price * el.qty;
      });
    }
  }

  if (sum > 0) {
    const created = await postSale({
      total: sum,
      date: new Date().toISOString(),
      userId: user,
      state: "SUCCESSFUL",
    });
    return saleDetail(itemsArr, created.id);
  }
}

async function saleDetail(itemsArr: any, idSale: any) {
  itemsArr.map(async (product: any) => {
    const stocked = product.stock - product.qty;
    await updateStock(product.id, stocked);
    await createDetailSale({
      amount: product.qty,
      price: product.price,
      idProduct: product.id,
      saleId: idSale,
    });
  });
  return "do it";
}

export default function Result() {
  const router = useRouter();
  const [role, setRole] = useState();
  const [user, setUser] = useState();
  const [cart, setCart]: any = useState();
  const { data: session } = useSession();
  const email = session?.user?.email as string;
  const products = useAppContext();

  useEffect(() => {
    (async () => {
      const res = await findUniqueUser(email);
      if (res) {
        setRole(res.role);
        setUser(res.id);
      }
      setCart(products.getCart());
    })();
  }, [email]);

  const { data, error } = useSWR(
    router.query.session_id
      ? `/api/checkout_sessions/${router.query.session_id}`
      : null,
    (url) => fetch(url).then((res) => res.json())
  );

  useEffect(() => {
    (async () => {
      const res = await sale(cart, user);
      if (res) {
        products.resetCart();
      }
    })();
  }, [cart]);

  return (
    <Layout>
      <div className={styles.container}>
        {data !== null ? <PaymentSuccessful /> : <NotFound button={true} />}
      </div>
    </Layout>
  );
}
