import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import { CAT_COMMAND, catCommand } from "./commands";

type Env = {
  DISCORD_PUBLIC_KEY: string;
};

async function verifyDiscordRequest(request: Request, env: Env) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const body = await request.text();
  const isValidRequest =
    signature &&
    timestamp &&
    (await verifyKey(body, signature, timestamp, env.DISCORD_PUBLIC_KEY));

  if (!isValidRequest) return { isValid: false };

  console.log("Verification request body: ", body);
  return {
    interaction: JSON.parse(body),
    isValid: true,
  };
}

export default {
  async fetch(req: Request, env: Env) {
    const { isValid, interaction } = await verifyDiscordRequest(req, env);
    if (!isValid || !interaction) {
      return new Response("Bad request signature", { status: 401 });
    }

    if (interaction.type === InteractionType.PING) {
      return Response.json({ type: InteractionResponseType.PONG });
    }

    if (interaction.type === InteractionType.APPLICATION_COMMAND) {
      if (
        interaction.data.name.toLowerCase() !== CAT_COMMAND.name.toLowerCase()
      ) {
        return Response.json({ error: "Unknown type" }, { status: 400 });
      }

      return catCommand(interaction);
    }

    return new Response("Not found", { status: 404 });
  },
};
