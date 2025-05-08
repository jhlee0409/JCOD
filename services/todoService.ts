import { createClient } from '@/utils/supabase/client';
import { Todo, TodoInsert } from '@/types/todo';

const supabase = createClient();

export const todoService = {
  /**
   * Todo 목록을 가져옵니다.
   */
  async getTodos(): Promise<Todo[]> {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Todo 목록 조회 실패:', error);
      return [];
    }

    return data as Todo[];
  },

  /**
   * 새로운 Todo를 생성합니다.
   */
  async createTodo(todo: TodoInsert): Promise<Todo | null> {
    const { data, error } = await supabase
      .from('todos')
      .insert(todo)
      .select()
      .single();

    if (error) {
      console.error('Todo 생성 실패:', error);
      return null;
    }

    return data as Todo;
  },

  /**
   * Todo의 완료 상태를 토글합니다.
   */
  async toggleTodoStatus(id: string, completed: boolean): Promise<boolean> {
    const { error } = await supabase
      .from('todos')
      .update({ completed, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Todo 상태 변경 실패:', error);
      return false;
    }

    return true;
  },

  /**
   * Todo를 삭제합니다.
   */
  async deleteTodo(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Todo 삭제 실패:', error);
      return false;
    }

    return true;
  }
};