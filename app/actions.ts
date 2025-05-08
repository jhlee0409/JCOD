'use server';

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

export async function addTodo(formData: FormData) {
  const supabase = createClient();
  const data = {
    title: formData.get("title") as string,
    completed: false,
  };

  if (!data.title) {
    return false;
  }
  
  const res = await supabase.from("todos").insert(data);
  if (res.error) {
    console.log(`[${res.status}] ${res.error.code} ${res.error.message}`);
    return false;
  }
  
  revalidatePath("/");
  return true;
}

export async function toggleTodoStatus(id: string, completed: boolean) {
  const supabase = createClient();
  const res = await supabase
    .from("todos")
    .update({ completed: !completed, updated_at: new Date().toISOString() })
    .eq("id", id);
    
  if (res.error) {
    console.log(`[${res.status}] ${res.error.code} ${res.error.message}`);
    return false;
  }
  
  revalidatePath("/");
  return true;
}

export async function deleteTodo(id: string) {
  const supabase = createClient();
  const res = await supabase.from("todos").delete().eq("id", id);
  
  if (res.error) {
    console.log(`[${res.status}] ${res.error.code} ${res.error.message}`);
    return false;
  }
  
  revalidatePath("/");
  return true;
}