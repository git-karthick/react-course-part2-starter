import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { Todo } from "./hooks/useTodos";
import axios from "axios";
interface AddTodoContext {
  previousTodos: Todo[];
}

const TodoForm = () => {
  const queryClient = useQueryClient();
  const addTodo = useMutation<Todo, Error, Todo, AddTodoContext>({
    mutationFn: (todo: Todo) =>
      axios
        .post("https://jsonplaceholder.typicode.com/todosx", todo)
        .then((res) => res.data),

    onMutate: (newTodo: Todo) => {
      const previousTodos = queryClient.getQueryData<Todo[]>(["todos"]) || [];
      queryClient.setQueriesData<Todo[]>(["todos"], (todos) => [
        newTodo,
        ...(todos || []),
      ]);
      return { previousTodos };
    },
    onSuccess: (savedTodo, newTodo) => {
      //Approach 1: Invalidating the  cache
      // queryClient.invalidateQueries({
      //   queryKey:['todos']
      // })

      //Approach 2: Updating the data in cache
      queryClient.setQueriesData<Todo[]>(["todos"], (todos) =>
        todos?.map((todo) => (todo === newTodo ? savedTodo : todo))
      );
      if (ref.current) ref.current.value = "";
    },
    onError: (error, newTodo, context) => {
      if (!context) return;

      queryClient.setQueriesData<Todo[]>(["todos"], context.previousTodos);
    },
  });
  const ref = useRef<HTMLInputElement>(null);

  return (
    <>
      {addTodo.error && (
        <div className="alert alert-danger">{addTodo.error.message}</div>
      )}
      <form
        className="row mb-3"
        onSubmit={(event) => {
          event.preventDefault();

          if (ref.current && ref.current.value)
            addTodo.mutate({
              id: 0,
              title: ref.current?.value,
              completed: false,
              userId: 1,
            });
        }}
      >
        <div className="col">
          <input ref={ref} type="text" className="form-control" />
        </div>
        <div className="col">
          <button className="btn btn-primary">Add</button>
        </div>
      </form>
    </>
  );
};

export default TodoForm;
