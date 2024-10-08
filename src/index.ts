import {
	InteractionResponseType,
	InteractionType,
	verifyKey,
} from "discord-interactions";
import { Hono, HonoRequest } from "hono";
import { CAT_COMMAND, catCommand } from "./commands";

export class JSONResponse extends Response {
	constructor(body: any, init?: ResponseInit) {
		const jsonBody = JSON.stringify(body);
		init = init || {
			headers: {
				"content-type": "application/json",
			},
		};
		super(jsonBody, init);
	}
}

const router = new Hono();

router.get("/", (c) => {
	const { env } = c;
	return c.text(`Hello ${(env as any).DISCORD_APPLICATION_ID}`);
});

router.post("/", async (c) => {
	const { req, env } = c;

	const availableTags = (await fetch("https://cataas.com/api/tags").then((r) =>
		r.json(),
	)) as string[];

	const { isValid, interaction } = await server.verifyDiscordRequest(req, env);
	if (!isValid || !interaction) {
		return new Response("Bad request signature", { status: 401 });
	}

	if (interaction.type === InteractionType.PING) {
		return new JSONResponse({ type: InteractionResponseType.PONG });
	}

	if (interaction.type === InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE) {
		const focusedOption = interaction.data.options.find(
			(opt: any) => opt.focused === true,
		)?.value as string;

		const filtered = availableTags.filter(
			(choice) =>
				choice && choice.toLowerCase().startsWith(focusedOption.toLowerCase()),
		);

		return new JSONResponse({
			type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
			data: {
				choices: filtered
					.slice(0, 25)
					.map((choice) => ({ name: choice, value: choice })),
			},
		});
	}

	if (interaction.type === InteractionType.APPLICATION_COMMAND) {
		if (
			interaction.data.name.toLowerCase() !== CAT_COMMAND.name.toLowerCase()
		) {
			return new JSONResponse({ error: "Unknown type" }, { status: 400 });
		}

		return await catCommand(interaction, availableTags);
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
