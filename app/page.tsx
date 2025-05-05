import { createClient } from "@/utils/supabase/client";
import RootLayout from "./layout";

export default async function Home() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("states")
    .select("*");
  
  if (error) {
    console.error("Error fetching data:", error);
    return <div>Error fetching data</div>;
  }

  return (
    <RootLayout>
      <h1>Supabase Data</h1>
      {data && data.length > 0 ? (
        <ul>
          {data.map((item) => (
            <li key={item.id}>
              {item.id} - {item.name}
            </li>
          ))}
        </ul>
      ) : (
        <p>No data found</p>
      )}
    </RootLayout>
  );
}
