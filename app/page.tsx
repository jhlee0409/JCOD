import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";

import { revalidatePath } from "next/cache";
import Form from "@/components/Form";

async function getData() {
  const supabase = createClient();
  const { data } = await supabase
    .from("list")
    .select("title, content, created_at, id");

  return data ?? [];
}

export default async function Index() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const data = await getData();

  const canInitSupabaseClient = () => {
    try {
      createClient();
      return true;
    } catch (e) {
      return false;
    }
  };

  const isSupabaseConnected = canInitSupabaseClient();

  const handleSubmit = async (formData: FormData) => {
    "use server";

    const supabase = createClient();
    const data = {
      title: formData.get("title"),
      content: formData.get("title"),
    };

    if (!data.content || !data.title) {
      return false;
    }
    const res = await supabase.from("list").insert(data);
    if (res.error) {
      console.log(`[${res.status}] ${res.error.code} ${res.error.message}`);
      return false;
    }
    revalidatePath("/");
    return true;
  };

  return (
    <div className="flex-1 w-full flex flex-col gap-20 items-center">
      <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
        <div className="w-full max-w-4xl flex justify-between items-center p-3 text-sm">
          <div />
          {isSupabaseConnected && <AuthButton />}
        </div>
      </nav>
      {!!user ? (
        <div className="animate-in flex-1 flex flex-col gap-20 opacity-0 max-w-4xl px-3">
          <main className="flex-1 flex flex-col gap-6">
            <Form onSubmit={handleSubmit} />
            <div>
              {data.map((item) => (
                <div key={item.id}>{item.title}</div>
              ))}
            </div>
          </main>
        </div>
      ) : (
        <div>
          <p className="text-3xl">Welcome to the JCOD world</p>
          <div className="flex flex-col gap-1 items-center pt-10">
            <p>If you want to do something in the world</p>
            <p>Let's login to the world</p>
          </div>
        </div>
      )}
    </div>
  );
}
