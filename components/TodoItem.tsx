'use client';

import { Todo } from "@/types/todo";
import { toggleTodoStatus, deleteTodo } from "@/app/actions";

interface TodoItemProps {
  todo: Todo;
}

const TodoItem = ({ todo }: TodoItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-md">
      <span className={todo.completed ? "line-through text-gray-500" : ""}>
        {todo.title}
      </span>
      <div className="flex gap-2">
        <button 
          className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          onClick={() => toggleTodoStatus(todo.id, todo.completed)}
        >
          {todo.completed ? "미완료" : "완료"}
        </button>
        <button 
          className="px-3 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          onClick={() => deleteTodo(todo.id)}
        >
          삭제
        </button>
      </div>
    </div>
  );
};

export default TodoItem;