import AuthButton from "../components/AuthButton";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import Form from "@/components/Form";
import { Todo } from "@/types/todo";
import TodoItem from "@/components/TodoItem";
import { addTodo } from "./actions";

async function getTodos() {
  const supabase = createClient();
  const { data } = await supabase
    .from("todos")
    .select("*")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export default async function Index() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const todos = await getTodos();

  const canInitSupabaseClient = () => {
    try {
      createClient();
      return true;
    } catch (e) {
      return false;
    }
  };

  const isSupabaseConnected = canInitSupabaseClient();

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
            <h1 className="text-3xl font-bold">Todo 앱</h1>
            <Form onSubmit={addTodo} />
            <div className="flex flex-col gap-4">
              {todos.map((todo: Todo) => (
                <TodoItem key={todo.id} todo={todo} />
              ))}
            </div>
          </main>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-3xl font-bold">Todo 앱</h1>
          <p>로그인하여 Todo 앱을 사용해보세요.</p>
        </div>
      )}
    </div>
  );
}
