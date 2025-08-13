"use client";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import store, { persistor } from "@/store/store";
import { PersistGate } from "redux-persist/integration/react";

export default function ClientProviders({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
      <ToastContainer />
      {children}
      </PersistGate>
    </Provider>
  );
}
