import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { Bot, session } from "grammy";
import type { Context, SessionFlavor } from "grammy";
import * as OTPAuth from "otpauth";
import * as qrcode from "qrcode";
import { config } from "@dotenvx/dotenvx";
import { Buffer } from "buffer";
import { InputFile } from "grammy";


config({ path: ".env.local" });

// 2. Extend the bot context to include session
type BotContext = Context & SessionFlavor<SessionData>;

// 3. Use the custom context when creating the bot
const bot = new Bot<BotContext>(process.env.BOT_TOKEN!);
bot.use(session({ initial: (): SessionData => ({ accounts: [] }) }))

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

// /start
bot.command("start", async (ctx: Context) => {
  await ctx.reply(
    "Welcome to KeyMeBaby! Use /add to add your TOTP secret.\n\nFormat:\n/add label secret\nor\n/add otpauth://..."
  );
});

// /add command
bot.command("add", async (ctx) => {
  const input = ctx.message?.text?.split(" ").slice(1).join(" ")
  if (!input) return ctx.reply("Usage: /add label secret OR otpauth://...")

  let account: Account

  if (input.startsWith("otpauth://")) {
    try {
      const totp = OTPAuth.URI.parse(input) as OTPAuth.TOTP
      account = {
        label: totp.label,
        issuer: totp.issuer ?? "Unknown",
        secret: totp.secret.base32,
        uri: input,
      }
    } catch {
      return ctx.reply("Invalid otpauth URI.")
    }
  } else {
    const [label, secret] = input.split(" ")
    if (!label || !secret)
      return ctx.reply("Invalid format. Use /add label secret")
    const totp = new OTPAuth.TOTP({
      issuer: "KeyMeBaby",
      label,
      secret: OTPAuth.Secret.fromBase32(secret),
    })
    account = {
      label,
      issuer: "KeyMeBaby",
      secret,
      uri: totp.toString(),
    }
  }

  ctx.session.accounts.push(account)
  await ctx.reply(`✅ Added account: ${account.label}`);
})

// /list
bot.command("list", async (ctx) => {
  const accounts = ctx.session.accounts;
  if (accounts.length === 0) return ctx.reply("No accounts added.");

  const list = accounts
    .map((a: Account, i: number) => `${i + 1}. ${a.label} (${a.issuer})`)
    .join("\n");

  await ctx.reply(`${"Your accounts:"}
${list}`);
});

// /code
bot.command("code", async (ctx) => {
  const accounts = ctx.session.accounts;
  if (accounts.length === 0) return ctx.reply("No accounts available.");

  const codes = accounts
    .map((a: Account) => {
      const totp = OTPAuth.URI.parse(a.uri) as OTPAuth.TOTP;
      const token = totp.generate();
      const remaining = Math.floor(totp.remaining() / 1000);
      return `${a.label}: ${token} (⏳ ${remaining}s)`;
    })
    .join("\n");

  await ctx.reply(`${"🔐 TOTP Codes:"}
${codes}`);
});
// /qr
bot.command("qr", async (ctx) => {
  const parts = ctx.message?.text?.split(" ");
  const idx = parseInt(parts?.[1] ?? "") - 1;

  const account = ctx.session.accounts?.[idx];
  if (!account)
    return ctx.reply("Invalid index. Use /list to see account numbers.");

  // Create QR as base64 image string
  const dataUrl = await qrcode.toDataURL(account.uri);
  // console.log('dataUrl', dataUrl);

  const base64 = dataUrl.split(",")[1]; // Remove the "data:image/png;base64," part

  // Convert to Buffer
  const buffer = Buffer.from(base64, "base64");

  // Send buffer as photo
  await ctx.replyWithPhoto(
    new InputFile(buffer),
    { caption: `${account.label} QR Code` }
  );
});

// fallback
bot.on("message", (ctx: Context) => {
  ctx.reply("Unknown command. Try /add, /list, /code, or /qr.");
});

bot.start();

const PORT = parseInt(process.env.PORT || "3000");

serve(
  {
    fetch: app.fetch,
    port: PORT,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
