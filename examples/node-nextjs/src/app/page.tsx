export default async function Home({ searchParams }: any) {
  const n = searchParams?.n || 1;
  const url = `${process.env.API_URL}/fibonacci/${n}`;
  console.log({ url });
  const res = await fetch(url).then((res) => res.json());
  return (
    <h1>
      Fibonacci of {n} is {res.value}
    </h1>
  );
}
