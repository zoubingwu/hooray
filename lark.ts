export function makeLarkSender(url: string) {
  return (message?: string) => {
    if (!message) return;

    return fetch(url, {
      method: "POST",
      body: JSON.stringify({
        msg_type: "interactive",
        card: {
          config: {
            wide_screen_mode: true,
          },
          elements: [
            {
              tag: "markdown",
              content: message,
            },
          ],
        },
      }),
    });
  };
}
