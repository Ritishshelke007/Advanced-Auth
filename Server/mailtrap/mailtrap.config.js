import { MailtrapClient } from "mailtrap";

const TOKEN = "69b16157d01c6fb9d5fb76c63649d0fc";
const ENDPOINT = "https://send.api.mailtrap.io/";

export const mailtrapClient = new MailtrapClient({
  endpoint: ENDPOINT,
  token: TOKEN,
});

export const sender = {
  email: "mailtrap@demomailtrap.com",
  name: "noreply verification",
};
