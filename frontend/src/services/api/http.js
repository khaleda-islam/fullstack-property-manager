
const SERVER_URL = import.meta.env.VITE_SERVER_URL || "";

const http = async (path, token, options = {}) => {
  const res = await fetch(`${SERVER_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export default http;
