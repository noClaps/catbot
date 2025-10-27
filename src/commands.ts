import {
  InteractionResponseFlags,
  InteractionResponseType,
} from "discord-interactions";

export const CAT_COMMAND = {
  name: "cat",
  description: "KITTY!",
};

export async function catCommand(interaction: any): Promise<Response> {
  let catImageURL = "https://cataas.com/cat";

  console.log(
    `
    server ID: ${interaction.guild_id},
    image URL: ${catImageURL}
    `,
  );

  console.log("Making request to cataas.com");

  const response = await fetch(catImageURL)
    .then((r) => r)
    .catch((err) => console.error(err));
  console.log("Request to cataas.com complete");

  if (!response || !response.ok) {
    console.log("Request to cataas.com failed");
    return Response.json({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: `Something went wrong, please try again later :(`,
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  console.log("Request to cataas.com succeeded");

  const fileType = response.headers.get("content-type");
  if (!fileType) throw new Error("File type not found");
  console.log("File type:", fileType);

  const filename = `cat-image.${fileType?.split("/")[1]}`;
  console.log("Filename:", filename);

  const file = new File([await response.arrayBuffer()], filename, {
    type: fileType,
  });
  console.log("Image downloaded");
  const json = {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: "",
      embeds: [
        {
          image: {
            url: `attachment://${file.name}`,
          },
        },
      ],
      attachments: [
        {
          id: 0,
          description: "cat image",
          filename: file.name,
        },
      ],
    },
  };

  const formData = new FormData();
  formData.append("payload_json", JSON.stringify(json));
  formData.append("files[0]", file);

  console.log("Form created");

  return new Response(formData);
}
