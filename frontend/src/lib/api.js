const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const apiGet = async (path) => {
  const res = await fetch(`${API}${path}`);
  return res.json();
};

export async function streamChat(agentId, message, onDelta, onDone, onError) {
  const res = await fetch(`${API}/agents/${agentId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });
  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n\n");
    buffer = lines.pop();
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const data = JSON.parse(line.slice(6));
      if (data.delta) onDelta(data.delta);
      else if (data.error) onError(data.error);
      else if (data.done) onDone();
    }
  }
}
