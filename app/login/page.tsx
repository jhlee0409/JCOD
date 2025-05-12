import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Login from "@/components/Login";

type SearchParams = Promise<{
  message: string;
}>;

export default async function LoginPage(props: { searchParams: SearchParams }) {
  const { message } = await props.searchParams;
  const signIn = async (formData: FormData) => {
    "use server";

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return redirect("/login?message=Could not authenticate user");
    }
    console.log(error);

    return redirect("/");
  };

  return <Login signIn={signIn} message={message} />;
}
