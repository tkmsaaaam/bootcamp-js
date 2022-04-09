import store from '../store.js';
import { createTodoAction } from '../flux/index.js';

class TodoForm {
  constructor() {
    this.button = document.querySelector(".todo-form__submit");
    this.form = document.querySelector(".todo-form__input");
  }

  mount() {
    if (!this.form.value) {
      this.button.addEventListener('click', (event) => {
        event.preventDefault();
        store.dispatch(createTodoAction({ name: this.form.value }));
      })
    }
    // TODO:
    // ここに 作成ボタンが押されたら todo を作成するような処理を追記する
  }
}

export default TodoForm;
