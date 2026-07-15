import "./env.js";
import { connect } from "node:tls";

const defaultSmtpHost = "smtp.gmail.com";
const defaultSmtpPort = 465;

const smtpHost = process.env.SMTP_HOST ?? defaultSmtpHost;
const smtpPort = Number(process.env.SMTP_PORT ?? defaultSmtpPort);
const smtpUser = process.env.SMTP_USER ?? "";
const smtpPass = process.env.SMTP_PASS ?? "";
const smtpFrom = process.env.SMTP_FROM ?? smtpUser;

const encodeHeader = (value) => `=?UTF-8?B?${Buffer.from(value, "utf8").toString("base64")}?=`;

const dotEscape = (value) => value.replace(/^\./gm, "..").replace(/\r?\n/g, "\r\n");

const normalizeRecipients = (value) => {
  const recipients = Array.isArray(value) ? value : String(value ?? "").split(/[;,]/);

  return Array.from(
    new Set(
      recipients
        .map((recipient) => recipient.trim())
        .filter(Boolean),
    ),
  );
};

const createTextMessage = ({ from, subject, text, to }) =>
  [
    `From: ${from}`,
    `To: ${normalizeRecipients(to).join(", ")}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    `Date: ${new Date().toUTCString()}`,
    "",
    dotEscape(text),
  ].join("\r\n");

const createHtmlMessage = ({ from, html, subject, text, to }) => {
  const boundary = `fptjobs-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return [
    `From: ${from}`,
    `To: ${normalizeRecipients(to).join(", ")}`,
    `Subject: ${encodeHeader(subject)}`,
    "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    `Date: ${new Date().toUTCString()}`,
    "",
    `--${boundary}`,
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    dotEscape(text),
    "",
    `--${boundary}`,
    "Content-Type: text/html; charset=UTF-8",
    "Content-Transfer-Encoding: 8bit",
    "",
    dotEscape(html),
    "",
    `--${boundary}--`,
  ].join("\r\n");
};

const createMessage = ({ from, html, subject, text, to }) =>
  html
    ? createHtmlMessage({ from, html, subject, text, to })
    : createTextMessage({ from, subject, text, to });

export const isMailConfigured = () => Boolean(smtpUser && smtpPass && smtpFrom);

export const sendMail = async ({ html, subject, text, to }) => {
  if (!isMailConfigured()) {
    throw new Error("SMTP credentials are not configured");
  }

  const recipients = normalizeRecipients(to);

  if (recipients.length === 0) {
    throw new Error("Email recipient is not configured");
  }

  const socket = connect({
    host: smtpHost,
    port: smtpPort,
    servername: smtpHost,
  });

  socket.setEncoding("utf8");

  let buffer = "";
  const waiters = [];

  const drain = () => {
    const finalLineMatch = buffer.match(/(?:^|\r?\n)(\d{3}) [^\r\n]*(?:\r?\n|$)/);

    if (!finalLineMatch || waiters.length === 0) {
      return;
    }

    const endIndex = (finalLineMatch.index ?? 0) + finalLineMatch[0].length;
    const response = buffer.slice(0, endIndex);
    buffer = buffer.slice(endIndex);
    waiters.shift()?.resolve(response);
    drain();
  };

  const readResponse = () =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("SMTP response timed out"));
      }, 15000);

      waiters.push({
        resolve: (response) => {
          clearTimeout(timeout);
          resolve(response);
        },
      });
      drain();
    });

  const assertCode = (response, expectedCodes) => {
    const code = Number.parseInt(String(response).slice(0, 3), 10);

    if (!expectedCodes.includes(code)) {
      throw new Error(`SMTP command failed with ${code}: ${String(response).trim()}`);
    }
  };

  const command = async (value, expectedCodes) => {
    socket.write(`${value}\r\n`);
    const response = await readResponse();
    assertCode(response, expectedCodes);
    return response;
  };

  socket.on("data", (chunk) => {
    buffer += chunk;
    drain();
  });

  try {
    await new Promise((resolve, reject) => {
      socket.once("secureConnect", resolve);
      socket.once("error", reject);
    });

    assertCode(await readResponse(), [220]);
    await command("EHLO localhost", [250]);
    await command("AUTH LOGIN", [334]);
    await command(Buffer.from(smtpUser, "utf8").toString("base64"), [334]);
    await command(Buffer.from(smtpPass, "utf8").toString("base64"), [235]);
    await command(`MAIL FROM:<${smtpFrom}>`, [250]);

    for (const recipient of recipients) {
      await command(`RCPT TO:<${recipient}>`, [250, 251]);
    }

    await command("DATA", [354]);
    socket.write(`${createMessage({ from: smtpFrom, html, subject, text, to: recipients })}\r\n.\r\n`);
    assertCode(await readResponse(), [250]);
    await command("QUIT", [221]);
  } finally {
    socket.end();
  }
};
