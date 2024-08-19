import { CAT_COMMAND } from "./commands";

const token = Bun.env.DISCORD_TOKEN;
const applicationId = Bun.env.DISCORD_APPLICATION_ID;

if (!token) {
  throw new Error("Discord token not found");
}
if (!applicationId) {
  throw new Error("Application ID not found");
}

async function registerCommands(url: string) {
  const response = await fetch(url, {
    headers: {
      "content-type": "application/json",
      authorization: `Bot ${token}`,
    },
    method: "PUT",
    body: JSON.stringify([CAT_COMMAND]),
  });

  if (response.ok) {
    console.log("Registered all commands!");
  } else {
    console.error("Error registering commands");
    console.error(await response.text());
  }

  return response;
}

await registerCommands(
  `https://discord.com/api/v10/applications/${applicationId}/commands`,
);
