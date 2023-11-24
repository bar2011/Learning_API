import { createHmac } from "crypto";

// URL safe variant of Base-64
function b64(str) {
	return Buffer.from(str)
		.toString("base64")
		.replace(/=/g, "")
		.replace(/\+/g, "-")
		.replace(/\//g, "_");
}
function utf8(text, inputEncoding) {
	const buffer = Buffer.from(text, inputEncoding);
	return Array.from(buffer);
}
function encode(header, payload, secret) {
	const headerEnc = b64(utf8(JSON.stringify(header)));
	const payloadEnc = b64(utf8(JSON.stringify(payload)));
	const signature = b64(
		createHmac(header.alg, secret)
			.update(`${headerEnc}.${payloadEnc}`)
			.digest("base64")
	);
	return `${headerEnc}.${payloadEnc}.${signature}`;
}
export function verify(jwt, secret) {
	const [headerB64, payloadB64, signatureB64] = jwt.split(".");

	const header = JSON.parse(
		Buffer.from(headerB64, "base64").toString("ascii")
	);
	if (header.alg == undefined) return false;
	const payload = JSON.parse(
		Buffer.from(payloadB64, "base64").toString("ascii")
	);
	if (payload.sub == undefined || payload.name == undefined) return false;

	const recreatedSignature = b64(
		createHmac(header.alg, secret)
			.update(`${headerB64}.${payloadB64}`)
			.digest("base64")
	);
	return recreatedSignature == signatureB64;
}

export function encodeUserData(email, username, secret) {
	const header = {
		alg: "sha256",
	};
	const payload = {
		sub: email,
		name: username,
	};

	return encode(header, payload, secret);
}

// Assumes that data was verified
export function getUserDataFromJWT(jwt) {
	const [headerB64, payloadB64, signatureB64] = jwt.split(".");
	const header = JSON.parse(
		Buffer.from(headerB64, "base64").toString("ascii")
	);
	const payload = JSON.parse(
		Buffer.from(payloadB64, "base64").toString("ascii")
	);

	return { payload, header };
}
