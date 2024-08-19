import {
  InteractionResponseFlags,
  InteractionResponseType,
} from "discord-interactions";
import { JSONResponse } from "./index";
import { combineAfterResponseHooks } from "hono/ssg";

export const CAT_COMMAND = {
  name: "cat",
  description: "KITTY!",
  options: [
    {
      type: 3,
      name: "tag",
      description: "What kind of kitty you like?",
      autocomplete: true,
    },
    { type: 3, name: "text", description: "Make the cat say something!" },
    { type: 5, name: "gif", description: "Moving cat wooooo" },
  ],
};

export async function catCommand(
  interaction: any,
  availableTags: string[],
): Promise<Response | JSONResponse> {
  const tag = interaction.data.options?.find((opt: any) => opt.name === "tag")
    ?.value as string;
  const gif = interaction.data.options?.find((opt: any) => opt.name === "gif")
    ?.value as boolean;
  const text = interaction.data.options?.find((opt: any) => opt.name === "text")
    ?.value as string;

  if (!availableTags.includes(tag ?? "")) {
    return new JSONResponse({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content:
          "That's not an available tag, please try again with one of the suggested tags",
        flags: InteractionResponseFlags.EPHEMERAL,
      },
    });
  }

  let catImageURL: string;

  switch (true) {
    case tag && !gif && !text:
      catImageURL = `https://cataas.com/cat/${tag}`;
      break;

    case !tag && gif && !text:
      catImageURL = `https://cataas.com/cat/gif`;
      break;

    case !tag && !gif && !!text:
      catImageURL = `https://cataas.com/cat/says/${encodeURIComponent(text)}`;
      break;

    case tag && !gif && !!text:
      catImageURL = `https://cataas.com/cat/${tag}/says/${encodeURIComponent(text)}`;
      break;

    case !tag && gif && !!text:
      catImageURL = `https://cataas.com/cat/gif/says/${encodeURIComponent(text)}`;
      break;

    default:
      if (tag && gif) {
        return new JSONResponse({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `You can't use both "tag" and "gif" :(`,
            flags: InteractionResponseFlags.EPHEMERAL,
          },
        });
      }
      catImageURL = `https://cataas.com/cat`;
  }

  console.log(
    `
    server ID: ${interaction.guild_id},
    tag: ${tag},
    gif: ${gif},
    text: ${text},
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
    return new JSONResponse({
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
