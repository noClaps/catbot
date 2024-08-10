// TODO: Add figure out GIF functionality

import {
  AttachmentBuilder,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

const availableTags = (await fetch("https://cataas.com/api/tags").then((r) =>
  r.json(),
)) as string[];

export default {
  data: new SlashCommandBuilder()
    .setName("cat")
    .setDescription("KITTY!")
    .addStringOption((option) =>
      option
        .setName("tag")
        .setDescription("What kind of kitty you like?")
        .setRequired(false)
        .setAutocomplete(true),
    )
    .addStringOption((option) =>
      option
        .setName("text")
        .setDescription("Make the cat say something!")
        .setRequired(false),
    ),

  async autocomplete(interaction: AutocompleteInteraction) {
    const focusedOption = interaction.options.getFocused();

    const filtered = availableTags.filter(
      (choice) =>
        choice && choice.toLowerCase().startsWith(focusedOption.toLowerCase()),
    );

    await interaction.respond(
      filtered.slice(0, 25).map((choice) => ({ name: choice, value: choice })),
    );
  },

  async execute(interaction: ChatInputCommandInteraction) {
    const tag = interaction.options.getString("tag");
    const text = interaction.options.getString("text");

    if (!availableTags.includes(tag ?? "")) {
      await interaction.reply({
        content:
          "That's not an available tag, please try again with one of the suggested tags",
        ephemeral: true,
      });
      return;
    }

    let catImageURL: string;

    switch (true) {
      case tag && !text:
        catImageURL = `https://cataas.com/cat/${tag}`;
        break;

      case !tag && !!text:
        catImageURL = `https://cataas.com/cat/says/${encodeURIComponent(text)}`;
        break;

      case tag && !!text:
        catImageURL = `https://cataas.com/cat/${tag}/says/${encodeURIComponent(text)}`;
        break;

      default:
        catImageURL = `https://cataas.com/cat`;
    }

    console.log(tag, text, catImageURL);

    const response = await fetch(catImageURL);
    const fileType = response.headers.get("Content-Type")?.split("/")[1];
    const catImage = Buffer.from(await response.arrayBuffer());

    const file = new AttachmentBuilder(catImage, {
      name: `cat-image.${fileType}`,
    });
    const embed = new EmbedBuilder().setImage(
      `attachment://cat-image.${fileType}`,
    );
    await interaction.reply({ embeds: [embed], files: [file] });
  },
};
