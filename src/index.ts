import {
  InteractionResponseType,
  InteractionType,
  verifyKey,
} from "discord-interactions";
import { Hono, HonoRequest } from "hono";
import { CAT_COMMAND, catCommand } from "./commands";

const router = new Hono();

router.get("/", (c) => {
  return c.html(
    `<a href="https://discord.com/oauth2/authorize?client_id=1271901024910839959">Install CatBot</a>`,
  );
});

router.post("/", async (c) => {
  const { req, env } = c;

  const { isValid, interaction } = await server.verifyDiscordRequest(req, env);
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

    return await catCommand(interaction);
  }
});

async function verifyDiscordRequest(request: HonoRequest, env: any) {
  const signature = request.header("x-signature-ed25519");
  const timestamp = request.header("x-signature-timestamp");
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

const server = {
  verifyDiscordRequest,
  fetch: router.fetch,
};

export default server;
