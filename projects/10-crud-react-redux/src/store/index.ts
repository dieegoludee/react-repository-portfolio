import { configureStore, type Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";
import usersReducer, { UserWithId, rollbackUser } from "./users/slice";

const persistanceLocalStorageMiddleware: Middleware =
	(store) => (next) => (action) => {
		next(action);
		localStorage.setItem("__redux__state__", JSON.stringify(store.getState()));
	};

const syncWithDatabase: Middleware = (store) => (next) => (action) => {
	const { type, payload } = action;
	const previousState = store.getState();

	next(action);

	if (type === "users/deleteUserById") {
		const userIdToRemove = payload;
		// <- eliminado un usuario
		const userToRemove = previousState.users.find(
			(user: UserWithId) => user.id === payload,
		);

		fetch(`https://jsonplaceholder.typicode.com/users/${payload}`, {
			method: "DELETE",
		})
			.then((res) => {
				if (res.ok) {
					toast.success(`Usuario ${payload} eliminado correctamente`);
				}
				throw new Error("Error al eliminar el usuario");
			})
			.catch((error) => {
				toast.error(`Error deleting user ${userIdToRemove}`);
				if (userToRemove) store.dispatch(rollbackUser(userToRemove));
				console.log(error);
			});
	}

	// fase 2
	console.log(store.getState());
};

export const store = configureStore({
	reducer: {
		users: usersReducer,
	},
	middleware: [persistanceLocalStorageMiddleware, syncWithDatabase],
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
