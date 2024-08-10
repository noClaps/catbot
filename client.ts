import { Client, Events, GatewayIntentBits, Collection } from "discord.js";
import cat from "./cat.ts";

interface ClientWithCommands extends Client {
  commands: Collection<string, any> | undefined;
}

const token = Bun.env.DISCORD_TOKEN;
if (!token) throw new Error("Discord token not found!");

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
}) as ClientWithCommands;

client.commands = new Collection();
client.commands.set(cat.data.name, cat);

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isAutocomplete()) {
    const command = (interaction.client as ClientWithCommands).commands?.get(
      interaction.commandName,
    );
    if (!command) {
      throw new Error(
        `No command matching ${interaction.commandName} was found.`,
      );
    }
    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(error);
    }
  }

  if (interaction.isChatInputCommand()) {
    const command = (interaction.client as ClientWithCommands).commands?.get(
      interaction.commandName,
    );

    if (!command) {
      throw new Error(
        `No command matching ${interaction.commandName} was found.`,
      );
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({
        content: "There was an error while executing this command!",
        ephemeral: true,
      });
    }
  }
});

client.login(token);
