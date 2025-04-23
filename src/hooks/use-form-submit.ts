// useFormSubmit.ts
import { useCallback } from "react";

interface SubmitOptions {
  endpoint: string;
  method?: string;
  headers?: Record<string, string>;
  onSuccess?: (response: any) => void;
  onError?: (error: any) => void;
  validate?: (data: any) => boolean;
}

export function useFormSubmit() {
  const submitForm = useCallback(
    async (data: any, options: SubmitOptions) => {
      const { endpoint, method = "POST", headers = {}, onSuccess, onError, validate } = options;

      try {
        if (validate && !validate(data)) {
          console.warn("Validation failed");
          return;
        }

        const url = endpoint.replace(/:([a-zA-Z0-9_]+)/g, (_, key) => data[key] || "");

        const res = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
            ...headers
          },
          body: JSON.stringify(data)
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        onSuccess?.(json);
      } catch (err) {
        console.error("Form submit error", err);
        onError?.(err);
      }
    },
    []
  );

  return { submitForm };
}
