/**
 * Dispatcher
 */
class Dispatcher extends EventTarget {
  dispatch() {
    this.dispatchEvent(new CustomEvent("event"));
  }

  subscribe(subscriber) {
    this.addEventListener("event", subscriber);
  }
}

/**
 * Action Creator and Action Types
 */
const FETCH_TODO_ACTION_TYPE = "Fetch todo list from server";
export const createFetchTodoListAction = () => ({
  type: FETCH_TODO_ACTION_TYPE,
  payload: undefined,
});

const CREATE_TODO_ACTION_TYPE = "Create todo list from server";
export const createTodoAction = (todoName) => ({
  type: CREATE_TODO_ACTION_TYPE,
  payload: todoName,
});

const UPDATE_TODO_ACTION_TYPE = "Update todo from server"
export const updateTodoAction = (todo) => ({
  type: UPDATE_TODO_ACTION_TYPE,
  payload: todo,
})

const DELETE_TODO_ACTION_TYPE = "Delete todo from server"
export const deleteTodoAction = (todo) => ({
  type: DELETE_TODO_ACTION_TYPE,
  payload: todo,
})

const CLEAR_ERROR = "Clear error from state";
export const clearError = () => ({
  type: CLEAR_ERROR,
  payload: undefined,
});

/**
 * Store Creator
 */
const api = "http://localhost:3000/todo";

const defaultState = {
  todoList: [],
  error: null,
};

const headers = {
  "Content-Type": "application/json; charset=utf-8",
};

const reducer = async (prevState, { type, payload }) => {
  switch (type) {
    case FETCH_TODO_ACTION_TYPE: {
      try {
        const resp = await fetch(api).then((d) => d.json());
        return { todoList: resp.todoList, error: null };
      } catch (err) {
        return { ...prevState, error: err };
      }
    }
    case CREATE_TODO_ACTION_TYPE: {
      try {
        const body = JSON.stringify(payload)
        const resp = await fetch(api, { method: 'POST', body, headers }).then((d) => d.json());
        return { todoList: [...prevState.todoList, resp], error: null };
      } catch (err) {
        return { ...prevState, error: err };
      }
    }
    case UPDATE_TODO_ACTION_TYPE: {
      try {
        const { id, ...body } = payload;
        const resp = await fetch(`${api}/${id}`, { method: 'PATCH', headers , body: JSON.stringify(body)}).then((d) => d.json());
        const idx = prevState.todoList.findIndex((todo) => todo.id === resp.id);
        if (idx === -1) return prevState
        const nextTodoList = prevState.todoList.concat();
        nextTodoList[idx] = resp;
        return { todoList: nextTodoList, error: null };
      } catch (err) {
        return { ...prevState, error: err };
      }
    }
    case DELETE_TODO_ACTION_TYPE: {
      try {
        const id = payload;
        const resp = await fetch(`${api}/${id}`, { method: 'DELETE', headers})
        const idx = prevState.todoList.findIndex((todo) => todo.id == id);
        if (idx === -1) return prevState
        const nextTodoList = prevState.todoList.concat();
        nextTodoList.splice(idx, 1);
        return { todoList: nextTodoList, error: null };
      } catch (err) {
        return { ...prevState, error: err };
      }
    }
    case CLEAR_ERROR: {
      return { ...prevState, error: null };
    }
    default: {
      throw new Error("unexpected action type: %o", { type, payload });
    }
  }
};

export function createStore(initialState = defaultState) {
  const dispatcher = new Dispatcher();
  let state = initialState;

  const dispatch = async ({ type, payload }) => {
    console.group(type);
    console.log("prev", state);
    state = await reducer(state, { type, payload });
    console.log("next", state);
    console.groupEnd();
    dispatcher.dispatch();
  };

  const subscribe = (subscriber) => {
    dispatcher.subscribe(() => subscriber(state));
  };

  return {
    dispatch,
    subscribe,
  };
}
