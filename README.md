# Catbot

A Discord bot to generate images of cats. The bot is powered by the [CATAAS (Cat as a service) API](https://cataas.com).

## Installation instructions

1. Clone the repository.

   ```sh
   git clone https://github.com/noClaps/catbot.git
   cd catbot/
   ```

2. Create an application in the [Discord developer portal](https://discord.com/developers/applications). Rename `.env.example` to `.env.`, copy the application token and application ID from the developer portal, and paste them into `.env`. **Make sure you do not share this file publicly**.

3. Install dependencies, and start the bot.

   ```sh
   bun install
   bun start
   ```

4. Install the bot to your server using the install link in the developer portal, and type `/cat` to get started!

## Bot commands

```
/cat [tag: string] [gif: boolean] [text: string]
```

### `tag`

A tag to describe the kind of cat you'd like. There is a list of tags available [here](https://cataas.com/api/tags), and the command will provide autocompletion for tags as you type them.

Incompatible with `gif`.

### `gif`

A boolean (True/False) value for whether the returned image should be a GIF or not. There are only 2 accepted values for this: `True` and `False`.

Incompatible with `tag`.

### `text`

Adds text to the image. There is currently no way to customise the font size and color. For some reason, some strings aren't compatible with the API, so if you've input text and you're getting a blank block instead of an image, that may be why it's happening.
