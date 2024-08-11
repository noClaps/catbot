import { REST, Routes } from "discord.js";
import cat from "./cat.ts";

const token = Bun.env.DISCORD_TOKEN;
if (!token) throw new Error("Discord token not found");

const commands = [cat.data.toJSON()];
const rest = new REST().setToken(token);

try {
  console.log(
    `Started refreshing ${commands.length} application (/) commands.`,
  );

  const clientId = Bun.env.CLIENT_ID;
  if (!clientId) throw new Error("Client ID not found");

  const data = (await rest.put(Routes.applicationCommands(clientId), {
    body: commands,
  })) as { length: number };

  console.log(`Successfully reloaded ${data.length} application (/) commands.`);
} catch (error) {
  console.error(error);
}
