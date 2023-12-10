import { createHmac } from "crypto";

export class Jwt {
	// URL safe variant of Base-64
	static b64(str) {
		return Buffer.from(str)
			.toString("base64")
			.replace(/=/g, "")
			.replace(/\+/g, "-")
			.replace(/\//g, "_");
	}
	static utf8(text, inputEncoding) {
		const buffer = Buffer.from(text, inputEncoding);
		return Array.from(buffer);
	}
	static encode(header, payload, secret) {
		const headerEnc = this.b64(this.utf8(JSON.stringify(header)));
		const payloadEnc = this.b64(this.utf8(JSON.stringify(payload)));
		const signature = this.b64(
			createHmac(header.alg, secret)
				.update(`${headerEnc}.${payloadEnc}`)
				.digest("base64")
		);
		return `${headerEnc}.${payloadEnc}.${signature}`;
	}
	static verify(jwt, secret) {
		const [headerB64, payloadB64, signatureB64] = jwt.split(".");
	
		const header = JSON.parse(
			Buffer.from(headerB64, "base64").toString("ascii")
		);
		if (header.alg == undefined) return false;
		const payload = JSON.parse(
			Buffer.from(payloadB64, "base64").toString("ascii")
		);
		if (
			payload.sub == undefined ||
			payload.name == undefined ||
			payload.exp == undefined ||
			typeof payload.exp != "string"
		)
			return false;
		if (Date.parse(payload.exp) < new Date()) return false;
	
		const recreatedSignature = this.b64(
			createHmac(header.alg, secret)
				.update(`${headerB64}.${payloadB64}`)
				.digest("base64")
		);
		return recreatedSignature == signatureB64;
	}
	
	static encodeUserData(
		email,
		username,
		secret,
		daysTillExpiration = 7
	) {
		const expirationTime = new Date();
		expirationTime.setDate(expirationTime.getDate() + daysTillExpiration);
	
		const header = {
			alg: "sha256",
		};
		const payload = {
			sub: email,
			name: username,
			exp: expirationTime,
		};
	
		return this.encode(header, payload, secret);
	}
	
	// Assumes that data was verified
	static getUserDataFromJWT(jwt) {
		const [headerB64, payloadB64, signatureB64] = jwt.split(".");
		const header = JSON.parse(
			Buffer.from(headerB64, "base64").toString("ascii")
		);
		const payload = JSON.parse(
			Buffer.from(payloadB64, "base64").toString("ascii")
		);
	
		return { payload, header };
	}
}